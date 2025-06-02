import { api } from "@shared";
import type { Column } from "../types";

export const columnsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getColumns: build.query<Column[], number>({
      query: (boardId) => `/boards/${boardId}/columns`,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Column" as const, id })),
        { type: "Column" as const, id: "LIST" },
      ],
    }),

    getColumn: build.query<Column, { boardId: number; columnId: number }>({
      query: ({ boardId, columnId }) => `/boards/${boardId}/columns/${columnId}`,
      providesTags: (_result, _error, { columnId }) => [{ type: "Column" as const, id: columnId }],
    }),

    createColumn: build.mutation<Column, { boardId: number; title: string }>({
      query: ({ boardId, title }) => ({
        url: `/boards/${boardId}/columns`,
        method: "POST",
        body: { title },
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board", id: boardId },
        { type: "Column" as const, id: "LIST" },
      ],
    }),

    updateColumn: build.mutation<void, { boardId: number; columnId: number; title: string }>({
      query: ({ boardId, columnId, title }) => ({
        url: `/boards/${boardId}/columns/${columnId}`,
        method: "PUT",
        body: { title },
      }),
      invalidatesTags: (_result, _error, { columnId, boardId }) => [
        { type: "Board", id: boardId },
        { type: "Column", id: columnId },
      ],
    }),

    deleteColumn: build.mutation<void, { boardId: number; columnId: number }>({
      query: ({ boardId, columnId }) => ({
        url: `/boards/${boardId}/columns/${columnId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { columnId, boardId }) => [
        { type: "Board", id: boardId },
        { type: "Column", id: "LIST" },
        { type: "Column", id: columnId },
      ],
    }),

    moveColumn: build.mutation<void, { boardId: number; columnId: number; newPosition?: number }>({
      query: ({ boardId, columnId, newPosition }) => ({
        url: `/boards/${boardId}/columns/${columnId}/move`,
        method: "POST",
        body: { newPosition },
      }),
      invalidatesTags: (_result, _error, { columnId, boardId }) => [
        { type: "Board", id: boardId },
        { type: "Column", id: "LIST" },
        { type: "Column", id: columnId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetColumnsQuery,
  useGetColumnQuery,
  useCreateColumnMutation,
  useUpdateColumnMutation,
  useDeleteColumnMutation,
  useMoveColumnMutation,
} = columnsApi;
