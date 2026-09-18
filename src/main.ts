import "./style.css";

let mode: "login" | "signup" = "login";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<section class="w-full h-screen flex flex-col gap-5 justify-center items-center">
  <h1 class="text-4xl font-bold text-orange-500">r/zen slam poetry</h1>
  <form id="form" action="#" class="flex flex-col gap-3 w-1/4"></form>
</section>
`;

function renderForm() {
  const form = document.querySelector<HTMLFormElement>("#form")!;

  form.innerHTML = `
    ${
      mode === "login"
        ? ""
        : `<label for="username" id="usernameLabel" class="text-lg font-semibold">Username</label>
    <input type="text" id="username" placeholder="Username" class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">`
    }
    <label for="email" id="emailLabel" class="text-lg font-semibold">Email</label>
    <input type="email" id="email" placeholder="Email" class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
    <label for="password" id="passwordLabel" class="text-lg font-semibold">Password</label>
    <input type="password" id="password" placeholder="Password" class="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
    <button type="submit" class="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">${mode === "login" ? "Login" : "Sign up"}</button>
    <p class="flex flex-row justify-center items-center gap-1">
      ${mode === "login" ? "Don't have an account?" : "Already have an account?"}
      <span id="authSwitch" class="text-blue-500 hover:underline cursor-pointer">${mode === "login" ? "Sign up" : "Login"}</span>
    </p>
  `;

  document
    .querySelector<HTMLSpanElement>("#authSwitch")!
    .addEventListener("click", (e) => {
      e.preventDefault();
      mode = mode === "login" ? "signup" : "login";
      renderForm();
    });
}

renderForm();

const script = document.createElement("script");
script.src = `https://www.google.com/recaptcha/enterprise.js?render=${import.meta.env.VITE_RECAPTCHA_KEY_ID}`;
document.head.appendChild(script);
