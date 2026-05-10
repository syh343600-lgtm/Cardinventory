import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "私人卡牌库存管理",
    short_name: "卡牌库存",
    description: "私人卡牌库存、买入卖出和利润记录工具",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#ecfeff",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
