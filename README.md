>[!WARNING]
>Unpolished & Unorganized: You will likely encounter raw notes, inconsistent Markdown formatting, and incomplete setup guides. Formatting cleanup is performed in batches rather than continuously.

>[!CAUTION]
>Breaking Changes: Expect frequent refactors that may break existing functionality without notice. Do not rely on this project for production-critical tasks until a stable release (v1.0.0) is tagged.

>[!NOTE]
>Project Context: This repository is part of my personal R&D and academic journey as a Computer Science Student interested in becoming an Agentic Software Engineer. It serves as a sandbox for exploring new architectures and performance-oriented languages.

>[!TIP]
>How to Navigate: Since the documentation might lag behind, the most reliable way to understand the current logic is to check the recent commit history or explore the /src directory directly.

>[!IMPORTANT]
>Documentation Mismatch: I am prioritizing the use of AI Assistants for rapid feature iteration over manual documentation updates. Most of the README content below is stale or reflects an older architectural version.

# Universal Academic Portfolio System (UAPS)

## MVP Implementation Status (เริ่มลงมือพัฒนาแล้ว)

โครงสร้างเริ่มต้นสำหรับ MVP ถูกสร้างแล้วในรูปแบบ Monorepo:

- `apps/web`: Frontend ด้วย Next.js (App Router)
- `apps/api`: Backend ด้วย Elysia (REST API สำหรับ Portfolio/Resume)
- `packages/db/sql/001_init_uaps.sql`: PostgreSQL schema เริ่มต้น

### Current MVP Slice

- Frontend pages: Overview, Dashboard, Portfolio (Projects/Skills/Experiences), Resume List, Resume Create
- API endpoints ที่พร้อมใช้งาน:
    - `GET /v1/health`
    - `GET/POST /v1/projects`
    - `GET/POST /v1/skills`
    - `GET/POST /v1/experiences`
    - `GET/POST /v1/resumes`
    - `POST /v1/resumes/:resumeId/compose`
    - `GET /v1/resumes/:resumeId/preview`
    - `GET /v1/resumes/:resumeId/export/:format` (รองรับ `json`, `md`; `pdf` และ `image` เป็น planned)

### Run Locally

```bash
bun install
bun run dev:api
bun run dev:web
```

ค่าเริ่มต้นของ API อยู่ที่ `http://localhost:4000` และ Web อยู่ที่ `http://localhost:3000`

### Docker Workflow (WSL First)

โปรเจกต์นี้แนะนำให้รัน Docker จากฝั่ง WSL เท่านั้น (เหมาะกับผู้ใช้ Docker Engine on WSL):

```bash
docker ps
docker compose up -d
```

ถ้าเปิด terminal ฝั่ง Windows แล้วเจอ `docker: command not found` ให้เปิด VS Code terminal ที่เป็น WSL shell แล้วรันคำสั่ง Docker ต่อได้ทันที

### GitHub OAuth Setup (MVP)

1. ไปที่ GitHub Settings > Developer settings > OAuth Apps > New OAuth App
2. กรอกข้อมูล:
    - Application name: `UAPS Local MVP`
    - Homepage URL: `http://localhost:3000`
    - Authorization callback URL: `http://localhost:4000/v1/auth/github/callback`
3. หลังสร้างเสร็จ จะได้ค่า `Client ID`
4. กด `Generate a new client secret` เพื่อได้ค่า `Client Secret`
5. นำค่าไปใส่ไฟล์ env:
    - `apps/api/.env` ใส่ `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `API_BASE_URL`, `WEB_APP_URL`, `JWT_SECRET`
    - `apps/web/.env` ใส่ `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_WEB_BASE_URL`

### Database Bootstrap

ถ้าต้องการเริ่มใช้ PostgreSQL schema ให้รันไฟล์:

- `packages/db/sql/001_init_uaps.sql`

หมายเหตุ: เวอร์ชันเริ่มต้นนี้ใช้ in-memory store ใน API เพื่อให้พัฒนา flow ได้เร็ว ก่อนเชื่อม persistence จริงในขั้นถัดไป

### Mock Data Seed (Use Case Demo)

หลังจาก sign in อย่างน้อย 1 ครั้ง (เพื่อให้มี user record) สามารถ seed ข้อมูลตัวอย่างสำหรับ demo use case ได้ด้วย:

```bash
cat packages/db/sql/002_seed_mock_use_case.sql | docker exec -i csi_postgres psql -U postgres -d uaps
```

ไฟล์นี้จะเติมข้อมูลตัวอย่างในตาราง Skills/Projects/Experiences/Resumes และเชื่อม composition ให้เห็น flow การทำ Resume หลายเวอร์ชันจากข้อมูลชุดเดียว โดยมีทั้งแนว Backend และ AI Engineer

นอกจากนี้ seed ชุดใหม่จะสร้าง Resume พื้นฐาน (`Core Profile - Base (Private)`) ก่อน แล้วค่อยมี Resume ที่ tailor งานแต่ละสายเพื่อแสดงแนวทาง add project/skill/experience ลงใน resume ที่มีโครงพื้นฐานแล้ว

ถ้าต้องการ mock ผู้สมัครหลายคนที่เปิด `public` / `company-only` เพื่อเดโหมด HR/Recruiter marketplace ให้รันเพิ่ม:

```bash
bun run --cwd apps/api scripts/seed-recruiter-mock.ts
```

คำสั่งนี้จะ apply schema visibility ที่จำเป็น (idempotent) และเติมข้อมูล demo ผู้สมัครหลายโปรไฟล์สำหรับทดสอบหน้า Home + HR filter ได้ทันที

### Visibility + Recruiter Access Schema (Design Foundation)

ถ้าต้องการรองรับ public/private resume, การ filter โดย HR/Recruiter และ audit กัน scam ให้ apply schema เพิ่มดังนี้:

```bash
cat packages/db/sql/003_resume_visibility_recruiter_access.sql | docker exec -i csi_postgres psql -U postgres -d uaps
```

ไฟล์นี้จะเพิ่ม:
- `resumes.visibility` (`private`, `public`, `company-only`)
- `resume_basics` สำหรับข้อมูลพื้นฐานที่ทุก resume ควรมี
- `companies`, `recruiter_accounts`, `recruiter_verifications`
- `resume_access_requests`, `resume_access_audit_logs`, `fraud_signals`

## Project Overview (แนวคิดโครงการ)
- UAPS คือระบบจัดการพอร์ตโฟลิโอและเรซูเม่แบบรวมศูนย์ (Centralized Portfolio Management System) สำหรับนักศึกษาและผู้สมัครงาน
- ปัญหาของการสมัครงานในปัจจุบันคือ ผู้สมัครมักมีเรซูเม่เพียงรูปแบบเดียว (One-size-fits-all) ทำให้ไม่สามารถนำเสนอจุดเด่นที่ตรงกับความต้องการของแต่ละบริษัทได้อย่างเต็มที่ UAPS จึงถูกออกแบบมาเพื่อแก้ปัญหานี้ โดยอนุญาตให้ผู้ใช้บันทึกข้อมูลตั้งต้น (Master Data) ทั้งหมดไว้ในที่เดียว และสามารถ "เลือกหยิบ" (Cherry-pick) ข้อมูลเหล่านั้นมาสร้างเป็นเรซูเม่ที่ปรับแต่งให้เหมาะสมกับแต่ละตำแหน่งงานได้อย่างรวดเร็ว

**Core Features:**
- จัดเก็บข้อมูลผลงาน (Project), ประสบการณ์ (Experience), และทักษะ (Skill) ไว้ในฐานข้อมูลส่วนตัว
- สร้างเรซูเม่ (Resume/CV) ได้ไม่จำกัดรูปแบบ โดยดึงเฉพาะข้อมูลที่เกี่ยวข้องกับตำแหน่งงานเป้าหมายมาใช้งาน

**Use Case & Core Value (ตัวอย่างสถานการณ์ใช้งาน)**
- เพื่อให้เห็นภาพความสามารถของระบบอย่างชัดเจน สมมติว่าผู้ใช้งานมีทักษะและผลงานทั้งด้าน AI และ Web Development:
    - Scenario A (สมัครงาน AI Engineer): ผู้ใช้งานสร้าง Resume ใบที่ 1 โดยระบบจะให้เลือกดึงเฉพาะข้อมูล Project ที่เกี่ยวกับการทำ Machine Learning และ Skill ด้าน Python/Data Science มาแสดงผล เพื่อยื่นสมัครบริษัท A และ B
    - Scenario B (สมัครงาน Software Engineer): ผู้ใช้งานสร้าง Resume ใบที่ 2 (หรือกดทำซ้ำจากใบแรก) แล้วสลับไปดึงผลงาน Project ที่เกี่ยวกับการเขียน Web API และ Skill ด้าน JavaScript มาแสดงผลแทน เพื่อยื่นสมัครบริษัท C และ D
- The Result: ผู้ใช้งานสามารถจับคู่ (Map) คุณสมบัติของตนเองให้ตรงกับ Job Description ของแต่ละบริษัทได้แม่นยำที่สุด ซึ่งช่วยเพิ่มโอกาสในการผ่านการคัดเลือก (Screening Process)

**Technical Focus (เป้าหมายเชิงเทคนิค)**
- โปรเจกต์นี้ถูกพัฒนาขึ้นโดยมีวัตถุประสงค์หลักเพื่อ ศึกษาและประยุกต์ใช้ความรู้ด้านการออกแบบฐานข้อมูลเชิงสัมพันธ์ (Relational Database Design) ตั้งแต่การวางโครงสร้างระดับแนวคิด (Conceptual), ระดับตรรกะ (Logical), ไปจนถึงการบังคับใช้ข้อจำกัดในระดับกายภาพ (Physical Implementation) ผ่าน PostgreSQL

## Entity
- User
    - userID
    - name
    - email
    - githubURL
- Project
    - projectID
    - userID
    - title
    - description
    - repoURL
    - isActive
    - status 
- Skill
    - skillID
    - name
    - category
- Experience
    - experienceID
    - userID
    - description
    - achievement
    - organization
    - role
    - startDate
    - endDate 
- Resume
    - resumeID
    - userID
    - versionName
    - targetJobTitle
    - targetCompany
    - isActive
    - status 
    - createdAt
    - updatedAt
- ResumeProject
    - resumeID
    - projectID
- ResumeSkill
    - resumeID
    - skillID
- ResumeExperience
    - resumeID
    - experienceID
- UserSkill
    - userID
    - skillID
    - proficiencyLevel
- ProjectSkill
    - projectID
    - skillID
- ExperienceSkill
    - experienceID
    - skillID

## Relationship

**Conceptual Relationships (ความสัมพันธ์เชิงแนวคิดภาพรวม)**
- User 1 : M Project (1 user มีหลาย project)
- User 1 : M Experience (1 user มีหลาย experience)
- User 1 : M Resume (1 user มีหลาย resume)
- User M : M Skill (หลาย user มีหลาย skill & หลาย skill อยู่ในหลาย user)
- Project M : M Skill (หลาย project มีการใช้หลาย skill & หลาย skill มีการใช้หลาย project)
- Project M : M Resume (หลาย project ถูกนำไปใช้ในหลาย resume & หลาย resume มีหลาย project)
- Experience M : M Resume (หลาย experience ถูกนำไปใช้ในหลาย resume & หลาย resume มีหลาย experience)
- Experience M : M Skill (หลาย experience มีการใช้หลาย skill & หลาย skill มีการใช้หลาย experience)
- Skill M : M Resume (หลาย skill ถูกนำไปใช้ในหลาย resume & หลาย resume มีหลาย skill)

**Logical Relationships (ความสัมพันธ์ระดับตารางฐานข้อมูลจริงที่ถูก Resolve แล้ว)**
- User 1 : M UserSkill
- Skill 1 : M UserSkill
- Project 1 : M ProjectSkill
- Skill 1 : M ProjectSkill
- Resume 1 : M ResumeProject
- Project 1 : M ResumeProject
- Resume 1 : M ResumeExperience
- Experience 1 : M ResumeExperience
- Resume 1 : M ResumeSkill
- Skill 1 : M ResumeSkill
- Experience 1 : M ExperienceSkill
- Skill 1 : M ExperienceSkill

**Physical Relationships (ความสัมพันธ์ระดับกายภาพและข้อจำกัดของข้อมูล)**

ในระดับการนำไปสร้างจริง (Physical Implementation) จะใช้หลักการกำหนด Primary Key (PK) และ Foreign Key (FK) ร่วมกับข้อจำกัด (Constraints) ดังนี้:

**กลุ่ม Entity หลัก (Master Tables)**
- `User`: PK คือ `userID`
- `Project`: PK คือ `projectID`, FK คือ `userID` (อ้างอิง User)
- `Skill`: PK คือ `skillID`
- `Experience`: PK คือ `experienceID`, FK คือ `userID` (อ้างอิง User)
- `Resume`: PK คือ `resumeID`, FK คือ `userID` (อ้างอิง User)

**กลุ่มตารางเชื่อมโยง (Junction Tables)**
- `UserSkill`: Composite PK (`userID`, `skillID`), FK `userID` อ้างอิงตาราง User, FK `skillID` อ้างอิงตาราง Skill
- `ProjectSkill`: Composite PK (`projectID`, `skillID`), FK `projectID` อ้างอิงตาราง Project, FK `skillID` อ้างอิงตาราง Skill
- `ExperienceSkill`: Composite PK (`experienceID`, `skillID`), FK `experienceID` อ้างอิงตาราง Experience, FK `skillID` อ้างอิงตาราง Skill
- `ResumeProject`: Composite PK (`resumeID`, `projectID`), FK อ้างอิงตาราง Resume และ Project ตามลำดับ
- `ResumeSkill`: Composite PK (`resumeID`, `skillID`), FK อ้างอิงตาราง Resume และ Skill ตามลำดับ
- `ResumeExperience`: Composite PK (`resumeID`, `experienceID`), FK อ้างอิงตาราง Resume และ Experience ตามลำดับ

*หมายเหตุ: ตาราง Junction ทั้งหมดควรตั้งค่า Constraint `ON DELETE CASCADE` เพื่อให้ข้อมูลที่เชื่อมโยงกันถูกลบอัตโนมัติหากข้อมูลหลักถูกลบ เพื่อป้องกันปัญหาข้อมูลขยะ (Orphan Records)*


## Feature Planning & Future Roadmap
### Phase 1: Data Completeness (ส่วนขยายข้อมูลโปรไฟล์ให้สมบูรณ์)
- ขยายการรองรับข้อมูลส่วนบุคคลอื่นๆ (Scaling Entities) เพื่อให้ Resume มีความสมบูรณ์ยิ่งขึ้น โดยเตรียมเพิ่มตารางจัดเก็บข้อมูลดังนี้: Certificate, Award, Education, Training, Language และ Social Media Links
- พัฒนาระบบ Export ข้อมูล เพื่อให้ผู้ใช้สามารถดาวน์โหลด Resume ที่ถูก Tailor-made แล้วออกมาในรูปแบบ PDF หรือสร้างเป็น Web Link (Public URL) สำหรับแชร์ได้ทันที

### Phase 2: Automated Application System (ระบบอำนวยความสะดวกในการสมัครงาน)
- พัฒนาระบบรวบรวมข้อมูลบริษัทและอีเมลของฝ่ายทรัพยากรบุคคล (HR Contacts Database)
- สร้างฟีเจอร์ "1-Click Apply" ที่อนุญาตให้ผู้ใช้เลือก Resume Profile ที่สร้างไว้ และกดส่งอีเมลพร้อมแนบเอกสารไปยังบริษัทและตำแหน่งที่สนใจได้โดยตรงผ่านระบบ

### Phase 3: HR Headhunting & Matching (ระบบสำหรับองค์กรและฝ่ายบุคคล)
- พัฒนาระบบค้นหาสำหรับ HR (Reverse Search) เพื่อให้ฝั่งบริษัทสามารถเข้ามาค้นหาผู้สมัครที่มีคุณสมบัติตรงตามต้องการ
- สร้างเงื่อนไขการกรองขั้นสูง (Advanced Filtering) เช่น HR สามารถตั้งค่าค้นหา "นักศึกษาที่มี Skill ด้าน Python และมี Project ที่เกี่ยวข้องกับ AI มากกว่า 2 โปรเจกต์ขึ้นไป"
- มีระบบการส่งข้อความส่วนตัว (Direct Contact) เพื่อให้ HR สามารถส่งอีเมลหรือข้อความทาบทามเจ้าของ Resume ได้โดยตรงผ่านระบบ

<!-- - ให้ใครก็ตามที่เข้ามาสร้างเเละจัดเก็บข้อมูลที่เกี่ยวกับ resume or cv สามารถดึงข้อมูลออกมาทำ Resume หรือ CV ได้หลายรูปเเบบตามประเภทงานที่สมัครเเละบริษัท
- scale เพิ่ม table Certificate , Award , Education , Training , Language , Social Media
- รวม email HR เเละข้อมูลบริษัท เเล้วเลือก Resume or CV กดส่งไปตามบริษัทที่ตัวเองสนใจ ตามตำเเหน่งนั้นๆ 
- ถ้าในอนาคตมี resume or cv เต็มไปหมด HR อยากได้คนที่มี skill or project or experience มากกว่า 2 เป็นต้นไป HR ก็สามารถเอา email ของเจ้าของ resume or cv ไปเพื่อติดต่อส่วนตัวได้เลย -->

```sql
-- ==========================================
-- UAPS Database Schema (PostgreSQL)
-- ==========================================
-- คำแนะนำ: ก่อนรันสคริปต์นี้ใน PostgreSQL ควรสร้าง Database แยกไว้ต่างหาก
-- ทุกตารางใช้ UUID เป็น Primary Key เพื่อความปลอดภัยและรองรับการขยายตัวในอนาคต

-- 1. สร้างตาราง User (ผู้ใช้งานหลัก)
CREATE TABLE Users (
    userID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    githubURL VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. สร้างตาราง Skill (ข้อมูลทักษะที่เป็น Master Data)
CREATE TABLE Skills (
    skillID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100) -- เช่น 'Programming Language', 'Soft Skill', 'Tool'
);

-- 3. สร้างตาราง Project (ข้อมูลผลงาน)
CREATE TABLE Projects (
    projectID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userID UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    repoURL VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Completed', -- เช่น In Progress, Completed
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- 4. สร้างตาราง Experience (ข้อมูลประสบการณ์ทำงาน/กิจกรรม)
CREATE TABLE Experiences (
    experienceID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userID UUID NOT NULL,
    organization VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    description TEXT,
    achievement TEXT,
    startDate DATE,
    endDate DATE, -- หากเป็น null อาจแปลว่ากำลังทำอยู่ (Present)
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- 5. สร้างตาราง Resume (ข้อมูลโปรไฟล์เอกสารสำหรับสมัครงาน)
CREATE TABLE Resumes (
    resumeID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    userID UUID NOT NULL,
    versionName VARCHAR(255) NOT NULL, -- เช่น 'AI Engineer - Company A'
    targetJobTitle VARCHAR(255),
    targetCompany VARCHAR(255),
    isActive BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'Draft', -- เช่น Draft, Published
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE
);

-- ==========================================
-- สร้าง Junction Tables (สำหรับจัดการความสัมพันธ์ M:N)
-- ==========================================

-- 6. ความสัมพันธ์ระหว่าง User และ Skill
CREATE TABLE UserSkills (
    userID UUID NOT NULL,
    skillID UUID NOT NULL,
    proficiencyLevel VARCHAR(50), -- เช่น Beginner, Intermediate, Expert
    PRIMARY KEY (userID, skillID),
    FOREIGN KEY (userID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (skillID) REFERENCES Skills(skillID) ON DELETE CASCADE
);

-- 7. ความสัมพันธ์ระหว่าง Project และ Skill
CREATE TABLE ProjectSkills (
    projectID UUID NOT NULL,
    skillID UUID NOT NULL,
    PRIMARY KEY (projectID, skillID),
    FOREIGN KEY (projectID) REFERENCES Projects(projectID) ON DELETE CASCADE,
    FOREIGN KEY (skillID) REFERENCES Skills(skillID) ON DELETE CASCADE
);

-- 8. ความสัมพันธ์ระหว่าง Experience และ Skill
CREATE TABLE ExperienceSkills (
    experienceID UUID NOT NULL,
    skillID UUID NOT NULL,
    PRIMARY KEY (experienceID, skillID),
    FOREIGN KEY (experienceID) REFERENCES Experiences(experienceID) ON DELETE CASCADE,
    FOREIGN KEY (skillID) REFERENCES Skills(skillID) ON DELETE CASCADE
);

-- 9. ความสัมพันธ์ระหว่าง Resume และ Project (เลือกโปรเจกต์ไหนลงเรซูเม่บ้าง)
CREATE TABLE ResumeProjects (
    resumeID UUID NOT NULL,
    projectID UUID NOT NULL,
    PRIMARY KEY (resumeID, projectID),
    FOREIGN KEY (resumeID) REFERENCES Resumes(resumeID) ON DELETE CASCADE,
    FOREIGN KEY (projectID) REFERENCES Projects(projectID) ON DELETE CASCADE
);

-- 10. ความสัมพันธ์ระหว่าง Resume และ Skill (เลือกทักษะไหนลงเรซูเม่บ้าง)
CREATE TABLE ResumeSkills (
    resumeID UUID NOT NULL,
    skillID UUID NOT NULL,
    PRIMARY KEY (resumeID, skillID),
    FOREIGN KEY (resumeID) REFERENCES Resumes(resumeID) ON DELETE CASCADE,
    FOREIGN KEY (skillID) REFERENCES Skills(skillID) ON DELETE CASCADE
);

-- 11. ความสัมพันธ์ระหว่าง Resume และ Experience (เลือกประสบการณ์ไหนลงเรซูเม่บ้าง)
CREATE TABLE ResumeExperiences (
    resumeID UUID NOT NULL,
    experienceID UUID NOT NULL,
    PRIMARY KEY (resumeID, experienceID),
    FOREIGN KEY (resumeID) REFERENCES Resumes(resumeID) ON DELETE CASCADE,
    FOREIGN KEY (experienceID) REFERENCES Experiences(experienceID) ON DELETE CASCADE
);
```

<!-- - [ ] การออกแบบ ER Diagram
- [ ] การออกแบบ Schema
- [ ] การออกแบบ Normalization
- [ ] การออกแบบ Query
- [ ] การออกแบบ Trigger
- [ ] การออกแบบ View
- [ ] การออกแบบ Stored Procedure
- [ ] การออกแบบ Function
- [ ] การออกแบบ Index
- [ ] การออกแบบ Constraint
- [ ] การออกแบบ Trigger
- [ ] การออกแบบ View
- [ ] การออกแบบ Stored Procedure
- [ ] การออกแบบ Function
- [ ] การออกแบบ Index
- [ ] การออกแบบ Constraint -->
