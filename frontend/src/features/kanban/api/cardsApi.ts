import { api } from "@shared";
import type { Card } from "../types";

export const cardsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCards: build.query<Card[], { boardId: number; columnId: number }>({
      query: ({ boardId, columnId }) => `/boards/${boardId}/columns/${columnId}/cards`,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Card" as const, id })),
        { type: "Card" as const, id: "LIST" },
      ],
    }),

    getCard: build.query<Card, { boardId: number; cardId: number }>({
      query: ({ boardId, cardId }) => `/boards/${boardId}/cards/${cardId}`,
      providesTags: (_result, _error, { cardId }) => [{ type: "Card" as const, id: cardId }],
    }),

    createCard: build.mutation<Card, { boardId: number; columnId: number; title: string }>({
      query: ({ boardId, columnId, title }) => ({
        url: `/boards/${boardId}/cards`,
        method: "POST",
        body: { title, columnId },
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board" as const, id: boardId },
        { type: "Card" as const, id: "LIST" },
        { type: "Column" as const, id: "LIST" },
      ],
    }),

    updateCard: build.mutation<
      void,
      {
        boardId: number;
        cardId: number;
        title?: string;
        description?: string;
        dueDate?: string;
      }
    >({
      query: ({ boardId, cardId, ...update }) => ({
        url: `/boards/${boardId}/cards/${cardId}`,
        method: "PUT",
        body: update,
      }),
      invalidatesTags: (_result, _error, { cardId, boardId }) => [
        { type: "Board" as const, id: boardId },
        { type: "Card" as const, id: cardId },
      ],
    }),

    patchCard: build.mutation<
      void,
      {
        boardId: number;
        cardId: number;
        patches: Array<{
          op: "replace" | "add" | "remove" | "move" | "copy" | "test";
          path: string;
          value?: any;
        }>;
      }
    >({
      query: ({ boardId, cardId, patches }) => ({
        url: `/boards/${boardId}/cards/${cardId}`,
        method: "PATCH",
        body: patches,
        headers: {
          "Content-Type": "application/json-patch+json",
        },
      }),
      invalidatesTags: (_result, _error, { boardId, cardId }) => [
        { type: "Board" as const, id: boardId },
        { type: "Card" as const, id: cardId },
        { type: "Column" as const, id: "LIST" },
      ],
    }),

    moveCard: build.mutation<
      void,
      {
        boardId: number;
        cardId: number;
        newColumnId: number;
        newPosition?: number;
      }
    >({
      query: ({ boardId, cardId, newColumnId, newPosition }) => ({
        url: `/boards/${boardId}/cards/${cardId}/move`,
        method: "POST",
        body: { newColumnId, newPosition },
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board" as const, id: boardId },
        { type: "Card" as const, id: "LIST" },
        { type: "Column" as const, id: "LIST" },
      ],
    }),

    deleteCard: build.mutation<void, { boardId: number; cardId: number }>({
      query: ({ boardId, cardId }) => ({
        url: `/boards/${boardId}/cards/${cardId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: "Board", id: boardId },
        { type: "Card", id: "LIST" },
        { type: "Column", id: "LIST" },
      ],
    }),

    assignMember: build.mutation<void, { boardId: number; cardId: number; userId: number }>({
      query: ({ boardId, cardId, userId }) => ({
        url: `/boards/${boardId}/cards/${cardId}/assignees`,
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: (_result, _error, { cardId, boardId }) => [
        { type: "Card", id: cardId },
        { type: "Board", id: boardId },
      ],
    }),

    unassignMember: build.mutation<void, { boardId: number; cardId: number; userId: number }>({
      query: ({ boardId, cardId, userId }) => ({
        url: `/boards/${boardId}/cards/${cardId}/assignees/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { cardId, boardId }) => [
        { type: "Card", id: cardId },
        { type: "Board", id: boardId },
      ],
    }),

    attachLabel: build.mutation<void, { boardId: number; cardId: number; labelId: number }>({
      query: ({ boardId, cardId, labelId }) => ({
        url: `/boards/${boardId}/cards/${cardId}/labels`,
        method: "POST",
        body: { labelId },
      }),
      invalidatesTags: (_result, _error, { cardId, boardId }) => [
        { type: "Card", id: cardId },
        { type: "Board", id: boardId },
      ],
    }),

    detachLabel: build.mutation<void, { boardId: number; cardId: number; labelId: number }>({
      query: ({ boardId, cardId, labelId }) => ({
        url: `/boards/${boardId}/cards/${cardId}/labels/${labelId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { cardId, boardId }) => [
        { type: "Card", id: cardId },
        { type: "Board", id: boardId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCardsQuery,
  useGetCardQuery,
  useCreateCardMutation,
  useUpdateCardMutation,
  usePatchCardMutation,
  useMoveCardMutation,
  useDeleteCardMutation,
  useAssignMemberMutation,
  useUnassignMemberMutation,
  useAttachLabelMutation,
  useDetachLabelMutation,
} = cardsApi;
