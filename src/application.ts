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

import "./shared-components/phi-logo"
import "./shared-components/phi-headline"
import "./shared-components/phi-card"
import "./shared-components/phi-page-header"
import "./shared-components/phi-page-details"

import "./components/phi-application"
import "./components/phi-main"
import "./components/phi-main-header"
import "./components/phi-home"
import "./components/phi-page-manager"
import "./components/phi-fund-browser"
import "./components/phi-fund-details/phi-fund-details.ts"
import "./components/phi-fund-details/phi-fund-product-browser.ts"
import "./components/phi-product-details.ts"
import "./components/phi-needs-analysis.ts"
