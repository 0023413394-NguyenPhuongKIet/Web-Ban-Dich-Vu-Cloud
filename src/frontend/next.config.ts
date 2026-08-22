import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tạo bundle độc lập cho Docker deployment (không cần node_modules)
  output: "standalone",
};

export default nextConfig;
