/**
 * Regenerates raster logos from assets/images/natta_icon.svg:
 * - natta_icon.png — wordmark only, native aspect ratio (no letterboxing)
 * - natta_app_icon.png — 1024² for Expo with solid #E6F4FE (no contrasting bars)
 */
const sharp = require("sharp");
const path = require("path");

const root = path.join(__dirname, "..");
const svgPath = path.join(root, "assets/images/natta_icon.svg");
const BG = { r: 230, g: 244, b: 254, alpha: 1 };

async function main() {
  const logoBuffer = await sharp(svgPath).resize({ width: 1024 }).png().toBuffer();
  await sharp(logoBuffer).toFile(path.join(root, "assets/images/natta_icon.png"));

  const meta = await sharp(logoBuffer).metadata();
  const w = meta.width ?? 1024;
  const h = meta.height ?? 315;

  const square = await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: BG,
    },
  })
    .composite([
      { input: logoBuffer, left: Math.round((1024 - w) / 2), top: Math.round((1024 - h) / 2) },
    ])
    .png()
    .toBuffer();

  await sharp(square).toFile(path.join(root, "assets/images/natta_app_icon.png"));
  console.log("Wrote natta_icon.png (%d×%d) and natta_app_icon.png (1024×1024)", w, h);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
