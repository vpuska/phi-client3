/**
 * shared-components/phi-headline.ts
 * --
 * @author VJP
 * @written 01-Jan-2026
 */

import {LitElement, html, css} from 'lit'
import { customElement} from 'lit/decorators.js'


/**
 * Displays a "headline" banner across the page, useful for displaying key information.
 */
@customElement('phi-headline')
export class PhiHeadline extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: row;
            align-items: stretch;
            justify-content: space-between;
            font-size: x-large;
            font-weight: bold;
            line-height: 24px;
        }

        div {
            display: flex;
            flex-direction: row;
            align-items: stretch;
        }
    `

    render() {
        return html`
            <div>
                <slot name="left"></slot>
            </div>
            <div>
                <slot name="right"></slot>
            </div>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-headline': PhiHeadline,
    }
}
