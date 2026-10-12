import type { SettingsData } from "../../types/settings";

// Demo values taken from the Figma Settings screenshot.
export function getMockSettings(): SettingsData {
  return {
    profile: {
      fullName: "Romina Valinejad",
      email: "rominavalinejad@gmail.com",
      avatarUrl: null,
      memberSince: "2025-10-01",
    },
    preferences: { currency: "IRR", language: "en", appearance: "light" },
    notifications: { budgetAlerts: true },
  };
}
