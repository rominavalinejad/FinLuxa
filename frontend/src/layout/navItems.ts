import {
  navAiInsightsIcon,
  navAnalyticsIcon,
  navHelpIcon,
  navHomeIcon,
  navSettingsIcon,
  navTransactionsIcon,
} from "../assets";

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  /** Icon size in px, taken from the Figma layer size. */
  iconSize: { width: number; height: number };
  /** Space between the icon and the label, from Figma. */
  gap: number;
}

// Order, labels, icon sizes and gaps follow the Figma Sidebar / Notion "Version 02".
// Only Home is implemented in this phase.
export const NAV_ITEMS: NavItem[] = [
  { label: "Home", path: "/", icon: navHomeIcon, iconSize: { width: 19.18, height: 19.94 }, gap: 22 },
  { label: "Transactions", path: "/transactions", icon: navTransactionsIcon, iconSize: { width: 21.55, height: 21.55 }, gap: 20 },
  { label: "Analytics", path: "/analytics", icon: navAnalyticsIcon, iconSize: { width: 18.12, height: 17.92 }, gap: 23 },
  { label: "AI Insights", path: "/ai-insights", icon: navAiInsightsIcon, iconSize: { width: 23.51, height: 22.96 }, gap: 19 },
  { label: "Settings", path: "/settings", icon: navSettingsIcon, iconSize: { width: 19.92, height: 20.58 }, gap: 21 },
  { label: "Help", path: "/help", icon: navHelpIcon, iconSize: { width: 20.07, height: 19.7 }, gap: 22 },
];
