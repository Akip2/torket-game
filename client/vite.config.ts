import { defineConfig, loadEnv, type ConfigEnv } from "vite";
import path from "path";

export default ({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), "");

  return defineConfig({
    base: "/",
    resolve: {
      alias: {
        "@shared": path.resolve(__dirname, "../shared"),
      },
    },

    server: {
      port: Number(env.VITE_PORT) || 5173,
    },
  });
};