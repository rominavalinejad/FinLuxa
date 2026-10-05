import {
  budgetEntertainmentIcon,
  budgetFoodIcon,
  budgetHousingIcon,
  budgetTransportIcon,
} from "../../../assets";

export interface CategoryStyle {
  /** Progress-bar fill colour. */
  color: string;
  /** Round category icon, or null when none is designed. */
  icon: string | null;
}

// Colours and icons exist in Figma only for these categories.
// PENDING: how custom / other categories get a colour + icon (to be decided later).
const STYLES: Record<string, CategoryStyle> = {
  food: { color: "#ea7a25", icon: budgetFoodIcon },
  housing: { color: "#25c6ea", icon: budgetHousingIcon },
  transport: { color: "#ead325", icon: budgetTransportIcon },
  entertainment: { color: "#ea25af", icon: budgetEntertainmentIcon },
};

const FALLBACK: CategoryStyle = { color: "#939393", icon: null };

export function getCategoryStyle(categoryId: string): CategoryStyle {
  return STYLES[categoryId] ?? FALLBACK;
}
