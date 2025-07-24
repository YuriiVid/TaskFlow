import { Edit2, Share, Copy, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { DropdownMenu } from "../../components";

interface BriefCardMenuProps {
  boardId: number;
  cardId: number;
  navigate: (path: string) => void;
  onDelete: () => void;
  onShare: () => void;
}

export const BriefCardMenu: React.FC<BriefCardMenuProps> = ({ boardId, cardId, navigate, onDelete, onShare }) => {
  const menuItems = [
    {
      label: "Edit",
      onClick: () => navigate(`/boards/${boardId}/cards/${cardId}`),
      icon: <Edit2 size={16} />,
      variant: "default" as const,
    },
    {
      label: "Share",
      onClick: onShare,
      icon: <Share size={16} />,
      variant: "default" as const,
    },
    {
      label: "Duplicate",
      onClick: () => toast.error("Duplicate feature coming soon"),
      icon: <Copy size={16} />,
      variant: "default" as const,
    },
    {
      label: "Delete",
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
      },
      icon: <Trash size={16} />,
      variant: "danger" as const,
    },
  ];

  return (
    <div className="dropdown-trigger">
      <DropdownMenu items={menuItems} position="right" size="sm" />
    </div>
  );
};
