/**
 * components/phi-app/phi-main.ts
 * --
 * @author VJP
 * @written 29-Sep-2025
 */

import {LitElement, html, css} from 'lit'
import {customElement} from "lit/decorators.js";


/**
 * Main application screen containing header, navigation and body
 */
@customElement('phi-app-main')
export class PhiAppMain extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
            margin: 0;
            padding: 8px;
            overflow-x: hidden;
            background-color: var(--sl-color-primary-50)
        }
    `

    render() {
        return html`
            <phi-app-header></phi-app-header>
            <phi-app-pager></phi-app-pager>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'phi-app-main': PhiAppMain;
    }
}