const { build, context } = require("esbuild");
const { copy } = require("esbuild-plugin-copy");

//@ts-check
/** @typedef {import('esbuild').BuildOptions} BuildOptions **/

/** @type BuildOptions */
const baseConfig = {
  bundle: true,
  minify: process.env.NODE_ENV === "production",
  sourcemap: process.env.NODE_ENV !== "production",
  platform: "node",
  entryPoints: ["./src/extension.ts"],
  outfile: "./dist/extension.js",
  external: ["vscode"],
  format: "cjs",
  // Plugin that facilitates copying additional files to the output directory
  plugins: [
    copy({
      // Copy any additional assets that are not imported in the code but needed at runtime
      // For example:
      // assets: [
      //   { from: './assets/**/*', to: './assets' },
      // ],
    }),
  ],
};

// Check for watch mode
const watchMode = process.argv.includes("--watch");

if (watchMode) {
  // Watch mode
  context(baseConfig)
    .then((ctx) => {
      ctx.watch();
      console.log("Watching for changes...");
    })
    .catch((error) => {
      console.error("Watch error:", error);
      process.exit(1);
    });
} else {
  // Build once
  build(baseConfig).catch((error) => {
    console.error("Build failed:", error);
    process.exit(1);
  });
}
