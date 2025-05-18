import { useQuery } from "@tanstack/react-query";
import { ProductService } from "@/services/product-service";

export function useGames(options = { limit: 50 }) {
  return useQuery({
    queryKey: ["products", "games", options],
    queryFn: async () => {
      try {
        return await ProductService.getProducts(options);
      } catch (error) {
        console.error("Failed to fetch games:", error);
        return {
          data: [],
          meta: {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: 0,
            totalPages: 0,
            currentPage: 0,
          },
        };
      }
    },
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
