const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: {
      lambda: "src/lambda.ts",
      server: "src/server.ts"
    },
    bundle: true,
    platform: "node",
    target: "node22",
    format: "cjs",
    sourcemap: true,
    outdir: "dist",
    external: [
      "@prisma/client",
      "prisma"
    ]
  })
  .then(() => {
    console.log("⚡ Backend build completed successfully!");
  })
  .catch((err) => {
    console.error("Build failed:", err);
    process.exit(1);
  });
