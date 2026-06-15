import {
  asAwardId,
  asCertificateId,
  asExperienceId,
  asProjectId,
  asResumeId,
  asSkillId,
  type FeatureResumeStatus,
  type NewProjectDraft,
  type ResumeId,
  type SavedResume,
  type UpsertSavedResumeInput,
  type VaultData,
  type VaultProject,
  type VaultSkill,
} from "@uaps/shared/resume-builder";

import type {
  Award,
  Certificate,
  Experience,
  Prisma,
  Project,
  ResumeAward,
  ResumeCertificate,
  ResumeExperience,
  ResumeProject,
  ResumeSkill,
} from "../../generated/prisma/client";

import { prisma } from "../prisma";

import type {
  IVaultBackendRepository,
  VaultBackendSnapshot,
  VaultBackendUserId,
} from "./vault-backend.types";
import {
  emptyVaultCollections,
  formatDuration,
  sanitizeIds,
  toBasicInfo,
  toPersistedResumeStatus,
  toSavedResume,
} from "./vault-backend.utils";

type PrismaResumeCompositionClient = Prisma.TransactionClient;
type PrismaUserSkillWithSkill = Prisma.UserSkillGetPayload<{
  include: { skill: true };
}>;
type PrismaResumeWithComposition = Prisma.ResumeGetPayload<{
  include: {
    resumeAwards: true;
    resumeBasic: true;
    resumeCertificates: true;
    resumeExperiences: true;
    resumeProjects: true;
    resumeSkills: true;
    user: true;
  };
}>;

export class OrmVaultRepository implements IVaultBackendRepository {
  async loadSnapshot(userId: VaultBackendUserId): Promise<VaultBackendSnapshot> {
    const [vault, savedResumes] = await Promise.all([
      this.loadVaultData(userId),
      this.loadSavedResumes(userId),
    ]);

    return {
      vault,
      savedResumes,
    };
  }

  async loadVaultData(userId: VaultBackendUserId): Promise<VaultData> {
    const [user, userSkills, projects, experiences, certificates, awards] =
      await Promise.all([
      prisma.user.findUnique({
        where: { userId },
        include: {
          resumes: {
            orderBy: { updatedAt: "desc" },
            take: 1,
            include: {
              resumeBasic: true,
            },
          },
        },
      }),
      prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
        orderBy: {
          skill: {
            name: "asc",
          },
        },
      }),
      prisma.project.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.experience.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.certificate.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.award.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    if (!user) {
      throw new Error("User profile not found");
    }

    const latestResumeBasic = user.resumes[0]?.resumeBasic;

    return {
      basicInfo: toBasicInfo({
        name: latestResumeBasic?.fullName ?? user.name,
        email: latestResumeBasic?.email ?? user.email,
        phone: latestResumeBasic?.phone ?? "",
        github: latestResumeBasic?.githubUrl ?? user.githubUrl ?? "",
      }),
      skills: userSkills.map((userSkill: PrismaUserSkillWithSkill) => ({
        id: asSkillId(userSkill.skillId),
        name: userSkill.skill.name,
        category: userSkill.skill.category,
      })),
      projects: projects.map((project: Project) => ({
        id: asProjectId(project.projectId),
        title: project.title,
        duration: formatDuration(project.startDate, project.endDate),
        description: project.description ?? "",
        githubUrl: project.repoUrl ?? undefined,
      })),
      experience: experiences.map((experience: Experience) => ({
        id: asExperienceId(experience.experienceId),
        company: experience.organization,
        role: experience.role,
        duration: formatDuration(experience.startDate, experience.endDate),
        responsibilities: experience.achievement ?? experience.description ?? "",
      })),
      certificates:
        certificates.length > 0
          ? certificates.map((certificate: Certificate) => ({
              id: asCertificateId(certificate.certificateId),
              name: certificate.name,
              year: certificate.year,
            }))
          : emptyVaultCollections().certificates,
      awards:
        awards.length > 0
          ? awards.map((award: Award) => ({
              id: asAwardId(award.awardId),
              name: award.name,
              desc: award.description,
            }))
          : emptyVaultCollections().awards,
    };
  }

  async loadSavedResumes(userId: VaultBackendUserId): Promise<SavedResume[]> {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      include: {
        resumeBasic: true,
        resumeExperiences: true,
        resumeCertificates: true,
        resumeAwards: true,
        resumeProjects: true,
        resumeSkills: true,
        user: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return resumes.map((resume: PrismaResumeWithComposition) =>
      toSavedResume({
        resumeId: resume.resumeId,
        title: resume.versionName,
        targetJobTitle: resume.targetJobTitle,
        targetCompany: resume.targetCompany,
        summary: resume.resumeBasic?.summary,
        status: resume.status,
        updatedAt: resume.updatedAt,
        projectIds: resume.resumeProjects.map(
          (project: ResumeProject) => project.projectId,
        ),
        skillIds: resume.resumeSkills.map((skill: ResumeSkill) => skill.skillId),
        experienceIds: resume.resumeExperiences.map(
          (experience: ResumeExperience) => experience.experienceId,
        ),
        certificateIds: resume.resumeCertificates.map(
          (certificate: ResumeCertificate) => certificate.certificateId,
        ),
        awardIds: resume.resumeAwards.map((award: ResumeAward) => award.awardId),
        visibility: resume.visibility,
        authorName: resume.user?.name,
        authorAvatarUrl: resume.user?.avatarUrl || undefined,
        sectionOrder: resume.sectionOrder,
      }),
    );
  }

  async getSavedResumeById(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
  ): Promise<SavedResume | null> {
    const savedResumes = await this.loadSavedResumes(userId);
    return savedResumes.find((resume) => resume.id === resumeId) ?? null;
  }

  async createSkill(
    userId: VaultBackendUserId,
    input: { category: string; name: string },
  ): Promise<VaultSkill> {
    const skill = await prisma.$transaction(
      async (transactionClient: Prisma.TransactionClient) => {
      const upsertedSkill = await transactionClient.skill.upsert({
        where: {
          name: input.name.trim(),
        },
        update: {
          category: input.category.trim(),
        },
        create: {
          name: input.name.trim(),
          category: input.category.trim(),
        },
      });

      await transactionClient.userSkill.upsert({
        where: {
          userId_skillId: {
            userId,
            skillId: upsertedSkill.skillId,
          },
        },
        update: {},
        create: {
          userId,
          skillId: upsertedSkill.skillId,
          proficiencyLevel: "Intermediate",
        },
      });

      return upsertedSkill;
      },
    );

    return {
      id: asSkillId(skill.skillId),
      name: skill.name,
      category: skill.category,
    };
  }

  async createProject(
    userId: VaultBackendUserId,
    input: NewProjectDraft,
  ): Promise<VaultProject> {
    const project = await prisma.project.create({
      data: {
        userId,
        title: input.title.trim(),
        description: input.description.trim(),
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        repoUrl: input.githubUrl || null,
        status: "Completed",
        isActive: true,
      },
    });

    return {
      id: asProjectId(project.projectId),
      title: project.title,
      duration: formatDuration(project.startDate, project.endDate),
      description: project.description ?? "",
      githubUrl: project.repoUrl ?? undefined,
    };
  }

  async updateProject(
    userId: VaultBackendUserId,
    projectId: string,
    input: NewProjectDraft,
  ): Promise<VaultProject> {
    const project = await prisma.project.update({
      where: {
        projectId,
        userId,
      },
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        repoUrl: input.githubUrl || null,
      },
    });

    return {
      id: asProjectId(project.projectId),
      title: project.title,
      duration: formatDuration(project.startDate, project.endDate),
      description: project.description ?? "",
      githubUrl: project.repoUrl ?? undefined,
    };
  }

  async deleteProject(
    userId: VaultBackendUserId,
    projectId: string,
  ): Promise<boolean> {
    await prisma.project.delete({
      where: {
        projectId,
        userId,
      },
    });
    return true;
  }

  async updateSkill(
    userId: VaultBackendUserId,
    skillId: string,
    input: { category: string; name: string },
  ): Promise<VaultSkill> {
    // Check if skill is linked to user
    const userSkill = await prisma.userSkill.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
    });

    if (!userSkill) {
      throw new Error("Skill not found for user");
    }

    // Upsert new skill
    const newSkill = await prisma.skill.upsert({
      where: { name: input.name.trim() },
      update: { category: input.category.trim() },
      create: { name: input.name.trim(), category: input.category.trim() },
    });

    if (newSkill.skillId !== skillId) {
      // Re-link to new skill and delete old link
      await prisma.userSkill.delete({
        where: {
          userId_skillId: { userId, skillId },
        },
      });

      await prisma.userSkill.upsert({
        where: {
          userId_skillId: { userId, skillId: newSkill.skillId },
        },
        update: {},
        create: {
          userId,
          skillId: newSkill.skillId,
          proficiencyLevel: "Intermediate",
        },
      });
    }

    return {
      id: asSkillId(newSkill.skillId),
      name: newSkill.name,
      category: newSkill.category,
    };
  }

  async deleteSkill(
    userId: VaultBackendUserId,
    skillId: string,
  ): Promise<boolean> {
    await prisma.userSkill.delete({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
    });
    return true;
  }

  async createExperience(userId: VaultBackendUserId, input: import("@uaps/shared/resume-builder").NewExperienceDraft): Promise<import("@uaps/shared/resume-builder").VaultExperience> {
    const experience = await prisma.experience.create({
      data: {
        userId,
        organization: input.company.trim(),
        role: input.role.trim(),
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        description: input.responsibilities.trim(),
      },
    });
    return {
      id: asExperienceId(experience.experienceId),
      company: experience.organization,
      role: experience.role,
      duration: formatDuration(experience.startDate, experience.endDate),
      responsibilities: experience.description ?? "",
    };
  }

  async updateExperience(userId: VaultBackendUserId, experienceId: string, input: import("@uaps/shared/resume-builder").NewExperienceDraft): Promise<import("@uaps/shared/resume-builder").VaultExperience> {
    const experience = await prisma.experience.update({
      where: { experienceId, userId },
      data: {
        organization: input.company.trim(),
        role: input.role.trim(),
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        description: input.responsibilities.trim(),
      },
    });
    return {
      id: asExperienceId(experience.experienceId),
      company: experience.organization,
      role: experience.role,
      duration: formatDuration(experience.startDate, experience.endDate),
      responsibilities: experience.description ?? "",
    };
  }

  async deleteExperience(userId: VaultBackendUserId, experienceId: string): Promise<boolean> {
    await prisma.experience.delete({ where: { experienceId, userId } });
    return true;
  }

  async createCertificate(userId: VaultBackendUserId, input: import("@uaps/shared/resume-builder").NewCertificateDraft): Promise<import("@uaps/shared/resume-builder").VaultCertificate> {
    const certificate = await prisma.certificate.create({
      data: {
        userId,
        name: input.name.trim(),
        year: input.year.trim(),
      },
    });
    return {
      id: asCertificateId(certificate.certificateId),
      name: certificate.name,
      year: certificate.year ?? "",
    };
  }

  async updateCertificate(userId: VaultBackendUserId, certificateId: string, input: import("@uaps/shared/resume-builder").NewCertificateDraft): Promise<import("@uaps/shared/resume-builder").VaultCertificate> {
    const certificate = await prisma.certificate.update({
      where: { certificateId, userId },
      data: {
        name: input.name.trim(),
        year: input.year.trim(),
      },
    });
    return {
      id: asCertificateId(certificate.certificateId),
      name: certificate.name,
      year: certificate.year ?? "",
    };
  }

  async deleteCertificate(userId: VaultBackendUserId, certificateId: string): Promise<boolean> {
    await prisma.certificate.delete({ where: { certificateId, userId } });
    return true;
  }

  async createAward(userId: VaultBackendUserId, input: import("@uaps/shared/resume-builder").NewAwardDraft): Promise<import("@uaps/shared/resume-builder").VaultAward> {
    const award = await prisma.award.create({
      data: {
        userId,
        name: input.name.trim(),
        description: input.desc.trim(),
      },
    });
    return {
      id: asAwardId(award.awardId),
      name: award.name,
      desc: award.description ?? "",
    };
  }

  async updateAward(userId: VaultBackendUserId, awardId: string, input: import("@uaps/shared/resume-builder").NewAwardDraft): Promise<import("@uaps/shared/resume-builder").VaultAward> {
    const award = await prisma.award.update({
      where: { awardId, userId },
      data: {
        name: input.name.trim(),
        description: input.desc.trim(),
      },
    });
    return {
      id: asAwardId(award.awardId),
      name: award.name,
      desc: award.description ?? "",
    };
  }

  async deleteAward(userId: VaultBackendUserId, awardId: string): Promise<boolean> {
    await prisma.award.delete({ where: { awardId, userId } });
    return true;
  }

  async saveResume(
    userId: VaultBackendUserId,
    input: UpsertSavedResumeInput,
  ): Promise<SavedResume> {
    const savedResumeId = await prisma.$transaction(
      async (transactionClient: Prisma.TransactionClient) => {
        const user = await transactionClient.user.findUnique({
          where: { userId },
          include: {
            resumes: {
              orderBy: { updatedAt: "desc" },
              take: 1,
              include: {
                resumeBasic: true,
              },
            },
          },
        });

        if (!user) {
          throw new Error("User profile not found");
        }

        const persistedStatus = toPersistedResumeStatus(input.status);
        const savedResume = input.resumeId
          ? await (async () => {
              const existingResume = await transactionClient.resume.findFirst({
                where: {
                  userId,
                  resumeId: String(input.resumeId),
                },
                select: {
                  resumeId: true,
                },
              });

              if (!existingResume) {
                throw new Error("Resume not found for update");
              }

              return transactionClient.resume.update({
                where: { resumeId: existingResume.resumeId },
                data: {
                  versionName: input.title,
                  targetJobTitle: input.config.targetRole || null,
                  targetCompany: input.config.targetCompany || null,
                  status: persistedStatus,
                  visibility: "private",
                  sectionOrder: input.config.sectionOrder || ["skills", "projects", "experience", "certificates", "awards"],
                },
              });
            })()
          : await transactionClient.resume.create({
              data: {
                versionName: input.title,
                targetJobTitle: input.config.targetRole || null,
                targetCompany: input.config.targetCompany || null,
                userId,
                visibility: "private",
                isActive: false,
                status: persistedStatus,
                sectionOrder: input.config.sectionOrder || ["skills", "projects", "experience", "certificates", "awards"],
              },
            });

        await transactionClient.resumeBasic.upsert({
          where: {
            resumeId: savedResume.resumeId,
          },
          update: {
            fullName: user.resumes[0]?.resumeBasic?.fullName ?? user.name,
            email: user.resumes[0]?.resumeBasic?.email ?? user.email,
            phone: user.resumes[0]?.resumeBasic?.phone ?? null,
            githubUrl:
              user.resumes[0]?.resumeBasic?.githubUrl ?? user.githubUrl,
            summary: input.config.summary || null,
          },
          create: {
            resumeId: savedResume.resumeId,
            fullName: user.resumes[0]?.resumeBasic?.fullName ?? user.name,
            email: user.resumes[0]?.resumeBasic?.email ?? user.email,
            phone: user.resumes[0]?.resumeBasic?.phone ?? null,
            githubUrl:
              user.resumes[0]?.resumeBasic?.githubUrl ?? user.githubUrl,
            summary: input.config.summary || null,
          },
        });

        await this.setResumeComposition(
          transactionClient,
          userId,
          savedResume.resumeId,
          input.config,
        );

        return savedResume.resumeId;
      },
    );
    const savedResume = await this.getSavedResumeById(
      userId,
      asResumeId(savedResumeId),
    );

    if (!savedResume) {
      throw new Error("Saved resume could not be reloaded");
    }

    return savedResume;
  }

  async duplicateResume(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
    duplicatedAt: string,
  ): Promise<SavedResume | null> {
    const existingResume = await this.getSavedResumeById(userId, resumeId);

    if (!existingResume) {
      return null;
    }

    const duplicatedResume = await this.saveResume(userId, {
      title: `${existingResume.title} (Copy)`,
      date: duplicatedAt,
      status: "Draft",
      config: existingResume.config,
    });

    return {
      ...duplicatedResume,
      date: duplicatedAt,
    };
  }

  async deleteResume(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
  ): Promise<boolean> {
    const deletedResume = await prisma.resume.deleteMany({
      where: {
        userId,
        resumeId: String(resumeId),
      },
    });

    return deletedResume.count > 0;
  }

  async updateResumeStatus(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
    status: FeatureResumeStatus,
  ): Promise<SavedResume | null> {
    const existingResume = await this.getSavedResumeById(userId, resumeId);

    if (!existingResume) {
      return null;
    }

    return this.saveResume(userId, {
      resumeId,
      title: existingResume.title,
      date: existingResume.date,
      status,
      config: existingResume.config,
    });
  }

  async getPublicResumes(): Promise<SavedResume[]> {
    const resumes = await prisma.resume.findMany({
      where: { visibility: "public" },
      include: {
        resumeBasic: true,
        resumeExperiences: true,
        resumeCertificates: true,
        resumeAwards: true,
        resumeProjects: true,
        resumeSkills: true,
        user: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 50,
    });

    const result: SavedResume[] = [];
    for (const resume of resumes) {
      const vault = await this.loadVaultData(resume.userId);
      const filteredVault: VaultData = {
        basicInfo: vault.basicInfo,
        skills: vault.skills.filter(s => resume.resumeSkills.some(rs => rs.skillId === s.id)),
        projects: vault.projects.filter(p => resume.resumeProjects.some(rp => rp.projectId === p.id)),
        experience: vault.experience.filter(e => resume.resumeExperiences.some(re => re.experienceId === e.id)),
        certificates: vault.certificates.filter(c => resume.resumeCertificates.some(rc => rc.certificateId === c.id)),
        awards: vault.awards.filter(a => resume.resumeAwards.some(ra => ra.awardId === a.id)),
      };

      const savedResume = toSavedResume({
        resumeId: resume.resumeId,
        title: resume.versionName,
        targetJobTitle: resume.targetJobTitle,
        targetCompany: resume.targetCompany,
        summary: resume.resumeBasic?.summary,
        status: resume.status,
        updatedAt: resume.updatedAt,
        projectIds: resume.resumeProjects.map(
          (project: ResumeProject) => project.projectId,
        ),
        skillIds: resume.resumeSkills.map((skill: ResumeSkill) => skill.skillId),
        experienceIds: resume.resumeExperiences.map(
          (experience: ResumeExperience) => experience.experienceId,
        ),
        certificateIds: resume.resumeCertificates.map(
          (certificate: ResumeCertificate) => certificate.certificateId,
        ),
        awardIds: resume.resumeAwards.map((award: ResumeAward) => award.awardId),
        visibility: resume.visibility,
        authorName: resume.user?.name,
        authorAvatarUrl: resume.user?.avatarUrl || undefined,
        sectionOrder: resume.sectionOrder,
      });

      savedResume.vaultData = filteredVault;
      result.push(savedResume);
    }

    return result;
  }

  async updateResumeVisibility(
    userId: VaultBackendUserId,
    resumeId: ResumeId,
    visibility: string,
  ): Promise<SavedResume | null> {
    const existingResume = await this.getSavedResumeById(userId, resumeId);
    if (!existingResume) return null;

    await prisma.resume.update({
      where: { resumeId: String(resumeId) },
      data: { visibility },
    });

    return this.getSavedResumeById(userId, resumeId);
  }

  private async setResumeComposition(
    transactionClient: PrismaResumeCompositionClient,
    userId: VaultBackendUserId,
    resumeId: string,
    config: UpsertSavedResumeInput["config"],
  ) {
    await Promise.all([
      transactionClient.resumeAward.deleteMany({ where: { resumeId } }),
      transactionClient.resumeCertificate.deleteMany({ where: { resumeId } }),
      transactionClient.resumeProject.deleteMany({ where: { resumeId } }),
      transactionClient.resumeSkill.deleteMany({ where: { resumeId } }),
      transactionClient.resumeExperience.deleteMany({ where: { resumeId } }),
    ]);

    const requestedProjectIds = sanitizeIds(config.selectedProjects.map(String));
    const requestedSkillIds = sanitizeIds(config.selectedSkills.map(String));
    const requestedExperienceIds = sanitizeIds(
      config.selectedExperience.map(String),
    );
    const requestedCertificateIds = sanitizeIds(
      config.selectedCerts.map(String),
    );
    const requestedAwardIds = sanitizeIds(config.selectedAwards.map(String));
    const [
      ownedProjects,
      ownedSkills,
      ownedExperiences,
      ownedCertificates,
      ownedAwards,
    ] = await Promise.all([
      requestedProjectIds.length > 0
        ? transactionClient.project.findMany({
            where: {
              userId,
              projectId: { in: requestedProjectIds },
            },
            select: {
              projectId: true,
            },
          })
        : Promise.resolve([]),
      requestedSkillIds.length > 0
        ? transactionClient.userSkill.findMany({
            where: {
              userId,
              skillId: { in: requestedSkillIds },
            },
            select: {
              skillId: true,
            },
          })
        : Promise.resolve([]),
      requestedExperienceIds.length > 0
        ? transactionClient.experience.findMany({
            where: {
              userId,
              experienceId: { in: requestedExperienceIds },
            },
            select: {
              experienceId: true,
            },
          })
        : Promise.resolve([]),
      requestedCertificateIds.length > 0
        ? transactionClient.certificate.findMany({
            where: {
              userId,
              certificateId: { in: requestedCertificateIds },
            },
            select: {
              certificateId: true,
            },
          })
        : Promise.resolve([]),
      requestedAwardIds.length > 0
        ? transactionClient.award.findMany({
            where: {
              userId,
              awardId: { in: requestedAwardIds },
            },
            select: {
              awardId: true,
            },
          })
        : Promise.resolve([]),
    ]);

    if (ownedProjects.length > 0) {
      await transactionClient.resumeProject.createMany({
        data: ownedProjects.map((project: Pick<Project, "projectId">) => ({
          resumeId,
          projectId: project.projectId,
        })),
      });
    }

    if (ownedSkills.length > 0) {
      await transactionClient.resumeSkill.createMany({
        data: ownedSkills.map((skill: { skillId: string }) => ({
          resumeId,
          skillId: skill.skillId,
        })),
      });
    }

    if (ownedExperiences.length > 0) {
      await transactionClient.resumeExperience.createMany({
        data: ownedExperiences.map(
          (experience: Pick<Experience, "experienceId">) => ({
          resumeId,
          experienceId: experience.experienceId,
          }),
        ),
      });
    }

    if (ownedCertificates.length > 0) {
      await transactionClient.resumeCertificate.createMany({
        data: ownedCertificates.map(
          (certificate: Pick<Certificate, "certificateId">) => ({
            resumeId,
            certificateId: certificate.certificateId,
          }),
        ),
      });
    }

    if (ownedAwards.length > 0) {
      await transactionClient.resumeAward.createMany({
        data: ownedAwards.map((award: Pick<Award, "awardId">) => ({
          resumeId,
          awardId: award.awardId,
        })),
      });
    }
  }
}
