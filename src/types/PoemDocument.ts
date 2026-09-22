import { type PoemInput } from "../schemas/poem";

export interface PoemDocument extends PoemInput {
  authorUid: string,
  avgRating: number,
  ratingCount: number,
  createdAt: Date,
}