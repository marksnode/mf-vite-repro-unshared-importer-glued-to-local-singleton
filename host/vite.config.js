import {federation} from '@module-federation/vite'

export default {
    root: 'host',
    build: {outDir: 'dist', emptyOutDir: true, minify: false},
    plugins: [
        federation({
            name: 'host',
            remotes: {remote: {type: 'module', name: 'remote', entry: 'http://localhost:4181/remoteEntry.js'}},
            shared: {'aaa-runtime': {singleton: true}},
            dts: false,
        }),
    ],
}
