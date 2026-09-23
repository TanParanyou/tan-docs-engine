/**
 * tan-docs-engine: Centralized Theme Configuration & Presets
 * 
 * ระบบกำหนดธีมกลาง (Single Source of Truth)
 * ทุก Component, Page และ Dialog อ้างอิง Design Tokens จาก theme นี้
 * หากต้องการเปลี่ยนสีหรือสไตล์ของเว็บทั้งระบบ ให้แก้ที่จุดนี้และใน `app/globals.css`
 */

export interface ThemeTokens {
  name: string;
  description: string;
  colors: {
    bg: string;
    bgSubtle: string;
    surface: string;
    surfaceHover: string;
    surfaceSunken: string;
    text: string;
    textMuted: string;
    textFaint: string;
    border: string;
    borderSubtle: string;
    primary: string;
    primaryHover: string;
    primaryText: string;
    accent: string;
    accentHover: string;
    accentLight: string;
    accentText: string;
    warning: string;
    warningLight: string;
    success: string;
    successLight: string;
    danger: string;
    dangerLight: string;
  };
  geometry: {
    radius: string;
    shadowSm: string;
    shadow: string;
    shadowLg: string;
  };
}

export const RETRO_THEME: ThemeTokens = {
  name: "Retro Technical Workstation",
  description: "80s/90s vintage workstation aesthetic with warm cream chassis, crisp inky borders, hard tactile shadows, and burnt amber & teal accents.",
  colors: {
    bg: "#f5efe6",
    bgSubtle: "#ebe3d5",
    surface: "#fdfbf7",
    surfaceHover: "#f7f1e4",
    surfaceSunken: "#e5ded0",
    text: "#23201b",
    textMuted: "#6b6357",
    textFaint: "#9c9182",
    border: "#2e2a24",
    borderSubtle: "#d6ccbc",
    primary: "#c2541a",
    primaryHover: "#a84410",
    primaryText: "#ffffff",
    accent: "#2a6d63",
    accentHover: "#1f564e",
    accentLight: "#e0ece8",
    accentText: "#1d5249",
    warning: "#b87a14",
    warningLight: "#faf0d7",
    success: "#29784b",
    successLight: "#dfefe6",
    danger: "#b53228",
    dangerLight: "#fbeae9",
  },
  geometry: {
    radius: "0px",
    shadowSm: "2px 2px 0px #2e2a24",
    shadow: "3px 3px 0px #2e2a24",
    shadowLg: "5px 5px 0px #2e2a24",
  },
};

export const ACTIVE_THEME = RETRO_THEME;
