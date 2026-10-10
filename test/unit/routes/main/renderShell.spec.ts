import { beforeEach, describe, expect, it } from "vitest";
import { renderLoading } from "../../../../src/components/main/renderLoading";
import { renderShell } from "../../../../src/components/main/renderShell";
import { renderCTA } from "../../../../src/components/main/renderCTA";

beforeEach(() => {
  document.body.innerHTML = `<div id="app"></div>`;
});

describe("Landing Page Test Suite", () => {
  it("should render Loading... text briefly", () => {
    renderLoading();

    const loading = document.querySelector<HTMLParagraphElement>("#loading");
    expect(loading).not.toBeNull();
    expect(loading?.textContent).toContain("Loading...");
  });

  it("should display the Landing page Title", () => {
    renderShell();

    const title = document.querySelector<HTMLHeadingElement>("#landing-title");
    expect(title?.textContent).toContain("r/zen slam poetry");
  });

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

  it("should render Public Poems(Zens) regardless of User state", async () => {
    //TODO uncomment below when test is complete
    //expect.hasAssertions();

    
  });
});
