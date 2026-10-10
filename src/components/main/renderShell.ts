import { mdiFeather, mdiYinYang } from "@mdi/js";
import { html } from "../../lib/html";
import firebaseLogo from "../../assets/Logomark_Full_Color.png";
import tsLogo from "../../assets/typescript.svg";
import viteLogo from "../../assets/vite_logo.jpeg";
import tailwindLogo from "../../assets/tailwind.svg";
import htmlLogo from "../../assets/HTML5.svg";
import zodLogo from "../../assets/Zod.svg";

export function renderShell() {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = html`
    <section
      class="w-full mx-auto min-h-screen flex flex-col justify-center items-center gap-5"
    >
      <article class="flex flex-row justify-center items-center gap-4">
        <svg viewBox="0 0 28 28" width="28" height="28">
          <path d="${mdiYinYang}" />
        </svg>
        <h1 id="landing-title" class="text-xl font-bold text-zinc-700">r/zen slam poetry</h1>
        <svg viewBox="0 0 28 28" width="28" height="28">
          <path d="${mdiFeather}" />
        </svg>
      </article>
      <article class="w-1/2 flex flex-col gap-3">
        <div id="cta"></div>
        <div id="signout"></div>
        <div id="poem-feed"></div>
      </article>
      <span class="flex flex-row justify-center gap-1 text-xs text-semibold"
        >Powered by
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/HTML"
          target="_blank"
          ><img
            src="${htmlLogo}"
            alt="HTML5 Logo and Link"
            width="16"
            height="16"
        /></a>
        <a href="https://tailwindcss.com" target="_blank"
          ><img
            src="${tailwindLogo}"
            alt="TailwindCSS Logo and Link"
            width="16"
            height="16"
        /></a>
        <a href="https://vite.dev" target="_blank"
          ><img
            src="${viteLogo}"
            alt="Vite Logo and Link"
            width="16"
            height="16"
        /></a>
        <a href="https://typescriptlang.org" target="_blank"
          ><img
            src="${tsLogo}"
            alt="Typescript Logo and Link"
            width="16"
            height="16"
        /></a>
        <a href="https://firebase.google.com/" target="_blank"
          ><img
            src="${firebaseLogo}"
            alt="Firebase Logo and Link"
            width="16"
            height="16"
        /></a>
        <a href="https://zod.dev" target="_blank"
          ><img src="${zodLogo}" alt="Zod Logo and Link" width="16" height="16"
        /></a>
      </span>
    </section>
  `;
}