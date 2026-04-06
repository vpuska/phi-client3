/**
 * application.ts
 * --
 * Application dependencies.
 */

// Shoelace requirements
import '@shoelace-style/shoelace/dist/themes/light.css'
import '@shoelace-style/shoelace/dist/themes/dark.css'
import '@shoelace-style/shoelace/dist/shoelace.js'

import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js'
setBasePath('/node_modules/@shoelace-style/shoelace/dist')
//setBasePath("./shoelace" )

import { registerIconLibrary} from '@shoelace-style/shoelace/dist/utilities/icon-library.js'
registerIconLibrary('app-icons', {
    resolver: name => `icons/${name}.svg`,
    mutator: svg => svg.setAttribute('fill', 'currentColor')
});

// Application modules
import "./css/themes.css"
import "./css/colors.css"
import "./components/bundle"

