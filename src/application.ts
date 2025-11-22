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


// Application modules
import "./themes.css"
import "./colors.css"

import "./components/phi-application"
import "./components/phi-main"
import "./components/phi-main-header"
import "./components/phi-color"
import "./components/phi-home"
import "./components/phi-page-manager"
import "./components/phi-fund-browser"
import "./components/phi-fund-details"