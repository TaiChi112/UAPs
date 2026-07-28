import React from "react";
import { ResumeDocument } from "@/features/resume-builder/components/preview/resume-document";
// import { getPublicProfile } from "./actions";

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  // Placeholder for data fetching logic
  const profileData = null; 

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">404</h1>
          <p className="text-slate-600">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* <ResumeDocument config={profileData.config} db={profileData.db} /> */}
      </div>
    </div>
  );
}
