import React, { useState } from "react";
import { AlignLeft } from "lucide-react";

interface CardDescriptionProps {
  description: string;
  onDescriptionChange: (description: string) => void;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ description, onDescriptionChange }) => {
  const [localDescription, setLocalDescription] = useState(description);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onDescriptionChange(localDescription.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLocalDescription(description);
  };

  return (
    <section className="space-y-2">
      <div className="flex items-center space-x-2 text-gray-700">
        <AlignLeft size={16} />
        <h3 className="font-bold">Description</h3>
      </div>
      <textarea
        value={localDescription}
        onChange={(e) => setLocalDescription(e.target.value)}
        onFocus={() => setIsEditing(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            handleSave();
            (e.target as HTMLTextAreaElement).blur();
          }
          if (e.key === "Escape") {
            e.stopPropagation();
            handleCancel();
            (e.target as HTMLTextAreaElement).blur();
          }
        }}
        readOnly={!isEditing}
        className="w-full min-h-[80px] p-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        placeholder="Add a description..."
      />
      {isEditing && (
        <div className="flex space-x-2">
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
        </div>
      )}
    </section>
  );
};
