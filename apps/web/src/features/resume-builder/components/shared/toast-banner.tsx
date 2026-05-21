import { CheckCircle } from "lucide-react";

export interface ToastBannerProps {
  message: string;
}

export function ToastBanner({ message }: ToastBannerProps) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-bounce">
      <CheckCircle className="w-5 h-5 text-green-400" /> {message}
    </div>
  );
}
