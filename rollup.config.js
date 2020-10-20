import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {terser} from "rollup-plugin-terser";
import clear from "rollup-plugin-clear";
import commonjs from '@rollup/plugin-commonjs';

const babelOptionsES5 = {
    runtimeHelpers:  false,
    externalHelpers: false,
    babelrc:         false,
    presets:         [
        [
            "@babel/env",
            {
                targets: {
                    ie:      '11',
                    edge:    '17',
                    firefox: '60',
                    chrome:  '71',
                    safari:  '11.1',
                },
            }
        ]
    ],
    plugins:         ['@babel/plugin-proposal-optional-chaining']
};

const babelOptionsES2018 = {
    runtimeHelpers:  false,
    externalHelpers: false,
    babelrc:         false,
    plugins:         ['@babel/plugin-proposal-optional-chaining']
};

// https://rollupjs.org/guide/en#big-list-of-options
export default [
    // ES2015 Minified
    {
        input:   './src/eventEmitter.js',
        output:  {
            file:      './dist/eventEmitter.min.js',
            format:    'iife',
            name:      'EventEmitter',
            compact:   true,
            sourcemap: true,
        },
        plugins: [
            resolve(),
            commonjs(),
            clear({targets: ['./dist']}),
            babel(babelOptionsES5),
            terser(),
        ]
    },
    // ES2015 None-Minified
    {
        input:   './src/eventEmitter.js',
        output:  {
            file:      './dist/eventEmitter.js',
            format:    'iife',
            name:      'EventEmitter',
            compact:   false,
            sourcemap: true,
        },
        plugins: [
            resolve(),
            commonjs(),
            babel(babelOptionsES5),
        ]
    },
    // ES Modules Minified
    {
        input:   './src/eventEmitter.js',
        output:  {
            file:      './dist/eventEmitter.esm.min.js',
            format:    'esm',
            compact:   true,
            sourcemap: true,
        },
        plugins: [
            resolve(),
            babel(babelOptionsES2018),
            terser(),
        ]
    },
    // ES Modules None-Minified
    {
        input:   './src/eventEmitter.js',
        output:  {
            file:      './dist/eventEmitter.esm.js',
            format:    'esm',
            compact:   false,
            sourcemap: true,
        },
        plugins: [
            resolve(),
            babel(babelOptionsES2018),
        ]
    },
    // Node Module
    {
        input:   './src/eventEmitter.js',
        output:  {
            file:   './dist/index.js',
            format: 'cjs',
            name:   'EventEmitter',
        },
        plugins: [
            resolve(),
            commonjs(),
        ]
    },
];
