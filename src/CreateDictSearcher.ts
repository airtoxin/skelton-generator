import { Dict } from "./DictLoader";

export const createDictSearcher = (dict: Dict) => (
  query: string,
  {
    exact = false,
  }: {
    exact?: boolean;
  } = {}
): Dict => {
  const q = query.replace(/_/g, ".");
  const regexp = new RegExp(exact ? `^${q}$` : q);
  return dict.filter((d) => regexp.test(d.reading));
};
