/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSettings } from "../types";

export interface ThemeColors {
  bg: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentHover: string;
  accentMuted: string;
  cardBg: string;
  tagBg: string;
  navBg: string;
}

export const THEME_PALETTES: Record<string, ThemeColors> = {
  scholar: {
    bg: "bg-[#0B132B]", // Dark academic deep navy
    surface: "bg-[#1C2541]", // Secondary slate navy
    border: "border-[#3A506B]/40",
    textPrimary: "text-[#FCFDFE]", // Clean white-grey
    textSecondary: "text-[#8594A6]",
    accent: "text-[#E0A96D]", // Dull gold
    accentHover: "hover:bg-[#E0A96D]/15",
    accentMuted: "bg-[#E0A96D]/10",
    cardBg: "bg-[#1C2541]",
    tagBg: "bg-[#3A506B]/30",
    navBg: "bg-[#090D1A]"
  },
  sepia: {
    bg: "bg-[#F4ECD8]", // Warm paper background
    surface: "bg-[#EFE5CD]", // Warm cards
    border: "border-[#D6C4A3]",
    textPrimary: "text-[#433422]", // Rich dark brown
    textSecondary: "text-[#705F49]",
    accent: "text-[#8F5B1E]", // Warm amber accent
    accentHover: "hover:bg-[#8F5B1E]/15",
    accentMuted: "bg-[#8F5B1E]/10",
    cardBg: "bg-[#EFE5CD]",
    tagBg: "bg-[#E3D6B5]",
    navBg: "bg-[#EBDDBB]"
  },
  clean: {
    bg: "bg-[#F8FAFC]", // Clean off-white
    surface: "bg-[#FFFFFF]", // Pure white cards
    border: "border-[#E2E8F0]",
    textPrimary: "text-[#0F172A]", // Deep charcoal
    textSecondary: "text-[#64748B]",
    accent: "text-[#0F172A]", // High luxury dark accents
    accentHover: "hover:bg-slate-200",
    accentMuted: "bg-slate-100",
    cardBg: "bg-[#FFFFFF]",
    tagBg: "bg-slate-100",
    navBg: "bg-[#FFFFFF]"
  },
  night: {
    bg: "bg-[#090D16]", // True night deep black
    surface: "bg-[#111827]", // Cozy charcoal cells
    border: "border-[#374151]/40",
    textPrimary: "text-[#F3F4F6]",
    textSecondary: "text-[#9CA3AF]",
    accent: "text-[#60A5FA]", // Muted blue
    accentHover: "hover:bg-[#60A5FA]/15",
    accentMuted: "bg-[#60A5FA]/10",
    cardBg: "bg-[#111827]",
    tagBg: "bg-slate-800/40",
    navBg: "bg-[#030712]"
  },
  forest: {
    bg: "bg-[#141E1B]", // High-level focus deep dark forest green
    surface: "bg-[#1E2E2A]",
    border: "border-[#2D453E]/40",
    textPrimary: "text-[#ECECE2]", // Dull cream
    textSecondary: "text-[#95A5A1]",
    accent: "text-[#D2B48C]", // Soft khaki / earth tan
    accentHover: "hover:bg-[#D2B48C]/15",
    accentMuted: "bg-[#D2B48C]/10",
    cardBg: "bg-[#1E2E2A]",
    tagBg: "bg-[#253934]",
    navBg: "bg-[#0D1513]"
  },
  highcontrast: {
    bg: "bg-[#000000]", // Accessibility high-contrast
    surface: "bg-[#1E1E1E]",
    border: "border-[#FFFFFF]",
    textPrimary: "text-[#FFFFFF]",
    textSecondary: "text-[#D1D5DB]",
    accent: "text-[#FFFF00]", // Neon yellow keying
    accentHover: "hover:bg-[#FFFF00]/15",
    accentMuted: "bg-[#FFFF00]/10",
    cardBg: "bg-[#1E1E1E]",
    tagBg: "bg-black",
    navBg: "bg-black"
  }
};

export const getThemePalette = (themeName: string): ThemeColors => {
  return THEME_PALETTES[themeName] || THEME_PALETTES.scholar;
};

export const getFontFamilyClass = (font: string): string => {
  switch (font) {
    case "serif":
      return "font-serif";
    case "academic":
      return "font-serif tracking-normal leading-[1.65]";
    case "dyslexic":
      return "font-sans tracking-wide leading-relaxed font-semibold";
    case "mono":
      return "font-mono";
    default:
      return "font-sans";
  }
};

export const getFontSizeClass = (size: string): string => {
  switch (size) {
    case "xs":
      return "text-xs";
    case "sm":
      return "text-sm";
    case "base":
      return "text-base";
    case "lg":
      return "text-lg";
    case "xl":
      return "text-xl";
    case "2xl":
      return "text-2xl";
    default:
      return "text-base";
  }
};

export const getLineSpaceClass = (spacing: string): string => {
  switch (spacing) {
    case "compact":
      return "leading-normal";
    case "normal":
      return "leading-relaxed";
    case "relaxed":
      return "leading-loose";
    case "spacious":
      return "leading-[2.2]";
    default:
      return "leading-relaxed";
  }
};

export const getParagraphSpaceClass = (spacing: string): string => {
  switch (spacing) {
    case "compact":
      return "mb-3";
    case "normal":
      return "mb-5";
    case "spacious":
      return "mb-8";
    default:
      return "mb-5";
  }
};
