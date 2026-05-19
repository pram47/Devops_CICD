import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appBaseURL = (env.VITE_APP_BASE_URL ?? "").trim();
  const proxy: Record<string, object> = {};

  if (appBaseURL) {
    proxy["/company"] = {
      target: appBaseURL,
      changeOrigin: true,
    };
    proxy["/job"] = {
      target: appBaseURL,
      changeOrigin: true,
    };
    proxy["/apply-monitor"] = {
      target: appBaseURL,
      changeOrigin: true,
    };
    proxy["/employee"] = {
      target: appBaseURL,
      changeOrigin: true,
    };
    proxy["/scout"] = {
      target: appBaseURL,
      changeOrigin: true,
      bypass: (req: { headers: Record<string, string | string[] | undefined> }) => {
        const accept = req.headers["accept"] ?? "";
        if (typeof accept === "string" && accept.includes("text/html")) {
          return "/index.html";
        }
      },
    };
    proxy["/utility"] = {
      target: appBaseURL,
      changeOrigin: true,
    };
    proxy["/api"] = {
      target: appBaseURL,
      changeOrigin: true,
    };
    proxy["/auth"] = {
      target: appBaseURL,
      changeOrigin: true,
      cookieDomainRewrite: "localhost",
    };
  }

  return {
    plugins: [react(), tailwindcss(), svgr()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy,
    },
  };
});
