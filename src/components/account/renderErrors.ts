import { type FirebaseError, FirebaseError as FBError } from "firebase/app";
import z from "zod";

export default async function renderErrors(
  isError: boolean,
  errorTypeParam: "zodError" | "FBError" | "",
  errorMessageParam: FirebaseError | z.ZodIssue[] | string,
) {
  const errorContainer =
    document.querySelector<HTMLParagraphElement>("#errors")!;
  if (!isError) {
    errorContainer.innerHTML = "";
    return;
  }
  if (
    isError &&
    errorTypeParam === "zodError" &&
    Array.isArray(errorMessageParam)
  ) {
    errorContainer.innerHTML = errorMessageParam
      .map(
        (issue) =>
          `<p class="absolute left-0 top-[105%] -translate-y-1/2 py-2 px-2 rounded-lg text-white font-semibold bg-red-500 text-sm">${issue.message}</p>`,
      )
      .join("");
  } else if (
    isError &&
    errorTypeParam === "" &&
    !Array.isArray(errorMessageParam)
  ) {
    errorContainer.innerHTML = `<p class="absolute left-0 top-[105%] -translate-y-1/2 py-2 px-2 rounded-lg text-white font-semibold bg-red-500 text-sm">${errorMessageParam}</p>`;
  } else if (
    isError &&
    errorTypeParam === "FBError" &&
    errorMessageParam instanceof FBError &&
    !Array.isArray(errorMessageParam)
  ) {
    errorContainer.innerHTML = `<p class="absolute left-0 top-[105%] -translate-y-1/2 py-2 px-2 rounded-lg text-white font-semibold bg-red-500 text-sm">${errorMessageParam.message}</p>`;
  }
}
