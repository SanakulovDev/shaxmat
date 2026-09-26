// Bundles the compiled API (dist/) into one ES module for the Vercel
// Function in api/index.js. Vercel's file tracing misses modules that Nest
// loads with optional dynamic imports (the WebSocket gateway runtime), and
// its loader cannot require() ES modules; a bundle sidesteps both.
import { build } from 'esbuild';

await build({
  entryPoints: ['dist/serverless.js'],
  outfile: 'dist-vercel/server.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  // Bundled CommonJS code still calls require() for Node built-ins.
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
  },
  // Optional packages that Nest and ws load only when installed.
  external: [
    '@nestjs/microservices',
    '@nestjs/microservices/*',
    'class-transformer',
    'class-transformer/*',
    'class-validator',
    'bufferutil',
    'utf-8-validate',
    'pg-native',
  ],
  logLevel: 'warning',
});
