/**
 * shared-components/phi-page-details.ts
 * --
 * @author VJP
 * @written 01-Jan-2026
 */

import {LitElement, html, css} from 'lit'
import { customElement} from 'lit/decorators.js'


/**
 * Container for page details..
 */
@customElement('phi-page-details')
export class PhiPageDetails extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            flex: 1 0 0;
            background-color: var(--sl-color-gray-200);
            border-radius: 0 0 8px 8px;
            overflow-y: auto;
            padding: 12px;
        }
    `

    render() {
        return html`<slot></slot>`
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-page-details': PhiPageDetails,
    }
}
