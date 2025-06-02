import React, { useState } from "react";
import { Board, Label } from "@features/kanban/types";
import { LabelColorPicker, LabelPreview, LabelEditModal } from "../../components";
import { LABEL_COLORS } from "../../constants/colors";

interface BoardLabelsTabProps {
  board: Board;
  onCreateLabel: (title: string, color: string) => Promise<boolean>;
  onUpdateLabel: (labelId: number, title: string, color: string) => Promise<boolean>;
  onDeleteLabel: (labelId: number) => Promise<boolean>;
}

export const BoardLabelsTab: React.FC<BoardLabelsTabProps> = ({
  board,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
}) => {
  const [newLabelTitle, setNewLabelTitle] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  const handleAddLabel = async () => {
    const success = await onCreateLabel(newLabelTitle, newLabelColor);
    if (success) {
      setNewLabelTitle("");
      setNewLabelColor(LABEL_COLORS[0]);
    }
  };

  const handleSaveLabel = async (title: string, color: string) => {
    if (!editingLabel) return;

    const success = await onUpdateLabel(editingLabel.id, title, color);
    if (success) {
      setEditingLabel(null);
    }
  };
  const handleDeleteLabel = async () => {
    if (!editingLabel) return;
    const success = await onDeleteLabel(editingLabel?.id);
    if (success) {
      setEditingLabel(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-3">Create New Label</h3>
        <div className="space-y-4">
          <LabelPreview title={newLabelTitle} color={newLabelColor} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={newLabelTitle}
              onChange={(e) => setNewLabelTitle(e.target.value)}
              placeholder="Enter label name (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>

          <LabelColorPicker selectedColor={newLabelColor} onColorChange={setNewLabelColor} />

          <button
            onClick={handleAddLabel}
            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors font-medium"
          >
            Create
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Current Labels ({board.labels?.length || 0})</h3>
        {board.labels?.map((label) => (
          <LabelPreview
            key={label.id}
            title={label.title}
            color={label.color}
            showEditIcon
            onEdit={() => setEditingLabel(label)}
          />
        ))}
      </div>

      {editingLabel && (
        <LabelEditModal
          label={editingLabel}
          onSave={handleSaveLabel}
          onCancel={() => setEditingLabel(null)}
          onDelete={handleDeleteLabel}
        />
      )}
    </div>
  );
};
