import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
// import typescript from '@rollup/plugin-typescript';
import typescript from 'rollup-plugin-typescript2';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import pkg from './package.json';

export default [
  // browser-friendly UMD build
  {
    input: 'src/main.ts',
    output: {
      name: 'quickchart',
      file: pkg.browser,
      format: 'umd',
      exports: 'default',
    },
    plugins: [nodePolyfills(), resolve(), commonjs(), json(), typescript()],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/main.ts',
    external: ['fs', 'axios', 'javascript-stringify'],
    plugins: [typescript()],
    output: [
      { file: pkg.main, format: 'cjs', exports: 'default' },
      { file: pkg.module, format: 'es', exports: 'default' },
    ],
  },
];
