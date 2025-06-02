import React from "react";
import { AlertTriangle, XCircle, Info, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type ErrorType = "default" | "warning" | "critical" | "notfound";

interface ErrorScreenProps {
  title?: string;
  message?: string;
  type?: ErrorType;
  showActions?: boolean;
  primaryAction?: {
    text: string;
    to: string;
    variant?: "primary" | "outline";
  };
  secondaryAction?: {
    text: string;
    to: string;
  };
  fullScreen?: boolean;
}

const ICONS: Record<ErrorType, LucideIcon> = {
  default: Info,
  warning: AlertTriangle,
  critical: XCircle,
  notfound: AlertTriangle,
};

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = "Something went wrong",
  message = "An unexpected error has occurred.",
  type = "default",
  showActions = true,
  primaryAction = {
    text: "Go Home",
    to: "/",
    variant: "primary",
  },
  secondaryAction,
  fullScreen = true,
}) => {
  const Icon = ICONS[type] || Info;

  return (
    <div className={`flex flex-col items-center justify-center text-center px-4 ${fullScreen ? "h-screen" : "py-12"}`}>
      <Icon className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>

      {showActions && (
        <div className="flex gap-4">
          {primaryAction && (
            <Link
              to={primaryAction.to}
              className={`${primaryAction.variant === "outline" ? "btn-outline" : "btn-primary"}`}
            >
              {primaryAction.text}
            </Link>
          )}
          {secondaryAction && (
            <Link to={secondaryAction.to} className="btn-outline">
              {secondaryAction.text}
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorScreen;
