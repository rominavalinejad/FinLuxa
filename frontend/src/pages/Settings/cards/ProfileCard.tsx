import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { CalendarIcon, MailIcon, PencilIcon, SquarePenIcon, UserIcon } from "../../../components/icons";
import { formatPeriod } from "../../../lib/date";
import type { ProfileInfo, ProfileUpdate } from "../../../types/settings";
import SettingsCard from "./SettingsCard";

interface Draft {
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

interface Errors {
  fullName?: string;
  email?: string;
  form?: string;
}

// Same rule as validate_email in repositories.py.
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function validate(draft: Draft): Errors {
  const errors: Errors = {};
  if (!draft.fullName.trim()) errors.fullName = "Full name cannot be empty.";
  if (!EMAIL_PATTERN.test(draft.email.trim())) errors.email = "Enter a valid email address.";
  return errors;
}

/** "2025-10-01" -> "October 2025" */
function formatMemberSince(iso: string): string {
  const date = new Date(iso);
  return formatPeriod({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 });
}

function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-[20px]">
      <span className="mt-[2px] shrink-0 text-ink">{icon}</span>
      <div className="min-w-0">
        <p className="text-[15px] font-normal leading-[normal]">{label}</p>
        {children}
      </div>
    </div>
  );
}

const VALUE_CLASS = "mt-[2px] text-[10px] font-normal leading-[normal] text-muted";
// Edit state is not designed in Figma: plain bordered inputs for now.
const INPUT_CLASS =
  "mt-[4px] h-[26px] w-[220px] rounded-[6px] border border-muted/40 bg-white px-[8px] text-[12px] leading-[normal] outline-none focus:border-brand";
const ERROR_CLASS = "mt-[2px] text-[10px] leading-[normal] text-expense";

interface ProfileCardProps {
  profile: ProfileInfo;
  onSave: (update: ProfileUpdate) => Promise<void>;
}

/**
 * Figma "Profile Information" card. Notion logic: "Edit Profile" makes Full Name and Email editable and
 * shows the pencil on the avatar (upload / change photo); clicking the button again saves. Member Since is read-only.
 */
export default function ProfileCard({ profile, onSave }: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    fullName: profile.fullName,
    email: profile.email,
    avatarUrl: profile.avatarUrl,
  });
  const [errors, setErrors] = useState<Errors>({});
  const fileInput = useRef<HTMLInputElement>(null);

  const avatarUrl = editing ? draft.avatarUrl : profile.avatarUrl;
  const initial = profile.fullName.trim().charAt(0).toUpperCase();

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    // Local preview only. The real upload must send the file bytes (users.profile_picture) once the endpoint exists.
    setDraft((prev) => ({ ...prev, avatarUrl: URL.createObjectURL(file) }));
  }

  async function handleToggle() {
    if (!editing) {
      setDraft({ fullName: profile.fullName, email: profile.email, avatarUrl: profile.avatarUrl });
      setErrors({});
      setEditing(true);
      return;
    }
    const found = validate(draft);
    if (found.fullName || found.email) {
      setErrors(found);
      return;
    }
    setSaving(true);
    try {
      await onSave({ fullName: draft.fullName.trim(), email: draft.email.trim(), avatarUrl: draft.avatarUrl });
      setErrors({});
      setEditing(false);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Could not save your profile." });
    } finally {
      setSaving(false);
    }
  }

  const editButton = (
    <button
      type="button"
      onClick={handleToggle}
      disabled={saving}
      className="flex h-[32px] items-center gap-[6px] rounded-[6px] bg-muted/20 px-[12px] text-[10px] font-medium leading-[normal] outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60"
    >
      <SquarePenIcon className="size-[14px]" />
      Edit Profile
    </button>
  );

  return (
    <SettingsCard title="Profile Information" icon={<UserIcon className="size-[18px]" />} action={editButton}>
      <div className="grid h-[206px] grid-cols-2">
        {/* Left: avatar + name + email (always the saved values) */}
        <div className="flex items-center gap-[36px] pl-[68px]">
          <div className="relative size-[125px] shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile photo" className="size-full rounded-full object-cover" />
            ) : (
              // Default avatar (Notion: "needs a default navigation") = initial on the brand purple.
              <span
                aria-hidden="true"
                className="flex size-full items-center justify-center rounded-full bg-netflow text-[56px] font-semibold leading-none text-white"
              >
                {initial}
              </span>
            )}
            {editing && (
              <>
                <button
                  type="button"
                  aria-label="Change profile photo"
                  onClick={() => fileInput.current?.click()}
                  className="absolute -right-[8px] bottom-[12px] flex size-[32px] items-center justify-center rounded-full bg-white text-netflow shadow-[2.96px_1.95px_6.922px_-2.786px_rgba(0,0,0,0.3)] outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <PencilIcon className="size-[14px]" />
                </button>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handlePhoto}
                />
              </>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[18px] font-semibold leading-[normal]">{profile.fullName}</p>
            <p className="mt-[4px] truncate text-[15px] font-normal leading-[normal] text-muted">{profile.email}</p>
          </div>
        </div>

        {/* Right: details (divider on the left) */}
        <div className="my-[28px] flex flex-col justify-center gap-[24px] border-l border-muted/20 pl-[93px]">
          <InfoRow icon={<UserIcon className="size-[23px]" />} label="Full Name">
            {editing ? (
              <>
                <input
                  aria-label="Full name"
                  value={draft.fullName}
                  onChange={(event) => setDraft((prev) => ({ ...prev, fullName: event.target.value }))}
                  className={INPUT_CLASS}
                />
                {errors.fullName && <p className={ERROR_CLASS}>{errors.fullName}</p>}
              </>
            ) : (
              <p className={VALUE_CLASS}>{profile.fullName}</p>
            )}
          </InfoRow>

          <InfoRow icon={<MailIcon className="size-[23px]" />} label="Email">
            {editing ? (
              <>
                <input
                  type="email"
                  aria-label="Email"
                  value={draft.email}
                  onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
                  className={INPUT_CLASS}
                />
                {errors.email && <p className={ERROR_CLASS}>{errors.email}</p>}
              </>
            ) : (
              <p className={VALUE_CLASS}>{profile.email}</p>
            )}
          </InfoRow>

          <InfoRow icon={<CalendarIcon className="size-[23px]" />} label="Member Since">
            <p className={VALUE_CLASS}>{formatMemberSince(profile.memberSince)}</p>
          </InfoRow>

          {errors.form && (
            <p role="alert" className={ERROR_CLASS}>
              {errors.form}
            </p>
          )}
        </div>
      </div>
    </SettingsCard>
  );
}
