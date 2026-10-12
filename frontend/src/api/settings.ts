import type {
  NotificationSettings,
  PreferencesSettings,
  ProfileUpdate,
  SettingsData,
} from "../types/settings";
import { USE_MOCK, apiGet } from "./client";
import { getMockSettings } from "./mock/settingsMock";

/**
 * Single entry point for Settings data.
 * None of these endpoints exist yet in api/main.py (and the DB has no columns for the preferences),
 * so the paths below are placeholders and only the mock mode works. In mock mode the "save"
 * functions just echo their input back.
 */
const NOT_READY = "Settings endpoints are not implemented in the backend yet.";

export async function fetchSettings(): Promise<SettingsData> {
  if (USE_MOCK) return getMockSettings();
  return apiGet<SettingsData>("/settings");
}

export async function saveProfile(update: ProfileUpdate): Promise<ProfileUpdate> {
  if (USE_MOCK) return update;
  throw new Error(NOT_READY);
}

export async function savePreferences(update: Partial<PreferencesSettings>): Promise<Partial<PreferencesSettings>> {
  if (USE_MOCK) return update;
  throw new Error(NOT_READY);
}

export async function saveNotifications(update: Partial<NotificationSettings>): Promise<Partial<NotificationSettings>> {
  if (USE_MOCK) return update;
  throw new Error(NOT_READY);
}
