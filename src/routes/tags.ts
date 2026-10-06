import type { FirebaseError } from "firebase/app";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  collection,
  where,
  orderBy,
  onSnapshot,
  query,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import EditorJS, { type OutputData } from "@editorjs/editorjs";
import Delimiter from "@editorjs/delimiter";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Underline from "@editorjs/underline";
import { html } from "../lib/html";
import { type PoemDocument } from "../types/PoemDocument";
import "../style.css";
import formatDate from "../lib/formatDate";

const params = new URLSearchParams(window.location.search);
const tag = params.get("t");

const editors = new Map<string, EditorJS>();

const publicDocs = new Map<string, QueryDocumentSnapshot<DocumentData>>();
const ownDocs = new Map<string, QueryDocumentSnapshot<DocumentData>>();

document.querySelector<HTMLDivElement>("#tags")!.innerHTML = html`
  <section
    class="w-full max-w-2xl min-h-screen mx-auto flex flex-col justify-center items-center"
  >
    <article class="text-lg font-semibold text-zinc-800">Loading...</article>
  </section>
`;

function renderTags(tag: string | null, user: User | null) {
  document.querySelector<HTMLDivElement>("#tags")!.innerHTML = html`
    <section
      class="w-full max-w-2xl min-h-screen mx-auto mt-10 flex flex-row justify-center items-start"
    >
      <article class="w-1/4 text-2xl font-semibold text-zinc-800">
        #${tag}
      </article>
      <article id="poem" class="w-3/4"></article>
    </section>
  `;

  const publicQuery = query(
    collection(db, "poems"),
    where("isPublic", "==", true),
    where("tags", "array-contains", tag),
    orderBy("createdAt", "desc"),
  );

  const unsubscribePublic = onSnapshot(
    publicQuery,
    (snapshot) => {
      publicDocs.clear();
      snapshot.docs.forEach((entry) => publicDocs.set(entry.id, entry));
      renderMergedPoems();
    },
    (error: FirebaseError) =>
      console.error("Public feed snapshot error:", error),
  );

  let unsubscribeOwn: (() => void) | undefined;

  if (user) {
    const ownQuery = query(
      collection(db, "poems"),
      where("authorUid", "==", user.uid),
      where("isPublic", "==", false),
      where("tags", "array-contains", tag),
      orderBy("createdAt", "desc"),
    );

    unsubscribeOwn = onSnapshot(
      ownQuery,
      (snapshot) => {
        ownDocs.clear();
        snapshot.docs.forEach((entry) => ownDocs.set(entry.id, entry));
        renderMergedPoems();
      },
      (error: FirebaseError) =>
        console.error("Own feed snapshot error:", error),
    );
  }

  return () => {
    unsubscribePublic();
    unsubscribeOwn?.();
  };
}

function renderMergedPoems() {
  editors.forEach((ed) => ed.destroy());
  editors.clear();

  const merged = new Map<string, QueryDocumentSnapshot<DocumentData>>([
    ...publicDocs,
    ...ownDocs,
  ]);

  const sorted = Array.from(merged.values()).sort(
    (a, b) => b.data().createdAt.toMillis() - a.data().createdAt.toMillis(),
  );

  const poemsHTML = sorted
    .map((entry) => {
      const poem = entry.data() as PoemDocument;
      return html`
        <article
          class="w-full mb-10 border border-gray-300 px-4 py-2 rounded-md"
        >
          <div id="poemsTitle" class="w-3/4">${poem.title}</div>
          <div class="h-0 border border-gray-300 rounded-full"></div>
          <div id="editorjs-${entry.id}" class="w-full"></div>
          <div class="h-0 border border-gray-300 rounded-full"></div>
          <div id="metadata-${entry.id}" class="w-full"></div>
        </article>
      `;
    })
    .join("");

  document.querySelector<HTMLElement>("#poem")!.innerHTML = poemsHTML;

  sorted.forEach((entry) => {
    const poem = entry.data() as PoemDocument;
    renderPoemBody(`editorjs-${entry.id}`, poem.body);
    renderMetadata(`${entry.id}`, poem);
  });
}

async function renderPoemBody(id: string, body: OutputData) {
  const editor = new EditorJS({
    holder: id,
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
  editors.set(id, editor);
}

function renderMetadata(id: string | null, poem: PoemDocument) {
  document.querySelector<HTMLDivElement>(`#metadata-${id}`)!.innerHTML = html`
    <article class="w-full flex flex-row justify-between items-center">
      <div class="w-1/3">by ${poem.displayName}</div>
      <div class="w-1/3">rating ${poem.avgRating}</div>
      <div class="w-1/3">on ${formatDate(poem.createdAt)}</div>
    </article>
  `;
}

onAuthStateChanged(auth, (user: User | null) => {
  renderTags(tag, user);
});
