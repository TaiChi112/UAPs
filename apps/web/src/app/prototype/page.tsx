"use client";
import React, { useState } from 'react';
import { Briefcase, User, Code, FileText, Award, CheckCircle } from 'lucide-react';

// ---------------------------------------------------------------------------
// 1. Centralized Data Mock (คลังข้อมูลส่วนตัวทั้งหมด)
// ---------------------------------------------------------------------------
const MOCK_DB = {
  basicInfo: {
    name: "Somchai Coding",
    title: "Computer Science Graduate",
    email: "somchai.c@example.com",
    phone: "+66 81 234 5678",
    github: "github.com/somchaicodes",
    linkedin: "linkedin.com/in/somchaicodes",
    summary: "A passionate CS graduate with hands-on experience in Software Engineering, Data Pipeline, and Machine Learning models. Adaptable and eager to solve complex problems."
  },
  skills: {
    programming: ["Python", "Java", "JavaScript", "TypeScript", "C++", "SQL"],
    frameworks: ["React", "Next.js", "Spring Boot", "Express", "TensorFlow", "PyTorch"],
    cloudAndTools: ["AWS (EC2, S3)", "GCP (BigQuery)", "Docker", "Git", "Airflow", "Kafka"],
    softSkills: ["Problem Solving", "Team Collaboration", "Agile Methodology"]
  },
  projects: [
    {
      id: "p1",
      title: "E-Commerce Microservices",
      role: "Backend Developer",
      technologies: ["Java", "Spring Boot", "Kafka", "Docker"],
      description: "Built scalable backend services for an e-commerce platform handling 10k concurrent users.",
      tags: ["SE", "Backend"]
    },
    {
      id: "p2",
      title: "Customer Churn Prediction",
      role: "AI Engineer",
      technologies: ["Python", "TensorFlow", "Pandas"],
      description: "Developed an ML model to predict customer churn with 85% accuracy, saving the company $50k annually.",
      tags: ["AI", "ML", "Data"]
    },
    {
      id: "p3",
      title: "Real-time Sales Dashboard Pipeline",
      role: "Data Engineer",
      technologies: ["Python", "Airflow", "GCP BigQuery", "SQL"],
      description: "Designed a daily ETL pipeline processing 1M+ rows of sales data into a data warehouse for BI tools.",
      tags: ["DE", "Data Pipeline", "GCP"]
    },
    {
      id: "p4",
      title: "Smart Traffic Camera Analysis",
      role: "Computer Vision Researcher",
      technologies: ["Python", "PyTorch", "OpenCV"],
      description: "Implemented an object detection model to count vehicle types in real-time.",
      tags: ["AI", "Computer Vision"]
    },
    {
      id: "p5",
      title: "AWS Log Processing System",
      role: "Data/Cloud Engineer",
      technologies: ["AWS S3", "AWS Lambda", "Python"],
      description: "Automated server log processing using serverless architecture on AWS.",
      tags: ["DE", "Cloud", "AWS"]
    }
  ],
  experience: [
    {
      id: "e1",
      company: "Tech Solutions Inc.",
      role: "Software Engineer Intern",
      duration: "Jun 2024 - Aug 2024",
      responsibilities: [
        "Developed RESTful APIs using Node.js and Express.",
        "Collaborated with frontend team to integrate APIs.",
        "Wrote unit tests improving code coverage by 20%."
      ],
      tags: ["SE", "Backend"]
    },
    {
      id: "e2",
      company: "Data Driven Co.",
      role: "Data Analyst Intern",
      duration: "Jun 2023 - Aug 2023",
      responsibilities: [
        "Cleaned and pre-processed large datasets using Python (Pandas).",
        "Created SQL queries to extract business insights.",
        "Assisted in deploying a basic predictive model."
      ],
      tags: ["Data", "AI Basic"]
    }
  ],
  certificates: [
    { id: "c1", name: "AWS Certified Developer - Associate", year: "2025" },
    { id: "c2", name: "Google Data Analytics Professional Certificate", year: "2024" },
    { id: "c3", name: "DeepLearning.AI TensorFlow Developer", year: "2024" }
  ],
  awards: [
    { id: "a1", name: "1st Place - National University Hackathon 2025", desc: "Built an AI-driven healthcare app." },
    { id: "a2", name: "Outstanding Academic Achievement in CS", desc: "GPA 3.95/4.00" }
  ]
};

// ---------------------------------------------------------------------------
// 2. Resume Configurations (การจำลองว่าแต่ละเวอร์ชันเลือกดึงข้อมูลไหนมาบ้าง)
// ในระบบจริง ส่วนนี้อาจจะเกิดจาก Algorithm หรือให้ User ติ๊กเลือกเอง
// ---------------------------------------------------------------------------
const RESUME_VARIANTS = [
  {
    id: "var-ai-comA",
    title: "AI Engineer @ Company A",
    description: "เน้นทักษะ Machine Learning และ Python สำหรับบริษัท Tech ที่เน้น AI",
    config: {
      summary: "Aspiring AI Engineer with a strong foundation in Machine Learning and Computer Vision, aiming to build intelligent systems at Company A.",
      skillsFilters: {
        programming: ["Python", "SQL", "C++"],
        frameworks: ["TensorFlow", "PyTorch"],
        cloudAndTools: ["Git", "Docker"]
      },
      projectIds: ["p2", "p4"], // Churn Prediction, Traffic Camera
      experienceIds: ["e2"],     // Data Analyst Intern (ใกล้เคียง AI)
      certIds: ["c3"],           // TensorFlow cert
      awardIds: ["a1", "a2"]
    }
  },
  {
    id: "var-se-comA",
    title: "Software Engineer @ Company A",
    description: "บริษัทเดียวกัน แต่สมัครตำแหน่ง SE เน้นระบบ Backend และสถาปัตยกรรม",
    config: {
      summary: "Dedicated Software Engineer with experience in building scalable backend microservices and APIs. Eager to contribute to Company A's core platform.",
      skillsFilters: {
        programming: ["Java", "TypeScript", "JavaScript", "Python"],
        frameworks: ["Spring Boot", "React", "Express"],
        cloudAndTools: ["Docker", "Git", "AWS (EC2, S3)"]
      },
      projectIds: ["p1"], // E-Commerce Microservices
      experienceIds: ["e1"], // SE Intern
      certIds: ["c1"],       // AWS Developer cert
      awardIds: ["a1"]       // Hackathon (โชว์ความสามารถการสร้าง app)
    }
  },
  {
    id: "var-de-comB",
    title: "Data Engineer @ Company B (AWS Stack)",
    description: "ตำแหน่ง DE บริษัทนี้ใช้ AWS เป็นหลัก จึงต้องดึงโปรเจกต์ AWS มาชู",
    config: {
      summary: "Data Engineer passionate about building robust data pipelines. Experienced in AWS ecosystem and eager to scale data infrastructure at Company B.",
      skillsFilters: {
        programming: ["Python", "SQL", "Java"],
        frameworks: [],
        cloudAndTools: ["AWS (EC2, S3)", "Airflow", "Kafka", "Docker"]
      },
      projectIds: ["p5", "p3"], // AWS Log System, Pipeline (เอา AWS ขึ้นก่อน)
      experienceIds: ["e2", "e1"], // โชว์สกิล Data ก่อน แล้วค่อยตามด้วย SE (ทำระบบ)
      certIds: ["c1", "c2"], // AWS Cert, Data Analytics Cert
      awardIds: ["a2"]
    }
  },
  {
    id: "var-de-comC",
    title: "Data Engineer @ Company C (GCP Stack)",
    description: "ตำแหน่ง DE เหมือนกัน แต่บริษัทนี้ใช้ Google Cloud (GCP) เป็นหลัก",
    config: {
      summary: "Data Engineer with a focus on big data processing using Google Cloud Platform. Ready to optimize data workflows at Company C.",
      skillsFilters: {
        programming: ["Python", "SQL"],
        frameworks: [],
        cloudAndTools: ["GCP (BigQuery)", "Airflow", "Git"]
      },
      projectIds: ["p3"], // Real-time Pipeline (GCP BigQuery)
      experienceIds: ["e2"], // Data Analyst Intern
      certIds: ["c2"], // Google Data Analytics Cert
      awardIds: []
    }
  }
];

// Helper function to filter arrays based on IDs
const getItemsByIds = (sourceArray: any[], ids: string[]) => {
  return sourceArray.filter(item => ids.includes(item.id));
};

export default function ResumePrototype() {
  const [activeVariantId, setActiveVariantId] = useState(RESUME_VARIANTS[0].id);

  const activeVariant = RESUME_VARIANTS.find(v => v.id === activeVariantId) || RESUME_VARIANTS[0];

  // จำลองกระบวนการ "สร้าง" Resume จาก Data Mock ตาม Config ของ Variant ที่เลือก
  const generatedResume = {
    basicInfo: { ...MOCK_DB.basicInfo, summary: activeVariant.config.summary }, // Override summary
    skills: {
      programming: MOCK_DB.skills.programming.filter(s => activeVariant.config.skillsFilters.programming.includes(s)),
      frameworks: MOCK_DB.skills.frameworks.filter(s => activeVariant.config.skillsFilters.frameworks.includes(s)),
      cloudAndTools: MOCK_DB.skills.cloudAndTools.filter(s => activeVariant.config.skillsFilters.cloudAndTools.includes(s)),
    },
    projects: getItemsByIds(MOCK_DB.projects, activeVariant.config.projectIds),
    experience: getItemsByIds(MOCK_DB.experience, activeVariant.config.experienceIds),
    certificates: getItemsByIds(MOCK_DB.certificates, activeVariant.config.certIds),
    awards: getItemsByIds(MOCK_DB.awards, activeVariant.config.awardIds),
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Smart Resume Generator (Prototype)</h1>
          <p className="text-slate-600">
            แนวคิด: สร้างฐานข้อมูลประวัติ (Mock DB) เพียงที่เดียว และปรับแต่ง (Configure) เพื่อสร้าง Resume 
            ที่เหมาะสมที่สุดสำหรับแต่ละตำแหน่ง (Role) และบริษัท (Company)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Configuration Selector */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 sticky top-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Select Version
              </h2>
              <div className="space-y-3">
                {RESUME_VARIANTS.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setActiveVariantId(variant.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 border ${
                      activeVariantId === variant.id
                        ? 'bg-blue-50 border-blue-500 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-medium text-slate-900 text-sm">{variant.title}</div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">{variant.description}</div>
                  </button>
                ))}
              </div>

              <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
                <strong>💡 สังเกตการณ์:</strong> ลองคลิกเปลี่ยน Version ด้านบน แล้วดูข้อมูลที่เปลี่ยนไปในฝั่งขวามือ (เช่น Project ที่แสดง, Skill ที่โชว์, หรือ Summary ที่เปลี่ยนไปตามบริษัท)
              </div>
            </div>
          </div>

          {/* Right Column: Generated Resume Preview */}
          <div className="lg:col-span-3">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
              
              {/* Output Indicator */}
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
                <span className="text-sm font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Generated Preview
                </span>
                <span className="text-sm text-slate-500">Target: {activeVariant.title}</span>
              </div>

              {/* --- BEGIN RESUME CONTENT --- */}
              <div className="space-y-8">
                
                {/* 1. Basic Info & Summary */}
                <header>
                  <h1 className="text-3xl font-bold text-gray-900">{generatedResume.basicInfo.name}</h1>
                  <p className="text-lg text-blue-600 font-medium mt-1">{activeVariant.title.split('@')[0]}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-sm text-gray-600">
                    <span>{generatedResume.basicInfo.email}</span>
                    <span>•</span>
                    <span>{generatedResume.basicInfo.phone}</span>
                    <span>•</span>
                    <span>{generatedResume.basicInfo.github}</span>
                  </div>
                  <p className="mt-4 text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 italic">
                    "{generatedResume.basicInfo.summary}"
                  </p>
                </header>

                {/* 2. Skills */}
                <section>
                  <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-gray-500" /> Technical Skills
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <strong className="text-sm text-gray-700 block mb-1">Programming:</strong>
                      <div className="flex flex-wrap gap-1">
                        {generatedResume.skills.programming.map(s => (
                          <span key={s} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong className="text-sm text-gray-700 block mb-1">Frameworks:</strong>
                      <div className="flex flex-wrap gap-1">
                        {generatedResume.skills.frameworks.map(s => (
                          <span key={s} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong className="text-sm text-gray-700 block mb-1">Tools & Cloud:</strong>
                      <div className="flex flex-wrap gap-1">
                        {generatedResume.skills.cloudAndTools.map(s => (
                          <span key={s} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. Experience */}
                {generatedResume.experience.length > 0 && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-gray-500" /> Experience
                    </h3>
                    <div className="space-y-4">
                      {generatedResume.experience.map(exp => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline">
                            <h4 className="font-semibold text-lg">{exp.role}</h4>
                            <span className="text-sm text-gray-500">{exp.duration}</span>
                          </div>
                          <div className="text-gray-600 font-medium">{exp.company}</div>
                          <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                            {exp.responsibilities.map((resp, idx) => (
                              <li key={idx}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. Projects */}
                {generatedResume.projects.length > 0 && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-500" /> Key Projects
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {generatedResume.projects.map(proj => (
                        <div key={proj.id} className="border border-gray-200 p-4 rounded-lg bg-gray-50/50">
                          <h4 className="font-semibold text-gray-900">{proj.title}</h4>
                          <div className="text-sm text-gray-500 mb-2">Role: {proj.role}</div>
                          <p className="text-sm text-gray-700 mb-3">{proj.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {proj.technologies.map(tech => (
                              <span key={tech} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">{tech}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 5. Certs & Awards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {generatedResume.certificates.length > 0 && (
                    <section>
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-gray-500" /> Certificates
                      </h3>
                      <ul className="space-y-2">
                        {generatedResume.certificates.map(cert => (
                          <li key={cert.id} className="text-sm flex items-start gap-2 text-gray-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                            <span>{cert.name} ({cert.year})</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {generatedResume.awards.length > 0 && (
                    <section>
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-gray-500" /> Awards
                      </h3>
                      <ul className="space-y-3">
                        {generatedResume.awards.map(award => (
                          <li key={award.id} className="text-sm text-gray-700">
                            <div className="font-semibold">{award.name}</div>
                            <div className="text-gray-500">{award.desc}</div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>

              </div>
              {/* --- END RESUME CONTENT --- */}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}