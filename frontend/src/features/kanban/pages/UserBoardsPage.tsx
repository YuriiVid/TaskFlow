import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useGetBoardsQuery, useDeleteBoardMutation, useCreateBoardMutation, useUpdateBoardMutation } from "../api";
import { getErrorMessage } from "@utils";
import { Header, BriefBoard, DropdownMenu } from "../components/";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Modal, LoadingScreen, ErrorScreen } from "@shared";

const UserBoardsPage: React.FC = () => {
  const { data: boards = [], isLoading, error } = useGetBoardsQuery();
  const [deleteBoard] = useDeleteBoardMutation();
  const [createBoard] = useCreateBoardMutation();
  const [updateBoard] = useUpdateBoardMutation();
  const [searchQuery, setSearchQuery] = useState("");

  const [confirmState, setConfirmState] = useState<{ open: boolean; boardId: number | null }>({
    open: false,
    boardId: null,
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [editBoardTitle, setEditBoardTitle] = useState("");
  const [editBoardDescription, setEditBoardDescription] = useState("");

  const filteredBoards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return boards;
    return boards.filter(
      (b) => b.title.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q))
    );
  }, [boards, searchQuery]);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const confirmDelete = (boardId: number) => {
    setConfirmState({ open: true, boardId });
  };

  const handleConfirmDelete = async () => {
    const id = confirmState.boardId;
    if (!id) return;
    try {
      await deleteBoard(id).unwrap();
      toast.success("Board deleted");
    } catch (err) {
      console.error("Failed to delete board:", err);
    } finally {
      setConfirmState({ open: false, boardId: null });
    }
  };

  const handleConfirmCreate = async () => {
    const title = newBoardTitle.trim();
    if (!title) return;
    try {
      await createBoard({ title, description: newBoardDescription }).unwrap();
      toast.success("Board created");
      setNewBoardTitle("");
      setNewBoardDescription("");
      setCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to create board:", err);
    }
  };

  const openEditModal = (boardId: number) => {
    const board = boards.find((b) => b.id === boardId);
    if (!board) return;
    setEditingBoardId(boardId);
    setEditBoardTitle(board.title);
    setEditBoardDescription(board.description || "");
    setEditModalOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!editingBoardId) return;
    const title = editBoardTitle.trim();
    try {
      await updateBoard({ id: editingBoardId, title, description: editBoardDescription }).unwrap();
      toast.success("Board updated");
      setEditModalOpen(false);
      setEditingBoardId(null);
    } catch (err) {
      console.error("Failed to update board:", err);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen title="Boards Loading Failed" message={getErrorMessage(error)} type="warning" />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={handleSearch} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Boards</h1>
            <p className="text-gray-600 mt-1">Manage and organize your projects</p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Board
          </button>
        </div>

        <div>
          {filteredBoards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBoards.map((board) => (
                <div key={board.id} className="relative">
                  <Link to={`/boards/${board.id}`} className="block">
                    <BriefBoard board={board} />
                  </Link>
                  <div className="absolute top-2 right-2">
                    <DropdownMenu
                      size="sm"
                      items={[
                        {
                          label: "Edit",
                          icon: <Edit2 size={16} />,
                          onClick: () => openEditModal(board.id),
                        },
                        {
                          label: "Delete",
                          icon: <Trash2 size={16} />,
                          variant: "danger",
                          onClick: () => confirmDelete(board.id),
                        },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              {searchQuery ? `No boards match “${searchQuery}”.` : "You have no boards. Add one to get started."}
            </p>
          )}
        </div>
      </div>

      <Modal
        isOpen={confirmState.open}
        title="Delete Board"
        message="Are you sure you want to delete this board? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ open: false, boardId: null })}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      <Modal
        isOpen={createModalOpen}
        title="Create New Board"
        onConfirm={handleConfirmCreate}
        onCancel={() => {
          setCreateModalOpen(false);
          setNewBoardTitle("");
          setNewBoardDescription("");
        }}
        confirmLabel="Create"
        cancelLabel="Cancel"
      >
        <input
          type="text"
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          placeholder="Enter board name"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
        />
        <textarea
          value={newBoardDescription}
          onChange={(e) => setNewBoardDescription(e.target.value)}
          placeholder="Enter board description (optional)"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </Modal>

      <Modal
        isOpen={editModalOpen}
        title="Edit Board"
        onConfirm={handleConfirmEdit}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingBoardId(null);
        }}
        confirmLabel="Save"
        cancelLabel="Cancel"
      >
        <input
          type="text"
          value={editBoardTitle}
          onChange={(e) => setEditBoardTitle(e.target.value)}
          placeholder="Update board name"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4"
        />
        <textarea
          value={editBoardDescription}
          onChange={(e) => setEditBoardDescription(e.target.value)}
          placeholder="Update board description"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </Modal>
    </div>
  );
};

export default UserBoardsPage;
