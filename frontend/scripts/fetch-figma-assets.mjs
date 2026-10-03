/**
 * Exports the static assets used by the layout from the FinLuxa Figma file (read-only).
 *
 *   PowerShell:  $env:FIGMA_TOKEN="<token>"; npm.cmd run assets:figma
 *   macOS/Linux: FIGMA_TOKEN=<token> npm run assets:figma
 *
 * Token: Figma > Settings > Security > Personal access tokens, scope "File content: Read-only".
 * Files are written to src/assets/ and should be committed.
 *
 * All assets are exported as SVG. One failed asset does not stop the others; failures are listed at the end.
 * If a layer is replaced in Figma its node id changes: update the id below (see the layer in Dev Mode).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FILE_KEY = "VewJNFHHOQgv01dY22Tlq4";

// id = Figma node id, file = path under src/assets
const SVG_ASSETS = [
  { id: "97:14", file: "finluxa-logo.svg" }, // Sidebar: FinLuxa Logo
  { id: "15:78", file: "icons/nav-home.svg" }, // Home Icon
  { id: "46:21", file: "icons/nav-transactions.svg" }, // Transactions Icon
  { id: "15:73", file: "icons/nav-analytics.svg" }, // Analytics icon
  { id: "15:68", file: "icons/nav-ai-insights.svg" }, // AI Insights Icon
  { id: "15:83", file: "icons/nav-settings.svg" }, // Settings Icon
  { id: "15:88", file: "icons/nav-help.svg" }, // Help Icon
  { id: "69:17", file: "icons/heart.svg" }, // Header: Heart Icon
  { id: "46:43", file: "icons/date.svg" }, // Header: Date Icon
  { id: "46:49", file: "icons/chevron-down.svg" }, // Header: Date Selector chevron
  { id: "46:27", file: "icons/profile-menu.svg" }, // Header: Profile Menu
  { id: "58:160", file: "icons/notification-button.svg" }, // Header: Notification Button
];

const token = process.env.FIGMA_TOKEN;
if (!token) {
  console.error("Missing FIGMA_TOKEN environment variable (see the header of this script).");
  process.exit(1);
}

const assetsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "assets");

async function figmaApi(pathAndQuery) {
  const response = await fetch(`https://api.figma.com${pathAndQuery}`, { headers: { "X-Figma-Token": token } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.err) {
    throw new Error(`Figma API ${response.status}: ${body.err ?? body.message ?? response.statusText}`);
  }
  return body;
}

async function saveFromUrl(file, url) {
  const download = await fetch(url);
  if (!download.ok) throw new Error(`download failed (${download.status})`);
  const target = path.join(assetsRoot, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await download.arrayBuffer()));
}

const failures = [];

const ids = SVG_ASSETS.map((a) => a.id).join(",");
const exported = await figmaApi(`/v1/images/${FILE_KEY}?ids=${encodeURIComponent(ids)}&format=svg`);
for (const asset of SVG_ASSETS) {
  try {
    const url = exported.images?.[asset.id];
    if (!url) throw new Error(`Figma returned no render for node ${asset.id}`);
    await saveFromUrl(asset.file, url);
    console.log(`✓ ${asset.file}`);
  } catch (error) {
    failures.push(`${asset.file}: ${error.message}`);
    console.error(`✗ ${asset.file}`);
  }
}

if (failures.length > 0) {
  console.error("\nSome assets failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("Done.");
