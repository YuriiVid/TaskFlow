import React, { useState, useEffect } from "react";
import { Plus, Tag } from "lucide-react";
import { Label, LabelEditModal, LabelPreview } from "../../components";
import { Board, Card as CardType, Label as LabelType } from "@features/kanban/types";

interface CardLabelsProps {
  card: CardType;
  board: Board;
  onCreateLabel: (title: string, color: string) => Promise<LabelType>;
  onUpdateLabel: (labelId: number, title: string, color: string) => void;
  onDeleteLabel: (labelId: number) => void;
  onAttachLabel: (labelId: number) => void;
  onDetachLabel: (labelId: number) => void;
}

export const CardLabels: React.FC<CardLabelsProps> = ({
  card,
  board,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
  onAttachLabel,
  onDetachLabel,
}) => {
  const [showLabelDropdown, setShowLabelDropdown] = useState(false);
  const [editingLabel, setEditingLabel] = useState<LabelType | null>(null);
  const [creatingLabel, setCreatingLabel] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingLabel || creatingLabel || showLabelDropdown) {
          setEditingLabel(null);
          setCreatingLabel(false);
          setShowLabelDropdown(false);
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [editingLabel, creatingLabel, showLabelDropdown]);

  const handleCreateLabel = async (title: string, color: string) => {
    const newLabel = await onCreateLabel(title, color);
    onAttachLabel(newLabel.id);
    setCreatingLabel(false);
  };

  const handleEditLabel = (title: string, color: string) => {
    if (editingLabel) {
      onUpdateLabel(editingLabel.id, title, color);
      setEditingLabel(null);
    }
  };

  const handleToggleLabel = (labelId: number) => {
    const attachedLabelIds = new Set(card.labels.map((l) => l.id));

    if (attachedLabelIds.has(labelId)) {
      onDetachLabel(labelId);
    } else {
      onAttachLabel(labelId);
    }
  };

  const handleDeleteLabel = (labelId: number) => {
    onDeleteLabel(labelId);
    setEditingLabel(null);
  };

  return (
    <div className="mt-3">
      <div className="flex items-center gap-3 mb-4">
        <Tag size={18} className="text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-700">Labels</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {card.labels.map((label) => (
          <Label
            key={label.id}
            className="group flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity relative"
            color={label.color}
            onClick={() => setShowLabelDropdown(!showLabelDropdown)}
          >
            <span className="">{label.title}</span>
          </Label>
        ))}

        <div className="relative">
          <button
            onClick={() => setShowLabelDropdown(!showLabelDropdown)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors"
          >
            <Plus size={16} />
            Add Label
          </button>

          {showLabelDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-56">
              <div className="p-3">
                <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Labels</div>

                {board.labels.length > 0 ? (
                  <div className="space-y-1 mb-3">
                    {board.labels.map((label) => (
                      <LabelPreview
                        key={label.id}
                        title={label.title}
                        color={label.color}
                        showCheckbox
                        showEditIcon
                        isChecked={card.labels.some((l) => l.id === label.id)}
                        onToggle={() => handleToggleLabel(label.id)}
                        onEdit={() => setEditingLabel(label)}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-3">No available labels</p>
                )}

                <hr className="my-3" />

                <button
                  onClick={() => {
                    setCreatingLabel(true);
                    setShowLabelDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700"
                >
                  <Plus size={16} />
                  Create New Label
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {editingLabel && (
        <LabelEditModal
          label={editingLabel}
          onSave={handleEditLabel}
          onCancel={() => setEditingLabel(null)}
          onDelete={() => handleDeleteLabel(editingLabel.id)}
        />
      )}

      {creatingLabel && (
        <LabelEditModal
          label={{ id: 0, title: "", color: "#10B981" }}
          onSave={handleCreateLabel}
          onCancel={() => setCreatingLabel(false)}
        />
      )}

      {showLabelDropdown && <div className="fixed inset-0 z-5" onClick={() => setShowLabelDropdown(false)} />}
    </div>
  );
};
