import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import clear from "rollup-plugin-clear";
import {terser} from "rollup-plugin-terser";

const babelOptionsES2018 = {
    runtimeHelpers:  false,
    externalHelpers: false,
    babelrc:         false,
    plugins:         ['@babel/plugin-proposal-optional-chaining']
};

// https://rollupjs.org/guide/en#big-list-of-options
export default [
    // ES Modules Minified
    {
        input:   './src/eventEmitter.js',
        output:  {
            file:      './dist/eventEmitter.min.js',
            format:    'esm',
            compact:   true,
            sourcemap: true,
        },
        plugins: [
            clear({targets: ['./dist']}),
            resolve(),
            babel(babelOptionsES2018),
            terser(),
        ]
    },
    // ES Modules None-Minified
    {
        input:   './src/eventEmitter.js',
        output:  {
            file:      './dist/eventEmitter.js',
            format:    'esm',
            compact:   false,
            sourcemap: true,
        },
        plugins: [
            resolve(),
            babel(babelOptionsES2018),
        ]
    },
];
