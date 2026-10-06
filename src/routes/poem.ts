import { onAuthStateChanged, type User } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, getDoc, type DocumentData } from "firebase/firestore";
import EditorJS, { type OutputData } from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Delimiter from "@editorjs/delimiter";
import Underline from "@editorjs/underline";
import { mdiFeather, mdiYinYang } from "@mdi/js";
import { auth, db } from "../lib/firebase";
import { html } from "../lib/html";
import { routes } from "../lib/routes";
import "../style.css";

const params = new URLSearchParams(window.location.search);
const poemId = params.get("id");
let isError: boolean = false;
let errorType: "FBError" | "" = "";
let editor: EditorJS;

document.querySelector<HTMLDivElement>("#poem")!.innerHTML = html`
  <section
    class="w-full max-w-2xl min-h-screen mx-auto flex flex-col items-center justify-center"
  >
    <article class="text-lg font-semibold text-zinc-800">Loading...</article>
  </section>
`;

//TODO add the `from` query context to redirect the user back to the originally queried page after login

async function renderPoem(poemId: string | null, user: User | null) {
  try {
    if (!poemId) {
      return (document.querySelector<HTMLDivElement>("#poem")!.innerHTML = html`
        <section
          class="w-full min-h-screen mx-auto flex items-center justify-center"
        >
          <article class="text-md font-semibold text-zinc-800">
            No Zen ID supplied, nothing to show.
          </article>
        </section>
      `);
    }
    const poemSnap = await getDoc(doc(db, "poems", poemId));

    if (poemSnap.exists()) {
      const poem: DocumentData = poemSnap.data();

      const canView = poem.isPublic || poem.authorUid === user?.uid;

      if (!canView) {
        window.location.href = routes.poems;
        return;
      }

      document.querySelector<HTMLDivElement>("#poem")!.innerHTML = html`
        <section
          class="w-full max-w-2xl h-screen min-h-screen mx-auto flex flex-col items-center justify-center"
        >
          <article
            id="poemTitle"
            class="w-full border border-gray-300 rounded-md py-2 px-4 flex flex-row items-center justify-center gap-3 text-4xl font-semibold text-zinc-800 wrap-break-word"
          >
            <svg viewBox="0 0 28 28" width="28" height="28">
              <path d="${mdiYinYang}" />
            </svg>
            <p class="flex flex-row items-center justify-center">
              ${poem.title}
            </p>
            <svg viewBox="0 0 28 28" width="28" height="28">
              <path d="${mdiFeather}" />
            </svg>
          </article>
          <article
            id="editorjs"
            class="w-full max-w-2xl my-2 border border-gray-300 rounded-md py-2 px-4 flex flex-col items-center justify-center"
          ></article>
          <article id="tag-chips"></article>
        </section>
      `;

      renderPoemBody(poem.body);

      renderTagChips(poem.tags);
    }
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "permission-denied") {
      isError = true;
      errorType = "FBError";
      renderErrors(true, "FBError");
    } else {
      console.error(error);
    }
  }
}

function renderErrors(isError: boolean, errorType: "FBError" | string) {
  if (isError) {
    if (errorType === "FBError") {
      document.querySelector<HTMLDivElement>("#poem")!.innerHTML = html`
        <section
          class="w-full min-h-screen mx-auto flex items-center justify-center"
        >
          <article class="text-md font-semibold text-red-500">
            This Zen - unfortunately - doesn't exist.
          </article>
        </section>
      `;
      return;
    }
  }
}

async function renderPoemBody(body: OutputData) {
  editor = new EditorJS({
    holder: "editorjs",
    data: body ?? { blocks: [] },
    readOnly: true,
    tools: {
      header: Header,
      list: List,
      delimiter: Delimiter,
      underline: Underline,
    },
  });
  await editor.isReady;
}

function renderTagChips(tags: string[]) {
  const container = document.querySelector<HTMLDivElement>("#tag-chips")!;
  if (tags.length < 1) {
    document.querySelector<HTMLDivElement>("#tag-chips")!.className =
      "flex flex-wrap gap-2 my-0";
  } else {
    document.querySelector<HTMLDivElement>("#tag-chips")!.className =
      "w-full flex flex-row justify-center items-center gap-2 border border-gray-300 rounded-md py-2 px-4";
  }
  container.innerHTML = tags
    .map(
      (tag) => html`
        <a
          href="/tags/?t=${tag}"
          class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full no-underline"
        >
          ${tag}
        </a>
      `,
    )
    .join("");
}

onAuthStateChanged(auth, async (user: User | null) => {
  await renderPoem(poemId, user);
});
