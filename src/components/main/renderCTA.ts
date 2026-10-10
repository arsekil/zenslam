import { mdiAccountPlusOutline, mdiLogin } from "@mdi/js";
import { html } from "../../lib/html";

export function renderCTA() {
  document.querySelector<HTMLDivElement>("#cta")!.innerHTML = html`
    <article
      class="flex flex-col sm:2xl:flex-row items-center justify-center gap-6"
    >
      <a
        href="/auth/cta/?mode=login"
        class="py-6 px-8 bg-pink-200 rounded-full cursor-pointer flex flex-row justify-center items-center gap-2"
      >
        <svg viewBox="0 0 28 28" width="28" height="28">
          <path d="${mdiLogin}" fill="black" />
        </svg>
        Log In
      </a>
      <a
        href="/auth/cta/?mode=signup"
        class="py-6 px-8 text-white bg-blue-600 rounded-full cursor-pointer flex flex-row justify-center items-center gap-2"
      >
        <svg viewBox="0 0 28 28" width="28" height="28">
          <path d="${mdiAccountPlusOutline}" fill="black" />
        </svg>
        Sign Up
      </a>
    </article>
  `;
}
