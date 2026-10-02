import { mdiArrowLeft } from "@mdi/js";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Delimiter from "@editorjs/delimiter";
import Underline from "@editorjs/underline";
import { html } from "../../lib/html";
import { setupTagInput, renderTagChips } from "./handleSubmit";
import handleSubmit from "./handleSubmit";

let editor: EditorJS;

export default function renderForm() {
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
    .addEventListener("submit", (e) => handleSubmit(e, editor));

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