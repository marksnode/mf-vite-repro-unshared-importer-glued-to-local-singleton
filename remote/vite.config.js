import {federation} from '@module-federation/vite'

export default {
    root: 'remote',
    base: 'http://localhost:4181/',
    build: {outDir: 'dist', emptyOutDir: true, minify: false},
    plugins: [
        federation({
            name: 'remote',
            filename: 'remoteEntry.js',
            exposes: {'./widget': './src/widget.js'},
            // aaa-runtime is a workspace singleton with a local fallback; zzz-hooks is NOT shared, it is bundled into the widget
            shared: {'aaa-runtime': {singleton: true}},
            dts: false,
        }),
    ],
}
