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

import { registerIconLibrary} from '@shoelace-style/shoelace/dist/utilities/icon-library.js'
registerIconLibrary('app-icons', {
    resolver: name => `icons/${name}.svg`,
    mutator: svg => svg.setAttribute('fill', 'currentColor')
});

// Application modules
import "./themes.css"
import "./colors.css"

import "./shared-components/phi-logo"
import "./shared-components/phi-headline"
import "./shared-components/phi-card"
import "./shared-components/phi-page-header"
import "./shared-components/phi-page-details"
import "./shared-components/phi-option-set"
import "./shared-components/phi-keyword-search"

import "./components/bundle"

