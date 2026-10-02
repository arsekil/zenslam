import commitTag from "./commitTag";
import renderTagChips from "./renderTagChips";

let tags: string[] = [];

export default function setupTagInput() {
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