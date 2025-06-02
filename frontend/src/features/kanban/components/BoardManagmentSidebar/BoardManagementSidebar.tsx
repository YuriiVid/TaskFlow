import React, { useState } from "react";
import { X } from "lucide-react";
import { Board, BoardMember, BoardMemberRole } from "@features/kanban/types";
import { Modal } from "@shared";
import { useBoardManagement } from "./useBoardManagement";
import { BoardGeneralTab } from "./BoardGeneralTab";
import { BoardMembersTab } from "./BoardMembersTab";
import { BoardLabelsTab } from "./BoardLabelsTab";
import { useAppSelector } from "@app/hooks";
import { useNavigate } from "react-router-dom";

interface BoardManagementSidebarProps {
  board: Board;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "general" | "members" | "labels";

export const BoardManagementSidebar: React.FC<BoardManagementSidebarProps> = ({ board, isOpen, onClose }) => {
  const {
    updateBoardDetails,
    deleteBoardById,
    addBoardMember,
    updateMemberRoleById,
    removeBoardMember,
    createBoardLabel,
    updateBoardLabel,
    deleteBoardLabel,
    transferBoardOwnership,
    leaveBoard,
  } = useBoardManagement(board.id);
  const currentUser = useAppSelector((state) => state.auth.user)!;
  const currentMember = board.members.find((member) => member.id === currentUser.id);
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // Modal states
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [showDeleteBoardModal, setShowDeleteBoardModal] = useState(false);
  const [showLeaveBoardModal, setShowLeaveBoardModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<BoardMemberRole | null>(null);

  const navigate = useNavigate();

  const handleDeleteBoard = () => {
    setShowDeleteBoardModal(true);
  };

  const confirmDeleteBoard = async () => {
    const success = await deleteBoardById();
    if (success) {
      setShowDeleteBoardModal(false);
      onClose();
    }
  };

  const handleRoleChange = (member: BoardMember, newRole: BoardMemberRole) => {
    setSelectedMember(member);
    setSelectedRole(newRole);
    setShowRoleChangeModal(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedMember || !selectedRole) return;
    let success = false;
    if (selectedRole === BoardMemberRole.Owner) {
      success = await transferBoardOwnership(selectedMember.id);
    } else {
      success = await updateMemberRoleById(selectedMember.id, selectedRole);
    }
    if (success) {
      setShowRoleChangeModal(false);
      setSelectedMember(null);
      setSelectedRole(null);
    }
  };

  const handleRemoveMember = (member: BoardMember) => {
    setSelectedMember(member);
    setShowRemoveMemberModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!selectedMember) return;

    const success = await removeBoardMember(selectedMember.id);
    if (success) {
      setShowRemoveMemberModal(false);
      setSelectedMember(null);
    }
  };

  const handleLeaveBoard = () => {
    setShowLeaveBoardModal(true);
  };

  const confirmLeaveBoard = async () => {
    if (!currentMember) return;

    const success = await leaveBoard();
    if (success) {
      setShowLeaveBoardModal(false);
      onClose();
      navigate("/boards");
    }
  };

  const tabs = [
    { key: "general" as const, label: "General" },
    { key: "members" as const, label: "Members" },
    { key: "labels" as const, label: "Labels" },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        <div className="flex-1 bg-black/50" onClick={onClose} />

        <div className="w-96 bg-white shadow-lg flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Board Management</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 ${
                    activeTab === tab.key
                      ? "border-teal-500 text-teal-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === "general" && (
              <BoardGeneralTab
                board={board}
                onSave={updateBoardDetails}
                onDelete={handleDeleteBoard}
                onLeave={handleLeaveBoard}
                currentMember={currentMember}
              />
            )}

            {activeTab === "members" && (
              <BoardMembersTab
                board={board}
                onAddMember={addBoardMember}
                onRoleChange={handleRoleChange}
                onRemoveMember={handleRemoveMember}
                currentMember={currentMember}
              />
            )}

            {activeTab === "labels" && (
              <BoardLabelsTab
                board={board}
                onCreateLabel={createBoardLabel}
                onUpdateLabel={updateBoardLabel}
                onDeleteLabel={deleteBoardLabel}
              />
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showRoleChangeModal}
        title={selectedRole === BoardMemberRole.Owner ? "Transfer Ownership" : "Change Member Role"}
        onConfirm={confirmRoleChange}
        onCancel={() => {
          setShowRoleChangeModal(false);
          setSelectedMember(null);
          setSelectedRole(null);
        }}
        confirmLabel={selectedRole === BoardMemberRole.Owner ? "Transfer Ownership" : "Change Role"}
        cancelLabel="Cancel"
      >
        <div className="space-y-3">
          {selectedRole === BoardMemberRole.Owner ? (
            <>
              <p className="text-gray-700">
                Are you sure you want to transfer ownership to <strong>{selectedMember?.fullName}</strong>?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-yellow-800 text-sm font-medium">⚠️ Warning</p>
                <p className="text-yellow-700 text-sm mt-1">
                  This action cannot be undone. You will lose owner privileges and become an admin.
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-700">
              Change <strong>{selectedMember?.fullName}</strong>'s role to{" "}
              <strong>{selectedRole?.toLowerCase()}</strong>?
            </p>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showRemoveMemberModal}
        title="Remove Member"
        message={`Are you sure you want to remove ${selectedMember?.fullName} from this board?`}
        onConfirm={confirmRemoveMember}
        onCancel={() => {
          setShowRemoveMemberModal(false);
          setSelectedMember(null);
        }}
        confirmLabel="Remove"
        cancelLabel="Cancel"
      />

      <Modal
        isOpen={showDeleteBoardModal}
        title="Delete Board"
        message="Are you sure you want to delete this board? This action cannot be undone."
        onConfirm={confirmDeleteBoard}
        onCancel={() => setShowDeleteBoardModal(false)}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
      <Modal
        isOpen={showLeaveBoardModal}
        title="Leave Board"
        message="Are you sure you want to leave this board? You will no longer have access to it and its cards."
        onConfirm={confirmLeaveBoard}
        onCancel={() => setShowLeaveBoardModal(false)}
        confirmLabel="Leave Board"
        cancelLabel="Cancel"
      />
    </>
  );
};
