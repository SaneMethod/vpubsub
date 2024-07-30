import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
    {
        input: 'index.js',
        output: {
            file: 'dist/vpubsub.full.js',
            format: 'esm'
        },
        plugins: [
            nodeResolve()
        ],
    },
    {
        input: 'index.js',
        output: {
            file: 'dist/vpubsub.js',
            format: 'esm'
        },
        external: [
            'lodash-es',
        ]
    },
    {
        input:'index.js',
        output: {
            file:'dist/vpubsub.full.min.js',
            format:'esm'
        },
        plugins:[
            nodeResolve(),
            terser()
        ]
    },
    {
        input:'index.js',
        output: {
            file:'dist/vpubsub.min.js',
            format:'esm'
        },
        external:[
            "lodash-es",
        ],
        plugins:[
            terser()
        ]
    }
];
