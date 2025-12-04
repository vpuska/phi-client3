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
            gap: 8px;
            width: 100%;
            margin: 0;
            padding: 8px;
            background-color: var(--sl-color-primary-200)
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
