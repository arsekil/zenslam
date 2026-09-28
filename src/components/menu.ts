import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { html } from "../lib/html";
import "../style.css";

const menuItems = [
  { href: "/", label: "Home", color: "bg-graphite" },
  { href: "/poems/", label: "Poems", color: "bg-charcoal-blue" },
  { href: "/collection/", label: "Collection", color: "bg-pumpkin-spice" },
  { href: "/submission/", label: "Submission", color: "bg-prussian-blue" },
  { href: "/account/", label: "Account", color: "bg-intense-cherry" },
];

function renderMenu() {
  document.querySelector<HTMLDivElement>("#menu")!.innerHTML = html`
    <nav class="w-full p-2">
      <menu class="flex flex-row flex-wrap justify-center gap-2">
        ${menuItems.map(
          (item) => html`
            <li class="list-none">
              <a
                href="${item.href}"
                class="block py-2 px-3 md:py-4 md:px-6 ${item.color} text-white font-semibold rounded-sm hover:rounded-lg hover:scale-105 transition-transform no-underline"
              >
                ${item.label}
              </a>
            </li>
          `
        ).join("")}
      </menu>
    </nav>
  `;
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/";
  } else {
    renderMenu();
  }
});
