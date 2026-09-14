import type { NextConfig } from "next";
const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "d22fxaf9t8d39k.cloudfront.net" },
    ],
  },
  poweredByHeader: false,
};
export default config;
