import { FirebaseError } from "firebase/app";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

document.querySelector<HTMLButtonElement>("#logout")!.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "/";
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error("Error signing out:", error);
    }
  }
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/";
  }
});
