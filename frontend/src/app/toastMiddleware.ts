import type { Middleware } from "@reduxjs/toolkit";
import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils";

// Type guard for rejected actions with error payload
interface RejectedAction {
  type: string;
  payload: FetchBaseQueryError | SerializedError;
  error: SerializedError;
  meta?: {
    arg: {
      endpointName?: string;
      originalArgs?: any;
    };
  };
}

function isRejectedActionWithPayload(action: unknown): action is RejectedAction {
  return isRejectedWithValue(action);
}

// Endpoints that should not show toast notifications
const SILENT_ENDPOINTS = [
  "refresh-user-token",
  "getCurrentUser",
  // Add other endpoints you want to silence
];

// URLs that should not show toast notifications
const SILENT_URL_PATTERNS = [
  "/api/auth/refresh-user-token",
  // Add other URL patterns you want to silence
];

function shouldShowToast(action: RejectedAction): boolean {
  // Check if this is from a silent endpoint by name
  if (action.meta?.arg?.endpointName) {
    const endpointName = action.meta.arg.endpointName;
	console.log(endpointName);
	
    if (SILENT_ENDPOINTS.includes(endpointName)) {
      return false;
    }
  }

  // Check if this is from a silent URL pattern
  if (action.payload && "status" in action.payload) {
    const payload = action.payload as FetchBaseQueryError;

    // Check if the error contains URL information
    if (payload.data && typeof payload.data === "object" && "url" in payload.data) {
      const url = payload.data.url as string;
      if (SILENT_URL_PATTERNS.some((pattern) => url.includes(pattern))) {
        return false;
      }
    }
  }

  // Check action type for URL patterns (RTK Query typically includes endpoint info in action type)
  if (action.type) {
    const hasMatchingPattern = SILENT_URL_PATTERNS.some((pattern) =>
      action.type.toLowerCase().includes(pattern.replace(/[^a-z0-9]/gi, "").toLowerCase())
    );
    if (hasMatchingPattern) {
      return false;
    }
  }

  return true;
}

export const errorToastMiddleware: Middleware = () => (next) => (action) => {
  // Handle errors with proper typing
  if (isRejectedActionWithPayload(action)) {
    // Only show toast if this endpoint is not in the silent list
    if (shouldShowToast(action)) {
      const errorMessage = getErrorMessage(action.payload);
      toast.error(errorMessage);
    }
  }

  return next(action);
};
