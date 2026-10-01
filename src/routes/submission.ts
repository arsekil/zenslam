import { onAuthStateChanged } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { z } from "zod";
import { mdiArrowLeft } from "@mdi/js";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Delimiter from "@editorjs/delimiter";
import Underline from "@editorjs/underline";
import { PoemSchema } from "../schemas/poem";
import { html } from "../lib/html";
import "../style.css";

let isError = false;
let errorType: "zodError" | "FBError" | "" = "";
let errorMessage: string | z.ZodIssue[] = "";
let editor: EditorJS;
let tags: string[] = [];
const MAX_TAGS = 5;

document.querySelector<HTMLDivElement>("#submission")!.innerHTML = html`
  <section
    class="w-full min-h-screen flex flex-col gap-5 justify-center items-center"
  >
    <p class="text-zinc-800">Loading...</p>
  </section>
`;

function renderShell() {
  document.querySelector<HTMLDivElement>("#submission")!.innerHTML = html`
    <section
      class="w-full max-w-2xl min-h-screen mx-auto mt-10 sm:max-5xl:mt-0 px-4 py-4 flex flex-col gap-5 justify-center items-center"
    >
      <h1 class="text-2xl font-bold text-zinc-700">Submit a Zen</h1>
      <div
        id="back"
        class="w-full max-w-2xl flex flex-row justify-items-start items-center gap-2 cursor-pointer"
      ></div>
      <form
        id="form"
        class="w-full max-w-2xl flex flex-col justify-center gap-3 "
      ></form>
      <p id="errors"></p>
    </section>
  `;

  renderForm();
}

function renderForm() {
  const form = document.querySelector<HTMLFormElement>("#form")!;
  const backButton = document.querySelector<HTMLDivElement>("#back")!;

  editor = new EditorJS({
    holder: "editorjs",
    placeholder: "Write your Zen here",
    tools: {
      header: Header,
      list: List,
      delimiter: Delimiter,
      underline: Underline,
    },
  });

  form.innerHTML = html`
    <label for="title" class="text-lg font-semibold pl-2">Title</label>
    <input
      type="text"
      id="title"
      placeholder="Zen title"
      class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <label for="body" class="text-lg font-semibold pl-2">Poem</label>
    <div
      id="editorjs"
      class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    ></div>
    <label for="tags" class="text-lg font-semibold pl-2"
      >Tags <span class="text-sm font-semibold">(press comma or Enter to add, optional/recommended)</span></label
    >
    <div id="tag-chips" class="flex flex-wrap gap-2 my-1"></div>
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
      Submit
    </button>
  `;

  document
    .querySelector<HTMLFormElement>("#form")!
    .addEventListener("submit", handleSubmit);

  backButton.innerHTML = html`
    <span
      class="flex flex-row justify-start items-center text-lg font-semibold"
    >
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path d="${mdiArrowLeft}" fill="black" />
      </svg>
      <span>Back</span>
    </span>
  `;

  backButton.addEventListener(
    "click",
    () => (window.location.href = "/account/"),
  );

  setupTagInput();
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
    document.querySelector<HTMLDivElement>("#tag-chips")!.className = "flex flex-wrap gap-2 my-0";
  } else {
    document.querySelector<HTMLDivElement>("#tag-chips")!.className = "flex flex-wrap gap-2 my-1";
  }
  container.innerHTML = tags
    .map(
      (tag, idx) => html`
        <span
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
      btn.addEventListener("click", () => {
        tags.splice(Number(btn.dataset.index), 1);
        renderTagChips();
        renderErrors();
      });
    });
}

function commitTag(raw: string) {
  const tag = raw.trim();
  if (!tag) return;
  if (tags.includes(tag)) return;
  if (tags.length > MAX_TAGS) return;
  tags.push(tag);
  renderTagChips();
}

function renderErrors() {
  const errorContainer =
    document.querySelector<HTMLParagraphElement>("#errors")!;
  if (!isError) {
    errorContainer.innerHTML = "";
    return;
  }
  if (errorType === "zodError" && Array.isArray(errorMessage)) {
    errorContainer.innerHTML = errorMessage
      .map(
        (issue) =>
          `<p class="text-white font-semibold bg-red-500 text-sm">${issue.message}</p>`,
      )
      .join("");
  } else if (errorType === "FBError" && typeof errorMessage === "string") {
    errorContainer.innerHTML = `<p class="text-white font-semibold bg-red-500 text-sm">${errorMessage}</p>`;
  }
}

async function handleSubmit(e: SubmitEvent) {
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
    await addDoc(collection(db, "poems"), {
      ...validated,
      displayName: auth.currentUser?.displayName,
      authorUid: auth.currentUser?.uid,
      avgRating: 0,
      ratingCount: 0,
      createdAt: serverTimestamp(),
    });
    window.location.href = "/account/";
  } catch (error: any) {
    if (error instanceof FirebaseError) {
      isError = true;
      errorType = "FBError";
      errorMessage = error as unknown as string; //"Something went wrong saving your poem. Please try again.";
    } else if (error instanceof z.ZodError) {
      isError = true;
      errorType = "zodError";
      errorMessage = error.issues;
    }
  }
  renderErrors();
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/";
  } else {
    renderShell();
  }
});
