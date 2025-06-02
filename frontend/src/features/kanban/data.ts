import { BriefCard, Column } from "./types";

const cardKey = Symbol("card");
export type CardData = {
  [cardKey]: true;
  card: BriefCard;
  columnId: number;
  rect: DOMRect;
};

export function getCardData({ card, rect, columnId }: Omit<CardData, typeof cardKey> & { columnId: number }): CardData {
  return {
    [cardKey]: true,
    rect,
    card,
    columnId,
  };
}

export function isCardData(value: Record<string | symbol, unknown>): value is CardData {
  return Boolean(value[cardKey]);
}

export function isDraggingACard({ source }: { source: { data: Record<string | symbol, unknown> } }): boolean {
  return isCardData(source.data);
}

const cardDropTargetKey = Symbol("card-drop-target");
export type CardDropTargetData = {
  [cardDropTargetKey]: true;
  card: BriefCard;
  columnId: number;
};

export function isCardDropTargetData(value: Record<string | symbol, unknown>): value is CardDropTargetData {
  return Boolean(value[cardDropTargetKey]);
}

export function getCardDropTargetData({
  card,
  columnId,
}: Omit<CardDropTargetData, typeof cardDropTargetKey> & {
  columnId: number;
}): CardDropTargetData {
  return {
    [cardDropTargetKey]: true,
    card,
    columnId,
  };
}

const columnKey = Symbol("column");
export type ColumnData = {
  [columnKey]: true;
  column: Column;
};

export function getColumnData({ column }: Omit<ColumnData, typeof columnKey>): ColumnData {
  return {
    [columnKey]: true,
    column,
  };
}

export function isColumnData(value: Record<string | symbol, unknown>): value is ColumnData {
  return Boolean(value[columnKey]);
}

export function isDraggingAColumn({ source }: { source: { data: Record<string | symbol, unknown> } }): boolean {
  return isColumnData(source.data);
}
