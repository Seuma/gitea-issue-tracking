const { build } = require('esbuild');

build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'out/extension.js',
  platform: 'node',
  external: ['vscode'], // Mark 'vscode' module as external to avoid bundling it
  format: 'cjs', // CommonJS format for Node.js
  sourcemap: true, // Optional: generate source maps
}).catch(() => process.exit(1));