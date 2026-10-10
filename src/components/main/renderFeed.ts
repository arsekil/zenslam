import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { db } from "../../lib/firebase";
import { renderErrors } from "./renderErrors";
import { poemRatings } from "./poemRatings";
import formatDate from "../../lib/formatDate";
import type { PoemDocument } from "../../types/PoemDocument";
import { html } from "../../lib/html";

export async function renderFeed() {
  try {
    const feedQuery = query(
      collection(db, "poems"),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(
      feedQuery,
      (snapshot) => {
        const poemsHTML = snapshot.docs
          .map((entry) => {
            const poem = entry.data() as PoemDocument;
            const ratings = poemRatings(poem);
            const createdAt = poem.createdAt;
            return html`
              <section
                class="w-full flex flex-col sm:3xl:flex-row justify-between items-center border rounded-md p-4 gap-3 sm:2xl:gap-0"
              >
                <article class="w-full flex justify-center items-center">
                  <a
                    href="/poem/?id=${entry.id}"
                    class="text-zinc-800 font-semibold no-underline hover:text-blue-800"
                    >${poem.title}</a
                  >
                </article>
                <article class="w-full max-w-35 flex flex-row justify-center">
                  ${String(ratings.display)}
                </article>
                <section class="w-full flex flex-row justify-center gap-1">
                  <article class="max-w-50">
                    <p class="max-w-50">
                      posted by
                      <a
                        href="/account/?uid=${poem.authorUid}"
                        class="no-underline text-blue-800 cursor-pointer"
                      >
                        ${poem.displayName ?? "Unknown"}
                      </a>
                    </p>
                  </article>
                  <article class="max-w-50">
                    <p>on ${formatDate(createdAt)}</p>
                  </article>
                </section>
              </section>
            `;
          })
          .join("");

        document.querySelector<HTMLDivElement>("#poem-feed")!.innerHTML = html`
          <section class="flex flex-col gap-4 justify-center items-center">
            ${poemsHTML || "No poems yet."}
          </section>
        `;
      },
      (error) => {
        if (error instanceof FirebaseError) {
          renderErrors(error);
        }
      },
    );

    return unsubscribe;
  } catch (error) {
    if (error instanceof FirebaseError) {
      renderErrors(error);
    } else if (error instanceof Error) {
      renderErrors(error);
    }
  }
}