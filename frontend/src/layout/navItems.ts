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
}

// Order, labels and icon sizes follow the Figma Sidebar / Notion "Version 02".
// Only Home is implemented in this phase.
export const NAV_ITEMS: NavItem[] = [
  { label: "Home", path: "/", icon: navHomeIcon, iconSize: { width: 19.2, height: 19.9 } },
  { label: "Transactions", path: "/transactions", icon: navTransactionsIcon, iconSize: { width: 21.6, height: 21.6 } },
  { label: "Analytics", path: "/analytics", icon: navAnalyticsIcon, iconSize: { width: 18.1, height: 17.9 } },
  { label: "AI Insights", path: "/ai-insights", icon: navAiInsightsIcon, iconSize: { width: 23.5, height: 23.0 } },
  { label: "Settings", path: "/settings", icon: navSettingsIcon, iconSize: { width: 19.9, height: 20.6 } },
  { label: "Help", path: "/help", icon: navHelpIcon, iconSize: { width: 20.1, height: 19.7 } },
];
