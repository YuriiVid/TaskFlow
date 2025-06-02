import React from "react";
import { BriefBoard as BriefBoardType } from "@features/kanban/types";
import { Users } from "lucide-react";
import { Avatar } from "@shared";

interface BriefBoardProps {
  board: BriefBoardType;
}

const BriefBoardComponent: React.FC<BriefBoardProps> = ({ board }) => {
  const { title, description, members, tasksCount } = board;

  const extraCount = members.length - 3;
  const visibleMembers = members.slice(0, 3);

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-52">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
      </div>

      <div className="flex items-center justify-start text-sm text-gray-500">
        <Users className="w-4 h-4 mr-1" />
        <span>{members.length}</span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="-space-x-2 flex items-center">
          {visibleMembers.map((member) => (
            <Avatar key={member.id} src={member.profilePictureUrl} name={`${member.firstName} ${member.lastName}`} />
          ))}
          {extraCount > 0 && (
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 border-2 border-white text-xs text-gray-600">
              +{extraCount}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-500">{tasksCount} tasks</span>
      </div>
    </div>
  );
};

export const BriefBoard = React.memo(BriefBoardComponent);
