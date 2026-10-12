import { budgetAlertsIcon } from "../../../assets";
import { BellIcon } from "../../../components/icons";
import MaskIcon from "../../../components/MaskIcon";
import type { NotificationSettings } from "../../../types/settings";
import { Switch } from "../controls";
import SettingsCard from "./SettingsCard";

interface NotificationCardProps {
  notifications: NotificationSettings;
  onChange: (update: Partial<NotificationSettings>) => void;
}

/**
 * Figma "Notification" card. Notion: the notification system's logic "will be explained in the future",
 * so this only stores the Budget alerts switch.
 */
export default function NotificationCard({ notifications, onChange }: NotificationCardProps) {
  return (
    <SettingsCard title="Notification" icon={<BellIcon className="size-[18px]" />}>
      <div className="flex h-[79px] items-center justify-between pl-[36px] pr-[25px]">
        <div className="flex items-start gap-[15px]">
          {/* Single-colour SVG from Figma, painted with the text colour */}
          <span className="shrink-0 text-ink">
            <MaskIcon src={budgetAlertsIcon} width={31} height={31} />
          </span>
          <div>
            <h3 className="text-[15px] font-normal leading-[normal]">Budget alerts</h3>
            <p className="mt-[2px] text-[10px] font-normal leading-[normal] text-muted">
              Get notified when you’re close to your budget limits.
            </p>
          </div>
        </div>
        <Switch
          label="Budget alerts"
          checked={notifications.budgetAlerts}
          onChange={(budgetAlerts) => onChange({ budgetAlerts })}
        />
      </div>
    </SettingsCard>
  );
}
