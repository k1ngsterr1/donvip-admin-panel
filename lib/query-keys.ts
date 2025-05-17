export const feedbackKeys = {
  all: () => ["feedbacks"] as const,
  lists: () => [...feedbackKeys.all(), "list"] as const,
  list: (filters: Record<string, any>) =>
    [...feedbackKeys.lists(), { filters }] as const,
  details: () => [...feedbackKeys.all(), "detail"] as const,
  detail: (id: number) => [...feedbackKeys.details(), id] as const,
};
