import type { NextConfig } from "next";
const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "d22fxaf9t8d39k.cloudfront.net" },
      { protocol: "https", hostname: "envases3g.vercel.app" },
      { protocol: "https", hostname: "aaqncfxpdnlxmxmylkzq.supabase.co" },
    ],
  },
  poweredByHeader: false,
};
export default config;
