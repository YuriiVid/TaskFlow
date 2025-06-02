import React from "react";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <LoadingSpinner className="h-12 w-12 " />
    </div>
  );
};

export default LoadingScreen;
