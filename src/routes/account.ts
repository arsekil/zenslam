import { FirebaseError } from "firebase/app";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { html } from "../lib/html";

let displayName: string | null = null;

function renderAccount(displayName: string | null) {
  document.querySelector<HTMLDivElement>("#account")!.innerHTML = html`
  <button id="logout">Logout</button>
  `;

  document
    .querySelector<HTMLButtonElement>("#logout")!
    .addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "/";
      } catch (error) {
        if (error instanceof FirebaseError) {
          console.error("Error signing out:", error);
        }
      }
    });
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/";
  } else {
    displayName = user.displayName;
    renderAccount(displayName);
  }
});
