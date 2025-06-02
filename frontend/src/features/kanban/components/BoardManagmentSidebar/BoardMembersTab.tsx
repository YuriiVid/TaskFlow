import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { Board, BoardMember, BoardMemberRole } from "@features/kanban/types";
import { BoardMemberCard } from "./BoardMemberCard";

interface BoardMembersTabProps {
  board: Board;
  currentMember?: BoardMember;
  onAddMember: (email: string) => Promise<boolean>;
  onRoleChange: (member: BoardMember, newRole: BoardMemberRole) => void;
  onRemoveMember: (member: BoardMember) => void;
}

export const BoardMembersTab: React.FC<BoardMembersTabProps> = ({
  board,
  currentMember,
  onAddMember,
  onRoleChange,
  onRemoveMember,
}) => {
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const handleAddMember = async () => {
    if (newMemberEmail.trim()) {
      const success = await onAddMember(newMemberEmail);
      if (success) {
        setNewMemberEmail("");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium mb-3">Add New Member</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="Enter email address"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
          />
          <button
            onClick={handleAddMember}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <UserPlus size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Current Members ({board.members?.length || 0})</h3>
        {board.members?.map((member) => (
          <BoardMemberCard
            key={member.id}
            member={member}
            onRoleChange={onRoleChange}
            onRemove={onRemoveMember}
            currentMember={currentMember}
          />
        ))}
      </div>
    </div>
  );
};
