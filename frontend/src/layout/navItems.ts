export interface NavItem {
  label: string;
  path: string;
}

// Order and labels follow the Figma Sidebar / Notion "Version 02".
// Only Home is implemented in this phase.
export const NAV_ITEMS: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "Transactions", path: "/transactions" },
  { label: "Analytics", path: "/analytics" },
  { label: "AI Insights", path: "/ai-insights" },
  { label: "Settings", path: "/settings" },
  { label: "Help", path: "/help" },
];
