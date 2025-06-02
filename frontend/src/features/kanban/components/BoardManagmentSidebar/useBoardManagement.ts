import toast from "react-hot-toast";
import { BoardMemberRole } from "@features/kanban/types";
import {
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
  useAddBoardMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useTransferOwnershipMutation,
  useLeaveBoardMutation,
} from "@features/kanban/api";

export const useBoardManagement = (boardId: number) => {
  const [updateBoard] = useUpdateBoardMutation();
  const [deleteBoard] = useDeleteBoardMutation();
  const [createLabel] = useCreateLabelMutation();
  const [updateLabel] = useUpdateLabelMutation();
  const [deleteLabel] = useDeleteLabelMutation();
  const [addMember] = useAddBoardMemberMutation();
  const [updateMemberRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [transferOwnership] = useTransferOwnershipMutation();
  const [leave] = useLeaveBoardMutation();

  const updateBoardDetails = async (title: string, description: string) => {
    try {
      await updateBoard({ id: boardId, title, description }).unwrap();
      toast.success("Board updated successfully");
    } catch (error) {
      console.log(`Failed to update board ${error}`);
    }
  };

  const deleteBoardById = async () => {
    try {
      await deleteBoard(boardId).unwrap();
      toast.success("Board deleted");
      return true;
    } catch (error) {
      console.log(`Failed to delete board ${error}`);
      return false;
    }
  };

  const addBoardMember = async (email: string) => {
    try {
      await addMember({ boardId, email }).unwrap();
      toast.success("User added successfully");
      return true;
    } catch (error) {
      console.log(`Failed to add user ${error}`);
      return false;
    }
  };

  const updateMemberRoleById = async (userId: number, role: BoardMemberRole) => {
    try {
      await updateMemberRole({ boardId, userId, role }).unwrap();
      toast.success(`Role updated to ${role.toLowerCase()}`);
      return true;
    } catch (error) {
      console.log(`Failed to update role ${error}`);
      return false;
    }
  };

  const removeBoardMember = async (userId: number) => {
    try {
      await removeMember({ boardId, userId }).unwrap();
      toast.success("Member removed");
      return true;
    } catch (error) {
      console.log(`Failed to remove member ${error}`);
      return false;
    }
  };

  const createBoardLabel = async (title: string, color: string) => {
    try {
      await createLabel({ boardId, title, color }).unwrap();
      toast.success("Label created");
      return true;
    } catch (error) {
      console.log(`Failed to create label ${error}`);
      return false;
    }
  };

  const updateBoardLabel = async (labelId: number, title: string, color: string) => {
    try {
      await updateLabel({ boardId, labelId, title, color }).unwrap();
      toast.success("Label updated");
      return true;
    } catch (error) {
      console.log(`Failed to update label ${error}`);
      return false;
    }
  };

  const deleteBoardLabel = async (labelId: number) => {
    try {
      await deleteLabel({ boardId, labelId }).unwrap();
      toast.success("Label deleted");
      return true;
    } catch (error) {
      console.log(`Failed to delete label ${error}`);
      return false;
    }
  };

  const transferBoardOwnership = async (userId: number) => {
    try {
      await transferOwnership({ boardId, userId }).unwrap();
      toast.success("Ownership transfered");
      return true;
    } catch (error) {
      console.log(`Failed to transfer ownership ${error}`);
      return false;
    }
  };

  const leaveBoard = async () => {
    try {
      await leave(boardId).unwrap();
      toast.success("You left the board");
      return true;
    } catch (error) {
      console.log(`Failed to leave the board ${error}`);
      return false;
    }
  };

  return {
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
  };
};
