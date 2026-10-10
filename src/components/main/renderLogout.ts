import { mdiAccountCircleOutline, mdiLogout } from "@mdi/js";
import { FirebaseError } from "firebase/app";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { renderErrors } from "../main/renderErrors";
import { auth } from "../../lib/firebase";
import { html } from "../../lib/html";

export function renderLogout(user: User) {
  document.querySelector<HTMLButtonElement>("#signout")!.innerHTML = html`
    <article
      class="flex flex-col sm:2xl:flex-row items-center justify-center gap-6"
    >
      <a
        href="/account/?uid=${user.uid}"
        class="py-6 px-8 bg-cyan-600 rounded-full cursor-pointer flex flex-row justify-center items-center gap-2"
      >
        <svg viewBox="0 0 28 28" width="28" height="28">
          <path d="${mdiAccountCircleOutline}" fill="black" />
        </svg>
        Account
      </a>
      <button
        type="button"
        id="logout"
        class="py-6 px-8 bg-orange-500 rounded-full cursor-pointer flex flex-row justify-center items-center gap-2"
      >
        <svg viewBox="0 0 28 28" width="28" height="28">
          <path d="${mdiLogout}" fill="black" />
        </svg>
        Log Out
      </button>
    </article>
  `;

  document
    .querySelector<HTMLButtonElement>("#logout")!
    .addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "/";
      } catch (error) {
        if (error instanceof FirebaseError) {
          renderErrors(error);
        }
      }
    });
}