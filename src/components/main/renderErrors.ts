import { FirebaseError } from "firebase/app";
import type { ZodIssue } from "zod";
import { html } from "../../lib/html";

export function renderErrors(error: Error | ZodIssue[] | FirebaseError) {
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