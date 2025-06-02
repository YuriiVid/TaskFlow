import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import {
  isCardData,
  isCardDropTargetData,
  isColumnData,
  isDraggingACard,
  isDraggingAColumn,
} from "@features/kanban/data";
import { Board } from "../../types";

export function monitorCardDrop(board: Board, boardId: number, moveCard: Function) {
  return monitorForElements({
    canMonitor: isDraggingACard,
    onDrop({ source, location }) {
      const cardData = source.data;
      if (!isCardData(cardData)) return;

      const innerMost = location.current.dropTargets[0];
      if (!innerMost) return;
      const dropTargetData = innerMost.data;

      if (isCardDropTargetData(dropTargetData)) {
        const newColumn = board.columns.find((col) => col.id === dropTargetData.columnId);
        if (!newColumn) return;

        const indexOfTarget = newColumn.cards
          .filter((card) => card.id != cardData.card.id)
          .findIndex((card) => card.id === dropTargetData.card.id);
        const closestEdge = extractClosestEdge(dropTargetData);
        const newPosition = closestEdge === "bottom" ? indexOfTarget + 1 : indexOfTarget;

        if (newColumn.id === cardData.columnId && newPosition === cardData.card.position) {
          return;
        }

        moveCard({
          boardId,
          cardId: cardData.card.id,
          newColumnId: newColumn.id,
          newPosition,
        });
        return;
      }

      if (isColumnData(dropTargetData)) {
        const newColumn = board.columns.find((col) => col.id === dropTargetData.column.id);
        if (!newColumn) return;
        if (newColumn.id === cardData.columnId) return;
		
        const newPosition = newColumn.cards.length;
        moveCard({
          boardId,
          cardId: cardData.card.id,
          newColumnId: newColumn.id,
          newPosition,
        });
      }
    },
  });
}

export function monitorColumnDrop(board: Board, boardId: number, moveColumn: Function) {
  return monitorForElements({
    canMonitor: isDraggingAColumn,
    onDrop({ source, location }) {
      const colData = source.data;
      if (!isColumnData(colData)) return;

      const dropTarget = location.current.dropTargets[0];
      if (!dropTarget) return;
      const dropData = dropTarget.data;
      if (!isColumnData(dropData)) return;

      const sourceCol = board.columns.find((col) => col.id === colData.column.id);
      const destCol = board.columns.find((col) => col.id === dropData.column.id);
      if (!sourceCol || !destCol || sourceCol === destCol) return;

      moveColumn({
        boardId,
        columnId: colData.column.id,
        newPosition: destCol.position,
      });
    },
  });
}
