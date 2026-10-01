import type { PoemDocument } from "../../types/PoemDocument";

//TODO
export default function poemRatings(poem: Pick<PoemDocument, "avgRating" | "ratingCount">) {
  const { avgRating, ratingCount } = poem;

  if (ratingCount === 0) {
    return { display: "No ratings yet" };
  }

  return {
    display: `${avgRating.toFixed(1)} * (${ratingCount})}`,
    avgRating,
    ratingCount,
  };
}