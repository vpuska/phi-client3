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
import "./components/phi-application"