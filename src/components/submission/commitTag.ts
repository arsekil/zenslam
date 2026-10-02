import renderTagChips from "./renderTagChips";

let tags: string[] = [];
const MAX_TAGS = 5;

export default function commitTag(raw: string) {
  const tag = raw.trim();
  if (!tag) return;
  if (tags.includes(tag)) return;
  if (tags.length > MAX_TAGS) return;
  tags.push(tag);
  renderTagChips();
}