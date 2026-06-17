import { type FormEvent, useState, useRef } from "react";

import { Check, CheckCircle, Plus, X, Pencil, Trash2 } from "lucide-react";

import type {
  NewCertificateDraft,
  CertificateId,
  ResumeConfig,
  VaultData,
} from "@uaps/shared/resume-builder";
import { useResumeBuilderActions } from "../../state/use-resume-builder-actions";


export interface CertificatesSectionProps {
  certificates: VaultData["certificates"];
  selectedCertificateIds: ResumeConfig["selectedCerts"];
  showCertificateForm: boolean;
  newCertificate: NewCertificateDraft;
  onToggleCertificate: (certificateId: CertificateId) => void;
  onShowCertificateForm: () => void;
  onHideCertificateForm: () => void;
  onCertificateDraftChange: (draft: NewCertificateDraft) => void;
  onAddCertificate: (event: FormEvent<HTMLFormElement>) => void;
}

export function CertificatesSection({
  certificates,
  selectedCertificateIds,
  showCertificateForm,
  newCertificate,
  onToggleCertificate,
  onShowCertificateForm,
  onHideCertificateForm,
  onCertificateDraftChange,
  onAddCertificate,
}: CertificatesSectionProps) {
  const actions = useResumeBuilderActions();
  const [editingCertificateId, setEditingCertificateId] = useState<CertificateId | null>(null);
  const [editDraft, setEditDraft] = useState<NewCertificateDraft>({
    name: "",
    year: "",
  });

  const handleEditClick = (e: React.MouseEvent, cert: VaultData["certificates"][0]) => {
    e.stopPropagation();
    setEditingCertificateId(cert.id);
    setEditDraft({
      name: cert.name,
      year: cert.year || "",
    });
  };

  const handleDeleteClick = async (e: React.MouseEvent, certificateId: CertificateId) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this certificate?")) {
      await actions.deleteCertificateFromVault(certificateId);
    }
  };

  const handleUpdateCertificate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingCertificateId) {
      await actions.updateCertificateInVault(editingCertificateId, editDraft);
      setEditingCertificateId(null);
    }
  };

  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-slate-700 flex items-center gap-2 border-b pb-2">
        <CheckCircle className="w-4 h-4" /> Certificates
      </h3>
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {certificates.map((cert) => {
          const isSelected = selectedCertificateIds.includes(cert.id);

          if (editingCertificateId === cert.id) {
            return (
              <form
                key={cert.id}
                onSubmit={handleUpdateCertificate}
                className="bg-slate-50 p-4 border border-blue-200 rounded-lg space-y-3 relative"
              >
                <button
                  type="button"
                  onClick={() => setEditingCertificateId(null)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Certificate Name"
                  required
                  className="w-full text-sm p-2 border rounded-md"
                  value={editDraft.name}
                  onChange={(e) =>
                    setEditDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Year"
                  className="w-full text-sm p-2 border rounded-md"
                  value={editDraft.year}
                  onChange={(e) =>
                    setEditDraft((prev) => ({ ...prev, year: e.target.value }))
                  }
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </form>
            );
          }

          return (
            <div
              key={cert.id}
              className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? "bg-blue-50 border-blue-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
              }`}
              onClick={() => onToggleCertificate(cert.id)}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-slate-300 text-transparent"
                }`}
              >
                <Check className="w-3 h-3" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4
                    className={`font-medium text-sm truncate ${
                      isSelected ? "text-blue-900" : "text-slate-800"
                    }`}
                  >
                    {cert.name}
                  </h4>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleEditClick(e, cert)}
                      className="text-slate-400 hover:text-blue-600 p-1"
                      title="Edit certificate"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteClick(e, cert.id)}
                      className="text-slate-400 hover:text-red-600 p-1"
                      title="Delete certificate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    isSelected ? "text-blue-700" : "text-slate-500"
                  }`}
                >
                  {cert.year}
                </div>
              </div>
            </div>
          );
        })}

        {showCertificateForm ? (
          <form
            onSubmit={onAddCertificate}
            className="bg-slate-50 p-4 border border-blue-200 rounded-lg space-y-3 relative"
          >
            <button
              type="button"
              onClick={onHideCertificateForm}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Certificate Name"
              required
              className="w-full text-sm p-2 border rounded-md"
              value={newCertificate.name}
              onChange={(e) =>
                onCertificateDraftChange({ ...newCertificate, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Year"
              className="w-full text-sm p-2 border rounded-md"
              value={newCertificate.year}
              onChange={(e) =>
                onCertificateDraftChange({ ...newCertificate, year: e.target.value })
              }
            />
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Save Certificate
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={onShowCertificateForm}
            className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 border-2 border-dashed border-slate-200 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Certificate
          </button>
        )}
      </div>
    </section>
  );
}
