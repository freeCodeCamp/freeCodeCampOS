await Bun.build({
  entrypoints: ["./server/index.ts"],
  outdir: "./dist",
  target: "node",
});

export {};
