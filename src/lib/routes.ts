export const routes = {
  main: "/",
  cta: "/auth/cta/",
  passwordReset: "/auth/passwordreset/",
  poem: "/poem/",
  poems: "/poems/",
  submission: "/submission/",
  collection: "/collection/",
  account: "/account/",
  tags: "/tags/",
} as const;

export function poemUrl(poemId: string, from?: string) {
  const params = new URLSearchParams({ id: poemId });
  if (from) params.set("from", from);
  return `${routes.poem}?${params.toString()}`;
}

export function poemsUrl(opts?: { from?: string }) {
  // if /poems/ ever takes params, this is where they go
  return routes.poems;
}

export function accountUrl(uid: string) {
  return `${routes.account}?uid=${encodeURIComponent(uid)}`;
}

export function collectionUrl(collectionId: string) {
  return `${routes.collection}?id=${encodeURIComponent(collectionId)}`;
}

export function editPoemUrl(poemId: string) {
  return `/poem/edit/?id=${encodeURIComponent(poemId)}`;
}

export function getBackTarget(from: string | null): {
  label: string;
  href: string;
} {
  if (!from) return { label: "Back", href: routes.account };

  const [kind, id] = from.split(":");

  switch (kind) {
    case "feed":
      return { label: "Back to feed", href: routes.main };
    case "poems":
      return { label: "Back to poems", href: routes.poems };
    case "profile":
      return id
        ? { label: "Back to profile", href: accountUrl(id) }
        : { label: "Back", href: routes.account };
    case "collection":
      return { label: "Back to collection", href: collectionUrl(id) };
    default:
      return { label: "Back", href: routes.account };
  }
}
