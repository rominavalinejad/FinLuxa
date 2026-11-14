import { useId, useMemo, useState } from "react";
import { chevronDownIcon } from "../../../assets";
import { FAQ, HELP_TOPICS, filterFaq, type HelpTopic } from "../../../lib/helpContent";
import SettingsCard from "../../Settings/cards/SettingsCard";
import { SearchIcon } from "../../Transactions/icons";
import { BookOpenIcon } from "../icons";

type TopicFilter = HelpTopic | "all";

const TOPIC_PILLS: { id: TopicFilter; label: string }[] = [{ id: "all", label: "All" }, ...HELP_TOPICS];

/**
 * "Frequently asked questions": search + topic pills + accordion.
 * Search and topic work together (like the Transactions filters). One answer is open at a time.
 * The content lives in lib/helpContent.ts.
 */
export default function FaqCard() {
  const baseId = useId();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<TopicFilter>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useMemo(() => filterFaq(FAQ, query, topic), [query, topic]);

  const searchBox = (
    <label className="relative block h-[32px] w-[260px] rounded-full bg-muted/15">
      <SearchIcon className="absolute left-[14px] top-1/2 size-[14px] -translate-y-1/2 text-muted" />
      <input
        type="search"
        aria-label="Search the help articles"
        placeholder="Search questions..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="size-full rounded-full bg-transparent pl-[38px] pr-[14px] text-[10px] font-normal leading-[normal] outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-brand"
      />
    </label>
  );

  return (
    <SettingsCard title="Frequently asked questions" icon={<BookOpenIcon className="size-[18px]" />} action={searchBox}>
      <div role="group" aria-label="Topic" className="flex flex-wrap gap-[8px] border-b border-[#eef0f3] px-[32px] py-[16px]">
        {TOPIC_PILLS.map((pill) => {
          const selected = topic === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setTopic(pill.id)}
              className={`h-[26px] rounded-full px-[12px] text-[9px] font-semibold leading-[normal] outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                selected ? "bg-sidebar text-white" : "bg-muted/15 text-muted"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        {items.length === 1 ? "1 question found" : `${items.length} questions found`}
      </p>

      {items.length === 0 ? (
        <div className="px-[32px] py-[40px] text-center">
          <p className="text-[12px] font-semibold leading-[normal]">No questions match your search</p>
          <p className="mt-[6px] text-[10px] font-normal leading-[1.6] text-muted">
            Try fewer or different words
            {topic !== "all" ? ", or choose All to search every topic" : ""}.
          </p>
        </div>
      ) : (
        <ul>
          {items.map((item) => {
            const open = openId === item.id;
            const buttonId = `${baseId}-q-${item.id}`;
            const panelId = `${baseId}-a-${item.id}`;
            return (
              <li key={item.id} className="border-b border-[#eef0f3] last:border-b-0">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenId(open ? null : item.id)}
                    className="flex w-full items-center justify-between gap-[16px] px-[32px] py-[17px] text-left text-[11px] font-semibold leading-[normal] outline-none focus-visible:bg-muted/10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                  >
                    {item.question}
                    <img
                      src={chevronDownIcon}
                      alt=""
                      aria-hidden="true"
                      className={`h-[7px] w-[13px] shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!open}
                  className={`grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[640px] px-[32px] pb-[20px] text-[10px] font-normal leading-[1.7] text-ink/70">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SettingsCard>
  );
}
