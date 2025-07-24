import React, { useState, useRef, useEffect } from "react";
import { FilterIcon, Share2, SlidersHorizontal, Settings, Tag, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import type { FilterOption, SortOption } from "./BoardHeaderControls";
import { Board } from "@features/kanban/types";
import { BoardManagementSidebar, LabelPreview } from "../../components";

interface BoardHeaderProps {
  filterBy: FilterOption;
  sortBy: SortOption;
  board: Board;
  onFilterChange: (filter: FilterOption) => void;
  onSortChange: (sort: SortOption) => void;
  selectedLabel: number | null;
  onLabelFilterChange: (labelId: number | null) => void;
}

export const BoardHeader: React.FC<BoardHeaderProps> = ({
  board,
  filterBy,
  sortBy,
  onFilterChange,
  onSortChange,
  selectedLabel,
  onLabelFilterChange,
}) => {
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false);
  const labelDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(event.target as Node)) {
        setIsLabelDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = () => {
    const inviteLink = `${window.location.origin}/boards/join/${board.id}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Board invite link copied!");
  };

  const selectedLabelData = selectedLabel ? board.labels.find((label) => label.id === selectedLabel) : null;

  return (
    <>
      <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FilterIcon size={16} className="text-gray-500" />
            <select
              className="text-sm text-gray-600 border-none bg-transparent focus:outline-none"
              onChange={(e) => onFilterChange(e.target.value as FilterOption)}
              value={filterBy}
            >
              <option value="all">All Cards</option>
              <option value="hasComments">Has Comments</option>
              <option value="hasAssignees">Has Assignees</option>
            </select>
          </div>

          {/* Custom Label Filter Dropdown */}
          <div className="flex items-center space-x-2 relative" ref={labelDropdownRef}>
            <Tag size={16} className="text-gray-500" />
            <button
              className="text-sm text-gray-600 bg-transparent focus:outline-none flex items-center space-x-1 hover:bg-gray-50 px-2 py-1 rounded"
              onClick={() => setIsLabelDropdownOpen(!isLabelDropdownOpen)}
            >
              <span className="flex items-center space-x-1 pr-6">
                {selectedLabelData ? (
                  <LabelPreview title={selectedLabelData.title} color={selectedLabelData.color} />
                ) : (
                  <span>All Labels</span>
                )}
              </span>
              <ChevronDown size={12} className={`transition-transform ${isLabelDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isLabelDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[160px]">
                <button
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center"
                  onClick={() => {
                    onLabelFilterChange(null);
                    setIsLabelDropdownOpen(false);
                  }}
                >
                  All Labels
                </button>
                {board.labels.map((label) => (
                  <button
                    key={label.id}
                    className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center"
                    onClick={() => {
                      onLabelFilterChange(label.id);
                      setIsLabelDropdownOpen(false);
                    }}
                  >
                    <LabelPreview title={label.title} color={label.color} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <SlidersHorizontal size={16} className="text-gray-500" />
            <select
              className="text-sm text-gray-600 border-none bg-transparent focus:outline-none"
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              value={sortBy}
            >
              <option value="none">No Sort</option>
              <option value="name">Sort by Name</option>
              <option value="comments">Sort by Comments</option>
            </select>
          </div>
        </div>

        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-gray-800 pointer-events-none">
          {board.title}
        </h1>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-md flex items-center gap-2 text-gray-600"
          >
            <Share2 size={16} />
            <span className="text-sm">Share Board</span>
          </button>
          <button
            onClick={() => setIsManagementOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-md flex items-center gap-2 text-gray-600"
          >
            <Settings size={16} />
            <span className="text-sm">Manage Board</span>
          </button>
        </div>
      </div>

      <BoardManagementSidebar board={board} isOpen={isManagementOpen} onClose={() => setIsManagementOpen(false)} />
    </>
  );
};
