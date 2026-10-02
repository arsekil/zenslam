import { z } from "zod";
import { FirebaseError } from "firebase/app";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type EditorJS from "@editorjs/editorjs";
import { auth, db } from "../../lib/firebase";
import { PoemSchema } from "../../schemas/poem";
import { html } from "../../lib/html";
import renderErrors from "./renderErrors";

let tags: string[] = [];
const MAX_TAGS = 5;
let isError = false;
let errorType: "zodError" | "FBError" | "" = "";
let errorMessage: FirebaseError | z.ZodIssue[];

export function commitTag(raw: string) {
  const tag = raw.trim();
  if (!tag) return;
  if (tags.includes(tag)) return;
  if (tags.length > MAX_TAGS) return;
  tags.push(tag);
  renderTagChips();
}

export function setupTagInput() {
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

export function renderTagChips() {
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

export default async function handleSubmit(e: SubmitEvent, editor: EditorJS) {
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
      errorMessage = error as FirebaseError; //"Something went wrong saving your poem. Please try again.";
    } else if (error instanceof z.ZodError) {
      isError = true;
      errorType = "zodError";
      errorMessage = error.issues;
    }
  }
  renderErrors();
}
