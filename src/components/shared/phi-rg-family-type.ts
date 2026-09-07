/**
 * shared-components/phi-rg-family-type.ts
 * --
 * @author VJP
 * @written 04-Jul-2026
 */

import {LitElement, html, css} from 'lit'
import {customElement, property} from 'lit/decorators.js'

export type FamilyType = "1" | "2" | "2D" | "1D" | "0D";
/**
 * Family type selection widget (Single, couple, etc...).  Raises `sl-change` event when type is changed.
 * Value is a string representing the number of adults and a trailing "D" for dependants.
 */
@customElement('phi-rg-family-type')
export class PhiRgFamilyType extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            padding: 0;
        }
        sl-icon-button, sl-icon {
            font-size: 2rem;
        }
    `

    @property({reflect:true}) value: FamilyType | "" = "";

    render() {
        return html`
            <sl-radio-group label="Persons Covered" value=${this.value || ""}
                @sl-change=${(e: Event) => this.value = (e.target as HTMLInputElement).value as FamilyType | ""}
            >

                <sl-tooltip content="Single">
                    <sl-radio-button value="1">
                        <sl-icon library="app-icons" name="single"></sl-icon>
                    </sl-radio-button>
                </sl-tooltip>

                <sl-tooltip content="Couple">
                    <sl-radio-button value="2">
                        <sl-icon library="app-icons" name="couple"></sl-icon>
                    </sl-radio-button>
                </sl-tooltip>

                <sl-tooltip content="Family">
                    <sl-radio-button value="2D">
                        <sl-icon library="app-icons" name="family"></sl-icon>
                    </sl-radio-button>
                </sl-tooltip>

                <sl-tooltip content="Single Parent Family">
                    <sl-radio-button value="1D">
                        <sl-icon library="app-icons" name="single_parent"></sl-icon>
                    </sl-radio-button>
                </sl-tooltip>

                <sl-tooltip content="Dependants Only">
                    <sl-radio-button value="0D">
                        <sl-icon library="app-icons" name="dependants"></sl-icon>
                    </sl-radio-button>
                </sl-tooltip>

            </sl-radio-group>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-rg-family-type': PhiRgFamilyType,
    }
}
