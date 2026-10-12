export interface Language {
  /** ISO 639-1 code */
  code: string;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
}

// Source: Notion > Settings Page > "فهرست زبان‌های قابل انتخاب".
// The Notion table lists Persian (fa) twice; it appears once here.
// [code, English name, native name, direction]
const ROWS: [string, string, string, "ltr" | "rtl"][] = [
  ["en", "English", "English", "ltr"],
  ["zh", "Chinese", "中文", "ltr"],
  ["es", "Spanish", "Español", "ltr"],
  ["ar", "Arabic", "العربية", "rtl"],
  ["fr", "French", "Français", "ltr"],
  ["de", "German", "Deutsch", "ltr"],
  ["pt", "Portuguese", "Português", "ltr"],
  ["ru", "Russian", "Русский", "ltr"],
  ["ja", "Japanese", "日本語", "ltr"],
  ["hi", "Hindi", "हिन्दी", "ltr"],
  ["fa", "Persian", "فارسی", "rtl"],
  ["ur", "Urdu", "اردو", "rtl"],
  ["bn", "Bengali", "বাংলা", "ltr"],
  ["id", "Indonesian", "Bahasa Indonesia", "ltr"],
  ["ko", "Korean", "한국어", "ltr"],
  ["it", "Italian", "Italiano", "ltr"],
  ["nl", "Dutch", "Nederlands", "ltr"],
  ["tr", "Turkish", "Türkçe", "ltr"],
  ["pl", "Polish", "Polski", "ltr"],
  ["uk", "Ukrainian", "Українська", "ltr"],
  ["sv", "Swedish", "Svenska", "ltr"],
  ["no", "Norwegian", "Norsk", "ltr"],
  ["da", "Danish", "Dansk", "ltr"],
  ["fi", "Finnish", "Suomi", "ltr"],
  ["el", "Greek", "Ελληνικά", "ltr"],
  ["cs", "Czech", "Čeština", "ltr"],
  ["ro", "Romanian", "Română", "ltr"],
  ["hu", "Hungarian", "Magyar", "ltr"],
  ["he", "Hebrew", "עברית", "rtl"],
  ["th", "Thai", "ไทย", "ltr"],
  ["vi", "Vietnamese", "Tiếng Việt", "ltr"],
  ["ms", "Malay", "Bahasa Melayu", "ltr"],
  ["sw", "Swahili", "Kiswahili", "ltr"],
  ["ta", "Tamil", "தமிழ்", "ltr"],
  ["te", "Telugu", "తెలుగు", "ltr"],
  ["mr", "Marathi", "मराठी", "ltr"],
  ["ps", "Pashto", "پښتو", "rtl"],
  ["uz", "Uzbek", "Oʻzbekcha", "ltr"],
  ["az", "Azerbaijani", "Azərbaycanca", "ltr"],
  ["sr", "Serbian", "Српски", "ltr"],
  ["hr", "Croatian", "Hrvatski", "ltr"],
  ["bg", "Bulgarian", "Български", "ltr"],
  ["sk", "Slovak", "Slovenčina", "ltr"],
  ["am", "Amharic", "አማርኛ", "ltr"],
  ["km", "Khmer", "ភាសាខ្មែរ", "ltr"],
];

export const LANGUAGES: Language[] = ROWS.map(([code, name, nativeName, dir]) => ({ code, name, nativeName, dir }));
