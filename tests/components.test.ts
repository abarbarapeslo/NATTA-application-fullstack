import { describe, it, expect } from "vitest";

describe("Natta Mobile App - Component Tests", () => {
  it("should have proper theme colors configured", () => {
    const { themeColors } = require("../theme.config.js");
    
    expect(themeColors.primary.light).toBe("#0066FF");
    expect(themeColors.background.light).toBe("#F5F5F5");
    expect(themeColors.surface.light).toBe("#FFFFFF");
    expect(themeColors.foreground.light).toBe("#1A1A1A");
  });

  it("should have app name configured correctly", () => {
    const fs = require("fs");
    const path = require("path");
    const appConfigContent = fs.readFileSync(
      path.join(__dirname, "../app.config.ts"),
      "utf-8"
    );
    
    expect(appConfigContent).toContain('appName: "Natta"');
    expect(appConfigContent).toContain('appSlug: "natta-mobile"');
  });

  it("should have all required icon mappings", () => {
    const iconSymbolContent = require("fs").readFileSync(
      require("path").join(__dirname, "../components/ui/icon-symbol.tsx"),
      "utf-8"
    );
    
    // Check that essential icons are mapped
    expect(iconSymbolContent).toContain('"house.fill": "home"');
    expect(iconSymbolContent).toContain('"magnifyingglass": "search"');
    expect(iconSymbolContent).toContain('"person.fill": "person"');
    expect(iconSymbolContent).toContain('"calendar": "calendar-today"');
    expect(iconSymbolContent).toContain('"sparkles": "auto-awesome"');
  });

  it("should have all main screens created", () => {
    const fs = require("fs");
    const path = require("path");
    
    // Check tab screens
    expect(fs.existsSync(path.join(__dirname, "../app/(tabs)/index.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../app/(tabs)/search.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../app/(tabs)/profile.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../app/(tabs)/tools.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../app/(tabs)/more.tsx"))).toBe(true);
    
    // Check feature screens (live, routable tools)
    expect(fs.existsSync(path.join(__dirname, "../app/writing-hub.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../app/resume-assistant.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../app/video-space.tsx"))).toBe(true);
  });

  it("keeps not-yet-launched screens parked outside the router (future-features/)", () => {
    const fs = require("fs");
    const path = require("path");

    // Parked features must NOT be in app/ (otherwise expo-router exposes them).
    expect(fs.existsSync(path.join(__dirname, "../app/design-space.tsx"))).toBe(false);
    expect(fs.existsSync(path.join(__dirname, "../app/interview-simulator.tsx"))).toBe(false);
    expect(fs.existsSync(path.join(__dirname, "../app/calendar-view.tsx"))).toBe(false);

    // They still live in future-features/ for a later launch.
    expect(fs.existsSync(path.join(__dirname, "../future-features/design-space.tsx"))).toBe(true);
    expect(
      fs.existsSync(path.join(__dirname, "../future-features/interview-simulator.tsx")),
    ).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../future-features/calendar-view.tsx"))).toBe(true);
  });

  it("should have all UI components created", () => {
    const fs = require("fs");
    const path = require("path");
    
    expect(fs.existsSync(path.join(__dirname, "../components/ui/button.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../components/ui/card.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../components/ui/tag.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../components/ui/icon-symbol.tsx"))).toBe(true);
  });
});
