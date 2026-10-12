import { beforeEach, describe, expect, it } from "vitest";
import { renderLoading } from "../../../../src/components/main/renderLoading";
import { renderShell } from "../../../../src/components/main/renderShell";

beforeEach(() => {
  document.body.innerHTML = `<div id="app"></div>`;
});

describe("Landing Page Test Suite", () => {
  // Note: renders `Loading...` in `#app`
  it("should render Loading... text briefly", () => {
    renderLoading();

    const loading = document.querySelector<HTMLParagraphElement>("#loading");
    expect(loading).not.toBeNull();
    expect(loading?.textContent).toContain("Loading...");
  });

  // Note: renders `<h1>` in `#app`
  it("should display the Landing page Title", () => {
    renderShell();

    const title = document.querySelector<HTMLHeadingElement>("#landing-title");
    expect(title?.textContent).toContain("r/zen slam poetry");
  });
});
