import { Timestamp } from "firebase/firestore";

export default function formatDate(date: Date | string | Timestamp | null) {
  if (!date) return "Just now";

  let d: Date;

  if (typeof date === "string") {
    d = new Date(date);
  } else if (date instanceof Timestamp) {
    d = date.toDate();
  } else {
    d = date;
  }

  // Guard against invalid dates (e.g. malformed strings)
  if (Number.isNaN(d.getTime())) return "Just now";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}
