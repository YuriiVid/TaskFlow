import { api } from "@shared";
import { Comment } from "../types";

export const commentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getComments: build.query<Comment[], { boardId: number; cardId: number }>({
      query: ({ boardId, cardId }) => `/boards/${boardId}/cards/${cardId}/comments`,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Comment" as const, id })),
        { type: "Comment" as const, id: "LIST" },
      ],
    }),

    getComment: build.query<Comment, { boardId: number; cardId: number; commentId: number }>({
      query: ({ boardId, cardId, commentId }) => `/boards/${boardId}/cards/${cardId}/comments/${commentId}`,
      providesTags: (_result, _error, { commentId }) => [{ type: "Comment" as const, id: commentId }],
    }),

    createComment: build.mutation<Comment, { boardId: number; cardId: number; content: string }>({
      query: ({ boardId, cardId, ...comment }) => ({
        url: `/boards/${boardId}/cards/${cardId}/comments`,
        method: "POST",
        body: comment,
      }),
      invalidatesTags: (_result, _error, { cardId, boardId }) => [
        { type: "Comment", id: "LIST" },
        { type: "Card", id: cardId },
        { type: "Board" as const, boardId },
      ],
    }),

    updateComment: build.mutation<void, { boardId: number; cardId: number; commentId: number; content: string }>({
      query: ({ boardId, cardId, commentId, ...comment }) => ({
        url: `/boards/${boardId}/cards/${cardId}/comments/${commentId}`,
        method: "PUT",
        body: comment,
      }),
      invalidatesTags: (_result, _error, { commentId, cardId, boardId }) => [
        { type: "Comment", id: commentId },
        { type: "Comment", id: "LIST" },
        { type: "Card", id: cardId },
        { type: "Board" as const, boardId },
      ],
    }),

    deleteComment: build.mutation<void, { boardId: number; cardId: number; commentId: number }>({
      query: ({ boardId, cardId, commentId }) => ({
        url: `/boards/${boardId}/cards/${cardId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { commentId, cardId, boardId }) => [
        { type: "Comment", id: commentId },
        { type: "Comment", id: "LIST" },
        { type: "Card", id: cardId },
        { type: "Board" as const, boardId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCommentsQuery,
  useGetCommentQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentsApi;
