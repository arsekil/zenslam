import { onAuthStateChanged } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { z } from "zod";
import { mdiArrowLeft } from "@mdi/js";
import { auth, db } from "../lib/firebase";
import { PoemSchema } from "../schemas/poem";
import { html } from "../lib/html";
import "../style.css";

let isError = false;
let errorType: "zodError" | "FBError" | "" = "";
let errorMessage: string | z.ZodIssue[] = "";

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
      class="w-full h-212.5 flex flex-col gap-5 justify-center items-center"
    >
      <h1 class="text-3xl font-bold text-zinc-700">Submit a Zen</h1>
      <div
        id="back"
        class="w-1/3 flex flex-row justify-items-start items-center gap-2 cursor-pointer"
      ></div>
      <form id="form" class="flex flex-col justify-center gap-3 w-1/3"></form>
      <p id="errors"></p>
    </section>
  `;

  renderForm();
}

function renderForm() {
  const form = document.querySelector<HTMLFormElement>("#form")!;
  const backButton = document.querySelector<HTMLDivElement>("#back")!;

  form.innerHTML = html`
    <label for="title" class="text-lg font-semibold">Title</label>
    <input
      type="text"
      id="title"
      placeholder="Zen title"
      class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <label for="body" class="text-lg font-semibold">Poem</label>
    <textarea
      id="body"
      rows="10"
      placeholder="Write your Zen here"
      class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
    ></textarea>
    <label for="tags" class="text-lg font-semibold"
      >Tags (comma separated, optional)</label
    >
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
  const body = document.querySelector<HTMLTextAreaElement>("#body")!.value;
  const isPublic = document.querySelector<HTMLInputElement>("#public")!.checked;
  const tagsRaw = document.querySelector<HTMLInputElement>("#tags")!.value;
  const tags = tagsRaw
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  try {
    const validated = await PoemSchema.parseAsync({
      title,
      body,
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
