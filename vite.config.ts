import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import prism from "vite-plugin-prismjs";

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    prism({
      languages: [
        "markup",
        "html",
        "xml",
        "svg",
        "rss",
        "css",
        "javascript",
        "arduino",
        "armasm",
        "aspnet",
        "bash",
        "batch",
        "c",
        "cs",
        "cpp",
        "cmake",
        "csv",
        "d",
        "diff",
        "docker",
        "elixir",
        "erlang",
        "fortran",
        "git",
        "go",
        "gradle",
        "graphql",
        "haskell",
        "http",
        "java",
        "json",
        "json5",
        "latex",
        "log",
        "matlab",
        "mongodb",
        "nginx",
        "php",
        "powershell",
        "pug",
        "python",
        "r",
        "jsx",
        "tsx",
        "renpy",
        "ruby",
        "rust",
        "sass",
        "scss",
        "sql",
        "swift",
        "toml",
        "typescript",
        "vim",
        "visual-basic",
        "wasm",
        "yaml",
        "zig",
      ],
      plugins: ["line-numbers"],
      theme: "okaidia",
      css: true,
    }),
  ],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["server/**", "target/**"],
    },
    fs: {
      // Prevent Vite from serving files from the target directory
      strict: true,
      allow: ["."],
      exclude: ["target"],
    },
    proxy: {
      // Proxy API and auth routes to the Rust server (default port 8080).
      // This lets you run the real server while using Vite's HMR for client
      // changes. Adjust PORT env var if your backend runs on a different port.
      "/api": {
        target: `http://127.0.0.1:${process.env.PORT ?? "8080"}`,
        changeOrigin: true,
        secure: false,
        rewrite: (path: string) => path.replace(/^\/api/, "/api"),
      },
      // WebSocket endpoints used by the server (Vite will proxy WS when ws: true)
      "/ws": {
        target: `ws://127.0.0.1:${process.env.PORT ?? "8080"}`,
        ws: true,
      },
    },
    hmr: {
      host: "127.0.0.1",
      // Keep the HMR port equal to Vite's port so connections are stable
      port: 1420,
    },
  },
  optimizeDeps: {
    // Exclude problematic modules that use top-level await
    exclude: ["bson"],
  },
  esbuild: {
    supported: {
      "top-level-await": true,
    },
  },
  build: {
    outDir: "client/dist",
    emptyOutDir: true,
  },
}));
