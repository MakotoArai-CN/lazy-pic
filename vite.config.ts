import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import { minify, type MinifyOptions } from 'terser';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'path';

const terserOptions: MinifyOptions = {
  compress: {
    drop_console: true,
    drop_debugger: true
  },
  format: {
    comments: false
  }
};

/**
 * Vite's built-in terser plugin explicitly skips the ES output of library
 * builds, which leaves the ESM bundle unminified. Minify it after the bundle
 * is written so both published formats are equally small.
 */
function minifyEsLib(): Plugin {
  return {
    name: 'lazy-pic:minify-es-lib',
    apply: 'build',
    async closeBundle() {
      const bundlePath = resolve(__dirname, 'dist/lazy-pic.es.js');
      const mapPath = `${bundlePath}.map`;

      let code: string;
      try {
        code = await readFile(bundlePath, 'utf8');
      } catch {
        return;
      }

      let inputMap: Record<string, unknown> | undefined;
      try {
        inputMap = JSON.parse(await readFile(mapPath, 'utf8')) as Record<string, unknown>;
      } catch {
        inputMap = undefined;
      }

      const result = await minify(code, {
        ...terserOptions,
        module: true,
        sourceMap: inputMap
          ? {
              content: JSON.stringify(inputMap),
              asObject: true
            }
          : false
      });

      if (!result.code) {
        return;
      }

      await writeFile(
        bundlePath,
        `${result.code}\n//# sourceMappingURL=lazy-pic.es.js.map\n`,
        'utf8'
      );
      if (result.map) {
        await writeFile(
          mapPath,
          typeof result.map === 'string' ? result.map : JSON.stringify(result.map),
          'utf8'
        );
      }
    }
  };
}

export default defineConfig({
  plugins: [dts({ include: ['src'], exclude: ['src/**/*.test.ts'] }), minifyEsLib()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LazyPic',
      formats: ['es', 'umd'],
      fileName: (format) => `lazy-pic.${format}.js`
    },
    rollupOptions: {
      external: [],
      output: {
        exports: 'named',
        globals: {}
      }
    },
    minify: 'terser',
    terserOptions,
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
