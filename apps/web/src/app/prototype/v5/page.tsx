"use client";
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Code, FileText, CheckCircle, Plus, X, User, Check, 
  Building, LayoutDashboard, ArrowLeft, Save, Calendar, 
  Eye, Edit2, Copy, Trash2, FileDown, Tag, Sparkles, AlertTriangle, Play
} from 'lucide-react';

// =========================================================
// 1. DATABASE & INITIAL STATE
// =========================================================
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
    { id: "e2", company: "Data Driven Co.", role: "Data Analyst Intern", duration: "Jun 2023 - Aug 2023", responsibilities: "Cleaned and pre-processed large datasets using Python." },
  ],
  certificates: [
    { id: "c1", name: "AWS Certified Developer", year: "2025" },
    { id: "c2", name: "DeepLearning.AI TensorFlow", year: "2024" }
  ],
  awards: [
    { id: "a1", name: "1st Place - Hackathon 2025", desc: "Built an AI-driven healthcare app." }
  ]
};

const INITIAL_RESUMES = [
  {
    id: "res-1",
    title: "AI Engineer @ Company A",
    date: "10 May 2026",
    status: "Applied",
    config: {
      targetRole: "AI Engineer",
      targetCompany: "Company A",
      summary: "Passionate AI Engineer aiming to leverage machine learning skills to build scalable solutions.",
      selectedSkills: ["s1", "s4", "s5"],
      selectedProjects: ["p2"],
      selectedExperience: ["e2"],
      selectedCerts: ["c2"],
      selectedAwards: ["a1"],
    }
  },
  {
    id: "res-2",
    title: "Software Engineer @ Tech Flow",
    date: "08 May 2026",
    status: "Interviewing",
    config: {
      targetRole: "Software Engineer",
      targetCompany: "Tech Flow",
      summary: "Backend-focused developer with experience in microservices and cloud deployment.",
      selectedSkills: ["s2", "s3", "s5", "s6"],
      selectedProjects: ["p1"],
      selectedExperience: ["e1"],
      selectedCerts: ["c1"],
      selectedAwards: [],
    }
  }
];

const EMPTY_CONFIG = {
  targetRole: "", targetCompany: "", summary: "",
  selectedSkills: [], selectedProjects: [], selectedExperience: [], selectedCerts: [], selectedAwards: []
};

// =========================================================
// 2. SUB-COMPONENTS
// =========================================================

// --- Document Render Component (ใช้ซ้ำได้ทั้ง Preview และ Modal) ---
const ResumeDocument = ({ config, db }: { config: any, db: typeof INITIAL_DB }) => {
  const previewData = {
    skills: db.skills.filter(s => config.selectedSkills.includes(s.id)),
    projects: db.projects.filter(p => config.selectedProjects.includes(p.id)),
    experience: db.experience.filter(e => config.selectedExperience.includes(e.id)),
    certificates: db.certificates.filter(c => config.selectedCerts.includes(c.id)),
    awards: db.awards.filter(a => config.selectedAwards.includes(a.id)),
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 w-full max-w-[800px] mx-auto relative min-h-[800px] flex flex-col">
      <div className="text-center mb-6 border-b pb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{db.basicInfo.name}</h1>
        
        {(config.targetRole || config.targetCompany) && (
          <div className="text-blue-600 font-semibold mt-2 text-lg">
            {config.targetRole} {config.targetCompany && `@ ${config.targetCompany}`}
          </div>
        )}
        
        <div className="flex justify-center gap-4 text-sm text-slate-500 mt-3">
          <span>{db.basicInfo.email}</span><span>•</span><span>{db.basicInfo.phone}</span>
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
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {previewData.skills.map(skill => (
                <span key={skill.id} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded font-medium">{skill.name}</span>
              ))}
            </div>
          </div>
        )}

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

        {/* Empty State Indicator */}
        {previewData.skills.length === 0 && previewData.projects.length === 0 && previewData.experience.length === 0 && previewData.certificates.length === 0 && (
          <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Your resume is currently empty.</p>
            <p className="text-sm">Content will appear here as you select it.</p>
          </div>
        )}
      </div>
    </div>
  );
};


// =========================================================
// 3. MAIN APPLICATION COMPONENT
// =========================================================
export default function ResumeApp() {
  // --- Global States ---
  const [currentView, setCurrentView] = useState<'dashboard' | 'builder_manual' | 'builder_ai'>('dashboard');
  const [db, setDb] = useState(INITIAL_DB);
  const [savedResumes, setSavedResumes] = useState(INITIAL_RESUMES);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // --- Builder States ---
  const [resumeConfig, setResumeConfig] = useState(EMPTY_CONFIG);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // --- AI Feature States ---
  const [jobDescription, setJobDescription] = useState("");
  const [aiAnalysisState, setAiAnalysisState] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [aiFeedback, setAiFeedback] = useState<{ matchScore: number, missingSkills: string[] }>({ matchScore: 0, missingSkills: [] });

  // --- UI Form States ---
  const [newSkill, setNewSkill] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", role: "", description: "" });
  const [previewModal, setPreviewModal] = useState<any | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // =========================================================
  // ACTIONS: DATABASE (Inline Add)
  // =========================================================
  const toggleSelection = (category: keyof typeof resumeConfig, id: string) => {
    setResumeConfig(prev => {
      const currentSelection = prev[category] as string[];
      if (currentSelection.includes(id)) {
        return { ...prev, [category]: currentSelection.filter(item => item !== id) };
      }
      return { ...prev, [category]: [...currentSelection, id] };
    });
  };

  const handleAddNewSkill = (skillName: string) => {
    if (!skillName.trim()) return;
    const newId = `s-${Date.now()}`;
    const skillObj = { id: newId, name: skillName.trim(), category: "custom" };
    // เพิ่มลงคลัง
    setDb(prev => ({ ...prev, skills: [...prev.skills, skillObj] }));
    // เลือกให้ Resume อัตโนมัติ
    setResumeConfig(prev => ({ ...prev, selectedSkills: [...prev.selectedSkills, newId] }));
    setNewSkill("");
    return newId;
  };

  const handleAddNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim()) return;
    const newId = `p-${Date.now()}`;
    const projectObj = { ...newProject, id: newId };
    setDb(prev => ({ ...prev, projects: [...prev.projects, projectObj] }));
    setResumeConfig(prev => ({ ...prev, selectedProjects: [...prev.selectedProjects, newId] }));
    setShowProjectForm(false);
    setNewProject({ title: "", role: "", description: "" });
  };

  // =========================================================
  // ACTIONS: RESUME MANAGEMENT
  // =========================================================
  const handleSaveResume = () => {
    const titleName = resumeConfig.targetRole || resumeConfig.targetCompany 
      ? `${resumeConfig.targetRole || 'Untitled'} ${resumeConfig.targetCompany ? `@ ${resumeConfig.targetCompany}` : ''}`
      : `Untitled Resume ${savedResumes.length + 1}`;

    if (editingId) {
      setSavedResumes(prev => prev.map(res => 
        res.id === editingId ? { ...res, title: titleName, config: resumeConfig } : res
      ));
      setToastMessage("Resume updated successfully!");
    } else {
      const newResume = {
        id: `res-${Date.now()}`,
        title: titleName,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: "Draft",
        config: resumeConfig
      };
      setSavedResumes([newResume, ...savedResumes]);
      setToastMessage("New resume saved to Vault!");
    }
    
    // รีเซ็ต AI state ถ้ามี
    setJobDescription("");
    setAiAnalysisState('idle');
    setEditingId(null);
    setCurrentView('dashboard'); 
  };

  const handleEdit = (resume: typeof INITIAL_RESUMES[0]) => {
    setResumeConfig(resume.config);
    setEditingId(resume.id);
    setCurrentView('builder_manual');
    setPreviewModal(null);
  };

  const handleDuplicate = (resume: typeof INITIAL_RESUMES[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const duplicatedResume = {
      ...resume,
      id: `res-${Date.now()}`,
      title: `${resume.title} (Copy)`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: "Draft"
    };
    setSavedResumes([duplicatedResume, ...savedResumes]);
    setToastMessage("Resume duplicated!");
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedResumes(prev => prev.filter(r => r.id !== id));
    setToastMessage("Resume deleted.");
  };

  const handleStatusChange = (id: string, newStatus: string, e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    setSavedResumes(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  // =========================================================
  // ACTIONS: AI FEATURE (Mock LLM Service)
  // =========================================================
  const handleAnalyzeJD = () => {
    if (!jobDescription.trim()) {
      setToastMessage("Please paste a Job Description first.");
      return;
    }

    setAiAnalysisState('analyzing');
    
    // Simulate API Call delay
    setTimeout(() => {
      // Mock LLM Logic: สมมติว่า AI วิเคราะห์เสร็จแล้ว
      
      // 1. จัดเตรียม Config ให้ตรงกับ JD
      const suggestedConfig = {
        targetRole: "Data Engineer (Suggested)",
        targetCompany: "Tech Corp",
        summary: "Data Engineer with expertise in Python and AWS, aiming to optimize data pipelines as required in the Job Description.", // AI Rewritten summary
        selectedSkills: ["s1", "s5"], // ดึง Python, AWS มา
        selectedProjects: ["p2"], // ดึง ML/Data project มา
        selectedExperience: ["e2"],
        selectedCerts: [],
        selectedAwards: []
      };

      // 2. วิเคราะห์สิ่งที่ขาด (Gap Analysis)
      const mockMissingSkills = ["Kubernetes", "Apache Kafka", "Go"];
      
      setResumeConfig(suggestedConfig);
      setAiFeedback({
        matchScore: 65,
        missingSkills: mockMissingSkills
      });
      setAiAnalysisState('done');

    }, 2500);
  };

  const handleFixMissingSkill = (skill: string) => {
    handleAddNewSkill(skill); // เติมเข้าคลังและเลือกให้เลย
    // อัปเดต Feedback หลอกๆ ว่าเติมแล้วคะแนนขึ้น
    setAiFeedback(prev => ({
      matchScore: Math.min(100, prev.matchScore + 10),
      missingSkills: prev.missingSkills.filter(s => s !== skill)
    }));
    setToastMessage(`Added ${skill} to your Vault!`);
  };


  // =========================================================
  // RENDER HELPERS
  // =========================================================
  const statusColors: Record<string, string> = {
    "Draft": "bg-slate-100 text-slate-600 border-slate-200",
    "Applied": "bg-blue-50 text-blue-700 border-blue-200",
    "Interviewing": "bg-purple-50 text-purple-700 border-purple-200",
  };


  // =========================================================
  // VIEW 1: DASHBOARD
  // =========================================================
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10 font-sans relative">
        {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-bounce">
            <CheckCircle className="w-5 h-5 text-green-400" /> {toastMessage}
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {/* Header & Creation Options */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold flex items-center gap-3 text-slate-900 mb-6">
              <LayoutDashboard className="w-8 h-8 text-blue-600" /> My Vault & Resumes
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Manual */}
              <div 
                onClick={() => { setResumeConfig(EMPTY_CONFIG); setEditingId(null); setCurrentView('builder_manual'); }}
                className="bg-white border-2 border-slate-200 hover:border-blue-400 hover:shadow-md p-6 rounded-2xl cursor-pointer transition-all group flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center shrink-0 transition-colors">
                  <Plus className="w-6 h-6 text-slate-500 group-hover:text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Create Manually</h3>
                  <p className="text-sm text-slate-500 mt-1">Start from scratch. Select items from your vault to build a tailored resume.</p>
                </div>
              </div>

              {/* Option 2: AI */}
              <div 
                onClick={() => { setResumeConfig(EMPTY_CONFIG); setEditingId(null); setCurrentView('builder_ai'); }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 hover:border-indigo-400 hover:shadow-md p-6 rounded-2xl cursor-pointer transition-all group flex items-start gap-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-2 bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-bl-lg tracking-wider">New</div>
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-indigo-900 group-hover:text-indigo-700 transition-colors">Auto-Tailor with AI</h3>
                  <p className="text-sm text-indigo-700/70 mt-1">Paste a Job Description. Let AI scan your vault and build the perfect match.</p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Saved Resumes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResumes.map(res => (
                <div key={res.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all group flex flex-col justify-between overflow-hidden cursor-pointer" onClick={() => setPreviewModal(res)}>
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <select 
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border outline-none appearance-none cursor-pointer pr-6 ${statusColors[res.status] || statusColors["Draft"]}`}
                          value={res.status}
                          onChange={(e) => handleStatusChange(res.id, e.target.value, e)}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Applied">Applied</option>
                          <option value="Interviewing">Interviewing</option>
                        </select>
                        <Tag className="w-3 h-3 absolute right-2.5 top-2 opacity-50 pointer-events-none" />
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{res.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                      <Calendar className="w-4 h-4 opacity-70" /> {res.date}
                    </div>
                  </div>
                  <div className="border-t border-slate-100 bg-slate-50/50 p-3 px-4 flex justify-between items-center">
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(res); }} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => handleDuplicate(res, e)} className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Duplicate">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => handleDelete(res.id, e)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm font-medium text-slate-600 flex items-center gap-1 group-hover:text-blue-600">
                      <Eye className="w-4 h-4" /> View
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Modal: Full Preview */}
        {previewModal && (
          <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8">
            <div className="absolute inset-0" onClick={() => setPreviewModal(null)}></div>
            <div className="relative w-full max-w-5xl h-full flex flex-col bg-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white px-6 py-4 border-b flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{previewModal.title}</h2>
                  <p className="text-sm text-slate-500">Preview Mode</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(previewModal)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm flex items-center gap-2 transition-colors">
                    <Edit2 className="w-4 h-4"/> Edit
                  </button>
                  <button onClick={() => setToastMessage("Downloading PDF...")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm">
                    <FileDown className="w-4 h-4"/> Download PDF
                  </button>
                  <button onClick={() => setPreviewModal(null)} className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors ml-2">
                    <X className="w-6 h-6"/>
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto p-4 md:p-8 flex-1">
                <ResumeDocument config={previewModal.config} db={db} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // VIEW 2: BUILDER (MANUAL)
  // =========================================================
  if (currentView === 'builder_manual') {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-6 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[90vh]">
          
          {/* LEFT: Editor */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <div>
                <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-1 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Cancel
                </button>
                <h2 className="text-xl font-bold text-slate-800">{editingId ? "Edit Resume" : "Manual Builder"}</h2>
              </div>
              <button onClick={handleSaveResume} className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
                <Save className="w-4 h-4" /> Save to Vault
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Manual Form Sections (เหมือนเดิมเป๊ะ) */}
              <section className="space-y-4">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2"><User className="w-4 h-4" /> Role & Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Target Role</label>
                    <input type="text" placeholder="e.g. AI Engineer" className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" value={resumeConfig.targetRole} onChange={e => setResumeConfig({...resumeConfig, targetRole: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Target Company</label>
                    <input type="text" placeholder="e.g. Company A" className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none" value={resumeConfig.targetCompany} onChange={e => setResumeConfig({...resumeConfig, targetCompany: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Executive Summary</label>
                  <textarea placeholder="Tailor your summary..." className="w-full text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none h-20" value={resumeConfig.summary} onChange={e => setResumeConfig({...resumeConfig, summary: e.target.value})} />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2"><Code className="w-4 h-4" /> Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {db.skills.map(skill => {
                    const isSelected = resumeConfig.selectedSkills.includes(skill.id);
                    return (
                      <button key={skill.id} onClick={() => toggleSelection('selectedSkills', skill.id)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1 ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>
                        {isSelected && <Check className="w-3 h-3" />} {skill.name}
                      </button>
                    );
                  })}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleAddNewSkill(newSkill); }} className="flex gap-2 mt-2">
                  <input type="text" placeholder="Quick add new skill..." className="flex-1 text-sm p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" value={newSkill} onChange={e => setNewSkill(e.target.value)} />
                  <button type="submit" className="bg-slate-800 text-white px-3 rounded-md text-sm hover:bg-slate-700">Add</button>
                </form>
              </section>

              <section className="space-y-3">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2"><FileText className="w-4 h-4" /> Projects</h3>
                <div className="space-y-2">
                  {db.projects.map(proj => {
                    const isSelected = resumeConfig.selectedProjects.includes(proj.id);
                    return (
                      <div key={proj.id} onClick={() => toggleSelection('selectedProjects', proj.id)} className={`p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-blue-300'}`}>
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
                {showProjectForm ? (
                  <form onSubmit={handleAddNewProject} className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-3 relative">
                    <button type="button" onClick={() => setShowProjectForm(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
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

              <div className="grid grid-cols-2 gap-6">
                <section className="space-y-3">
                  <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2"><Briefcase className="w-4 h-4" /> Experience</h3>
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
                  <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2"><CheckCircle className="w-4 h-4" /> Certificates</h3>
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

          {/* RIGHT: Live Preview */}
          <div className="overflow-y-auto hidden lg:block rounded-2xl shadow-xl border-slate-200 border bg-white p-2">
            <ResumeDocument config={resumeConfig} db={db} />
          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // VIEW 3: BUILDER (AI TAILORED)
  // =========================================================
  if (currentView === 'builder_ai') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 font-sans">
        
        {/* Navbar */}
        <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
          <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          {aiAnalysisState === 'done' && (
            <div className="flex gap-3">
              <button onClick={() => setCurrentView('builder_manual')} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                Switch to Manual Edit
              </button>
              <button onClick={handleSaveResume} className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                <Save className="w-4 h-4" /> Save AI Draft
              </button>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-[80vh]">
          
          {/* LEFT PANEL: AI CONTROLS & INSIGHTS */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full">
            
            {/* Step 1: Input JD */}
            {aiAnalysisState === 'idle' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-lg mb-3">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Paste Job Description</h2>
                  <p className="text-sm text-slate-500 mt-1">AI will match your vault data and rewrite your summary to fit the role perfectly.</p>
                </div>
                
                <textarea 
                  className="w-full flex-1 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm resize-none bg-slate-50"
                  placeholder="Paste the requirements or JD text here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
                
                <div className="mt-4 flex flex-col gap-2">
                  <button 
                    onClick={() => setJobDescription("Looking for a Data Engineer with strong Python skills, AWS experience, and knowledge of Kubernetes.")}
                    className="text-xs text-indigo-600 hover:underline text-left"
                  >
                    Use Sample JD
                  </button>
                  <button 
                    onClick={handleAnalyzeJD}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium flex justify-center items-center gap-2 hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" /> Analyze & Generate
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Loading State */}
            {aiAnalysisState === 'analyzing' && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 relative mb-6">
                  <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">AI is working its magic...</h3>
                <p className="text-sm text-slate-500 mt-2 space-y-1">
                  <span className="block animate-pulse">Analyzing Job Description...</span>
                  <span className="block animate-pulse delay-75">Scanning your Data Vault...</span>
                  <span className="block animate-pulse delay-150">Rewriting Executive Summary...</span>
                </p>
              </div>
            )}

            {/* Step 3: Analysis Results (Gap Analysis) */}
            {aiAnalysisState === 'done' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-y-auto">
                <div className="flex justify-between items-center mb-6 pb-4 border-b">
                  <div>
                    <h2 className="font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" /> AI Insights
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Based on Vault data</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-indigo-600">{aiFeedback.matchScore}%</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Match Score</div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Missing Skills Warning */}
                  {aiFeedback.missingSkills.length > 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4" /> Missing Requirements
                      </h4>
                      <p className="text-xs text-amber-700 mb-3">The JD asked for these, but they aren't in your vault. Have you used them?</p>
                      <div className="space-y-2">
                        {aiFeedback.missingSkills.map(skill => (
                          <div key={skill} className="flex justify-between items-center bg-white border border-amber-100 p-2 rounded-lg shadow-sm">
                            <span className="text-sm font-medium text-slate-700">{skill}</span>
                            <button 
                              onClick={() => handleFixMissingSkill(skill)}
                              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded font-medium transition-colors"
                            >
                              + Add to Vault
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-emerald-800">Perfect Match!</h4>
                      <p className="text-xs text-emerald-700">You have all the required skills in your vault.</p>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600">
                    <strong>Note:</strong> The AI has automatically rewritten your Executive Summary and selected relevant projects/skills to match the JD.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: LIVE PREVIEW */}
          <div className="lg:col-span-8 bg-white rounded-2xl shadow-xl border-slate-200 border p-2 overflow-y-auto flex justify-center items-start">
            {aiAnalysisState === 'idle' ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 w-full min-h-[400px]">
                <FileText className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium text-slate-500">Awaiting AI Analysis...</p>
                <p className="text-sm text-slate-400">Paste JD and click analyze to see your tailored resume.</p>
              </div>
            ) : aiAnalysisState === 'analyzing' ? (
               <div className="flex justify-center items-center h-full w-full opacity-50 blur-sm pointer-events-none transition-all duration-500">
                  <ResumeDocument config={EMPTY_CONFIG} db={db} />
               </div>
            ) : (
              // Show Result!
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ResumeDocument config={resumeConfig} db={db} />
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  return null;
}