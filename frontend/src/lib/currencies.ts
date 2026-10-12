export interface Currency {
  /** ISO 4217 code */
  code: string;
  name: string;
  /** Short name shown in the Settings dropdown ("IRR - Rial"). Falls back to `name`. */
  shortName: string;
  symbol: string;
  /** Minor-unit digits (ISO 4217) */
  decimals: number;
}

// Source: Notion > Settings Page > "فهرست واحد های پولی FinLuxa" (code, English name, symbol, decimals).
// [code, name, symbol, decimals]
const ROWS: [string, string, string, number][] = [
  // International
  ["USD", "US Dollar", "$", 2],
  ["EUR", "Euro", "€", 2],
  ["GBP", "Pound Sterling", "£", 2],
  ["CHF", "Swiss Franc", "CHF", 2],
  ["JPY", "Japanese Yen", "¥", 0],
  ["CNY", "Chinese Yuan", "CN¥", 2],
  ["CAD", "Canadian Dollar", "CA$", 2],
  ["AUD", "Australian Dollar", "A$", 2],
  ["NZD", "New Zealand Dollar", "NZ$", 2],
  ["SGD", "Singapore Dollar", "S$", 2],
  ["HKD", "Hong Kong Dollar", "HK$", 2],
  ["KRW", "South Korean Won", "₩", 0],
  // Middle East and Asia
  ["IRR", "Iranian Rial", "﷼", 2],
  ["AED", "UAE Dirham", "د.إ", 2],
  ["SAR", "Saudi Riyal", "﷼", 2],
  ["QAR", "Qatari Riyal", "ر.ق", 2],
  ["KWD", "Kuwaiti Dinar", "د.ك", 3],
  ["BHD", "Bahraini Dinar", "د.ب", 3],
  ["OMR", "Omani Rial", "ر.ع.", 3],
  ["JOD", "Jordanian Dinar", "د.ا", 3],
  ["TRY", "Turkish Lira", "₺", 2],
  ["INR", "Indian Rupee", "₹", 2],
  ["PKR", "Pakistani Rupee", "₨", 2],
  ["BDT", "Bangladeshi Taka", "৳", 2],
  ["THB", "Thai Baht", "฿", 2],
  ["IDR", "Indonesian Rupiah", "Rp", 2],
  ["MYR", "Malaysian Ringgit", "RM", 2],
  ["PHP", "Philippine Peso", "₱", 2],
  ["VND", "Vietnamese Dong", "₫", 0],
  // Europe, Africa and the Americas
  ["SEK", "Swedish Krona", "kr", 2],
  ["NOK", "Norwegian Krone", "kr", 2],
  ["DKK", "Danish Krone", "kr", 2],
  ["PLN", "Polish Złoty", "zł", 2],
  ["CZK", "Czech Koruna", "Kč", 2],
  ["HUF", "Hungarian Forint", "Ft", 2],
  ["RON", "Romanian Leu", "lei", 2],
  ["RUB", "Russian Ruble", "₽", 2],
  ["UAH", "Ukrainian Hryvnia", "₴", 2],
  ["ILS", "Israeli New Shekel", "₪", 2],
  ["ZAR", "South African Rand", "R", 2],
  ["EGP", "Egyptian Pound", "E£", 2],
  ["NGN", "Nigerian Naira", "₦", 2],
  ["KES", "Kenyan Shilling", "KSh", 2],
  ["MAD", "Moroccan Dirham", "د.م.", 2],
  ["BRL", "Brazilian Real", "R$", 2],
  ["MXN", "Mexican Peso", "MX$", 2],
  ["ARS", "Argentine Peso", "AR$", 2],
  ["CLP", "Chilean Peso", "CLP$", 0],
  ["COP", "Colombian Peso", "COL$", 2],
  ["ISK", "Icelandic Króna", "kr", 0],
  ["TWD", "New Taiwan Dollar", "NT$", 2],
  ["DZD", "Algerian Dinar", "د.ج", 2],
  ["AFN", "Afghan Afghani", "؋", 2],
];

// Short display names, only defined where the owner has decided them (the Notion list has full names only).
const SHORT_NAMES: Record<string, string> = { IRR: "Rial" };

export const CURRENCIES: Currency[] = ROWS.map(([code, name, symbol, decimals]) => ({
  code,
  name,
  shortName: SHORT_NAMES[code] ?? name,
  symbol,
  decimals,
}));
