import { html }from "../../lib/html";
import renderErrors from "./renderErrors";

let tags: string[] = [];

export default function renderTagChips() {
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