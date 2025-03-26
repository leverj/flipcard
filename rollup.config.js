import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      // Development build (unminified with source maps)
      file: 'dist/flipcard-viewer.js',
      format: 'es',
      sourcemap: true,
      exports: 'named'
    },
    {
      // Production build (minified without source maps)
      file: 'dist/flipcard-viewer.min.js',
      format: 'es',
      sourcemap: false,
      exports: 'named',
      plugins: [terser({
        format: {
          comments: false
        },
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      })]
    }
  ],
  plugins: [
    nodeResolve()
  ],
  external: ['lit'],
  // Add warning for circular dependencies
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      throw new Error(warning.message);
    }
    warn(warning);
  }
}; 