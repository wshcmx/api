import { wshcmx } from "../index";

interface PaginatorItems<T> {
  total: number;
  items: T[];
}

interface PaginatorParams {
  page?: number;
  per_page?: number;
}

export function gather<T>(
  items: T[],
  params: PaginatorParams = {}
): PaginatorItems<T> {
  if (!wshcmx.utils.type.isArray(items)) {
    return items;
  }

  const page = Max(OptInt(params.GetOptProperty("page"), 1), 1);
  const perPage = Min(Max(OptInt(params.GetOptProperty("per_page"), 100), 1), 400);

  return {
    total: ArrayCount(items),
    items: ArrayRange(items, (page - 1) * perPage, perPage)
  };
}
