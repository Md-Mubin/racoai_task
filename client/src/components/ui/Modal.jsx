import { X } from "lucide-react";

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-lg w-full max-w-lg mx-4 shadow-lg animate-slideUp bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold text-text">{title}</h3>
          <button
            onClick={onClose}
            className="text-text-light hover:text-text text-2xl leading-none bg-transparent border-none cursor-pointer"
          >
            <X/>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
