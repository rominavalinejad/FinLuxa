import type { ComponentType, ReactNode } from "react";
import { navSettingsIcon } from "../../../assets";
import { GlobeIcon, LanguagesIcon, MonitorIcon, MoonIcon, PaletteIcon, SunIcon, type IconProps } from "../../../components/icons";
import MaskIcon from "../../../components/MaskIcon";
import { CURRENCIES } from "../../../lib/currencies";
import { LANGUAGES } from "../../../lib/languages";
import type { PreferencesSettings, ThemeMode } from "../../../types/settings";
import { ChoicePill, SelectPill } from "../controls";
import SettingsCard from "./SettingsCard";

const CURRENCY_OPTIONS = CURRENCIES.map((currency) => ({
  value: currency.code,
  label: `${currency.code} - ${currency.shortName}`,
}));

// English names in the dropdown (decided by the owner).
const LANGUAGE_OPTIONS = LANGUAGES.map((language) => ({ value: language.code, label: language.name }));

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: ComponentType<IconProps> }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
];

interface ColumnProps {
  icon: ReactNode;
  title: string;
  description: string;
  /** Left padding of the icon + title block and of the control (measured separately in the screenshot). */
  headerLeft: number;
  controlLeft: number;
  /** Draws the vertical divider on the left edge. */
  divider?: boolean;
  children: ReactNode;
}

function PreferenceColumn({ icon, title, description, headerLeft, controlLeft, divider, children }: ColumnProps) {
  return (
    <div className="relative pt-[17px]">
      {divider && <span aria-hidden="true" className="absolute left-0 top-[8px] h-[124px] w-px bg-muted/20" />}
      <div className="flex h-[40px] items-start gap-[15px]" style={{ paddingLeft: headerLeft }}>
        <span className="shrink-0 text-ink">{icon}</span>
        <div>
          <h3 className="text-[15px] font-normal leading-[normal]">{title}</h3>
          <p className="mt-[2px] whitespace-nowrap text-[10px] font-normal leading-[normal] text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-[28px]" style={{ paddingLeft: controlLeft }}>
        {children}
      </div>
    </div>
  );
}

interface PreferencesCardProps {
  preferences: PreferencesSettings;
  onChange: (update: Partial<PreferencesSettings>) => void;
}

/**
 * Figma "Preferences" card: Currency / Language / Appearance in three columns.
 * Currency only changes how amounts are labelled (no effect on chart logic, per Notion).
 * NOTE: for now the choices are only stored; applying them app-wide (formatAmount, i18n, dark theme) is not built yet.
 */
export default function PreferencesCard({ preferences, onChange }: PreferencesCardProps) {
  return (
    <SettingsCard title="Preferences" icon={<MaskIcon src={navSettingsIcon} width={18} height={18} />}>
      <div className="grid h-[156px] grid-cols-[324px_356px_1fr]">
        <PreferenceColumn
          icon={<GlobeIcon className="size-[32px]" />}
          title="Currency"
          description="Your default currency for all transactions."
          headerLeft={36}
          controlLeft={32}
        >
          <SelectPill
            label="Currency"
            value={preferences.currency}
            options={CURRENCY_OPTIONS}
            onChange={(currency) => onChange({ currency })}
          />
        </PreferenceColumn>

        <PreferenceColumn
          icon={<LanguagesIcon className="size-[32px]" />}
          title="Language"
          description="Choose your preferred language."
          headerLeft={63}
          controlLeft={43}
          divider
        >
          <SelectPill
            label="Language"
            value={preferences.language}
            options={LANGUAGE_OPTIONS}
            onChange={(language) => onChange({ language })}
          />
        </PreferenceColumn>

        <PreferenceColumn
          icon={<PaletteIcon className="size-[32px]" />}
          title="Appearance"
          description="Choose your theme preference."
          headerLeft={43}
          controlLeft={24}
          divider
        >
          <div role="radiogroup" aria-label="Appearance" className="flex gap-[8px]">
            {THEME_OPTIONS.map((option) => (
              <ChoicePill
                key={option.value}
                label={option.label}
                icon={option.icon}
                selected={preferences.appearance === option.value}
                onSelect={() => onChange({ appearance: option.value })}
              />
            ))}
          </div>
        </PreferenceColumn>
      </div>
    </SettingsCard>
  );
}
