/**
 * components/phi-needs.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {LitElement, html, css} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'

/**
 * Health insurance needs.
 */
@customElement('phi-needs')
export class PhiNeeds extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
   `

    @property() summary = "";
    @state() selectedState = "";

    render() {
        return html`
            <sl-details>
                <slot name="summary">
                    <div slot="summary">${this.summary}</div>
                </slot>
                <slot></slot>
            </sl-details>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-needs': PhiNeeds,
    }
}
