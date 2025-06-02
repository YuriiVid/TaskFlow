import React from "react";
import { Layout, LogOut, ArrowLeft, SearchIcon, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "@features/auth/api/authApi";
import { Avatar } from "@shared";
import { DropdownMenu } from "../../components";
import { useAppSelector } from "@app/hooks";

interface HeaderProps {
  showBackButton?: boolean;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  rightContent?: React.ReactNode;
  backTo?: string; // Optional specific route to go back to
}

export const Header: React.FC<HeaderProps> = ({
  showBackButton = false,
  showSearch = true,
  onSearch,
  searchPlaceholder = "Search...",
  backTo,
}) => {
  const currentUser = useAppSelector((state) => state.auth.user)!;
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const AvatarMenuItems = [
    {
      label: "My Profile",
      icon: <User size={16} />,
      onClick: () => navigate("/profile"),
    },
    {
      label: "Logout",
      icon: <LogOut size={16} />,
      onClick: handleLogout,
      variant: "danger" as const,
    },
  ];
  return (
    <div className="px-4 py-4 flex items-center justify-between border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
      <div className="flex items-center">
        {showBackButton && (
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-md mr-2">
            <ArrowLeft size={20} className="text-gray-500" />
          </button>
        )}
        <Layout className="h-8 w-8 text-teal-500" />
        <h1 className="text-xl font-semibold ml-2">TaskFlow</h1>
      </div>

      {showSearch && (
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-teal-500"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <DropdownMenu
          trigger={
            <Avatar
              src={currentUser.profilePictureUrl}
              name={`${currentUser.firstName} ${currentUser.lastName}`}
              size="md"
            />
          }
          items={AvatarMenuItems}
          position="left"
        />
      </div>
    </div>
  );
};
