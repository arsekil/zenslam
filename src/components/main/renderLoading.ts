import { html } from "../../lib/html";

/** Renders the authentication form based on the current mode */
export function renderLoading() {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = html`
  <p id="loading" class="text-zinc-800">Loading...</p>
  `;
}