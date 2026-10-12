import { useCallback, useEffect, useState } from "react";
import { fetchSettings, saveNotifications, savePreferences, saveProfile } from "../api/settings";
import type {
  NotificationSettings,
  PreferencesSettings,
  ProfileUpdate,
  SettingsData,
} from "../types/settings";

interface State {
  data: SettingsData | null;
  loading: boolean;
  error: string | null;
}

const messageOf = (err: unknown) => (err instanceof Error ? err.message : "Something went wrong.");

export function useSettings() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null });
  /** Error from the last auto-saved change (preferences / notifications). */
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSettings()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((err: Error) => !cancelled && setState({ data: null, loading: false, error: err.message }));
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = useCallback((change: (data: SettingsData) => SettingsData) => {
    setState((prev) => (prev.data ? { ...prev, data: change(prev.data) } : prev));
  }, []);

  /** Throws on failure so the Profile card can stay in edit mode and show the message. */
  const updateProfile = useCallback(
    async (update: ProfileUpdate) => {
      const saved = await saveProfile(update);
      patch((data) => ({ ...data, profile: { ...data.profile, ...saved } }));
    },
    [patch],
  );

  /** Preferences apply as soon as they change (there is no Save button in Figma). */
  const updatePreferences = useCallback(
    async (update: Partial<PreferencesSettings>) => {
      setActionError(null);
      try {
        const saved = await savePreferences(update);
        patch((data) => ({ ...data, preferences: { ...data.preferences, ...saved } }));
      } catch (err) {
        setActionError(messageOf(err));
      }
    },
    [patch],
  );

  const updateNotifications = useCallback(
    async (update: Partial<NotificationSettings>) => {
      setActionError(null);
      try {
        const saved = await saveNotifications(update);
        patch((data) => ({ ...data, notifications: { ...data.notifications, ...saved } }));
      } catch (err) {
        setActionError(messageOf(err));
      }
    },
    [patch],
  );

  return { ...state, actionError, updateProfile, updatePreferences, updateNotifications };
}
