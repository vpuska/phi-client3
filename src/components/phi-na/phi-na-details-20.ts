/**
 * components/phi-na/phi-na-details-20.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {html, css} from 'lit'
import {query} from 'lit/decorators.js'
import {type SlRadioGroup} from "@shoelace-style/shoelace";
import {map} from 'lit/directives/map.js';
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";
import {consume} from "@lit/context";
import {MobxLitElement} from "@adobe/lit-mobx";

/**
 * Health insurance needs analysis.
 */
export class PhiNADetails20 extends MobxLitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 2em;
        }
        sl-icon-button, sl-icon {
            font-size: 2rem;
        }
    `
    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;

    @query('sl-radio-group#rg-cover-type') coverTypeRG!: SlRadioGroup;
    @query('sl-radio-group#rg-state') stateRG!: SlRadioGroup;

    hide() {
        this.context?.change(
            {tab20Label: `${this.coverTypeRG.value} ${this.stateRG.value}` },
        )
        return true;
    }

    /**
     * Main render routine
     */
    render() {
        return html`

            <sl-radio-group id="rg-cover-type" label="Cover Type" value=${this.context?.coverType || ""}>
                <sl-radio-button value="Combined">Combined</sl-radio-button>
                <sl-radio-button value="Hospital">Hospital</sl-radio-button>
                <sl-radio-button value="GeneralHealth">Extras</sl-radio-button>
            </sl-radio-group>
            
            <sl-radio-group id="rg-state" label="State" value=${this.context?.state || ""}>
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

