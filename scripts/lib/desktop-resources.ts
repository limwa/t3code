import gnomeCaptureBundle from "../../apps/desktop/gnome-extension/bundle.json" with { type: "json" };

/**
 * Files the desktop app reads from Electron's resources directory.
 *
 * electron-builder copies these as `extraResources`, and
 * scripts/check-desktop-resources.ts verifies a resources directory assembled
 * without it. Both read this list so they cannot disagree.
 */
export const DESKTOP_EXTRA_RESOURCES = [
  {
    from: "apps/desktop/prod-resources/resource-monitor",
    to: "resource-monitor",
  },
] as const;
export const LINUX_CAPTURE_EXTRA_RESOURCES = [
  {
    from: "apps/desktop/prod-resources/hyprland-capture",
    to: "hyprland-capture",
  },
  {
    from: "apps/desktop/prod-resources/kde-capture",
    to: "kde-capture",
  },
  {
    from: "apps/desktop/gnome-extension",
    to: "gnome-extension",
    filter: gnomeCaptureBundle.files,
  },
] as const;
export const LINUX_BROWSER_SECRET_EXTRA_RESOURCES = [
  { from: "apps/desktop/prod-resources/browser-secret", to: "browser-secret" },
] as const;
export const LINUX_EXTRA_RESOURCES = [
  ...DESKTOP_EXTRA_RESOURCES,
  ...LINUX_CAPTURE_EXTRA_RESOURCES,
  ...LINUX_BROWSER_SECRET_EXTRA_RESOURCES,
] as const;
