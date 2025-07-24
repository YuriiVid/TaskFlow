import React, { useState } from "react";
import { ChevronDown, Crown, Trash } from "lucide-react";
import { BoardMember, BoardMemberRole } from "@features/kanban/types";
import { Avatar } from "@shared";
import { hasBoardAdminRights } from "@features/kanban/utils";

interface BoardMemberCardProps {
  member: BoardMember;
  currentMember?: BoardMember;
  onRoleChange: (member: BoardMember, newRole: BoardMemberRole) => void;
  onRemove: (member: BoardMember) => void;
}

export const BoardMemberCard: React.FC<BoardMemberCardProps> = ({
  member,
  currentMember,
  onRoleChange,
  onRemove,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const getRoleColor = (role: string) => {
    const colors = {
      owner: "text-yellow-600 bg-yellow-100",
      admin: "text-teal-600 bg-teal-100",
      member: "text-blue-600 bg-blue-100",
      observer: "text-gray-600 bg-gray-100",
    };
    return colors[role as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const getRoleOptions = (currentRole: BoardMemberRole) => {
    return [
      { value: BoardMemberRole.Observer, label: "Observer" },
      { value: BoardMemberRole.Member, label: "Member" },
      { value: BoardMemberRole.Admin, label: "Admin" },
      { value: BoardMemberRole.Owner, label: "Owner" },
    ].filter((option) => option.value !== currentRole);
  };
  const hasAdminRights = hasBoardAdminRights(currentMember);
  const isOwner = member.role === BoardMemberRole.Owner;

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <Avatar src={member.profilePictureUrl} name={member.fullName} size="sm" />
        </div>
        <div>
          <div className="font-medium">{member.fullName} {currentMember!.id === member.id && ("(you)")}</div>
          <div className="text-sm text-gray-500">{member.email}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isOwner ? (
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleColor(
                member.role
              )} hover:opacity-80`}
            >
              {member.role}
              {hasAdminRights && <ChevronDown size={12} />}
            </button>

            {showRoleDropdown && hasAdminRights && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowRoleDropdown(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-24">
                  {getRoleOptions(member.role).map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onRoleChange(member, option.value);
                        setShowRoleDropdown(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getRoleColor(
              member.role
            )}`}
          >
            <Crown size={12} />
            {member.role}
          </span>
        )}

        {!isOwner && hasAdminRights && (
          <button
            onClick={() => onRemove(member)}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
            title="Remove Member"
          >
            <Trash size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
