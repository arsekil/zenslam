import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<section class="w-full h-screen flex flex-col gap-5 justify-center items-center">

  <h1 class="text-4xl font-bold">Zen Slam Poetry</h1>

  <a href="/poem/">Ode to the Night</a>

  <a href="/collection/">Collection</a>

</section>
`;
