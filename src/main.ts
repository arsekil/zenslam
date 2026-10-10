import { onAuthStateChanged, type User } from "firebase/auth";
import { renderLoading } from "./components/main/renderLoading";
import { renderShell } from "./components/main/renderShell";
import { renderCTA } from "./components/main/renderCTA";
import { renderLogout } from "./components/main/renderLogout";
import { renderFeed } from "./components/main/renderFeed";
import { auth } from "./lib/firebase";
import "./style.css";

renderLoading();
renderShell();

onAuthStateChanged(auth, (user: User | null) => {
  if (user) {
    renderLoading();
    renderShell();
    renderLogout(user);
    renderFeed();
  } else {
    renderLoading();
    renderShell();
    renderCTA();
    renderFeed();
  }
});

//TODO: Add reCAPTCHA Enterprise integration later
// const script = document.createElement("script");
// script.src = `https://www.google.com/recaptcha/enterprise.js?render=${import.meta.env.VITE_RECAPTCHA_KEY_ID}`;
// document.head.appendChild(script);
