import { createRequire } from 'module';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const year = new Date().getFullYear();
const years = '2014' + (year > 2014 ? '-' + year : '');
const banner = `/**
 * ${pkg.name} v${pkg.version}, ${pkg.description}.
 *
 * Copyright (c) ${years} ${pkg.author}.
 *
 * @version v${pkg.version}
 * @link ${pkg.homepage}
 * @license ${pkg.license}
 */`;

const external = ['react', 'react-dom'];
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM'
};

const babelConfig = {
  babelHelpers: 'bundled',
  presets: [
    ['@babel/preset-env', { targets: { browsers: '>0.25%, not dead' } }],
    ['@babel/preset-react', { runtime: 'classic' }]  // Changed to classic for old JSX syntax
  ],
  exclude: 'node_modules/**',
  extensions: ['.js', '.jsx']
};

export default [
  // UMD build (for browsers)
  {
    input: 'src/js/orb.js',
    output: {
      file: 'dist/orb.js',
      format: 'umd',
      name: 'orb',
      banner,
      globals,
      sourcemap: true
    },
    external,
    plugins: [
      resolve({ extensions: ['.js', '.jsx'] }),
      commonjs(),
      babel(babelConfig),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
        preventAssignment: true
      })
    ]
  },
  // UMD minified build
  {
    input: 'src/js/orb.js',
    output: {
      file: 'dist/orb.min.js',
      format: 'umd',
      name: 'orb',
      banner,
      globals,
      sourcemap: true
    },
    external,
    plugins: [
      resolve({ extensions: ['.js', '.jsx'] }),
      commonjs(),
      babel(babelConfig),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        preventAssignment: true
      }),
      terser({
        format: {
          comments: /^!/
        }
      })
    ]
  },
  // ESM build (for modern bundlers)
  {
    input: 'src/js/orb.js',
    output: {
      file: 'dist/orb.esm.js',
      format: 'esm',
      banner,
      sourcemap: true
    },
    external,
    plugins: [
      resolve({ extensions: ['.js', '.jsx'] }),
      commonjs(),
      babel(babelConfig)
    ]
  },
  // CSS build from LESS
  {
    input: 'src/css/orb.less',
    output: {
      file: 'dist/orb.css.tmp.js' // Dummy output, actual CSS goes to dist/orb.css
    },
    plugins: [
      postcss({
        extract: 'orb.css',
        minimize: false,
        sourceMap: true,
        use: {
          less: {
            javascriptEnabled: true
          }
        }
      })
    ]
  },
  // CSS minified build
  {
    input: 'src/css/orb.less',
    output: {
      file: 'dist/orb.min.css.tmp.js' // Dummy output
    },
    plugins: [
      postcss({
        extract: 'orb.min.css',
        minimize: true,
        sourceMap: true,
        use: {
          less: {
            javascriptEnabled: true
          }
        }
      })
    ]
  }
];
