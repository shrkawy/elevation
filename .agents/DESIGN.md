---
name: Obsidian & Amber
colors:
  surface: "#121414"
  surface-dim: "#121414"
  surface-bright: "#37393a"
  surface-container-lowest: "#0c0f0f"
  surface-container-low: "#1a1c1c"
  surface-container: "#1e2020"
  surface-container-high: "#282a2b"
  surface-container-highest: "#333535"
  on-surface: "#e2e2e2"
  on-surface-variant: "#e2bfb0"
  inverse-surface: "#e2e2e2"
  inverse-on-surface: "#2f3131"
  outline: "#a98a7d"
  outline-variant: "#5a4136"
  surface-tint: "#ffb693"
  primary: "#ffb693"
  on-primary: "#561f00"
  primary-container: "#ff6b00"
  on-primary-container: "#572000"
  inverse-primary: "#a04100"
  secondary: "#c8c6c5"
  on-secondary: "#313030"
  secondary-container: "#474746"
  on-secondary-container: "#b7b5b4"
  tertiary: "#c8c6c5"
  on-tertiary: "#303030"
  tertiary-container: "#9a9999"
  on-tertiary-container: "#313131"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#ffdbcc"
  primary-fixed-dim: "#ffb693"
  on-primary-fixed: "#351000"
  on-primary-fixed-variant: "#7a3000"
  secondary-fixed: "#e5e2e1"
  secondary-fixed-dim: "#c8c6c5"
  on-secondary-fixed: "#1c1b1b"
  on-secondary-fixed-variant: "#474746"
  tertiary-fixed: "#e4e2e1"
  tertiary-fixed-dim: "#c8c6c5"
  on-tertiary-fixed: "#1b1c1c"
  on-tertiary-fixed-variant: "#474746"
  background: "#121414"
  on-background: "#e2e2e2"
  surface-variant: "#333535"
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: "700"
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: "600"
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: "600"
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: "500"
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is engineered for high-performance environments where data density and immediate visual hierarchy are paramount. It targets a professional audience in sectors like fintech, dev-ops, or high-end analytics, where the UI must feel like a precision instrument.

The aesthetic blends **Modern Minimalism** with **High-Contrast Bold** elements. By utilizing a dark-first approach, the design system minimizes eye strain during long work sessions while using vibrant accents to direct attention to critical data points. The emotional response is one of authority, technical sophistication, and urgency.

- **Minimalism:** Use of expansive negative space within dense data modules to prevent cognitive overload.
- **High-Contrast:** Sharp juxtaposition between deep charcoal surfaces and electric orange interactive elements.
- **Tactile Precision:** Subtle 1px borders and sharp geometry to evoke the feeling of a premium physical hardware interface.

## Colors

The palette is anchored in a monochromatic charcoal scale to provide a sophisticated, non-distracting canvas.

- **Primary (#FF6B00):** A vibrant "Amber" orange. Reserved strictly for primary actions, critical alerts, and active states.
- **Secondary (#1A1A1A):** The standard surface color for cards and secondary navigation elements.
- **Tertiary (#262626):** Used for hover states, input backgrounds, and nested UI components to create subtle depth.
- **Neutral (#FFFFFF):** High-brightness white for maximum legibility of body text and icons against dark backgrounds.
- **Background (#0D0D0D):** The foundation "Deep Black" layer that ensures all other elements pop.
- **Success/Warning/Error:** While orange acts as a primary status, use specialized semantic tones (Emerald #10B981 and Rose #F43F5E) only for specific status indicators, ensuring they are lower in saturation than the brand Orange.

## Typography

This design system utilizes **Hanken Grotesk** for its sharp, contemporary terminals and exceptional legibility at small sizes. It provides the "professional" tone required for high-density dashboards.

For technical data, timestamps, and status badges, **JetBrains Mono** is employed to introduce a "developer-centric" feel and ensure numerical alignment in tables (tabular figures).

**Key Rules:**

- All headings use tight letter-spacing to maintain a "locked-in" architectural feel.
- High-contrast text (#FFFFFF) is used for primary content, while secondary content drops to 70% opacity (#B3B3B3) to manage hierarchy.
- Labels always appear in uppercase when using the monospaced font to enhance the "instrumental" aesthetic.

## Layout & Spacing

The layout utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. The philosophy is "Dense but Organized," prioritizing information throughput over white space.

- **Grid:** 16px gutters provide a consistent vertical and horizontal rhythm.
- **Density:** Components use tight internal padding (12px - 16px) to allow for more data visualization modules per viewport.
- **Breakpoints:**
  - **Mobile:** < 600px (Single column stacked).
  - **Tablet:** 600px - 1024px (2-column layouts for cards).
  - **Desktop:** > 1024px (Full dashboard grid with fixed-width sidebar).

## Elevation & Depth

In a dark, high-contrast system, shadows are secondary to **Tonal Layering** and **Borders**.

- **Surface Tiers:**
  - **Level 0 (Background):** #0D0D0D (Deepest).
  - **Level 1 (Cards/Sidebar):** #1A1A1A (Raised).
  - **Level 2 (Modals/Popovers):** #262626 (Foremost).
- **Outlines:** Instead of heavy shadows, use 1px solid borders (#333333) to define the silhouette of components.
- **Interactive Depth:** When an element is hovered, use a subtle inner-glow or a change in border color to the primary orange (#FF6B00) at 30% opacity, rather than traditional drop shadows.

## Shapes

The design system uses a **Soft (0.25rem)** roundedness approach. This maintains a sharp, technical feel while preventing the UI from feeling dated or overly aggressive.

- **Components:** Standard buttons and input fields use a 4px radius.
- **Large Containers:** Dashboard cards and main content areas use an 8px (rounded-lg) radius to distinguish them from smaller UI widgets.
- **Status Pills:** Small chips and badges use a fully circular (pill) radius to provide a visual break from the otherwise rectangular grid.

## Components

### Buttons

- **Primary:** Solid #FF6B00 background with #0D0D0D text. High-impact, no shadow.
- **Secondary:** Transparent background with a 1px #333333 border. White text. Hover state shifts border and text to Orange.
- **Ghost:** No border or background. Used for low-priority actions in utility bars.

### Input Fields

- **Default:** #1A1A1A background with #333333 border.
- **Focus:** 1px solid #FF6B00 border with a subtle 2px orange outer glow (10% opacity).
- **Labels:** Always use `label-sm` (JetBrains Mono) above the field in 60% white.

### Cards

- **Structure:** Background #1A1A1A with a 1px border (#333333).
- **Header:** Separate the card header from content with a 1px horizontal divider.
- **Metric Cards:** Large `display-lg` numbers in white with `label-md` titles in orange.

### Lists & Tables

- **Rows:** Alternate row colors (Zebra striping) using #1A1A1A and #1D1D1D.
- **Hover:** Highlight the entire row with #262626 and a 2px orange "active" bar on the far left.

### Status Indicators

- **Active/Live:** Small pulsating dot using #FF6B00.
- **Chips:** Small, uppercase monospaced text inside a subtle #262626 container with a 1px border.

### Data Visualization

- **Charts:** Use Orange (#FF6B00) as the primary data line. Use a scale of Grays (#404040, #666666) for secondary data to ensure the primary focus remains on the main metric.
