/**
 * shared-components/phi-page-header.ts
 * --
 * @author VJP
 * @written 01-Jan-2026
 */

import {LitElement, html, css, nothing} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import {Globals} from "../../modules/globals.ts";


/**
 * Common summary information for a page showing:
 * - logo
 * - summary
 * - menu
 * - close button.
 */
@customElement('phi-page-header')
export class PhiPageHeader extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`

        :host {
            display: flex;
            flex-direction: row;
            align-items: center;
            height: 32px;
            background-color: var(--sl-color-gray-400);
            border-radius: 8px 8px 0 0;
            border-bottom: 1px solid var(--sl-color-gray-800);
            gap: 24px;
            padding: 16px;
        }

        /* title/name - take up available space in row */
        h4 {
            flex: 1 0 0;
            margin: 0;
        }
    `

    @property() logo: string = "";
    @property() heading: string = "";

    render() {
        return html`
            ${this.logo === "" ? nothing : html`<phi-logo src="${this.logo}" alt="Fund's logo"></phi-logo>`}
            <h4>${this.heading}</h4>
            <slot></slot>
            <sl-icon-button
                    style="font-size: 32px"
                    name="x"
                    label="close fund detail page"
                    @click=${() => Globals.get.pageManager().popPage()}
            ></sl-icon-button>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-page-header': PhiPageHeader,
    }
}
