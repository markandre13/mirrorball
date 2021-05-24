import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default [{
    input: 'src/main.ts',
    output: {
        name: 'main',
        file: 'js/main.js',
        format: 'iife',
        sourcemap: true,
        extend: true
    },
    plugins: [
        typescript({
            sourceMap: true
        }),
        nodeResolve(),
        commonjs(),
    ]
}]
