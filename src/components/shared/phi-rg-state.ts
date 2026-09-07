/**
 * shared-components/phi-rg-state.ts
 * --
 * @author VJP
 * @written 04-Jul-2026
 */

import {LitElement, html, css} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import type {BaseStateType} from "../../api-models/products.ts";
import {map} from "lit/directives/map.js";

/**
 * State selection widget (NSW, VIC, ...).  Raises `sl-change` event when state is changed.
 */
@customElement('phi-rg-state')
export class PhiRgState extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            padding: 0;
        }
        sl-icon-button, sl-icon {
            font-size: 2rem;
        }
    `

    @property({reflect:true}) value: BaseStateType | "" = "";

    render() {
        return html`
            <sl-radio-group label="State" value=${this.value || ""}
                @sl-change=${(e: Event) => this.value = (e.target as HTMLInputElement).value as BaseStateType | ""}
            >

                ${map(["NSW/ACT", "VIC", "QLD", "TAS", "SA", "WA", "NT"], (state) => {return html `
                    <sl-tooltip content="${state}">
                        <sl-radio-button value=${state.substring(0,3)}>
                            <sl-icon library="app-icons" name="${state.substring(0,3)}"></sl-icon>
                        </sl-radio-button>
                    </sl-tooltip>
                `})}

            </sl-radio-group>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-rg-state': PhiRgState,
    }
}
