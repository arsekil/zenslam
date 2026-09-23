import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { html } from "../lib/html";
import "../style.css";

function renderMenu() {
  document.querySelector<HTMLDivElement>("#menu")!.innerHTML = html`
    <section class="w-full h-14.5 flex flex-col gap-5 justify-center items-center">
      <menu class="w-full h-14.5 flex flex-row justify-center items-center">
        <li class="list-none py-4 px-6 border border-graphite bg-graphite text-white font-semibold rounded-sm cursor-pointer hover:rounded-lg hover:scale-125">
          <a href="/" class="no-underline">Home</a>
        </li>
        <li class="list-none py-4 px-6 border border-charcoal-blue bg-charcoal-blue text-white font-semibold rounded-sm cursor-pointer hover:rounded-lg hover:scale-125">
          <a href="/poems/" class="no-underline">Poems</a>
        </li>
        <li class="list-none py-4 px-6 border border-pumpkin-spice bg-pumpkin-spice text-white font-semibold rounded-sm cursor-pointer hover:rounded-lg hover:scale-125">
          <a href="/collection/" class="no-underline">Collection</a>
        </li>
        <li class="list-none py-4 px-6 border border-prussian-blue bg-prussian-blue text-white font-semibold rounded-sm cursor-pointer hover:rounded-lg hover:scale-125">
          <a href="/submission/" class="no-underline">Submission</a>
        </li>
        <li class="list-none py-4 px-6 border border-intense-cherry bg-intense-cherry text-white font-semibold rounded-sm cursor-pointer hover:rounded-lg hover:scale-125">
          <a href="/account/" class="no-underline">Account</a>
        </li>
      </menu>
    </section>
  `;
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/";
  } else {
    renderMenu();
  }
});
