/**
 * components/phi-na/phi-na-details-35.ts
 * --
 * @author VJP
 * @written 24-Apr-2026
 */

import {html, css} from 'lit'
import {customElement, query, queryAll} from "lit/decorators.js";
import {consume} from "@lit/context";
import {MobxLitElement} from "@adobe/lit-mobx";
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";
import type {SlSelect} from "@shoelace-style/shoelace";

/**
 * Health insurance needs analysis - hospital accommodation and excess.
 */
@customElement('phi-na-details-35')
export class PhiNADetails35 extends MobxLitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 3em;
        }
        sl-checkbox {
            display: block;
        }
    `
    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;

    @query('sl-select') excessSelect!: SlSelect;
    @queryAll('sl-checkbox') accommodationCheckBoxes!: NodeListOf<HTMLInputElement>;

    validate() {
        const excess = +(this.excessSelect?.value || "0");
        const accommodation = [...this.accommodationCheckBoxes].map(checkbox => checkbox.value).join(';');
        this.context?.change({
            excess: excess,
            accommodation: accommodation
        })
        return true;
    }

    /**
     * Main render routine
     */
    render() {
        const accommodation = this.context?.accommodation.split(';') || "";

        return html`

            <sl-select style="max-width:300px" label = "Maximum Excess" value="${this.context?.excess}">
                <sl-option value="0">Nil Excess</sl-option>
                <sl-option value="250">$250 Excess</sl-option>
                <sl-option value="500">$500 Excess</sl-option>
                <sl-option value="750">$750 Excess</sl-option>
                <sl-option value="99999">Don't care</sl-option>
            </sl-select>
            
            <div>
                Accommodation Type
                <sl-checkbox value="PrivateOrPublic" ?checked="${accommodation.includes('PrivateOrPublic')}">Private or Public</sl-checkbox>
                <sl-checkbox value="PrivateSharedPublic" ?checked="${accommodation.includes('PrivateSharedPublic')}">Shared Private or Public</sl-checkbox>
                <sl-checkbox value="PrivateSharedPublicShared" ?checked="${accommodation.includes('PrivateSharedPublicShared')}">Shared Private or Shared Public</sl-checkbox>
                <sl-checkbox value="Public" ?checked="${accommodation.includes('Public')}">Public</sl-checkbox>
                <sl-checkbox value="PublicShared" ?checked="${accommodation.includes('PublicShared')}">Shared Public</sl-checkbox>
                <sl-checkbox value="PrivatePublicShared" ?checked="${accommodation.includes('PrivatePublicShared')}">Private or Public Shared</sl-checkbox>
            </div>
        `
    }
}

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-na-details-35': PhiNADetails35;
    }
}
