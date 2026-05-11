"use client";
import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Code,
  FileText,
  CheckCircle,
  Plus,
  X,
  User,
  Check,
  Building,
  LayoutDashboard,
  ArrowLeft,
  Save,
  Calendar,
  Eye,
  Edit2,
  Copy,
  Trash2,
  FileDown,
  Tag,
} from "lucide-react";

// 1. Initial Mock Database (ข้อมูล Master DB)
const INITIAL_DB = {
  basicInfo: {
    name: "Somchai Coding",
    email: "somchai.c@example.com",
    phone: "+66 81 234 5678",
    github: "github.com/somchaicodes",
  },
  skills: [
    { id: "s1", name: "Python", category: "programming" },
    { id: "s2", name: "Java", category: "programming" },
    { id: "s3", name: "React", category: "frameworks" },
    { id: "s4", name: "TensorFlow", category: "frameworks" },
    { id: "s5", name: "AWS", category: "tools" },
    { id: "s6", name: "Docker", category: "tools" },
  ],
  projects: [
    {
      id: "p1",
      title: "E-Commerce Microservices",
      role: "Backend Developer",
      description:
        "Built scalable backend services using Java and Spring Boot.",
    },
    {
      id: "p2",
      title: "Customer Churn Prediction",
      role: "AI Engineer",
      description:
        "Developed an ML model using Python and TensorFlow with 85% accuracy.",
    },
  ],
  experience: [
    {
      id: "e1",
      company: "Tech Solutions Inc.",
      role: "Software Engineer Intern",
      duration: "Jun 2024 - Aug 2024",
      responsibilities: "Developed RESTful APIs using Node.js.",
    },
    {
      id: "e2",
      company: "Data Driven Co.",
      role: "Data Analyst Intern",
      duration: "Jun 2023 - Aug 2023",
      responsibilities: "Cleaned and pre-processed large datasets.",
    },
  ],
  certificates: [
    { id: "c1", name: "AWS Certified Developer", year: "2025" },
    { id: "c2", name: "DeepLearning.AI TensorFlow", year: "2024" },
  ],
  awards: [
    {
      id: "a1",
      name: "1st Place - Hackathon 2025",
      desc: "Built an AI-driven healthcare app.",
    },
  ],
};

// 2. Mock Data สำหรับ Resume ที่เซฟไว้ (อัปเกรดให้เก็บ Config จริงด้วย)
const INITIAL_RESUMES = [
  {
    id: "res-1",
    title: "AI Engineer @ Company A",
    date: "10 May 2026",
    status: "Applied",
    config: {
      targetRole: "AI Engineer",
      targetCompany: "Company A",
      summary:
        "Passionate AI Engineer aiming to leverage machine learning skills.",
      selectedSkills: ["s1", "s4", "s5"],
      selectedProjects: ["p2"],
      selectedExperience: ["e2"],
      selectedCerts: ["c2"],
      selectedAwards: ["a1"],
    },
  },
  {
    id: "res-2",
    title: "Data Analyst @ Tech Flow",
    date: "08 May 2026",
    status: "Interviewing",
    config: {
      targetRole: "Data Analyst",
      targetCompany: "Tech Flow",
      summary:
        "Detail-oriented analyst with a strong background in data cleaning.",
      selectedSkills: ["s1", "s6"],
      selectedProjects: [],
      selectedExperience: ["e2"],
      selectedCerts: [],
      selectedAwards: [],
    },
  },
];

const EMPTY_CONFIG = {
  targetRole: "",
  targetCompany: "",
  summary: "",
  selectedSkills: [] as string[],
  selectedProjects: [] as string[],
  selectedExperience: [] as string[],
  selectedCerts: [] as string[],
  selectedAwards: [] as string[],
};

// --- Component ย่อย: กระดาษ Resume เปล่าๆ (ใช้ทั้งตอน Preview และใน Modal) ---
const ResumeDocument = ({
  config,
  db,
}: {
  config: any;
  db: typeof INITIAL_DB;
}) => {
  // กรองข้อมูลตามที่ถูก Select
  const previewData = {
    skills: db.skills.filter((s) => config.selectedSkills.includes(s.id)),
    projects: db.projects.filter((p) => config.selectedProjects.includes(p.id)),
    experience: db.experience.filter((e) =>
      config.selectedExperience.includes(e.id),
    ),
    certificates: db.certificates.filter((c) =>
      config.selectedCerts.includes(c.id),
    ),
    awards: db.awards.filter((a) => config.selectedAwards.includes(a.id)),
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-[800px] mx-auto relative h-full flex flex-col">
      <div className="text-center mb-6 border-b pb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          {db.basicInfo.name}
        </h1>

        {(config.targetRole || config.targetCompany) && (
          <div className="text-blue-600 font-semibold mt-2 text-lg">
            {config.targetRole}{" "}
            {config.targetCompany && `@ ${config.targetCompany}`}
          </div>
        )}

        <div className="flex justify-center gap-4 text-sm text-slate-500 mt-3">
          <span>{db.basicInfo.email}</span>
          <span>•</span>
          <span>{db.basicInfo.phone}</span>
        </div>

        {config.summary && (
          <p className="mt-4 text-slate-700 text-sm leading-relaxed max-w-2xl mx-auto italic">
            "{config.summary}"
          </p>
        )}
      </div>

      <div className="space-y-6 flex-1">
        {previewData.skills.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {previewData.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {previewData.experience.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
              Experience
            </h3>
            <div className="space-y-4">
              {previewData.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-semibold text-slate-900">{exp.role}</h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {exp.duration}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 mb-1 flex items-center gap-1">
                    <Building className="w-3 h-3" /> {exp.company}
                  </div>
                  <p className="text-sm text-slate-700 pl-4 border-l-2 border-slate-200">
                    {exp.responsibilities}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {previewData.projects.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
              Key Projects
            </h3>
            <div className="space-y-4">
              {previewData.projects.map((proj) => (
                <div key={proj.id}>
                  <h4 className="font-semibold text-slate-900">
                    {proj.title}{" "}
                    <span className="text-slate-400 font-normal text-sm">
                      | {proj.role}
                    </span>
                  </h4>
                  <p className="text-sm text-slate-700 mt-1">
                    {proj.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {previewData.certificates.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
              Certifications
            </h3>
            <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
              {previewData.certificates.map((cert) => (
                <li key={cert.id}>
                  {cert.name} ({cert.year})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty State (โชว์เฉพาะตอนยังไม่ได้เลือกอะไรเลย) */}
        {previewData.skills.length === 0 &&
          previewData.projects.length === 0 &&
          previewData.experience.length === 0 &&
          previewData.certificates.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Your resume is currently empty.</p>
              <p className="text-sm">
                Start selecting or adding information to build it.
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default function ResumeBuilder() {
  // Main States
  const [currentView, setCurrentView] = useState<"dashboard" | "builder">(
    "dashboard",
  );
  const [savedResumes, setSavedResumes] = useState(INITIAL_RESUMES);
  const [db, setDb] = useState(INITIAL_DB);

  // Builder States
  const [resumeConfig, setResumeConfig] = useState(EMPTY_CONFIG);
  const [editingId, setEditingId] = useState<string | null>(null); // สำหรับเช็คว่าสร้างใหม่หรือกำลัง Edit

  // Form States (Inline Add)
  const [newSkill, setNewSkill] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    role: "",
    description: "",
  });

  // Modal & Toast States
  const [previewResume, setPreviewResume] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --- Functions: Builder (หน้าสร้าง Resume) ---
  const toggleSelection = (category: keyof typeof resumeConfig, id: string) => {
    setResumeConfig((prev) => {
      const currentSelection = prev[category] as string[];
      if (currentSelection.includes(id)) {
        return {
          ...prev,
          [category]: currentSelection.filter((item) => item !== id),
        };
      }
      return { ...prev, [category]: [...currentSelection, id] };
    });
  };

  const handleAddNewSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const newId = `s-${Date.now()}`;
    const skillObj = { id: newId, name: newSkill.trim(), category: "custom" };
    setDb((prev) => ({ ...prev, skills: [...prev.skills, skillObj] }));
    setResumeConfig((prev) => ({
      ...prev,
      selectedSkills: [...prev.selectedSkills, newId],
    }));
    setNewSkill("");
  };

  const handleAddNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    const newId = `p-${Date.now()}`;
    const projectObj = { ...newProject, id: newId };
    setDb((prev) => ({ ...prev, projects: [...prev.projects, projectObj] }));
    setResumeConfig((prev) => ({
      ...prev,
      selectedProjects: [...prev.selectedProjects, newId],
    }));
    setShowProjectForm(false);
    setNewProject({ title: "", role: "", description: "" });
  };

  const handleSaveResume = () => {
    const titleName =
      resumeConfig.targetRole || resumeConfig.targetCompany
        ? `${resumeConfig.targetRole} ${resumeConfig.targetCompany ? `@ ${resumeConfig.targetCompany}` : ""}`
        : `Untitled Resume ${savedResumes.length + 1}`;

    if (editingId) {
      // Update ของเดิม
      setSavedResumes((prev) =>
        prev.map((res) =>
          res.id === editingId
            ? { ...res, title: titleName, config: resumeConfig }
            : res,
        ),
      );
      setToastMessage("Resume updated successfully!");
    } else {
      // Create ของใหม่
      const newResume = {
        id: `res-${Date.now()}`,
        title: titleName,
        date: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        status: "Draft",
        config: resumeConfig,
      };
      setSavedResumes([newResume, ...savedResumes]);
      setToastMessage("New resume saved successfully!");
    }

    setEditingId(null);
    setCurrentView("dashboard");
  };

  // --- Functions: Dashboard Actions ---
  const handleStartNew = () => {
    setResumeConfig(EMPTY_CONFIG);
    setEditingId(null);
    setCurrentView("builder");
  };

  const handleEdit = (resume: (typeof INITIAL_RESUMES)[0]) => {
    setResumeConfig(resume.config);
    setEditingId(resume.id);
    setCurrentView("builder");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedResumes((prev) => prev.filter((r) => r.id !== id));
    setToastMessage("Resume deleted.");
  };

  const handleDuplicate = (
    resume: (typeof INITIAL_RESUMES)[0],
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const duplicatedResume = {
      ...resume,
      id: `res-${Date.now()}`,
      title: `${resume.title} (Copy)`,
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "Draft",
    };
    setSavedResumes([duplicatedResume, ...savedResumes]);
    setToastMessage("Resume duplicated!");
  };

  const handleStatusChange = (
    id: string,
    newStatus: string,
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    e.stopPropagation();
    setSavedResumes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
    );
  };

  const handleDownloadMock = () => {
    setToastMessage("Downloading PDF... (Mock Action)");
    setTimeout(() => {
      setPreviewResume(null); // ปิด Modal อัตโนมัติหลังกดโหลด (จำลอง)
    }, 1500);
  };

  // =========================================================
  // VIEW 1: DASHBOARD
  // =========================================================
  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10 font-sans relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-bounce">
            <CheckCircle className="w-5 h-5 text-green-400" />
            {toastMessage}
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                <LayoutDashboard className="w-8 h-8 text-blue-600" />
                My Resumes
              </h1>
              <p className="text-slate-500 mt-2">
                Manage, duplicate, and track your tailored resumes.
              </p>
            </div>
            <button
              onClick={handleStartNew}
              className="bg-blue-600 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" /> Create New Resume
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResumes.map((res) => {
              // Status Styling
              const statusColors: Record<string, string> = {
                Draft: "bg-slate-100 text-slate-600 border-slate-200",
                Applied: "bg-blue-50 text-blue-700 border-blue-200",
                Interviewing: "bg-purple-50 text-purple-700 border-purple-200",
              };

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Content (Click to Preview) */}
                  <div
                    className="p-6 pb-4 cursor-pointer"
                    onClick={() => setPreviewResume(res)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText className="w-6 h-6" />
                      </div>

                      {/* Status Dropdown */}
                      <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border outline-none appearance-none cursor-pointer pr-6 ${statusColors[res.status] || statusColors["Draft"]}`}
                          value={res.status}
                          onChange={(e) =>
                            handleStatusChange(res.id, e.target.value, e)
                          }
                        >
                          <option value="Draft">Draft</option>
                          <option value="Applied">Applied</option>
                          <option value="Interviewing">Interviewing</option>
                        </select>
                        <Tag className="w-3 h-3 absolute right-2.5 top-2 opacity-50 pointer-events-none" />
                      </div>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {res.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4 opacity-70" /> {res.date}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="border-t border-slate-100 bg-slate-50/50 p-3 px-4 flex justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(res);
                        }}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDuplicate(res, e)}
                        className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(res.id, e)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => setPreviewResume(res)}
                      className="text-sm font-medium text-slate-600 flex items-center gap-1 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
                    >
                      <Eye className="w-4 h-4" /> View
                    </button>
                  </div>
                </div>
              );
            })}

            {savedResumes.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white border border-dashed border-slate-300 rounded-2xl">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No resumes yet.</p>
                <button
                  onClick={handleStartNew}
                  className="text-blue-600 mt-2 font-medium hover:underline"
                >
                  Create your first one
                </button>
              </div>
            )}
          </div>
        </div>

        {}
        {/* Modal: Full Preview */}
        {previewResume && (
          <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8">
            {/* Click outside to close */}
            <div
              className="absolute inset-0"
              onClick={() => setPreviewResume(null)}
            ></div>

            <div className="relative w-full max-w-5xl h-full flex flex-col bg-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-white px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {previewResume.title}
                  </h2>
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Last edited:{" "}
                    {previewResume.date}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPreviewResume(null);
                      handleEdit(previewResume);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Document
                  </button>
                  <button
                    onClick={handleDownloadMock}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <FileDown className="w-4 h-4" /> Download PDF
                  </button>
                  <button
                    onClick={() => setPreviewResume(null)}
                    className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors ml-2"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body (Scrollable Document) */}
              <div className="overflow-y-auto p-4 md:p-8 flex-1">
                {/* เรียกใช้ Component ย่อยโดยส่ง config ของใบที่คลิกไป */}
                <ResumeDocument config={previewResume.config} db={db} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // VIEW 2: BUILDER (หน้าสร้าง/แก้ไข Resume)
  // =========================================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: RESUME BUILDER (คลังข้อมูล & ตัวสร้าง) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[90vh]">
          <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
            <div>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 mt-1">
                <FileText className="w-5 h-5 text-blue-600" />
                {editingId ? "Edit Resume" : "Create New Resume"}
              </h2>
            </div>
            <button
              onClick={handleSaveResume}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Resume
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-8">
            {/* Section 1: Role & Summary */}
            <section className="space-y-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
                <User className="w-4 h-4" /> Role & Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Target Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI Engineer"
                    className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    value={resumeConfig.targetRole}
                    onChange={(e) =>
                      setResumeConfig({
                        ...resumeConfig,
                        targetRole: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Target Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Company A"
                    className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    value={resumeConfig.targetCompany}
                    onChange={(e) =>
                      setResumeConfig({
                        ...resumeConfig,
                        targetCompany: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Executive Summary
                </label>
                <textarea
                  placeholder="Tailor your summary..."
                  className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none h-20"
                  value={resumeConfig.summary}
                  onChange={(e) =>
                    setResumeConfig({
                      ...resumeConfig,
                      summary: e.target.value,
                    })
                  }
                />
              </div>
            </section>

            {/* Section 2: Skills */}
            <section className="space-y-3">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
                <Code className="w-4 h-4" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {db.skills.map((skill) => {
                  const isSelected = resumeConfig.selectedSkills.includes(
                    skill.id,
                  );
                  return (
                    <button
                      key={skill.id}
                      onClick={() =>
                        toggleSelection("selectedSkills", skill.id)
                      }
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
                    >
                      {isSelected && <Check className="w-3 h-3" />} {skill.name}
                    </button>
                  );
                })}
              </div>
              <form onSubmit={handleAddNewSkill} className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Type new skill & press Enter..."
                  className="flex-1 text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                />
                <button
                  type="submit"
                  className="bg-slate-800 text-white px-3 rounded-md text-sm hover:bg-slate-700"
                >
                  Add
                </button>
              </form>
            </section>

            {/* Section 3: Projects */}
            <section className="space-y-3">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
                <FileText className="w-4 h-4" /> Projects
              </h3>
              <div className="space-y-2">
                {db.projects.map((proj) => {
                  const isSelected = resumeConfig.selectedProjects.includes(
                    proj.id,
                  );
                  return (
                    <div
                      key={proj.id}
                      onClick={() =>
                        toggleSelection("selectedProjects", proj.id)
                      }
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-300"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm text-slate-900">
                            {proj.title}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {proj.description}
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {showProjectForm ? (
                <form
                  onSubmit={handleAddNewProject}
                  className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-3 relative"
                >
                  <button
                    type="button"
                    onClick={() => setShowProjectForm(false)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <h4 className="text-sm font-semibold">Create New Project</h4>
                  <input
                    type="text"
                    placeholder="Project Title"
                    required
                    className="w-full text-sm p-2 border rounded-md"
                    value={newProject.title}
                    onChange={(e) =>
                      setNewProject({ ...newProject, title: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Your Role"
                    required
                    className="w-full text-sm p-2 border rounded-md"
                    value={newProject.role}
                    onChange={(e) =>
                      setNewProject({ ...newProject, role: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Description"
                    required
                    className="w-full text-sm p-2 border rounded-md h-16"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Save & Select
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="flex items-center justify-center gap-1 w-full p-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Create New Project
                </button>
              )}
            </section>

            {/* Section 4 & 5: Experience & Certs */}
            <div className="grid grid-cols-2 gap-6">
              <section className="space-y-3">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
                  <Briefcase className="w-4 h-4" /> Experience
                </h3>
                {db.experience.map((exp) => (
                  <label
                    key={exp.id}
                    className="flex items-start gap-2 text-sm cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={resumeConfig.selectedExperience.includes(exp.id)}
                      onChange={() =>
                        toggleSelection("selectedExperience", exp.id)
                      }
                      className="mt-1 accent-blue-600"
                    />
                    <div>
                      <div className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                        {exp.role}
                      </div>
                      <div className="text-xs text-slate-500">
                        {exp.company}
                      </div>
                    </div>
                  </label>
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
                  <CheckCircle className="w-4 h-4" /> Certificates
                </h3>
                {db.certificates.map((cert) => (
                  <label
                    key={cert.id}
                    className="flex items-start gap-2 text-sm cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={resumeConfig.selectedCerts.includes(cert.id)}
                      onChange={() => toggleSelection("selectedCerts", cert.id)}
                      className="mt-1 accent-blue-600"
                    />
                    <div className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                      {cert.name}
                    </div>
                  </label>
                ))}
              </section>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE RESUME PREVIEW */}
        {/* เรียกใช้ Component ย่อยตัวเดียวกันกับใน Modal ทำให้โค้ดสะอาด ไม่ซ้ำซ้อน */}
        <div className="sticky top-6 h-[90vh] overflow-y-auto hidden lg:block rounded-2xl shadow-xl border-slate-200 border bg-white p-2">
          <ResumeDocument config={resumeConfig} db={db} />
        </div>
      </div>
    </div>
  );
}
