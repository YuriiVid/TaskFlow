import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import { PlusIcon, Edit2, Archive, Trash } from "lucide-react";
import toast from "react-hot-toast";
import invariant from "tiny-invariant";
import { DropdownMenu } from "../DropdownMenu/DropdownMenu";
import BriefCard from "../BriefCard/BriefCard";
import { Column as ColumnType } from "../../types";
import { useDeleteColumnMutation, useUpdateColumnMutation } from "../../api";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { unsafeOverflowAutoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import {
  getColumnData,
  isColumnData,
  isCardData,
  isCardDropTargetData,
  isDraggingACard,
  isDraggingAColumn,
  CardData,
} from "../../data";
import { isShallowEqual } from "../../utils";
import { BriefCardShadow } from "../../components";
import { DragLocationHistory } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types";

// Column-level Drag State
type TColumnState =
  | { type: "idle" }
  | { type: "is-card-over"; isOverChildCard: boolean; dragging: DOMRect }
  | { type: "is-column-over" }
  | { type: "is-dragging" };

const stateStyles: Record<TColumnState["type"], string> = {
  idle: "cursor-grab",
  "is-card-over": "outline outline-2 outline-neutral-50",
  "is-column-over": "bg-gray-200",
  "is-dragging": "opacity-40",
};

const idleState = { type: "idle" } satisfies TColumnState;

// Memoized card list to avoid rerenders
const CardList = memo(function CardList({ column, boardId }: { column: ColumnType; boardId: number }) {
  return column.cards.map((card) => <BriefCard key={card.id} card={card} columnId={column.id} boardId={boardId} />);
});

interface ColumnProps {
  column: ColumnType;
  boardId: number;
  onAddCard: (columnId: number) => void;
}

const ColumnComponent: React.FC<ColumnProps> = ({ column, boardId, onAddCard }) => {
  const [deleteColumn] = useDeleteColumnMutation();
  const [updateColumn] = useUpdateColumnMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(column.title);

  const [colState, setColState] = useState<TColumnState>(idleState);
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const outerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  // DnD setup
  useEffect(() => {
    const outer = outerRef.current!;
    const scrollable = scrollableRef.current!;
    const header = headerRef.current!;
    const inner = innerRef.current!;

    const colData = getColumnData({ column });

    function updateCardOver({ data, location }: { data: CardData; location: DragLocationHistory }) {
      const innerMost = location.current.dropTargets[0];
      const isOverChild = Boolean(innerMost && isCardDropTargetData(innerMost.data));

      const proposed: TColumnState = { type: "is-card-over", dragging: data.rect, isOverChildCard: isOverChild };
      setColState((curr) => (isShallowEqual(curr, proposed) ? curr : proposed));
    }

    return combine(
      draggable({
        element: header,
        getInitialData: () => colData,
        onGenerateDragPreview({ source, location, nativeSetDragImage }) {
          invariant(isColumnData(source.data));
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({ element: header, input: location.current.input }),
            render({ container }) {
              const clone = inner.cloneNode(true);
              const rect = inner.getBoundingClientRect();
              invariant(clone instanceof HTMLElement);

              clone.style.width = `${rect.width}px`;
              clone.style.height = `${rect.height}px`;
              clone.style.transform = "rotate(4deg)";

              container.appendChild(clone);
            },
          });
        },
        onDragStart() {
          setColState({ type: "is-dragging" });
        },
        onDrop() {
          setColState(idleState);
        },
      }),
      dropTargetForElements({
        element: outer,
        getData: () => colData,
        canDrop({ source }) {
          return isDraggingACard({ source }) || isDraggingAColumn({ source });
        },
        getIsSticky: () => true,
        onDragStart({ source, location }) {
          if (isCardData(source.data)) {
            updateCardOver({ data: source.data, location });
          }
        },
        onDragEnter({ source, location }) {
          if (isCardData(source.data)) {
            updateCardOver({ data: source.data, location });
          }
          if (isColumnData(source.data) && source.data.column.id !== column.id) {
            setColState({ type: "is-column-over" });
          }
        },
        onDropTargetChange({ source, location }) {
          if (isCardData(source.data)) {
            updateCardOver({ data: source.data, location });
          }
        },
        onDragLeave({ source }) {
          if (isColumnData(source.data) && source.data.column.id === column.id) {
            return;
          }
          setColState(idleState);
        },
        onDrop() {
          setColState(idleState);
        },
      }),
      autoScrollForElements({
        canScroll({ source }) {
          return isDraggingACard({ source });
        },
        element: scrollable,
      }),
      unsafeOverflowAutoScrollForElements({
        element: scrollable,
        canScroll({ source }) {
          return isDraggingACard({ source });
        },
        getOverflow() {
          return {
            forTopEdge: {
              top: 1000,
            },
            forBottomEdge: {
              bottom: 1000,
            },
          };
        },
      })
    );
  }, [column]);

  // Handlers
  const handleUpdateTitle = useCallback(async () => {
    if (!title.trim()) return toast.error("Title cannot be empty");
    try {
      await updateColumn({ boardId, columnId: column.id, title: title.trim() }).unwrap();
      setIsEditing(false);
      toast.success("Column updated");
    } catch {
      setTitle(column.title);
    }
  }, [title, updateColumn, boardId, column.id, column.title]);

  const handleDelete = useCallback(async () => {
    if (column.cards.length && !window.confirm("Delete column with cards?")) return;
    try {
      await deleteColumn({ boardId, columnId: column.id }).unwrap();
      toast.success("Column deleted");
    } catch (err: any) {
      console.log(`Failed to delete column ${err}`);
    }
  }, [deleteColumn, boardId, column.id, column.cards.length]);

  return (
    <div ref={outerRef} className="flex flex-col flex-shrink-0 w-72 rounded-lg shadow-md h-fit">
      <div
        className={`flex h-full flex-col rounded-lg bg-gray-100 text-neutral-50 ${stateStyles[colState.type]}`}
        ref={innerRef}
        data-block-board-panning
      >
        <div className={`flex h-full flex-col ${colState.type === "is-column-over" ? "invisible" : ""}`}>
          <div
            className="bg-gray-100 rounded-t-lg border-y-2 border-gray-200 p-4 flex flex-row items-center justify-between"
            ref={headerRef}
          >
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
                className="px-2 py-1 border rounded w-full focus:outline-none focus:border-teal-500 text-gray-900"
                autoFocus
              />
            ) : (
              <h3 className="font-semibold text-base text-gray-800 flex-1">
                {column.title} <span className="text-gray-600 text-sm font-normal">({column.cards.length})</span>
              </h3>
            )}
            <DropdownMenu
              items={[
                { label: "Edit", onClick: () => setIsEditing(true), icon: <Edit2 size={16} /> },
                { label: "Archive All", onClick: () => toast("Not implemented"), icon: <Archive size={16} /> },
                { label: "Delete", onClick: handleDelete, icon: <Trash size={16} />, variant: "danger" as const },
              ]}
              position="right"
              size="sm"
            />
          </div>

          <div
            ref={scrollableRef}
            className="flex flex-col p-2 [overflow-anchor:none] overflow-y-auto bg-gray-50 min-h-[100px] max-h-[calc(100vh-17rem)] [scrollbar-width:thin]"
          >
            <CardList boardId={boardId} column={column} />
            {colState.type === "is-card-over" && !colState.isOverChildCard && (
              <BriefCardShadow dragging={colState.dragging} />
            )}
          </div>

          <div className="flex flex-row gap-2 p-3 border-t border-gray-200 bg-white rounded-b-lg">
            <button
              onClick={() => onAddCard(column.id)}
              className="flex flex-grow flex-row items-center justify-center gap-1 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              <PlusIcon size={16} /> Add Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColumnComponent;
