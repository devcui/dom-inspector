import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [
      dts({
        include: ['src/**/*.ts'],
        outDir: 'dist',
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'DomInspector',
        formats: ['es', 'cjs', 'umd', 'iife'],
        fileName: (format) => {
          const formatMap: Record<string, string> = {
            es: 'dom-inspector.js',
            cjs: 'dom-inspector.cjs',
            umd: 'dom-inspector.umd.js',
            iife: 'dom-inspector.iife.js',
          };
          return formatMap[format] || `dom-inspector.${format}.js`;
        },
      },
      outDir: 'dist',
      sourcemap: isDev,
      minify: isDev ? false : 'esbuild',
      rollupOptions: {
        output: {
          exports: 'named',
        },
      },
    },
  };
});
