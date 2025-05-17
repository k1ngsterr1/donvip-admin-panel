import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AxiosError } from "axios";

// Utility function for combining class names with Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Extract error message from different error types
export function extractErrorMessage(error: unknown): string {
  console.error("API Error:", error);

  if (error instanceof AxiosError) {
    // Handle Axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const responseData = error.response.data;

      if (responseData?.message) {
        return responseData.message;
      } else if (responseData?.error) {
        return typeof responseData.error === "string"
          ? responseData.error
          : JSON.stringify(responseData.error);
      } else if (typeof responseData === "string") {
        return responseData;
      }

      return `Server error: ${error.response.status}`;
    } else if (error.request) {
      // The request was made but no response was received
      return "No response received from server. Please check your connection.";
    } else {
      // Something happened in setting up the request
      return error.message || "Error setting up the request";
    }
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    return error.message;
  }

  // Handle unknown errors
  return typeof error === "string" ? error : "An unknown error occurred";
}
