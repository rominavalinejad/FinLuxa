import type { ComponentType } from "react";
import { chevronDownIcon } from "../../assets";
import type { IconProps } from "../../components/icons";

/** Pill-shaped dropdown (Currency / Language). Native <select> for now: Figma has no open-state design. */
export interface SelectOption {
  value: string;
  label: string;
}

interface SelectPillProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export function SelectPill({ label, value, options, onChange }: SelectPillProps) {
  return (
    <div className="relative w-[276px]">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[33px] w-full cursor-pointer appearance-none truncate rounded-full bg-muted/20 pl-[20px] pr-[44px] text-[12px] font-medium leading-[normal] outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <img
        src={chevronDownIcon}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-[19px] top-1/2 h-[7px] w-[13px] -translate-y-1/2"
      />
    </div>
  );
}

/** One option of the Light / Dark / System group; the selected one is lavender with a purple border. */
interface ChoicePillProps {
  label: string;
  icon: ComponentType<IconProps>;
  selected: boolean;
  onSelect: () => void;
}

export function ChoicePill({ label, icon: Icon, selected, onSelect }: ChoicePillProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex h-[32px] w-[85px] items-center justify-center gap-[6px] rounded-full border text-[11px] font-medium leading-[normal] outline-none focus-visible:ring-2 focus-visible:ring-netflow ${
        selected ? "border-netflow bg-netflow/15" : "border-transparent bg-muted/20"
      }`}
    >
      <Icon className="size-[14px]" />
      {label}
    </button>
  );
}

interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** 60 x 24 toggle, brand green when on. */
export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[24px] w-[60px] shrink-0 rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand ${
        checked ? "bg-brand" : "bg-muted/40"
      }`}
    >
      <span
        className={`absolute top-[3px] block size-[18px] rounded-full bg-white shadow transition-[left] ${
          checked ? "left-[39px]" : "left-[3px]"
        }`}
      />
    </button>
  );
}
