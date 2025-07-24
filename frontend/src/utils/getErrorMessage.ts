import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

// Type definitions for API error responses
interface ValidationError {
  errors: Record<string, string[]>;
  type?: string;
  title?: string;
  status?: number;
  traceId?: string;
}

interface MessageError {
  message: string;
}

// Type guards for better error handling
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error != null && "status" in error;
}

function hasDataProperty(error: FetchBaseQueryError): error is FetchBaseQueryError & { data: any } {
  return "data" in error && error.data != null;
}

function isValidationError(data: unknown): data is ValidationError {
  return typeof data === "object" && data != null && "errors" in data && typeof (data as any).errors === "object";
}

function isErrorWithMessage(data: unknown): data is MessageError {
  return typeof data === "object" && data != null && "message" in data && typeof (data as any).message === "string";
}

function formatValidationErrors(errors: Record<string, string[]>): string {
  const errorMessages: string[] = [];

  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      // Format as "Field: error message" or just the error message if it's descriptive
      const fieldErrors = messages.map((msg) =>
        msg.toLowerCase().includes(field.toLowerCase()) ? msg : `${field}: ${msg}`
      );
      errorMessages.push(...fieldErrors);
    }
  }

  return errorMessages.join(", ");
}

export function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return "Unknown error";

  if (isFetchBaseQueryError(error)) {
    if (error.status === "FETCH_ERROR") return "Network error - check your connection";
    if (error.status === "PARSING_ERROR") return "Response parse error";

    if (error.status === "CUSTOM_ERROR") {
      if (hasDataProperty(error)) {
        // Check for validation errors first
        if (isValidationError(error.data)) {
          return formatValidationErrors(error.data.errors);
        }
        // Fallback to message property
        if (isErrorWithMessage(error.data)) {
          return error.data.message;
        }
      }
      return "Custom error";
    }

    // Handle other status codes (like 400, 401, 404, etc.)
    if (hasDataProperty(error)) {
      // Check for validation errors first
      if (isValidationError(error.data)) {
        return formatValidationErrors(error.data.errors);
      }
      // Check for title property (RFC 9110 Problem Details)
      if (error.data.title && typeof error.data.title === "string") {
        return error.data.title;
      }
      // Fallback to message property
      if (isErrorWithMessage(error.data)) {
        return error.data.message;
      }
    }

    return `Error ${error.status}`;
  }

  // Handle SerializedError
  return error.message ?? "An unknown error occurred";
}
