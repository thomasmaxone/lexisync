import React, { useEffect } from 'react';
import { Pencil, Trash2, Link2 } from 'lucide-react';

export default function ContextMenu({ x, y, onEdit, onDelete, onCreateLink, onClose, entity }) {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [onClose]);

  return (
    <div
      className="fixed rounded border py-1 z-50 bg-[#181C24] border-[#2D3742] shadow-lg"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onEdit}
        className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 text-[#E2E8F0] hover:bg-[#1E2530] hover:text-[#00D4FF]"
      >
        <Pencil className="w-4 h-4" />
        Edit
      </button>
      {entity?.type !== 'relationship' && onCreateLink && (
        <button
          onClick={onCreateLink}
          className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 text-[#E2E8F0] hover:bg-[#1E2530] hover:text-[#00D4FF]"
        >
          <Link2 className="w-4 h-4" />
          Create Link
        </button>
      )}
      <button
        onClick={onDelete}
        className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 text-[#EF4444] hover:bg-[#1E2530]"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}