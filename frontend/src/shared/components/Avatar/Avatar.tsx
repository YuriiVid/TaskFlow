import React, { useState } from "react";
const UPLOADS_URL = import.meta.env.VITE_UPLOADS_PATH || "/Uploads" + "/Avatars";
interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}

const Avatar: React.FC<AvatarProps> = ({ src, name, size = "md" }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const InitialsAvatar = () => (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );

  if (!src || imageError) {
    return <InitialsAvatar />;
  }

  return (
    <img
      src={`${UPLOADS_URL}/${src}`}
      alt={name}
      className={`${sizeClasses[size]} rounded-full object-cover`}
      onError={() => setImageError(true)}
    />
  );
};

export default Avatar;
