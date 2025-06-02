import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@shared";
import { LabelPreview } from "./LabelPreview";
import { LabelColorPicker } from "./LabelColorPicker";
import { Label } from "@features/kanban/types";

interface LabelEditModalProps {
  label: Label;
  onSave: (title: string, color: string) => void;
  onCancel: () => void;
  onDelete?: (labelId: number) => void;
}

export const LabelEditModal: React.FC<LabelEditModalProps> = ({ label, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState(label.title || "");
  const [color, setColor] = useState(label.color);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isNewLabel = label.id === 0;

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim(), color);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(label.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && title.trim()) {
      handleSave();
    }
  };

  return (
    <>
      <Modal
        isOpen={!showDeleteConfirm}
        title={isNewLabel ? "Create Label" : "Edit Label"}
        onConfirm={handleSave}
        onCancel={onCancel}
        confirmLabel={isNewLabel ? "Create" : "Save"}
        cancelLabel="Cancel"
        hideFooter={true}
      >
        <div className="space-y-4">
          <LabelPreview title={title} color={color} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter label name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              autoFocus
              maxLength={50}
            />
          </div>

          <LabelColorPicker selectedColor={color} onColorChange={setColor} />

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isNewLabel ? "Create" : "Save"}
            </button>

            {!isNewLabel && onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                title="Delete label"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        title="Delete Label"
        message="Are you sure you want to delete this label? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
};
