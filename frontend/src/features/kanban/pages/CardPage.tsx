import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import {
  useGetCardQuery,
  usePatchCardMutation,
  useAssignMemberMutation,
  useUnassignMemberMutation,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useCreateAttachmentMutation,
  useDeleteAttachmentMutation,
  useDownloadAttachmentMutation,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
  useAttachLabelMutation,
  useDetachLabelMutation,
} from "../api";
import { toast } from "react-hot-toast";
import { LoadingSpinner } from "@shared";
import { Card } from "../components";
import { Board } from "../types";
import { useAppSelector } from "@app/hooks";

type ContextType = { board: Board };

const CardPage: React.FC = () => {
  const { board } = useOutletContext<ContextType>();
  const params = useParams<{ boardId: string; id: string }>();
  const boardId = Number(params.boardId);
  const cardId = Number(params.id);
  const navigate = useNavigate();

  const currentUser = useAppSelector((state) => state.auth.user)!;

  const { data: card, isLoading } = useGetCardQuery({ boardId, cardId });
  const [patchCard] = usePatchCardMutation();
  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [createAttachment] = useCreateAttachmentMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();
  const [assignMember] = useAssignMemberMutation();
  const [unassignMember] = useUnassignMemberMutation();
  const [triggerDownload] = useDownloadAttachmentMutation();
  const [createLabel] = useCreateLabelMutation();
  const [updateLabel] = useUpdateLabelMutation();
  const [deleteLabel] = useDeleteLabelMutation();
  const [attachLabel] = useAttachLabelMutation();
  const [detachLabel] = useDetachLabelMutation();

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!card && !isLoading) {
      navigate(`/boards/${boardId}`);
    }
  }, [card, isLoading, navigate, boardId]);

  const doPatch = async (patches: any[]) => {
    if (!patches.length) return;
    try {
      await patchCard({ boardId, cardId, patches }).unwrap();
      toast.success("Updated successfully");
    } catch (err: any) {
      console.error("Patch failed:", err);
    }
  };

  const handleAddComment = async (content: string) => {
    try {
      await createComment({ boardId, cardId, content }).unwrap();
      toast.success("Comment added");
    } catch (err: any) {
      console.error("Add comment failed:", err);
    }
  };

  const handleDownload = async (id: number, name: string) => {
    try {
      const blob = await triggerDownload({
        boardId: board.id,
        cardId: cardId,
        attachmentId: id,
      }).unwrap();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Download failed", err);
    }
  };

  const handleUpdateComment = async (id: number, content: string) => {
    try {
      await updateComment({ boardId, cardId, commentId: id, content }).unwrap();
      toast.success("Comment updated");
    } catch (err: any) {
      console.error("Update comment failed:", err);
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await deleteComment({ boardId, cardId, commentId: id }).unwrap();
      toast.success("Comment deleted");
    } catch (err: any) {
      console.error("Delete comment failed:", err);
    }
  };

  const handleAddAttachment = async (file: File) => {
    setIsUploading(true);
    try {
      await createAttachment({ boardId, cardId, file }).unwrap();
      toast.success("Attachment added");
    } catch (err: any) {
      console.error(`Failed to add attachment ${err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = async (id: number) => {
    try {
      await deleteAttachment({ boardId, cardId, attachmentId: id }).unwrap();
      toast.success("Attachment removed");
    } catch (err: any) {
      console.error("Remove attachment failed:", err);
    }
  };

  const handleAddAssignee = async (userId: number) => {
    try {
      await assignMember({ boardId, cardId, userId }).unwrap();
      toast.success("Assignee added");
    } catch (err: any) {
      console.error("Add assignee failed:", err);
    }
  };

  const handleRemoveAssignee = async (userId: number) => {
    try {
      await unassignMember({ boardId, cardId, userId }).unwrap();
      toast.success("Assignee removed");
    } catch (err: any) {
      console.error("Remove assignee failed:", err);
    }
  };

  const handleCreateLabel = async (title: string, color: string) => {
    try {
      const result = await createLabel({ boardId, title, color }).unwrap();
      toast.success("Label created");
      return result;
    } catch (err: any) {
      console.error("Create label failed:", err);
      throw err;
    }
  };

  const handleUpdateLabel = async (labelId: number, title: string, color: string) => {
    try {
      await updateLabel({ boardId, labelId, title, color, cardId }).unwrap();
      toast.success("Label updated");
    } catch (err: any) {
      console.error("Update label failed:", err);
    }
  };

  const handleDeleteLabel = async (labelId: number) => {
    try {
      await deleteLabel({ boardId, labelId, cardId }).unwrap();
      toast.success("Label deleted");
    } catch (err: any) {
      console.error("Delete label failed:", err);
    }
  };

  const handleAttachLabel = async (labelId: number) => {
    try {
      await attachLabel({ boardId, cardId, labelId }).unwrap();
      toast.success("Label attached");
    } catch (err: any) {
      console.error("Attach label failed:", err);
    }
  };

  const handleDetachLabel = async (labelId: number) => {
    try {
      await detachLabel({ boardId, cardId, labelId }).unwrap();
      toast.success("Label removed");
    } catch (err: any) {
      console.error("Detach label failed:", err);
    }
  };

  const handleClose = () => {
    navigate(`/boards/${boardId}`);
  };

  if (isLoading || !card) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={handleClose}>
        <LoadingSpinner className="w-10 h-10" />
      </div>
    );
  }

  return (
    <Card
      board={board}
      card={card}
      currentUser={currentUser}
      isUploading={isUploading}
      onPatch={doPatch}
      onAddComment={handleAddComment}
      onUpdateComment={handleUpdateComment}
      onDeleteComment={handleDeleteComment}
      onAddAttachment={handleAddAttachment}
      onRemoveAttachment={handleRemoveAttachment}
      onDownloadAttachment={handleDownload}
      onAddAssignee={handleAddAssignee}
      onRemoveAssignee={handleRemoveAssignee}
      onCreateLabel={handleCreateLabel}
      onUpdateLabel={handleUpdateLabel}
      onDeleteLabel={handleDeleteLabel}
      onAttachLabel={handleAttachLabel}
      onDetachLabel={handleDetachLabel}
      onClose={handleClose}
    />
  );
};

export default CardPage;
