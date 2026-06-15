import { useState, type DragEvent } from "react";
import { GripVertical } from "lucide-react";

export interface SectionOrderEditorProps {
  sectionOrder: string[];
  activeSections: string[];
  onChange: (newOrder: string[]) => void;
}

const SECTION_LABELS: Record<string, string> = {
  skills: "Technical Skills",
  experience: "Experience",
  projects: "Key Projects",
  certificates: "Certifications",
  awards: "Awards",
};

export function SectionOrderEditor({
  sectionOrder,
  activeSections,
  onChange,
}: SectionOrderEditorProps) {
  // Sort sectionOrder such that active sections are ordered as specified,
  // and inactive sections are pushed to the end or just ignored.
  // We only allow reordering of active sections.
  
  const currentActiveOrder = sectionOrder.filter((s) => activeSections.includes(s));
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  if (currentActiveOrder.length < 2) {
    return null; // No need to reorder if less than 2 active sections
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedIndex === null || draggedIndex === index) return;

    // We can swap instantly for visual feedback
    const newOrder = [...currentActiveOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    
    // We only update the local 'visual' order until drop?
    // Actually, updating the state in dragOver makes the list jumpy but immediate.
    // Let's just update the parent state directly.
    
    // To preserve inactive sections at the end:
    const inactiveSections = sectionOrder.filter((s) => !activeSections.includes(s));
    onChange([...newOrder, ...inactiveSections]);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-6">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
        Section Order
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Drag and drop to reorder the visible sections on your resume.
      </p>
      <div className="space-y-2">
        {currentActiveOrder.map((sectionId, index) => (
          <div
            key={sectionId}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 bg-white border border-slate-200 p-2.5 rounded-lg shadow-sm cursor-grab active:cursor-grabbing transition-colors ${
              draggedIndex === index ? "opacity-50" : "hover:border-slate-300"
            }`}
          >
            <GripVertical className="w-4 h-4 text-slate-400" />
            <span className="font-medium text-slate-700 text-sm">
              {SECTION_LABELS[sectionId] || sectionId}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
