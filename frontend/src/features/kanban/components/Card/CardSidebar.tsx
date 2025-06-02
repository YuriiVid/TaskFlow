import React, { useState } from "react";
import { Calendar, Users, UserPlus, X } from "lucide-react";
import { UtcDateTimeInput, Avatar, Modal } from "@shared";
import { BoardMember } from "@features/kanban/types";

interface CardSidebarProps {
  dueDate: string;
  assignedUsers: BoardMember[];
  availableMembers: BoardMember[];
  onDueDateChange: (dueDate: string) => void;
  onAddAssignee: (userId: number) => void;
  onRemoveAssignee: (userId: number) => void;
}

export const CardSidebar: React.FC<CardSidebarProps> = ({
  dueDate,
  assignedUsers,
  availableMembers,
  onDueDateChange,
  onAddAssignee,
  onRemoveAssignee,
}) => {
  const [localDueDate, setLocalDueDate] = useState(dueDate);
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [confirmRemoveAssignee, setConfirmRemoveAssignee] = useState<{
    open: boolean;
    memberId: number | null;
  }>({ open: false, memberId: null });

  const handleSaveDueDate = () => {
    onDueDateChange(localDueDate);
    setIsEditingDueDate(false);
  };

  const handleCancelDueDate = () => {
    setIsEditingDueDate(false);
    setLocalDueDate(dueDate);
  };

  const handleConfirmRemoveAssignee = () => {
    if (confirmRemoveAssignee.memberId) {
      onRemoveAssignee(confirmRemoveAssignee.memberId);
      setConfirmRemoveAssignee({ open: false, memberId: null });
    }
  };

  return (
    <div className="space-y-6">
      {/* Due Date Section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
        <div className="flex items-center space-x-2 text-gray-700 mb-3">
          <Calendar size={16} />
          <h4 className="font-medium">Due Date</h4>
        </div>
        <UtcDateTimeInput
          utcIso={localDueDate}
          onChangeUtc={setLocalDueDate}
          onEnterSave={handleSaveDueDate}
          onEscapeCancel={handleCancelDueDate}
          onFocus={() => setIsEditingDueDate(true)}
          readOnly={!isEditingDueDate}
          className="w-full p-2 rounded border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        {isEditingDueDate && (
          <div className="flex space-x-2">
            <button
              onClick={handleSaveDueDate}
              className="px-3 py-1 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancelDueDate}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Assignees Section */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <Users size={16} />
            <h4 className="font-medium">Assignees</h4>
            <span className="text-sm text-gray-500">({assignedUsers.length})</span>
          </div>

          {availableMembers.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors text-sm"
              >
                <UserPlus size={14} />
                <span>Add</span>
              </button>

              {showAssigneeDropdown && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
                      Board Members
                    </div>
                    {availableMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          onAddAssignee(member.id);
                          setShowAssigneeDropdown(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors text-left"
                      >
                        <Avatar
                          src={member.profilePictureUrl}
                          name={`${member.firstName} ${member.lastName}`}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {`${member.firstName} ${member.lastName}`}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{member.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {assignedUsers.length > 0 ? (
          <div className="space-y-2">
            {assignedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <Avatar src={user.profilePictureUrl} name={`${user.firstName} ${user.lastName}`} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{`${user.firstName} ${user.lastName}`}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => setConfirmRemoveAssignee({ open: true, memberId: user.id })}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors group"
                  title="Remove assignee"
                >
                  <X size={14} className="text-gray-400 group-hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
            <Users size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">No assignees yet</p>
            <p className="text-gray-400 text-xs">Add someone to work on this card</p>
          </div>
        )}
      </div>

      {showAssigneeDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowAssigneeDropdown(false)} />}

      <Modal
        isOpen={confirmRemoveAssignee.open}
        title="Remove Assignee"
        message="Are you sure you want to remove this assignee?"
        onConfirm={handleConfirmRemoveAssignee}
        onCancel={() => setConfirmRemoveAssignee({ open: false, memberId: null })}
        confirmLabel="Remove"
        cancelLabel="Cancel"
      />
    </div>
  );
};
