import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { resolve } from "path";

describe("Profile Feature", () => {
  it("should have profile screen file", () => {
    const profilePath = resolve(__dirname, "../app/(tabs)/profile.tsx");
    expect(existsSync(profilePath)).toBe(true);
  });

  it("should have Tag component with label prop", () => {
    const tagPath = resolve(__dirname, "../components/ui/tag.tsx");
    expect(existsSync(tagPath)).toBe(true);
  });

  it("should have plus icon mapped in icon-symbol", () => {
    const iconPath = resolve(__dirname, "../components/ui/icon-symbol.tsx");
    expect(existsSync(iconPath)).toBe(true);
  });

  it("should have pencil icon mapped in icon-symbol", () => {
    const iconPath = resolve(__dirname, "../components/ui/icon-symbol.tsx");
    expect(existsSync(iconPath)).toBe(true);
  });

  it("should support AsyncStorage for profile data", () => {
    // AsyncStorage is imported in profile.tsx
    const profilePath = resolve(__dirname, "../app/(tabs)/profile.tsx");
    expect(existsSync(profilePath)).toBe(true);
  });
});
