import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { BriefCard as BriefCardType } from "../../types";
import { useDeleteCardMutation, usePatchCardMutation } from "../../api/cardsApi";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { BriefCardMenu } from "./BriefCardMenu";
import { Modal } from "@shared";

import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import invariant from "tiny-invariant";
import { getCardData, getCardDropTargetData, isCardData, isDraggingACard } from "../../data";
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { isShallowEqual } from "../../utils";
import { BriefCardShadow } from "./BriefCardShadow";
import { createPortal } from "react-dom";
import { Avatar } from "@shared/index";
import CircularCheckbox from "../CircularCheckbox";
import { Label } from "../Label/Label";
import { BriefCardIcons } from "./BriefCardIcons";

interface CardProps {
  card: BriefCardType;
  columnId: number;
  boardId: number;
}

type TCardState =
  | { type: "idle" }
  | { type: "is-dragging" }
  | { type: "is-dragging-and-left-self" }
  | { type: "is-over"; dragging: DOMRect; closestEdge: Edge }
  | { type: "preview"; container: HTMLElement; dragging: DOMRect };

const idle: TCardState = { type: "idle" };

const innerStyles: { [Key in TCardState["type"]]?: string } = {
  idle: `
    hover:shadow-lg hover:shadow-teal-100/50 hover:-translate-y-0.5 
    hover:border-teal-200 cursor-grab active:cursor-grabbing
    transition-all duration-200 ease-out
  `,
  "is-dragging": "opacity-50 scale-105 rotate-2 shadow-2xl shadow-teal-200/60",
};

const outerStyles: { [Key in TCardState["type"]]?: string } = {
  "is-dragging-and-left-self": "hidden",
};

const BriefCard: React.FC<CardProps> = ({ card, columnId, boardId }) => {
  const navigate = useNavigate();
  const [deleteCard] = useDeleteCardMutation();
  const [patchCard] = usePatchCardMutation();

  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TCardState>(idle);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Add modal state

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest(".dropdown-trigger")) return;
      navigate(`/boards/${boardId}/cards/${card.id}`);
    },
    [boardId, card.id, navigate]
  );

  // Updated to show modal instead of directly deleting
  const handleDeleteClick = useCallback(() => {
    setShowDeleteModal(true);
  }, []);

  // Actual delete function called from modal
  const handleConfirmDelete = useCallback(async () => {
    try {
      await deleteCard({ boardId, cardId: card.id }).unwrap();
      toast.success("Card deleted successfully! 🗑️");
      setShowDeleteModal(false);
    } catch (err) {
      console.log(`Failed to delete card ${err}`);
      toast.error("Failed to delete card");
    }
  }, [deleteCard, boardId, card.id]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
  }, []);

  const handleToogleCompleted = async (isCompleted: boolean) => {
    try {
      const patches = [{ op: "replace" as const, path: "/isCompleted", value: isCompleted }];
      await patchCard({ boardId, cardId: card.id, patches }).unwrap();
    } catch (err) {
      console.log(`Failed to update ${err}`);
    }
  };

  const handleShare = useCallback(() => {
    const cardUrl = `${window.location.origin}/boards/${boardId}/cards/${card.id}`;
    navigator.clipboard.writeText(cardUrl);
    toast.success("Card link copied! 📋");
  }, [boardId, card.id]);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    return combine(
      draggable({
        element: inner,
        getInitialData: ({ element }) => getCardData({ card, columnId, rect: element.getBoundingClientRect() }),
        onGenerateDragPreview({ nativeSetDragImage, location, source }) {
          const data = source.data;
          invariant(isCardData(data));
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({ element: inner, input: location.current.input }),
            render({ container }) {
              setState({
                type: "preview",
                container,
                dragging: inner.getBoundingClientRect(),
              });
            },
          });
        },
        onDragStart() {
          setState({ type: "is-dragging" });
        },
        onDrop() {
          setState(idle);
        },
      }),
      dropTargetForElements({
        element: outer,
        getIsSticky: () => true,
        canDrop: isDraggingACard,
        getData: ({ element, input }) => {
          const data = getCardDropTargetData({ card, columnId });
          return attachClosestEdge(data, { element, input, allowedEdges: ["top", "bottom"] });
        },
        onDragEnter({ source, self }) {
          if (!isCardData(source.data)) return;
          if (source.data.card.id === card.id) return;
          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) return;

          setState({ type: "is-over", dragging: source.data.rect, closestEdge });
        },
        onDrag({ source, self }) {
          if (!isCardData(source.data)) {
            return;
          }
          if (source.data.card.id === card.id) {
            return;
          }
          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) {
            return;
          }

          const proposed: TCardState = { type: "is-over", dragging: source.data.rect, closestEdge };
          setState((current) => (isShallowEqual(current, proposed) ? current : proposed));
        },
        onDragLeave({ source }) {
          if (!isCardData(source.data)) {
            return;
          }
          if (source.data.card.id === card.id) {
            setState({ type: "is-dragging-and-left-self" });
            return;
          }
          setState(idle);
        },
        onDrop() {
          setState(idle);
        },
      })
    );
  }, []);

  const renderContent = () => {
    return (
      <div className={`flex flex-shrink-0 flex-col gap-3 px-1 py-1 ${outerStyles[state.type]}`} ref={outerRef}>
        {state.type === "is-over" && state.closestEdge === "top" ? <BriefCardShadow dragging={state.dragging} /> : null}

        <div
          className={`
            bg-white rounded-xl border border-gray-200/60 shadow-sm backdrop-blur-sm
            overflow-hidden group relative min-w-64 w-full max-w-72
            ${innerStyles[state.type]}
          `}
          ref={innerRef}
          onClick={handleCardClick}
          style={
            state.type === "preview"
              ? {
                  width: state.dragging.width,
                  height: state.dragging.height,
                  transform: "rotate(5deg) scale(1.02)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-gray-50/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative p-3">
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-wrap gap-1.5 flex-1 mr-2 min-w-0">
                {card.labels.map((label) => (
                  <Label key={label.id} color={label.color} className="px-2 py-1 text-xs rounded-full">
                    <span>{label.title}</span>
                  </Label>
                ))}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                <BriefCardMenu
                  boardId={boardId}
                  cardId={card.id}
                  navigate={navigate}
                  onDelete={handleDeleteClick}
                  onShare={handleShare}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <div
                className={`transition-all duration-200 ease-out overflow-hidden flex-shrink-0 ${
                  !card.isCompleted
                    ? "max-w-0 opacity-0 group-hover:max-w-[24px] group-hover:opacity-100"
                    : "max-w-[24px] opacity-100"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <CircularCheckbox
                  id={`card-select-${card.id}`}
                  checked={card.isCompleted}
                  onChange={handleToogleCompleted}
                />
              </div>

              <h4
                className={`text-sm font-medium leading-snug line-clamp-2 group-hover:text-gray-800 transition-colors align-middle min-w-0 flex-1 ${
                  card.isCompleted ? "text-gray-400" : "text-gray-900"
                }`}
              >
                {card.title}
              </h4>
            </div>

            {/* Fixed bottom section with proper overflow handling */}
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center flex-shrink-0 min-w-0">
                {card.assignedUsers.length > 0 && (
                  <div className="flex items-center min-w-0">
                    {card.assignedUsers.length <= 2 ? (
                      // Show up to 2 avatars with minimal overlap
                      <div className="flex -space-x-0.5">
                        {card.assignedUsers.map((user, index) => (
                          <div
                            key={user.id}
                            className="relative flex-shrink-0"
                            style={{ zIndex: card.assignedUsers.length - index }}
                            title={`${user.firstName} ${user.lastName}`}
                          >
                            <Avatar
                              src={user.profilePictureUrl}
                              name={`${user.firstName} ${user.lastName}`}
                              size="sm"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      // Show first avatar + count for 3+ users
                      <div className="flex items-center gap-1 min-w-0">
                        <div className="flex-shrink-0">
                          <Avatar
                            src={card.assignedUsers[0].profilePictureUrl}
                            name={`${card.assignedUsers[0].firstName} ${card.assignedUsers[0].lastName}`}
                            size="sm"
                          />
                        </div>
                        <span className="text-xs text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                          +{card.assignedUsers.length - 1}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center flex-shrink-0 ml-auto">
                <BriefCardIcons
                  isCompleted={card.isCompleted}
                  dueDate={card.dueDate}
                  hasDescription={card.hasDescription}
                  attachmentsCount={card.attachmentsCount}
                  commentsCount={card.commentsCount}
                />
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-600/0 via-teal-600/40 to-teal-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {state.type === "is-over" && state.closestEdge === "bottom" ? (
          <BriefCardShadow dragging={state.dragging} />
        ) : null}
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      {state.type === "preview" ? createPortal(renderContent(), state.container) : null}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        title="Delete Card"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      >
        <div className="space-y-3">
          <p className="text-gray-700">
            Are you sure you want to delete the card <strong>"{card.title}"</strong>?
          </p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
        </div>
      </Modal>
    </>
  );
};

export default BriefCard;
