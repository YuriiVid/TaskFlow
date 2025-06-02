import { api } from "@shared";
import { Attachment } from "../types";

export const attachmentsApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAttachments: build.query<Attachment[], { boardId: number; cardId: number }>({
      query: ({ boardId, cardId }) => `/boards/${boardId}/cards/${cardId}/attachments`,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: "Attachment" as const, id })),
        { type: "Attachment" as const, id: "LIST" },
      ],
    }),

    createAttachment: build.mutation<Attachment, { boardId: number; cardId: number; file: File }>({
      query: ({ boardId, cardId, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/boards/${boardId}/cards/${cardId}/attachments`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { cardId, boardId }) => [
        { type: "Attachment", id: "LIST" },
        { type: "Card", id: cardId },
        { type: "Board" as const, boardId },
      ],
    }),

    deleteAttachment: build.mutation<void, { boardId: number; cardId: number; attachmentId: number }>({
      query: ({ boardId, cardId, attachmentId }) => ({
        url: `/boards/${boardId}/cards/${cardId}/attachments/${attachmentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { attachmentId, cardId, boardId }) => [
        { type: "Attachment", id: attachmentId },
        { type: "Attachment", id: "LIST" },
        { type: "Card", id: cardId },
        { type: "Board" as const, boardId },
      ],
    }),

    downloadAttachment: build.mutation<Blob, { boardId: number; cardId: number; attachmentId: number }>({
      query: ({ boardId, cardId, attachmentId }) => ({
        url: `/boards/${boardId}/cards/${cardId}/attachments/${attachmentId}/download`,
        responseHandler: async (response) => await response.blob(),
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAttachmentsQuery,
  useCreateAttachmentMutation,
  useDeleteAttachmentMutation,
  useDownloadAttachmentMutation,
} = attachmentsApi;
