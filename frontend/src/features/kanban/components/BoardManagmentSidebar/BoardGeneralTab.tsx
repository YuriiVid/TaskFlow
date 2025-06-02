import React, { useState } from "react";
import { LogOut, Trash } from "lucide-react";
import { Board, BoardMember, BoardMemberRole } from "@features/kanban/types";
import { hasBoardAdminRights } from "@features/kanban/utils";

interface BoardGeneralTabProps {
  board: Board;
  currentMember?: BoardMember;
  onSave: (title: string, description: string) => Promise<void>;
  onDelete: () => void;
  onLeave: () => void;
}

export const BoardGeneralTab: React.FC<BoardGeneralTabProps> = ({
  board,
  currentMember,
  onSave,
  onDelete,
  onLeave,
}) => {
  const [title, setTitle] = useState(board.title || "");
  const [description, setDescription] = useState(board.description || "");

  const hasAdminRights = hasBoardAdminRights(currentMember);
  const isOwner = currentMember?.role === BoardMemberRole.Owner;
  const canLeave = !isOwner && currentMember;

  const handleSave = () => {
    onSave(title, description);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Board Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          readOnly={!hasAdminRights}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          readOnly={!hasAdminRights}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          placeholder="Add a description for your board..."
        />
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors"
      >
        Save Changes
      </button>

      {canLeave && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Board</h3>
          <p className="text-sm text-gray-500 mb-4">You will no longer have access to this board and its cards.</p>
          <button
            onClick={onLeave}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Leave Board
          </button>
        </div>
      )}

      {isOwner && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-4">
            Once you delete a board, there is no going back. Please be certain.
          </p>
          <button
            onClick={onDelete}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <Trash size={16} />
            Delete Board
          </button>
        </div>
      )}
    </div>
  );
};
