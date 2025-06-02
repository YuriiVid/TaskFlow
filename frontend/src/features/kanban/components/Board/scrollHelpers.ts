import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { unsafeOverflowAutoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element";
import { isDraggingACard, isDraggingAColumn } from "@features/kanban/data";

export function setupAutoScroll(element: HTMLElement) {
  const canScroll = ({ source }: { source: any }) => isDraggingACard({ source }) || isDraggingAColumn({ source });

  const scrollConfig = {
    top: 1000,
    left: 1000,
    bottom: 1000,
    right: 1000,
  };

  const autoScrollCleanup = autoScrollForElements({
    canScroll,
    element,
  });

  const overflowCleanup = unsafeOverflowAutoScrollForElements({
    element,
    canScroll,
    getOverflow: () => ({
      forLeftEdge: scrollConfig,
      forRightEdge: scrollConfig,
    }),
  });

  return () => {
    autoScrollCleanup();
    overflowCleanup();
  };
}
