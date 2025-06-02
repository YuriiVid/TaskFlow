import React from "react";
import { MessageSquare, Paperclip, AlignLeft, Calendar } from "lucide-react";
import { UtcDateTimeDisplay } from "@shared";

interface BriefCardIconsProps {
  dueDate?: string;
  hasDescription: boolean;
  attachmentsCount: number;
  commentsCount: number;
  isCompleted: boolean;
}

export const BriefCardIcons: React.FC<BriefCardIconsProps> = ({
  dueDate,
  hasDescription,
  attachmentsCount,
  commentsCount,
  isCompleted,
}) => {
  const formatDueDate = (date: string) => {
    const due = new Date(date);
    const now = new Date();
    return {
      isOverdue: due < now,
    };
  };

  const dueDateClass = (date: string) => {
    if (isCompleted) return "text-teal-600";
    return formatDueDate(date).isOverdue ? "text-red-500" : "text-gray-500";
  };

  const dueIconClass = (date: string) => {
    if (isCompleted) return "text-teal-500";
    return formatDueDate(date).isOverdue ? "text-red-400" : "text-gray-400";
  };

  return (
    <div className="flex justify-between items-center w-full text-gray-500">
      <div className="flex items-center min-w-[80px]">
        {dueDate && (
          <div className="flex items-center mr-1">
            <Calendar size={14} className={dueIconClass(dueDate)} />
            <span className={`text-xs ml-1 ${dueDateClass(dueDate)}`}>
              <UtcDateTimeDisplay utcIso={dueDate} dateOnly={true} />
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {hasDescription && (
          <div className="flex items-center">
            <AlignLeft size={14} className="text-gray-400" />
          </div>
        )}
        <div className="flex items-center">
          <Paperclip size={14} className="text-gray-400" />
          <span className="text-xs ml-1">{attachmentsCount}</span>
        </div>
        <div className="flex items-center">
          <MessageSquare size={14} className="text-gray-400" />
          <span className="text-xs ml-1">{commentsCount}</span>
        </div>
      </div>
    </div>
  );
};
