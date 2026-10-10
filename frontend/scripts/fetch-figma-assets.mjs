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

  // Current Balance card
  { id: "54:528", file: "cards/current-balance/card.svg" },
  { id: "69:29", file: "cards/current-balance/wallet.svg" },
  { id: "69:23", file: "cards/current-balance/starting-balance-bg.svg" },
  { id: "48:95", file: "cards/current-balance/starting-balance-icon.svg" },
  { id: "48:75", file: "cards/current-balance/trend-up.svg" },
  { id: "54:535", file: "cards/current-balance/chevron-right.svg" },

  // Cash Flow card
  { id: "52:424", file: "cards/cash-flow/card.svg" },
  { id: "53:495", file: "cards/cash-flow/divider.svg" },
  { id: "69:42", file: "cards/cash-flow/icon.svg" },
  { id: "52:437", file: "cards/cash-flow/income-bg.svg" },
  { id: "69:45", file: "cards/cash-flow/income-icon.svg" },
  { id: "52:453", file: "cards/cash-flow/expense-bg.svg" },
  { id: "69:46", file: "cards/cash-flow/expense-icon.svg" },
  { id: "53:497", file: "cards/cash-flow/net-flow-bg.svg" },
  { id: "69:47", file: "cards/cash-flow/net-flow-icon.svg" },

  // Budget Overview card
  { id: "58:3", file: "cards/budget/card.svg" },
  { id: "70:56", file: "cards/budget/icon.svg" },
  { id: "70:66", file: "cards/budget/food.svg" },
  { id: "70:70", file: "cards/budget/housing.svg" },
  { id: "70:73", file: "cards/budget/transport.svg" },
  { id: "70:76", file: "cards/budget/entertainment.svg" },

  // Spending by Category card
  { id: "62:31", file: "cards/spending/card.svg" },
  { id: "61:21", file: "cards/spending/icon-bg.svg" },
  { id: "69:35", file: "cards/spending/icon.svg" },

  // Saving Goal card
  { id: "54:541", file: "cards/saving-goal/card.svg" },
  { id: "54:549", file: "cards/saving-goal/icon-bg.svg" },
  { id: "70:50", file: "cards/saving-goal/icon.svg" },
  { id: "70:49", file: "cards/saving-goal/more.svg" },
  { id: "54:607", file: "cards/saving-goal/status-card.svg" },
  { id: "70:52", file: "cards/saving-goal/light-icon.svg" },

  // AI Insight card
  { id: "54:537", file: "cards/ai-insight/card.svg" },
  { id: "70:79", file: "cards/ai-insight/icon.svg" },
  { id: "70:82", file: "cards/ai-insight/illustration.svg" },
  { id: "102:6", file: "cards/ai-insight/button-bg.svg" },
  { id: "55:149", file: "cards/ai-insight/arrow-right.svg" },

  // Monthly Overview card
  { id: "62:146", file: "cards/monthly-overview/card.svg" },
  { id: "69:20", file: "cards/monthly-overview/icon.svg" },

  // Small steps card
  { id: "58:180", file: "cards/small-steps/card.svg" },
  { id: "59:6895", file: "cards/small-steps/illustration.svg" },
  { id: "60:7347", file: "cards/small-steps/button-bg.svg" },
  { id: "60:7348", file: "cards/small-steps/arrow-right.svg" },
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
  if (response.status === 429) {
    // Figma's REST API has plan-based quotas (very low on the Starter plan). Every failed run counts, so do not retry early.
    const retryAfter = Number(response.headers.get("retry-after"));
    const wait = Number.isFinite(retryAfter) && retryAfter > 0
      ? `Retry after about ${(retryAfter / 3600).toFixed(1)} hours (${(retryAfter / 86400).toFixed(1)} days).`
      : "Figma did not say when the limit resets.";
    const details = ["x-figma-plan-tier", "x-figma-rate-limit-type", "x-figma-upgrade-link"]
      .map((name) => (response.headers.get(name) ? `  ${name}: ${response.headers.get(name)}` : null))
      .filter(Boolean)
      .join("\n");
    throw new Error(`Figma API rate limit exceeded (429). ${wait}\nDo not re-run before that.${details ? `\n${details}` : ""}`);
  }
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
