# CareerVault AI

AI-powered resume strategist for people who want a single source of truth for career data, then tailor resumes to each role without inventing experience.

## Overview

CareerVault AI helps first-job seekers and tech professionals maintain a centralized career vault and generate job-specific resumes from that source. The core idea is simple: store verified facts once, then reuse them across multiple resume versions with manual control or AI-assisted tailoring.

## Why this exists

- Application fatigue: editing the same resume into multiple variants wastes time.
- ATS mismatch: strong candidates still get filtered out when keyword coverage is weak.
- AI hallucination: generic resume tools may add skills or claims that are not true.
- Scattered data: skills, projects, and experiences often live in separate files or memory.

## Product Goals

1. Centralize all career data in one vault.
2. Support both manual resume building and AI-assisted tailoring.
3. Keep every generated resume grounded in real data already stored in the vault.
4. Surface missing skills and content gaps so the user can improve the source data.

## Core MVP

### 1. Data Vault

Store the canonical career profile in one place:

- Basic info
- Skills
- Projects
- Experience
- Certificates
- Awards

Inline quick add is part of the flow, so users can add a new skill or project while building a resume and sync it back into the vault immediately.

### 2. Dashboard and Resume Management

The dashboard should show all created resumes as cards and support the full CRUD flow:

- Preview in a modal
- Edit
- Duplicate
- Delete

Status tracking can be used as a lightweight job tracker with values such as Draft, Applied, and Interviewing.

### 3. Manual Resume Builder

Users can set a target role and target company, then select or deselect items from the vault to compose the resume.

The layout should be dynamic: if a section is empty or not selected, it should disappear automatically instead of consuming page space.

### 4. AI-Tailored Builder

The AI flow is designed to be useful without becoming fictional:

- Paste a Job Description into the builder.
- Match the JD against the vault and pull only relevant data.
- Rewrite summaries and project descriptions to better fit the JD keywords.
- Report missing skills or gaps, then let the user add them to the vault.

The important constraint is zero hallucination: the system must not invent experience, skills, or outcomes that are not already present in the vault.

## Suggested Tech Stack

- Frontend: React, Next.js App Router, Tailwind CSS, Lucide Icons
- Backend / API: Next.js Route Handlers or Node.js with Express
- Database: PostgreSQL with Prisma or Drizzle ORM
- Authentication: NextAuth.js or Clerk
- AI / LLM: Google Gemini API or OpenAI API with JSON-first prompting
- PDF export: `@react-pdf/renderer` or Puppeteer

## Future Roadmap

### Phase 2

Connect a real LLM API and add user authentication.

### Phase 3

Add OCR for pasted images or screenshots of Job Descriptions, with human review before finalization.

### Phase 4

Import data from third-party sources such as GitHub commits, LeetCode, or LinkedIn.

### Phase 5

Offer multiple resume templates, including ATS-friendly and creative styles.

## Thai Summary

CareerVault AI คือแพลตฟอร์มสำหรับเก็บข้อมูลสายอาชีพแบบศูนย์กลาง แล้วนำข้อมูลนั้นมาใช้สร้าง Resume หลายเวอร์ชันได้อย่างเป็นระบบ โดยยังคุมคุณภาพด้วยแนวคิด zero hallucination

### ปัญหาที่ต้องการแก้

- ต้องแก้ Resume ซ้ำหลายไฟล์เมื่อสมัครหลายบริษัท
- Resume มักไม่ผ่าน ATS เพราะ keyword ไม่ตรงกับ Job Description
- เครื่องมือ AI บางแบบแต่งข้อมูลเกินจริง ทำให้เกิดปัญหาตอนสัมภาษณ์
- ข้อมูล skills, projects, experience กระจัดกระจายอยู่หลายที่

### แนวทางแก้

- เก็บข้อมูลทุกอย่างไว้ใน Data Vault เดียว
- เลือกทำ Resume แบบ Manual ได้
- ใช้ AI ช่วยวิเคราะห์ JD และจัดข้อมูลจาก Vault ให้เหมาะกับตำแหน่งงาน
- แจ้ง gap analysis เพื่อบอกสิ่งที่ขาด แล้วให้ผู้ใช้เพิ่มกลับเข้า Vault ได้ทันที

### ฟีเจอร์ MVP

- Data Vault สำหรับเก็บ Basic Info, Skills, Projects, Experience, Certificates, Awards
- Dashboard สำหรับดู จัดการ ทำซ้ำ และลบ Resume
- Manual Resume Builder สำหรับเลือกข้อมูลจาก Vault
- AI-Tailored Builder สำหรับ paste JD แล้วให้ระบบช่วยจับคู่และ rewrite แบบไม่บิดเบือนความจริง

## Small Improvements You May Want Next

1. Add screenshots or a short GIF for the dashboard and resume builder.
2. Add a quick start section with local run commands for this web app.
3. Add links to the main routes, such as Dashboard, Resume Builder, and HR Filter.
4. Add a note describing how the AI builder should avoid hallucination in implementation.