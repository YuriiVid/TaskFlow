// 1. CardHeader.tsx - Handles the title editing and completion status
import React, { useState } from "react";
import { X } from "lucide-react";
import CircularCheckbox from "../CircularCheckbox";

interface CardHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onClose: () => void;
  isCompleted: boolean;
  onToogleCompleted: (isCompleted: boolean) => void;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  onTitleChange,
  onClose,
  isCompleted,
  onToogleCompleted,
}) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const trimmed = localTitle.trim();
    if (!trimmed) return;
    onTitleChange(trimmed);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalTitle(title);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Close"
      >
        <X size={20} className="text-gray-500" />
      </button>

      <div className="flex gap-2 items-center">
        <CircularCheckbox id="card-completed-checkbox" checked={isCompleted} onChange={onToogleCompleted} />

        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          onFocus={() => setIsEditing(true)}
          readOnly={!isEditing}
          className={`text-2xl font-semibold w-full bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
            isCompleted && " text-gray-400"
          }`}
          placeholder="Card title"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSave();
              (e.target as HTMLInputElement).blur();
            }
            if (e.key === "Escape") {
              handleCancel();
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
        {isEditing && (
          <>
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};
