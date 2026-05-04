/**
 * AUTO-GENERATED Media Configuration
 * Do not edit manually. Run sync-assets script to update.
 */
import assets from './mediaAssets.json';

export const MEDIA_ASSETS = {
  // Common Aliases
  THEME_MASTER_VIDEO: process.env.NEXT_PUBLIC_THEME_MASTER_VIDEO_URL || assets["public/videos/pass/theme_master.mp4"] || "/videos/pass/theme_master.mp4",
  HALER_SYMBOL: process.env.NEXT_PUBLIC_HALER_SYMBOL_URL || assets["public/images/halersymbol.png"] || "/images/halersymbol.png",
  BLIZ_DEVICE: process.env.NEXT_PUBLIC_BLIZ_DEVICE_URL || assets["public/images/bliz-device.png"] || "/images/bliz-device.png",
  WATERBALL_VIDEO: assets["public/videos/waterball.mp4"] || "/videos/waterball.mp4",
  WATERBALL_GIF: assets["public/videos/waterball.gif"] || "/videos/waterball.gif",
  
  FLAVORS: {
    mango: assets["public/flavors/mango.png"] || "/flavors/mango.png",
    melon: assets["public/flavors/melon.png"] || "/flavors/melon.png",
    berry: assets["public/flavors/berry.png"] || "/flavors/berry.png",
    peach: assets["public/flavors/peach.png"] || "/flavors/peach.png",
    lemon: assets["public/flavors/lemon.png"] || "/flavors/lemon.png",
  },

  THEME_VIDEOS: {
    nectar: "/videos/pass/nectar.mp4",
    terrascent: "/videos/pass/terrascent.mp4",
    sylvana: "/videos/pass/sylvana.mp4",
    flor: "/videos/pass/flor.mp4",
    innoscent: "/videos/pass/innoscent.mp4",
  },

  // Raw Access
  all: assets
} as const;

export type MediaAssetKey = keyof typeof MEDIA_ASSETS;
