import React, { useRef, useState } from "react";
import { Paperclip, Upload, Download, ExternalLink, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu } from "../../components";
import { Modal } from "@shared";
import { Attachment } from "@features/kanban/types";

interface CardAttachmentsProps {
  attachments: Attachment[];
  isUploading: boolean;
  onAddAttachment: (file: File) => void;
  onRemoveAttachment: (attachmentId: number) => void;
  onOpenInNewTab: (fileUrl: string) => void;
  onDownload: (id: number, fileName: string) => void;
}

// Utility function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const CardAttachments: React.FC<CardAttachmentsProps> = ({
  attachments,
  isUploading,
  onAddAttachment,
  onRemoveAttachment,
  onOpenInNewTab,
  onDownload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    attachmentId: number | null;
  }>({ open: false, attachmentId: null });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddAttachment(file);
      e.target.value = "";
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDelete.attachmentId) {
      onRemoveAttachment(confirmDelete.attachmentId);
      setConfirmDelete({ open: false, attachmentId: null });
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-700">
          <Paperclip size={16} />
          <h3 className="font-medium">Attachments</h3>
          <span className="text-sm text-gray-500">({attachments.length})</span>
        </div>

        <div className="relative">
          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" disabled={isUploading} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="text-sm font-medium">Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={16} />
                <span className="text-sm font-medium">Add File</span>
              </>
            )}
          </button>
        </div>
      </div>

      {attachments.length > 0 ? (
        <div className="space-y-3">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="group flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                <Paperclip size={18} className="text-teal-500" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{att.fileName}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>Added {new Date(att.createdAt).toLocaleDateString()}</span>
                  {att.sizeInBytes && (
                    <>
                      <span>•</span>
                      <span>{formatFileSize(att.sizeInBytes)}</span>
                    </>
                  )}
                </div>
              </div>

              <DropdownMenu
                items={[
                  {
                    label: "Open in new tab",
                    onClick: (e) => {
                      e.stopPropagation();
                      onOpenInNewTab(att.fileUrl);
                    },
                    icon: <ExternalLink size={16} />,
                  },
                  {
                    label: "Download",
                    onClick: (e) => {
                      e.stopPropagation();
                      onDownload(att.id, att.fileName);
                    },
                    icon: <Download size={16} />,
                  },
                  {
                    label: "Remove",
                    onClick: (e) => {
                      e.stopPropagation();
                      setConfirmDelete({ open: true, attachmentId: att.id });
                    },
                    icon: <Trash2 size={16} />,
                    variant: "danger",
                  },
                ]}
                position="right"
                trigger={
                  <div className="p-2 hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={16} className="text-gray-500" />
                  </div>
                }
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <Paperclip size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">No attachments yet</p>
          <p className="text-gray-400 text-xs">Click "Add File" to upload your first attachment</p>
        </div>
      )}

      <Modal
        isOpen={confirmDelete.open}
        title="Delete Attachment"
        message="Are you sure you want to delete this attachment? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ open: false, attachmentId: null })}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </section>
  );
};
