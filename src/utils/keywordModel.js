export function normalizeKeywordList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.keywords)) return data.keywords;
  return [];
}
