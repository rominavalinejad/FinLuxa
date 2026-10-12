/** Appearance options from Notion: Light, Dark, System Default. */
export type ThemeMode = "light" | "dark" | "system";

export interface ProfileInfo {
  fullName: string;
  email: string;
  /** Uploaded photo (URL), or null -> the default avatar (initial of the name). */
  avatarUrl: string | null;
  /** ISO date (maps to users.created_at). Read-only. */
  memberSince: string;
}

export interface PreferencesSettings {
  /** ISO 4217 code, see lib/currencies.ts. Display only: it does not change any chart logic. */
  currency: string;
  /** ISO 639-1 code, see lib/languages.ts. */
  language: string;
  appearance: ThemeMode;
}

export interface NotificationSettings {
  /** "Get notified when you're close to your budget limits." Real logic is still undefined in Notion. */
  budgetAlerts: boolean;
}

/** Everything the Settings page needs. */
export interface SettingsData {
  profile: ProfileInfo;
  preferences: PreferencesSettings;
  notifications: NotificationSettings;
}

/** The fields the user can change from "Edit Profile". */
export type ProfileUpdate = Pick<ProfileInfo, "fullName" | "email" | "avatarUrl">;
