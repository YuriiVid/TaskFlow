export type FilterOption = "all" | "hasComments" | "hasAssignees";
export type SortOption = "none" | "name" | "comments";

export interface BoardHeaderControls {
  filterBy: FilterOption;
  sortBy: SortOption;
  selectedLabel?: string | null;
  onFilterChange: (filter: FilterOption) => void;
  onSortChange: (sort: SortOption) => void;
  onLabelFilterChange: (labelId: string | null) => void;
}
