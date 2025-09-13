/**
 * Helper function to get full icon URL
 */
export const getIconUrl = (iconPath: string | null): string | null => {
  if (!iconPath) return null;

  // If iconPath already contains a full URL, return as is
  if (iconPath.startsWith("http://") || iconPath.startsWith("https://")) {
    return iconPath;
  }

  // Get base URL without /api suffix since file paths start with /uploads
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.don-vip.com/api";
  const baseUrl = apiBaseUrl.replace(/\/api$/, ""); // Remove trailing /api

  return `${baseUrl}${iconPath}`;
};
