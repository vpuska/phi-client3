/**
 * shared-components/phi-card.ts
 * --
 * @author VJP
 * @written 01-Jan-2026
 */

import {LitElement, html, css, nothing} from 'lit'
import {customElement, property} from 'lit/decorators.js'


/**
 * Wrapper for sl-card including styling to make cards equal height regardless of content.
 */
@customElement('phi-card')
export class PhiCard extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            padding: 0;
        }
        sl-card {
            height: 100%;
        }
        sl-card::part(base) {
            height: 100%;
        }
        sl-card::part(header) {
            background-color: var(--sl-color-gray-400);
        }
        sl-card::part(body) {
            flex: 1 0 0;
            height: 100%;
        }
        sl-card::part(footer) {
            padding: 4px 12px;
        }
        sl-tooltip {
            --show-delay: 1s;
        }
    `

    /**
     * Enable the display of the header.
     */
    @property({type: Boolean}) header = false;
    /**
     * Enable the display of the footer.
     */
    @property({type: Boolean}) footer = false;

    render() {
        return html`
            <sl-card exportparts="body, base, header, footer">
                ${this.header ? html`<slot name="header" slot="header"></slot>` : nothing}
                <slot ></slot>
                ${this.footer ? html`<slot name="footer" slot="footer"></slot>` : nothing}
            </sl-card>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-card': PhiCard,
    }
}
