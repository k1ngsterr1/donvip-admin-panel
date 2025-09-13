/**
 * Helper function to get full icon URL
 */
export const getIconUrl = (iconPath: string | null): string | null => {
  if (!iconPath) return null;

  // If iconPath already contains a full URL, return as is
  if (iconPath.startsWith("http://") || iconPath.startsWith("https://")) {
    return iconPath;
  }

  // Otherwise, prepend the base URL
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.don-vip.com/api";
  return `${baseUrl}${iconPath}`;
};
