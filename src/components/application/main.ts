/**
 * components/phi-main.ts
 * --
 * @author VJP
 * @written 29-Sep-2025
 */

import {LitElement, html, css} from 'lit'


/**
 * Main application screen containing header, navigation and body
 */
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
            background-color: var(--sl-color-primary-50)
        }
    `

    render() {
        return html`
            <phi-main-header></phi-main-header>
            <phi-page-manager></phi-page-manager>
        `
    }
}


