import { FirebaseError } from "firebase/app";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Delimiter from "@editorjs/delimiter";
import Underline from "@editorjs/underline";
import { mdiArrowLeft } from "@mdi/js";
import { type ZodIssue } from "zod";
import { db } from "../../lib/firebase";
import { html } from "../../lib/html";
import type { PoemDocument } from "../../types/PoemDocument";
import { PoemSchema } from "../../schemas/poem";
import { routes } from "../../lib/routes";
import { ZodError } from "zod";

const params = new URLSearchParams(window.location.search);
const poemId = params.get("id");

let tags: string[] = [];
const MAX_TAGS = 5;

let editor: EditorJS;

async function handleSave(e: SubmitEvent, editor: EditorJS) {
  e.preventDefault();

  const title = document.querySelector<HTMLInputElement>("#title")!.value;
  const outputData = await editor.save();
  const isPublic = document.querySelector<HTMLInputElement>("#public")!.checked;
  const tagInput = document.querySelector<HTMLInputElement>("#tags")!;
  const pending = tagInput.value.trim();
  if (pending) {
    commitTag(pending);
    tagInput.value = "";
  }

  try {
    const validated = await PoemSchema.parseAsync({
      title,
      body: outputData,
      tags,
      isPublic,
    });

    if (poemId !== null) {
      await setDoc(
        doc(db, "poems", poemId),
        {
          ...validated,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      window.location.href = `${routes.poem}?id=${poemId}`;
    }
  } catch (error: any) {
    if (error instanceof FirebaseError) {
      renderErrors(error);
    } else if (error instanceof ZodError) {
      renderErrors(error);
    } else {
      renderErrors(error);
    }
  }
}

export default async function renderForm() {
  tags = [];
  const form = document.querySelector<HTMLFormElement>("#form")!;
  const backButton = document.querySelector<HTMLDivElement>("#back")!;

  form.innerHTML = html`
    <label for="title" class="text-lg font-semibold pl-2">Title</label>
    <input
      type="text"
      id="title"
      class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <label for="body" class="text-lg font-semibold pl-2">Poem</label>
    <div
      id="editorjs"
      class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    ></div>
    <label for="tags" class="text-lg font-semibold pl-2"
      >Tags
      <span class="text-sm font-semibold"
        >(press comma or Enter to add, click on 'x' to remove)</span
      ></label
    >
    <div id="tag-chips" role="list" class="flex flex-wrap gap-2 my-1"></div>
    <input
      type="text"
      id="tags"
      placeholder="e.g. haiku, nature, grief"
      class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <label class="inline-flex justify-center items-center cursor-pointer gap-3">
      <span class="text-lg font-semibold">Private</span>
      <input type="checkbox" id="public" name="public" class="sr-only peer" />
      <div
        class="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600
              after:content-[''] after:absolute after:top-0.5 after:left-0.5
              after:bg-white after:rounded-full after:h-5 after:w-5
              after:transition-all peer-checked:after:translate-x-5
              relative transition-colors"
      ></div>
      <span class="text-lg font-semibold">Public</span>
    </label>
    <button
      type="submit"
      class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors cursor-pointer"
    >
      Save
    </button>
  `;

  try {
    if (!poemId) {
      return (document.querySelector<HTMLDivElement>("#edit")!.innerHTML = html`
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

    if (!poemSnap.exists()) {
      document.querySelector("#edit")!.innerHTML = html`<p
        class="text-red-500 text-semibold text-2xl"
      >
        Poem not found.
      </p>`;
      return;
    }

    const poem = poemSnap.data() as PoemDocument;

    document.querySelector<HTMLInputElement>("#title")!.value = poem.title;

    tags = Array.isArray(poem.tags) ? [...poem.tags] : [];
    renderTagChips();

    document.querySelector<HTMLInputElement>("#public")!.checked =
      poem.isPublic;

    editor = new EditorJS({
      holder: "editorjs",
      data: poem.body ?? { blocks: [] },
      tools: {
        header: Header,
        list: List,
        delimiter: Delimiter,
        underline: Underline,
      },
    });
    await editor.isReady;
  } catch (error) {
    if (error instanceof FirebaseError) {
      renderErrors(error);
    }
  }

  document
    .querySelector<HTMLFormElement>("#form")!
    .addEventListener("submit", (e) => handleSave(e, editor));

  backButton.innerHTML = html`
    <span
      class="border border-gray-300 rounded-md py-2 px-4 flex flex-row justify-start items-center text-lg font-semibold"
    >
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="${mdiArrowLeft}" fill="black" />
      </svg>
      <span>Back</span>
    </span>
  `;

  backButton.addEventListener("click", () => {
    window.location.replace(`${routes.poem}?id=${poemId}`);
  });

  setupTagInput();
  renderTagChips();
}

function commitTag(raw: string) {
  const tag = raw.trim();
  if (!tag) return;
  if (tags.includes(tag)) return;
  if (tags.length >= MAX_TAGS) return;
  tags.push(tag);
  renderTagChips();
}

function setupTagInput() {
  const input = document.querySelector<HTMLInputElement>("#tags")!;
  input.addEventListener("keydown", (e) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      commitTag(input.value);
      input.value = "";
    } else if (e.key === "Backspace" && input.value === "" && tags.length) {
      tags.pop();
      renderTagChips();
    }
  });
}

function renderTagChips() {
  const container = document.querySelector<HTMLDivElement>("#tag-chips")!;
  if (tags.length < 1) {
    document.querySelector<HTMLDivElement>("#tag-chips")!.className =
      "flex flex-wrap gap-2 my-0";
  } else {
    document.querySelector<HTMLDivElement>("#tag-chips")!.className =
      "flex flex-wrap gap-2 my-1";
  }
  container.innerHTML = tags
    .map(
      (tag: string, idx: number) => html`
        <span
          role="listitem"
          class="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
        >
          ${tag}
          <button
            type="button"
            data-index=${idx}
            class="cursor-pointer font-bold hover:text-blue-600"
          >
            x
          </button>
        </span>
      `,
    )
    .join("");

  container
    .querySelectorAll<HTMLButtonElement>("button[data-index]")
    .forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          tags.splice(Number(btn.dataset.index), 1);
          renderTagChips();
        } catch (error) {
          renderErrors(
            error instanceof Error ? error : new Error(String(error)),
          );
        }
      });
    });
}

function renderErrors(error: Error | ZodIssue[] | FirebaseError) {
  const errorContainer =
    document.querySelector<HTMLParagraphElement>("#errors")!;
  if (!error) {
    errorContainer.textContent = "";
    document.querySelector<HTMLButtonElement>(
      "input[type='submit']",
    )!.disabled = false;
    return;
  }
  if (error && Array.isArray(error)) {
    errorContainer.innerHTML = error
      .map(
        (issue) =>
          html`<p class="text-white font-semibold bg-red-500 text-sm">
            ${issue.message}
          </p>`,
      )
      .join("");
    document.querySelector<HTMLButtonElement>(
      "input[type='submit']",
    )!.disabled = true;
  } else if (error && error instanceof FirebaseError) {
    errorContainer.innerHTML = html`<p
      class="text-white font-semibold bg-red-500 text-sm"
    >
      ${error.message}
    </p>`;
  } else {
    errorContainer.innerHTML = html`<p
      class="text-white font-semibold bg-red-500 text-sm"
    >
      ${error}
    </p>`;
    document.querySelector<HTMLButtonElement>(
      "input[type='submit']",
    )!.disabled = true;
  }
}
