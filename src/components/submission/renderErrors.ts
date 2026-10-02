import { z } from "zod";

let isError = false;
let errorType: "zodError" | "FBError" | "" = "";
let errorMessage: string | z.ZodIssue[] = "";

export default function renderErrors() {
  const errorContainer =
    document.querySelector<HTMLParagraphElement>("#errors")!;
  if (!isError) {
    errorContainer.innerHTML = "";
    return;
  }
  if (isError && errorType === "zodError" && Array.isArray(errorMessage)) {
    errorContainer.innerHTML = errorMessage
      .map(
        (issue) =>
          `<p class="text-white font-semibold bg-red-500 text-sm">${issue.message}</p>`,
      )
      .join("");
  } else if (isError && errorType === "FBError" && typeof errorMessage === "string") {
    errorContainer.innerHTML = `<p class="text-white font-semibold bg-red-500 text-sm">${errorMessage}</p>`;
  }
}