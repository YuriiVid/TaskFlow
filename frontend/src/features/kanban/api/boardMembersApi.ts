import { api } from "@shared";
import type { BoardMember, BoardMemberRole } from "../types";

export const boardMembersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBoardMembers: build.query<BoardMember[], number>({
      query: (boardId) => `/boards/${boardId}/members`,
      providesTags: (members = [], _error, boardId) => [
        ...members.map((m) => ({ type: "BoardMember" as const, id: m.id })),
        { type: "BoardMember" as const, id: `LIST-${boardId}` },
      ],
    }),

    addBoardMember: build.mutation<void, { boardId: number; email: string; role?: BoardMemberRole }>({
      query: ({ boardId, email, role }) => ({
        url: `/boards/${boardId}/members`,
        method: "POST",
        body: { email, boardMemberRole: role },
      }),
      invalidatesTags: (_res, _err, { boardId }) => [
        { type: "BoardMember" as const, id: `LIST-${boardId}` },
        { type: "Board" as const, boardId },
      ],
    }),

    updateMemberRole: build.mutation<void, { boardId: number; userId: number; role: BoardMemberRole }>({
      query: ({ boardId, userId, role }) => ({
        url: `/boards/${boardId}/members/${userId}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (_res, _err, { boardId }) => [
        { type: "BoardMember" as const, id: `LIST-${boardId}` },
        { type: "Board" as const, boardId },
      ],
    }),

    removeMember: build.mutation<void, { boardId: number; userId: number }>({
      query: ({ boardId, userId }) => ({
        url: `/boards/${boardId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { boardId }) => [
        { type: "BoardMember" as const, id: `LIST-${boardId}` },
        { type: "Board" as const, boardId },
      ],
    }),

    transferOwnership: build.mutation<void, { boardId: number; userId: number }>({
      query: ({ boardId, userId }) => ({
        url: `/boards/${boardId}/members/${userId}/transfer-ownership`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, { boardId }) => [
        { type: "BoardMember" as const, id: `LIST-${boardId}` },
        { type: "Board" as const, boardId },
      ],
    }),

    leaveBoard: build.mutation<void, number>({
      query: (boardId) => ({
        url: `/boards/${boardId}/members/leave`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, boardId) => [{ type: "BoardMember" as const, id: `LIST-${boardId}` }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBoardMembersQuery,
  useAddBoardMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useTransferOwnershipMutation,
  useLeaveBoardMutation,
} = boardMembersApi;
