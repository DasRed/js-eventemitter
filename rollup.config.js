import resolve from 'rollup-plugin-node-resolve';
import progress from 'rollup-plugin-progress';
import babel from 'rollup-plugin-babel';
import {terser} from "rollup-plugin-terser";
import clear from "rollup-plugin-clear";
import commonjs from 'rollup-plugin-commonjs';

// https://rollupjs.org/guide/en#big-list-of-options
export default [
    // Node Module
    {
        input:   './src/eventEmitter.js',
        output:  {
            file:   './dist/index.js',
            format: 'cjs',
            name:   'EventEmitter',
        },
        plugins: [
            clear({targets: ['./dist']}),
            progress({clearLine: false}),
            resolve(),
            commonjs(),
        ]
    },
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
            progress({clearLine: false}),
            resolve(),
            commonjs(),
            babel({
                runtimeHelpers:  false,
                externalHelpers: false,
                babelrc:         false,
                ignore:          [/\/core-js\//],
                presets:         [
                    [
                        '@babel/preset-env',
                        {
                            useBuiltIns: 'usage',
                            corejs:      {
                                version:   2,
                                proposals: true
                            },
                            targets:     {
                                ie:      '11',
                                edge:    '17',
                                firefox: '60',
                                chrome:  '71',
                                safari:  '11.1',
                            },
                        }
                    ]
                ],
            }),
            terser({sourcemap: true}),
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
            progress({clearLine: false}),
            resolve(),
            commonjs(),
            babel({
                runtimeHelpers:  false,
                externalHelpers: false,
                babelrc:         false,
                ignore:          [/\/core-js\//],
                presets:         [
                    [
                        '@babel/preset-env',
                        {
                            useBuiltIns: 'usage',
                            corejs:      {
                                version:   2,
                                proposals: true
                            },
                            targets:     {
                                ie:      '11',
                                edge:    '17',
                                firefox: '60',
                                chrome:  '71',
                                safari:  '11.1',
                            },
                        }
                    ]
                ],
            }),
        ]
    },
];
