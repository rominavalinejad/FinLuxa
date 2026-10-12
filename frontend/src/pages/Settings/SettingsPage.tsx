import { useSettings } from "../../hooks/useSettings";
import NotificationCard from "./cards/NotificationCard";
import PreferencesCard from "./cards/PreferencesCard";
import ProfileCard from "./cards/ProfileCard";

/**
 * Figma Settings frame: three full-width cards (1002px) stacked under the Header.
 * Vertical offsets are measured from the screenshot (Figma access was not available), about +-2px:
 * first card starts 160px from the top (24px lower than on Home), gaps of 29px and 19px between cards.
 */
export default function SettingsPage() {
  const { data, loading, error, actionError, updateProfile, updatePreferences, updateNotifications } = useSettings();

  if (error) return <p role="alert">{error}</p>;
  if (loading && !data) return <p>Loading…</p>;
  if (!data) return null;

  return (
    <div className="pt-[24px]">
      <ProfileCard profile={data.profile} onSave={updateProfile} />
      <div className="mt-[29px]">
        <PreferencesCard preferences={data.preferences} onChange={updatePreferences} />
      </div>
      <div className="mt-[19px]">
        <NotificationCard notifications={data.notifications} onChange={updateNotifications} />
      </div>
      {actionError && (
        <p role="alert" className="mt-[12px] text-[10px] text-expense">
          {actionError}
        </p>
      )}
    </div>
  );
}
