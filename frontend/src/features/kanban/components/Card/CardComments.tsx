import React, { useState } from "react";
import { MessageSquare, Edit2, Trash, SendHorizontalIcon, X } from "lucide-react";
import { Avatar, Modal } from "@shared";
import { Comment } from "@features/kanban/types";
import { AppUser } from "@shared";

interface CardCommentsProps {
  comments: Comment[];
  currentUser: AppUser;
  onAddComment: (content: string) => void;
  onUpdateComment: (commentId: number, content: string) => void;
  onDeleteComment: (commentId: number) => void;
}

export const CardComments: React.FC<CardCommentsProps> = ({
  comments,
  currentUser,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}) => {
  const [commentText, setCommentText] = useState("");
  const [editingComment, setEditingComment] = useState<{ id: number; content: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    commentId: number | null;
  }>({ open: false, commentId: null });

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText("");
  };

  const handleEditComment = () => {
    if (!editingComment?.content.trim()) return;
    onUpdateComment(editingComment.id, editingComment.content.trim());
    setEditingComment(null);
  };

  const handleDeleteComment = () => {
    if (confirmDelete.commentId) {
      onDeleteComment(confirmDelete.commentId);
      setConfirmDelete({ open: false, commentId: null });
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center space-x-2 text-gray-700">
        <MessageSquare size={16} />
        <h3 className="font-medium">Comments</h3>
      </div>

      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden max-w-xl">
            <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
              <div className="flex items-center space-x-2">
                <Avatar src={c.user.profilePictureUrl} name={`${c.user.firstName} ${c.user.lastName}`} size="sm" />
                <div>
                  <span className="font-medium text-gray-800">{`${c.user.firstName} ${c.user.lastName}`}</span>
                  <span className="ml-2 text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</span>
                  {c.updatedAt && c.updatedAt !== c.createdAt && (
                    <span className="ml-1 text-xs text-gray-400">(edited)</span>
                  )}
                </div>
              </div>
              {c.user.id === currentUser.id && editingComment?.id !== c.id && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingComment({ id: c.id, content: c.content })}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ open: true, commentId: c.id })}
                    className="p-1 hover:bg-gray-200 rounded-full"
                  >
                    <Trash size={16} />
                  </button>
                </div>
              )}
            </div>

            {editingComment?.id === c.id ? (
              <div className="px-4 py-3 flex space-x-2">
                <input
                  value={editingComment.content}
                  autoFocus
                  onChange={(e) => setEditingComment({ id: c.id, content: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEditComment();
                    }
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      setEditingComment(null);
                    }
                  }}
                  className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button onClick={handleEditComment} className="p-2 hover:bg-gray-200 rounded-full" aria-label="Save">
                  <SendHorizontalIcon size={16} />
                </button>
                <button
                  onClick={() => setEditingComment(null)}
                  className="p-2 hover:bg-gray-200 rounded-full"
                  aria-label="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="px-4 py-3">
                <p className="text-gray-700 text-sm">{c.content}</p>
              </div>
            )}
          </div>
        ))}

        <div className="flex items-start space-x-3 max-w-xl">
          <Avatar
            src={currentUser.profilePictureUrl}
            name={`${currentUser.firstName} ${currentUser.lastName}`}
            size="md"
          />
          <div className="flex-1 relative">
            <textarea
              rows={2}
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.stopPropagation();
                  e.preventDefault();
                  handleSendComment();
                }
                if (e.key === "Escape") {
                  e.stopPropagation();
                  setCommentText("");
                }
              }}
              className="w-full border border-gray-300 rounded-lg p-3 pr-10 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleSendComment}
              className="absolute right-2 bottom-2 p-2 hover:bg-gray-200 rounded-full"
              aria-label="Send comment"
            >
              <SendHorizontalIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={confirmDelete.open}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={handleDeleteComment}
        onCancel={() => setConfirmDelete({ open: false, commentId: null })}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </section>
  );
};
