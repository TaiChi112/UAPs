import { useEffect, RefObject } from 'react';

export function useClickOutsideWithAutoSave({
  formRef,
  onClose,
  onSave,
  shouldAutoSave,
}: {
  formRef: RefObject<HTMLFormElement | null>;
  onClose: () => void;
  onSave: () => void;
  shouldAutoSave: boolean;
}) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        if (shouldAutoSave) {
          onSave();
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [formRef, onClose, onSave, shouldAutoSave]);
}
