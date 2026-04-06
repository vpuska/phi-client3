import {viteStaticCopy} from 'vite-plugin-static-copy'

// ...

export default({
    plugins:
        viteStaticCopy({
            targets: [
                {
                    src: 'node_modules/@shoelace-style/shoelace/dist/assets/icons/*.svg',
                    dest: 'shoelace/assets/icons',
                    //rename: {stripBase: 1}
                }
            ],
            silent: false,
        }),
})
