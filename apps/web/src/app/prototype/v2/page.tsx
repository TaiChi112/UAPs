"use client";
import React, { useState } from 'react';
import { Briefcase, Code, FileText, Award, CheckCircle, Plus, X, User, Check, Building } from 'lucide-react';

// 1. Initial Mock Database (ข้อมูลตั้งต้นในคลัง)
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
    { id: "p1", title: "E-Commerce Microservices", role: "Backend Developer", description: "Built scalable backend services using Java and Spring Boot." },
    { id: "p2", title: "Customer Churn Prediction", role: "AI Engineer", description: "Developed an ML model using Python and TensorFlow with 85% accuracy." },
  ],
  experience: [
    { id: "e1", company: "Tech Solutions Inc.", role: "Software Engineer Intern", duration: "Jun 2024 - Aug 2024", responsibilities: "Developed RESTful APIs using Node.js." },
    { id: "e2", company: "Data Driven Co.", role: "Data Analyst Intern", duration: "Jun 2023 - Aug 2023", responsibilities: "Cleaned and pre-processed large datasets." },
  ],
  certificates: [
    { id: "c1", name: "AWS Certified Developer", year: "2025" },
    { id: "c2", name: "DeepLearning.AI TensorFlow", year: "2024" }
  ],
  awards: [
    { id: "a1", name: "1st Place - Hackathon 2025", desc: "Built an AI-driven healthcare app." }
  ]
};

export default function ResumeBuilder() {
  // State 1: คลังข้อมูลกลาง (Master DB) ที่สามารถถูกเพิ่มข้อมูลได้
  const [db, setDb] = useState(INITIAL_DB);

  // State 2: ข้อมูลสำหรับ Resume ฉบับใหม่ที่กำลังสร้าง (เก็บแค่ ID ของสิ่งที่เลือก)
  const [resumeConfig, setResumeConfig] = useState({
    targetRole: "",
    targetCompany: "",
    summary: "",
    selectedSkills: [] as string[],
    selectedProjects: [] as string[],
    selectedExperience: [] as string[],
    selectedCerts: [] as string[],
    selectedAwards: [] as string[],
  });

  // States สำหรับแบบฟอร์ม Inline Add (สร้างข้อมูลใหม่)
  const [newSkill, setNewSkill] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", role: "", description: "" });

  // --- Functions: Toggling Selections (เปิด/ปิด การเลือกข้อมูลจากคลัง) ---
  const toggleSelection = (category: keyof typeof resumeConfig, id: string) => {
    setResumeConfig(prev => {
      const currentSelection = prev[category] as string[];
      if (currentSelection.includes(id)) {
        return { ...prev, [category]: currentSelection.filter(item => item !== id) };
      } else {
        return { ...prev, [category]: [...currentSelection, id] };
      }
    });
  };

  // --- Functions: Inline Quick Add (เพิ่มลงคลัง + เลือกใช้ทันที) ---
  const handleAddNewSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    
    const newId = `s-${Date.now()}`;
    const skillObj = { id: newId, name: newSkill.trim(), category: "custom" };
    
    // 1. เพิ่มลง Master DB
    setDb(prev => ({ ...prev, skills: [...prev.skills, skillObj] }));
    // 2. เลือกใช้งานใน Resume ทันที
    setResumeConfig(prev => ({ ...prev, selectedSkills: [...prev.selectedSkills, newId] }));
    // 3. เคลียร์ฟอร์ม
    setNewSkill("");
  };

  const handleAddNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;

    const newId = `p-${Date.now()}`;
    const projectObj = { ...newProject, id: newId };

    // 1. เพิ่มลง Master DB
    setDb(prev => ({ ...prev, projects: [...prev.projects, projectObj] }));
    // 2. เลือกใช้งานใน Resume ทันที
    setResumeConfig(prev => ({ ...prev, selectedProjects: [...prev.selectedProjects, newId] }));
    // 3. ปิด/เคลียร์ฟอร์ม
    setShowProjectForm(false);
    setNewProject({ title: "", role: "", description: "" });
  };

  // --- Derived Data: ดึงข้อมูลเต็มๆ จาก DB ตาม ID ที่ User เลือก ---
  const previewData = {
    skills: db.skills.filter(s => resumeConfig.selectedSkills.includes(s.id)),
    projects: db.projects.filter(p => resumeConfig.selectedProjects.includes(p.id)),
    experience: db.experience.filter(e => resumeConfig.selectedExperience.includes(e.id)),
    certificates: db.certificates.filter(c => resumeConfig.selectedCerts.includes(c.id)),
    awards: db.awards.filter(a => resumeConfig.selectedAwards.includes(a.id)),
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: RESUME BUILDER (คลังข้อมูล & ตัวสร้าง) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[90vh]">
          <div className="bg-slate-50 border-b border-slate-200 p-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <FileText className="w-5 h-5 text-blue-600" />
              Resume Builder
            </h2>
            <p className="text-sm text-slate-500 mt-1">Select from Database or Add New directly.</p>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-8">
            
            {/* Section 1: Target Position & Summary */}
            <section className="space-y-4">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
                <User className="w-4 h-4" /> Role & Summary
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Target Role</label>
                  <input 
                    type="text" placeholder="e.g. AI Engineer" 
                    className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    value={resumeConfig.targetRole}
                    onChange={e => setResumeConfig({...resumeConfig, targetRole: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Target Company</label>
                  <input 
                    type="text" placeholder="e.g. Company A" 
                    className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    value={resumeConfig.targetCompany}
                    onChange={e => setResumeConfig({...resumeConfig, targetCompany: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Executive Summary</label>
                <textarea 
                  placeholder="Tailor your summary for this specific role and company..." 
                  className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none h-20"
                  value={resumeConfig.summary}
                  onChange={e => setResumeConfig({...resumeConfig, summary: e.target.value})}
                />
              </div>
            </section>

            {/* Section 2: Skills (Hybrid Add Demo) */}
            <section className="space-y-3">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
                <Code className="w-4 h-4" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* ปุ่มเลือก Skill จากคลัง */}
                {db.skills.map(skill => {
                  const isSelected = resumeConfig.selectedSkills.includes(skill.id);
                  return (
                    <button
                      key={skill.id}
                      onClick={() => toggleSelection('selectedSkills', skill.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${
                        isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {skill.name}
                    </button>
                  );
                })}
              </div>
              {/* ฟอร์มเพิ่ม Skill ใหม่ลงคลัง */}
              <form onSubmit={handleAddNewSkill} className="flex gap-2 mt-2">
                <input 
                  type="text" placeholder="Type new skill & press Enter..." 
                  className="flex-1 text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newSkill} onChange={e => setNewSkill(e.target.value)}
                />
                <button type="submit" className="bg-slate-800 text-white px-3 rounded-md text-sm hover:bg-slate-700">Add</button>
              </form>
            </section>

            {/* Section 3: Projects (Hybrid Add Demo) */}
            <section className="space-y-3">
              <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
                <FileText className="w-4 h-4" /> Projects
              </h3>
              <div className="space-y-2">
                {/* ลิสต์เลือก Project จากคลัง */}
                {db.projects.map(proj => {
                  const isSelected = resumeConfig.selectedProjects.includes(proj.id);
                  return (
                    <div 
                      key={proj.id} 
                      onClick={() => toggleSelection('selectedProjects', proj.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-sm text-slate-900">{proj.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{proj.description}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ฟอร์มเพิ่ม Project ใหม่ลงคลัง */}
              {showProjectForm ? (
                <form onSubmit={handleAddNewProject} className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-3 relative">
                  <button type="button" onClick={() => setShowProjectForm(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                  <h4 className="text-sm font-semibold">Create New Project</h4>
                  <input type="text" placeholder="Project Title" required className="w-full text-sm p-2 border rounded-md" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
                  <input type="text" placeholder="Your Role" required className="w-full text-sm p-2 border rounded-md" value={newProject.role} onChange={e => setNewProject({...newProject, role: e.target.value})} />
                  <textarea placeholder="Description" required className="w-full text-sm p-2 border rounded-md h-16" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700">Save & Select</button>
                </form>
              ) : (
                <button onClick={() => setShowProjectForm(true)} className="flex items-center justify-center gap-1 w-full p-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-lg text-sm hover:border-blue-400 hover:text-blue-600 transition-colors">
                  <Plus className="w-4 h-4" /> Create New Project
                </button>
              )}
            </section>

            {/* Section 4 & 5: Experience & Certs (Simple Selector) */}
            <div className="grid grid-cols-2 gap-6">
              <section className="space-y-3">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
                  <Briefcase className="w-4 h-4" /> Experience
                </h3>
                {db.experience.map(exp => (
                  <label key={exp.id} className="flex items-start gap-2 text-sm cursor-pointer group">
                    <input type="checkbox" checked={resumeConfig.selectedExperience.includes(exp.id)} onChange={() => toggleSelection('selectedExperience', exp.id)} className="mt-1 accent-blue-600" />
                    <div>
                      <div className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{exp.role}</div>
                      <div className="text-xs text-slate-500">{exp.company}</div>
                    </div>
                  </label>
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
                  <CheckCircle className="w-4 h-4" /> Certificates
                </h3>
                {db.certificates.map(cert => (
                  <label key={cert.id} className="flex items-start gap-2 text-sm cursor-pointer group">
                    <input type="checkbox" checked={resumeConfig.selectedCerts.includes(cert.id)} onChange={() => toggleSelection('selectedCerts', cert.id)} className="mt-1 accent-blue-600" />
                    <div className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{cert.name}</div>
                  </label>
                ))}
              </section>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: LIVE RESUME PREVIEW (Dynamic Layout) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 min-h-[90vh] sticky top-6">
          
          <div className="text-center mb-6 border-b pb-6">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{db.basicInfo.name}</h1>
            
            {/* Dynamic Role/Company Display */}
            {(resumeConfig.targetRole || resumeConfig.targetCompany) && (
              <div className="text-blue-600 font-semibold mt-2 text-lg">
                {resumeConfig.targetRole} {resumeConfig.targetCompany && `@ ${resumeConfig.targetCompany}`}
              </div>
            )}
            
            <div className="flex justify-center gap-4 text-sm text-slate-500 mt-3">
              <span>{db.basicInfo.email}</span>
              <span>•</span>
              <span>{db.basicInfo.phone}</span>
            </div>

            {/* Dynamic Summary */}
            {resumeConfig.summary && (
              <p className="mt-4 text-slate-700 text-sm leading-relaxed max-w-2xl mx-auto italic">
                {resumeConfig.summary}
              </p>
            )}
          </div>

          <div className="space-y-6">
            
            {/* DYNAMIC: Skills Section */}
            {previewData.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {previewData.skills.map(skill => (
                    <span key={skill.id} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded font-medium">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* DYNAMIC: Experience Section */}
            {previewData.experience.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">Experience</h3>
                <div className="space-y-4">
                  {previewData.experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-semibold text-slate-900">{exp.role}</h4>
                        <span className="text-xs text-slate-500 font-medium">{exp.duration}</span>
                      </div>
                      <div className="text-sm text-slate-600 mb-1 flex items-center gap-1"><Building className="w-3 h-3"/> {exp.company}</div>
                      <p className="text-sm text-slate-700 pl-4 border-l-2 border-slate-200">{exp.responsibilities}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DYNAMIC: Projects Section */}
            {previewData.projects.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">Key Projects</h3>
                <div className="space-y-4">
                  {previewData.projects.map(proj => (
                    <div key={proj.id}>
                      <h4 className="font-semibold text-slate-900">{proj.title} <span className="text-slate-400 font-normal text-sm">| {proj.role}</span></h4>
                      <p className="text-sm text-slate-700 mt-1">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DYNAMIC: Certificates Section */}
            {previewData.certificates.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">Certifications</h3>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                  {previewData.certificates.map(cert => (
                    <li key={cert.id}>{cert.name} ({cert.year})</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Empty State Help Text (ถ้าไม่ได้เลือกอะไรเลยให้แสดงข้อความนี้) */}
            {previewData.skills.length === 0 && previewData.projects.length === 0 && previewData.experience.length === 0 && previewData.certificates.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Your resume is currently empty.</p>
                <p className="text-sm">Start selecting or adding information from the left panel.</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}