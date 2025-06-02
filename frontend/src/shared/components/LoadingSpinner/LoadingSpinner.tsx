import React from "react";

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = "" }) => {
  return (
    <div
      className={`
        inline-block
        animate-spin
        rounded-full
        border-4
        border-t-current
        border-gray-200
		text-teal-500
        ${className}
      `}
    />
  );
};

export default LoadingSpinner;
