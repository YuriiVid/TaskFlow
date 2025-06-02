import React, { useEffect } from "react";
import { CardHeader } from "./CardHeader";
import { CardDescription } from "./CardDescription";
import { CardAttachments } from "./CardAttachments";
import { CardComments } from "./CardComments";
import { CardSidebar } from "./CardSidebar";
import { CardLabels } from "./CardLabels";
import { Board, Card as CardType, Label } from "@features/kanban/types";
import { AppUser } from "@shared";

interface CardProps {
  board: Board;
  card: CardType;
  currentUser: AppUser;
  isUploading: boolean;
  onPatch: (patches: any[]) => void;
  onAddAttachment: (file: File) => void;
  onRemoveAttachment: (attachmentId: number) => void;
  onDownloadAttachment: (id: number, fileName: string) => void;
  onAddComment: (content: string) => void;
  onUpdateComment: (commentId: number, content: string) => void;
  onDeleteComment: (commentId: number) => void;
  onAddAssignee: (userId: number) => void;
  onRemoveAssignee: (userId: number) => void;
  onCreateLabel: (title: string, color: string) => Promise<Label>;
  onUpdateLabel: (labelId: number, title: string, color: string) => void;
  onDeleteLabel: (labelId: number) => void;
  onAttachLabel: (labelId: number) => void;
  onDetachLabel: (labelId: number) => void;
  onClose: () => void;
}

const UPLOADS_URL = import.meta.env.VITE_UPLOADS_PATH || "/uploads";

export const Card: React.FC<CardProps> = ({
  board,
  card,
  currentUser,
  isUploading,
  onPatch,
  onAddAttachment,
  onRemoveAttachment,
  onDownloadAttachment,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddAssignee,
  onRemoveAssignee,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
  onAttachLabel,
  onDetachLabel,
  onClose,
}) => {
  const availableMembers = board.members.filter((m) => !card.assignedUsers.some((u) => u.id === m.id));

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleTitleChange = (newTitle: string) => {
    onPatch([{ op: "replace", path: "/title", value: newTitle }]);
  };
  const handleDescriptionChange = (newDesc: string) => {
    onPatch([{ op: "replace", path: "/description", value: newDesc }]);
  };
  const handleDueDateChange = (newDate: string) => {
    onPatch([{ op: "replace", path: "/dueDate", value: newDate || null }]);
  };
  const handleToogleCompleted = (isCompleted: boolean) => {
    onPatch([{ op: "replace", path: "/isCompleted", value: isCompleted }]);
  };
  const openInNewTab = (url: string): void => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) newWindow.opener = null;
  };
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-xl p-12 w-full max-w-4xl relative shadow-2xl ring-1 ring-black/5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader
          title={card.title}
          onTitleChange={handleTitleChange}
          onClose={onClose}
          isCompleted={card.isCompleted}
          onToogleCompleted={handleToogleCompleted}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          <div className="md:col-span-2 space-y-8">
			 <CardLabels
          card={card}
          board={board}
          onCreateLabel={onCreateLabel}
          onUpdateLabel={onUpdateLabel}
          onDeleteLabel={onDeleteLabel}
          onAttachLabel={onAttachLabel}
          onDetachLabel={onDetachLabel}
        />
            <CardDescription description={card.description ?? ""} onDescriptionChange={handleDescriptionChange} />
            <CardAttachments
              attachments={card.attachments}
              isUploading={isUploading}
              onAddAttachment={onAddAttachment}
              onRemoveAttachment={onRemoveAttachment}
              onOpenInNewTab={(url) => openInNewTab(`${UPLOADS_URL}/${url}`)}
              onDownload={onDownloadAttachment}
            />
            <CardComments
              comments={card.comments}
              currentUser={currentUser}
              onAddComment={onAddComment}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
            />
          </div>

          <CardSidebar
            dueDate={card.dueDate || ""}
            assignedUsers={card.assignedUsers}
            availableMembers={availableMembers}
            onDueDateChange={handleDueDateChange}
            onAddAssignee={(id) => onAddAssignee(id)}
            onRemoveAssignee={(id) => onRemoveAssignee(id)}
          />
        </div>
      </div>
    </div>
  );
};
