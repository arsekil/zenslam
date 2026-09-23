import { html } from "../lib/html";
import "../style.css";

document.querySelector<HTMLDivElement>("#collection")!.innerHTML = html`
  <section
    class="w-full min-h-screen flex flex-col gap-5 justify-center items-center"
  >
    <p class="text-zinc-800">Loading...</p>
  </section>
`;
