import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { html } from "../lib/html";
import "../style.css";

document.querySelector<HTMLDivElement>("#menu")!.innerHTML = html`
  <section
    class="w-full flex flex-col gap-5 justify-center items-center"
  >
    <p class="text-zinc-800">Loading…</p>
  </section>
`;

function renderMenu() {
  document.querySelector<HTMLDivElement>("#menu")!.innerHTML = html`
    <menu class="w-full flex flex-row justify-center items-center gap-5">
      <li class="list-none">
        <a href="/" class="no-underline">Home</a>
      </li>
      <li>
        <a href="/poems/">Poems</a>
      </li>
      <li>
        <a href="/collection/">Collection</a>
      </li>
      <li>
        <a href="/submission/">Submission</a>
      </li>
      <li>
        <a href="/account/">Account</a>
      </li>
    </menu>
  `;
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/";
  } else {
    renderMenu();
  }
});
