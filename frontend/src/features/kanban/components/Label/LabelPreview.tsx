import React from "react";
import { Edit2 } from "lucide-react";
import { Label } from "./Label";

interface LabelPreviewProps {
  title?: string;
  color: string;
  showCheckbox?: boolean;
  isChecked?: boolean;
  onToggle?: () => void;
  showEditIcon?: boolean;
  onEdit?: () => void;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({
  title,
  color,
  showCheckbox = false,
  isChecked = false,
  onToggle,
  showEditIcon = false,
  onEdit,
}) => {
  return (
    <div className="flex items-center gap-3 p-0.5 rounded-md hover:bg-gray-50 transition-colors">
      {showCheckbox && (
        <div className="relative">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={onToggle}
            className="w-4 h-4 text-teal-600 bg-white border-2 border-gray-300 rounded focus:ring-teal-500 focus:ring-2 cursor-pointer"
          />
        </div>
      )}

      <Label
        color={color}
        className="w-48 px-3 py-2 rounded text-sm font-medium h-8 flex items-center whitespace-nowrap overflow-hidden shadow-sm"
      >
        <span className="text-shadow-sm tracking-wide leading-none">{title}</span>
      </Label>

      {showEditIcon && onEdit && (
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Edit label"
        >
          <Edit2 size={16} />
        </button>
      )}
    </div>
  );
};
