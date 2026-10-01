import z from "zod";

let isError: boolean = false;
let errorType: "zodError" | "FBError" | "" = "";
let errorMessage: unknown | z.ZodIssue[] = [];

export default function renderErrorMessages() {
  const errorContainer =
    document.querySelector<HTMLParagraphElement>("#errors")!;
  if (isError) {
    if (errorType === "zodError" && Array.isArray(errorMessage)) {
      errorContainer.innerHTML = errorMessage
        .map((issue) => `<p>${issue.message}</p>`)
        .join("");
    } else if (errorType === "FBError" && typeof errorMessage === "string") {
      errorContainer.textContent = errorMessage;
    }
  } else {
    errorContainer.textContent = "";
  }
}