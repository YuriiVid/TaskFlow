import { api } from "@shared";
import type { BriefBoard, Board } from "../types";

export const boardsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getBoards: build.query<BriefBoard[], void>({
      query: () => "/boards",
      providesTags: (boards = []) => [
        ...boards.map((b) => ({ type: "Board" as const, id: b.id })),
        { type: "Board" as const, id: "LIST" },
      ],
    }),

    getBoard: build.query<Board, number>({
      query: (id) => `/boards/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Board" as const, id }],
    }),

    createBoard: build.mutation<BriefBoard, { title: string; description?: string }>({
      query: (board) => ({
        url: "/boards",
        method: "POST",
        body: board,
      }),
      invalidatesTags: [{ type: "Board" as const, id: "LIST" }],
    }),

    updateBoard: build.mutation<void, { id: number; title: string; description: string }>({
      query: ({ id, ...board }) => ({
        url: `/boards/${id}`,
        method: "PUT",
        body: board,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Board" as const, id },
        { type: "Board" as const, id: "LIST" },
      ],
    }),

    deleteBoard: build.mutation<void, number>({
      query: (id) => ({
        url: `/boards/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Board" as const, id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBoardsQuery,
  useGetBoardQuery,
  useCreateBoardMutation,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
} = boardsApi;
