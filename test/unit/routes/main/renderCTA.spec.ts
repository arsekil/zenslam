import { beforeEach, describe, expect, it } from "vitest";
import { renderShell } from "../../../../src/components/main/renderShell";
import { renderCTA } from "../../../../src/components/main/renderCTA";

beforeEach(() => {
  document.body.innerHTML = `<div id="app"></div>`;
});

describe("Call-to-Action Buttons(Login/Signup)", () => {
  // Note: renders the authentication buttons(Login/Signup)
  it("should render the Call-to-Action buttons(Login/Signup)", () => {
    expect.hasAssertions();
    renderShell();
    renderCTA();
    const cta = document.querySelector<HTMLDivElement>("#cta");

    expect(cta).not.toBeNull();
    expect(cta?.querySelector("article")).not.toBeNull();

    const links = cta?.querySelectorAll<HTMLAnchorElement>("a");
    expect(links).toHaveLength(2);
    expect(links?.[0]?.getAttribute("href")).toBe("/auth/cta/?mode=login");
    expect(links?.[1]?.getAttribute("href")).toBe("/auth/cta/?mode=signup");
  });
});
