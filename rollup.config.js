import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
		input: 'index.js',
		output: {
			name: 'quickchart',
			file: pkg.browser,
			format: 'umd'
		},
		plugins: [
      nodePolyfills(),
			resolve(),
			commonjs(),
      json(),
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	{
		input: 'index.js',
		external: [],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	}
];
