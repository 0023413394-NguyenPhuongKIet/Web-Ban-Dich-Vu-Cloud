import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Chỉ bật output standalone khi build trong Docker, Vercel sẽ dùng serverless chuẩn
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,
};

export default nextConfig;
