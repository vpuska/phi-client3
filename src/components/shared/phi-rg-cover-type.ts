/**
 * shared-components/phi-cover-type.ts
 * --
 * @author VJP
 * @written 04-Jul-2026
 */

import {LitElement, html, css} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import type {CoverType} from "../../api-models/products.ts";

/**
 * Cover type selection widget (Combined, Hospital, Extras).  Raises `sl-change` event when cover type is changed.
 */
@customElement('phi-rg-cover-type')
export class PhiRgCoverType extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            padding: 0;
        }
    `

    @property({reflect:true}) value: CoverType | "" = "";

    render() {
        return html`
            <sl-radio-group label="Cover Type" value=${this.value || ""}
                @sl-change=${(e: Event) => this.value = (e.target as HTMLInputElement).value as CoverType | ""}
            >
                <sl-radio-button value="Combined">Combined</sl-radio-button>
                <sl-radio-button value="Hospital">Hospital</sl-radio-button>
                <sl-radio-button value="GeneralHealth">Extras</sl-radio-button>
            </sl-radio-group>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-rg-cover-type': PhiRgCoverType,
    }
}
