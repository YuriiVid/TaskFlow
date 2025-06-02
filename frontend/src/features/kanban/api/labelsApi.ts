import { api } from "@shared";
import { Label } from "../types";

export const labelsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getLabels: build.query<Label[], number>({
      query: (boardId) => `/boards/${boardId}/labels`,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Label" as const, id })),
        { type: "Label", id: "LIST" },
      ],
    }),

    getLabel: build.query<Label, { boardId: number; labelId: number }>({
      query: ({ boardId, labelId }) => `/boards/${boardId}/labels/${labelId}`,
      providesTags: (_result, _error, { labelId }) => [{ type: "Label", id: labelId }],
    }),

    createLabel: build.mutation<Label, { boardId: number; title: string; color: string }>({
      query: ({ boardId, ...label }) => ({
        url: `/boards/${boardId}/labels`,
        method: "POST",
        body: label,
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Label", id: "LIST" },
        { type: "Board", boardId },
        { type: "Card", id: "LIST" },
      ],
    }),

    updateLabel: build.mutation<
      void,
      { boardId: number; labelId: number; title: string; color: string; cardId?: number }
    >({
      query: ({ boardId, labelId, ...label }) => ({
        url: `/boards/${boardId}/labels/${labelId}`,
        method: "PUT",
        body: label,
      }),
      invalidatesTags: (_result, _error, { boardId, cardId, labelId }) => [
        { type: "Label", id: labelId },
        { type: "Label", id: "LIST" },
        { type: "Board", boardId },
        { type: "Card", cardId },
      ],
    }),

    deleteLabel: build.mutation<void, { boardId: number; labelId: number; cardId?: number }>({
      query: ({ boardId, labelId }) => ({
        url: `/boards/${boardId}/labels/${labelId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { boardId, cardId }) => [
        { type: "Label", id: "LIST" },
        { type: "Board", boardId },
        { type: "Card", cardId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLabelsQuery,
  useGetLabelQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
} = labelsApi;
