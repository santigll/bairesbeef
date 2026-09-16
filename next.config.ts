import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Next's default is 1MB, which a real photo (camera/phone, product
      // or banner or logo images uploaded from /admin) easily exceeds.
      // Our own upload validation caps files at 5MB (see src/lib/uploads.ts);
      // give this some headroom over that plus multipart overhead.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
