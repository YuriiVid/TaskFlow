import React, { useEffect, useRef, useState } from "react";
import { Board } from "../../types";
import { useCreateColumnMutation, useMoveColumnMutation, useMoveCardMutation, useCreateCardMutation } from "../../api";
import { monitorCardDrop, monitorColumnDrop } from "./dropHandlers";
import { setupAutoScroll } from "./scrollHelpers";
import { bindAll } from "bind-event-listener";
import { BoardHeader, ColumnComponent } from "../../components";
import { CleanupFn } from "@atlaskit/pragmatic-drag-and-drop/dist/types/entry-point/types";

type FilterOption = "all" | "hasComments" | "hasAssignees";
type SortOption = "none" | "name" | "comments";

interface BoardProps {
  board: Board;
  boardId: number;
  searchQuery: string;
}

export const KanbanBoard: React.FC<BoardProps> = ({ board, boardId, searchQuery }) => {
  const [sortBy, setSortBy] = useState<SortOption>("none");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [selectedLabelId, setSelectedLabelId] = useState<number | null>(null);
  const [filteredColumns, setFilteredColumns] = useState(board.columns);
  const scrollableRef = useRef<HTMLDivElement | null>(null);

  const [moveCard] = useMoveCardMutation();
  const [createCard] = useCreateCardMutation();
  const [createColumn] = useCreateColumnMutation();
  const [moveColumn] = useMoveColumnMutation();

  useEffect(() => {
    const element = scrollableRef.current!;
    return [
      monitorCardDrop(board, boardId, moveCard),
      monitorColumnDrop(board, boardId, moveColumn),
      setupAutoScroll(element),
    ].reduce((cleanupA, cleanupB) => () => {
      cleanupA();
      cleanupB();
    });
  }, [boardId, board.columns, moveCard, moveColumn]);

  useEffect(() => {
    let cleanupActive: CleanupFn | null = null;
    const scrollable = scrollableRef.current!;
    const begin = ({ startX }: { startX: number }) => {
      let lastX = startX;
      const cleanup = bindAll(
        window,
        [
          {
            type: "pointermove",
            listener(event) {
              const currentX = event.clientX;
              const diffX = lastX - currentX;
              lastX = currentX;
              scrollable.scrollBy({ left: diffX });
            },
          },
          ...(
            ["pointercancel", "pointerup", "pointerdown", "keydown", "resize", "click", "visibilitychange"] as const
          ).map((type) => ({ type, listener: () => cleanup() })),
        ],
        { capture: true }
      );
      cleanupActive = cleanup;
    };

    const cleanupStart = bindAll(scrollable, [
      {
        type: "pointerdown",
        listener(event) {
          if ((event.target as HTMLElement).closest("[data-block-board-panning]")) return;
          begin({ startX: event.clientX });
        },
      },
    ]);

    return () => {
      cleanupStart();
      cleanupActive?.();
    };
  }, []);

  useEffect(() => {
    let processedColumns = board.columns.map((col) => ({ ...col, cards: [...col.cards] }));

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      processedColumns = processedColumns.map((col) => ({
        ...col,
        cards: col.cards.filter(
          (card) => card.title.toLowerCase().includes(q) || card.description?.toLowerCase().includes(q)
        ),
      }));
    }

    // Standard filters
    if (filterBy !== "all") {
      processedColumns = processedColumns.map((col) => ({
        ...col,
        cards: col.cards.filter((card) =>
          filterBy === "hasComments"
            ? card.commentsCount > 0
            : filterBy === "hasAssignees"
            ? card.assignedUsers.length > 0
            : true
        ),
      }));
    }

    // Label filter
    if (selectedLabelId) {
      processedColumns = processedColumns.map((col) => ({
        ...col,
        cards: col.cards.filter((card) => card.labels?.some((label) => label.id === selectedLabelId)),
      }));
    }

    // Sorting
    if (sortBy !== "none") {
      processedColumns = processedColumns.map((col) => ({
        ...col,
        cards: [...col.cards].sort((a, b) =>
          sortBy === "name"
            ? a.title.localeCompare(b.title)
            : sortBy === "comments"
            ? b.commentsCount - a.commentsCount
            : 0
        ),
      }));
    }

    setFilteredColumns(processedColumns);
  }, [searchQuery, board.columns, sortBy, filterBy, selectedLabelId]);

  const handleAddCard = async (columnId: number) => {
    try {
      await createCard({ boardId, columnId, title: "New Card" }).unwrap();
    } catch (error) {
      console.error("Failed to create card:", error);
    }
  };

  const handleAddColumn = async () => {
    try {
      await createColumn({ boardId, title: "New Column" }).unwrap();
    } catch (error) {
      console.error("Failed to create column:", error);
    }
  };

  return (
    <>
      <BoardHeader
        board={board}
        filterBy={filterBy}
        sortBy={sortBy}
        selectedLabel={selectedLabelId}
        onFilterChange={setFilterBy}
        onSortChange={setSortBy}
        onLabelFilterChange={setSelectedLabelId}
      />
      <div className="flex-grow relative">
        <div className="absolute inset-0">
          <div className="h-full flex flex-col">
            <div
              className="flex h-full flex-row gap-3 overflow-x-auto p-3 [scrollbar-width:thin] overflow-y-hidden"
              ref={scrollableRef}
            >
              {filteredColumns.map((column) => (
                <ColumnComponent key={column.id} column={column} boardId={boardId} onAddCard={handleAddCard} />
              ))}
              <button
                onClick={handleAddColumn}
                className="flex-shrink-0 w-[280px] h-[50px] border-2 border-dashed border-gray-300 rounded-lg 
                hover:border-gray-400 transition-colors flex items-center justify-center text-gray-500 
                hover:text-gray-600"
              >
                <span className="flex items-center gap-2">+ Add Column</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
