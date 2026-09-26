import { type Timestamp } from "firebase/firestore";
import { type PoemInput } from "../schemas/poem";

export interface PoemDocument extends PoemInput {
  displayName: string;
  authorUid: string;
  avgRating: number;
  ratingCount: number;
  isPublic: boolean;
  createdAt: Timestamp;
}
