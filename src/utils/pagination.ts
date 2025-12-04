export function getPagination(query: any, totalItems?: number) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit, 10) || 10);
  const skip = (page - 1) * limit;
  const totalPages = totalItems ? Math.ceil(totalItems / limit) : undefined;
  return { page, limit, skip, totalPages };
}