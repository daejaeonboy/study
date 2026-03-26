import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  async headers() {
    const recoveryScriptHeaders = [
      {
        key: "Content-Type",
        value: "application/javascript; charset=utf-8",
      },
      {
        key: "Cache-Control",
        value: "no-store, must-revalidate",
      },
    ];

    return [
      {
        source: "/index.tsx",
        headers: recoveryScriptHeaders,
      },
      {
        source: "/@vite/client",
        headers: recoveryScriptHeaders,
      },
      {
        source: "/@react-refresh",
        headers: recoveryScriptHeaders,
      },
      {
        source: "/@vite-plugin-pwa/pwa-entry-point-loaded",
        headers: recoveryScriptHeaders,
      },
      {
        source: "/dev-sw.js",
        headers: recoveryScriptHeaders,
      },
      {
        source: "/index.css",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
