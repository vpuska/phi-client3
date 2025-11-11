/**
 * components/phi-main.ts
 * --
 * @author VJP
 * @written 29-Sep-2025
 */

import {LitElement, html, css} from 'lit'
import {customElement} from 'lit/decorators.js'


/**
 * Main application screen containing header, navigation and body
 */
@customElement('phi-main')
export class PhiMain extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }
        phi-main-header {
            flex: 0 0 auto;     // height fixed to content           
        }
        phi-page-manager {
            flex: 1 1 0;        // height floats with remaining screen space
        }
    `

    render() {
        return html`
            <phi-main-header></phi-main-header>
            <phi-page-manager></phi-page-manager>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-main': PhiMain,
    }
}
