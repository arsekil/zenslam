import {
  collection,
  where,
  query,
  getDocs,
  type DocumentData,
  Query,
  QuerySnapshot,
  orderBy,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import z from "zod";
import { db, auth } from "../../lib/firebase";
import { html } from "../../lib/html";
import formatDate from "../../lib/formatDate";
import type { PoemDocument } from "../../types/PoemDocument";
import renderErrors from "./renderErrors";

let isError = false;
let errorType: "zodError" | "" = "";
let errorMessage: string | z.ZodIssue[] = "";

export default async function renderPoems(
  viewedUid: string,
  isOwnProfile: boolean,
) {
  try {
    const poemsContainer =
      document.querySelector<HTMLDivElement>("#poemsContainer")!;
    const poemsRef = collection(db, "poems");

    let feedQuery: Query<DocumentData, DocumentData>;

    if (isOwnProfile) {
      feedQuery = query(
        poemsRef,
        where("authorUid", "==", auth.currentUser!.uid),
        orderBy("createdAt", "desc"),
      );
      poemsContainer.classList.add("mt-10");
    } else {
      feedQuery = query(
        poemsRef,
        where("authorUid", "==", viewedUid),
        where("isPublic", "==", true),
      );
      poemsContainer.classList.remove("mt-10");
    }

    const feedQuerySnapshot: QuerySnapshot<DocumentData, DocumentData> =
      await getDocs(feedQuery);

    const poemsTitle =
      document.querySelector<HTMLParagraphElement>("#poemsTitle")!;
    const poemsList = document.querySelector<HTMLDivElement>("#poemsList")!;

    poemsTitle.textContent = `Poems (${feedQuerySnapshot.docs.length})`;
    poemsList.innerHTML = `${feedQuerySnapshot.docs
      .map((entry) => {
        const poem = entry.data() as PoemDocument;
        return html`<article
          class="w-full max-h-16 flex flex-row justify-between items-center border border-gray-300 rounded-md px-4 py-2"
        >
          <a
            href="/poem/?id=${entry.id}"
            class="w-full max-w-40 overflow-hidden text-ellipsis whitespace-nowrap text-2xl font-semibold no-underline hover:text-blue-800"
          >
            ${poem.title}
          </a>
          <p class="w-full max-w-12 text-sm">
            ${poem.isPublic ? "Public" : "Private"}
          </p>
          <p class="text-sm">posted on ${formatDate(poem.createdAt)}</p>
        </article>`;
      })
      .join("")}`;
  } catch (error) {
    if (error instanceof FirebaseError) {
      isError = true;
      errorType = "";
      errorMessage =
        error.code === "unavailable"
          ? "Connection seems slow right now — please try again."
          : "Non-validation related issue, Contact support!";
      console.error(error);
      await renderErrors(isError, errorType, errorMessage);
    }
  }
  // finally {
  //   isError = false;
  //   renderErrors();
  // }
}
