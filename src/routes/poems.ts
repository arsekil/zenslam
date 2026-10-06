import { html } from "../lib/html";
import "../style.css";

document.querySelector<HTMLDivElement>("#poem")!.innerHTML = html`
  <section
    class="w-full max-w-2xl min-h-screen mx-auto flex flex-col gap-5 justify-center items-center"
  >
    <p class="text-lg font-semibold text-zinc-800">Loading Poems...</p>
  </section>
`;
