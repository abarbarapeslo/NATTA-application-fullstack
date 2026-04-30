import { describe, it, expect } from "vitest";

describe("AIpply Mobile App - Component Tests", () => {
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
    
    expect(appConfigContent).toContain('appName: "AIpply"');
    expect(appConfigContent).toContain('appSlug: "aipply-mobile"');
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
    
    // Check feature screens
    expect(fs.existsSync(path.join(__dirname, "../app/writing-hub.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../app/resume-assistant.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../app/design-space.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../app/video-space.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../app/interview-simulator.tsx"))).toBe(true);
  });

  it("should have all UI components created", () => {
    const fs = require("fs");
    const path = require("path");
    
    expect(fs.existsSync(path.join(__dirname, "../components/ui/button.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../components/ui/card.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../components/ui/tag.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../components/ui/icon-symbol.tsx"))).toBe(true);
  });

  it("should have design documentation", () => {
    const fs = require("fs");
    const path = require("path");
    
    expect(fs.existsSync(path.join(__dirname, "../design.md"))).toBe(true);
    expect(fs.existsSync(path.join(__dirname, "../todo.md"))).toBe(true);
  });
});
