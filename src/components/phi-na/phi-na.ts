/**
 * components/phi-na/phi-na.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {LitElement, html, css} from 'lit'
import {query, state} from 'lit/decorators.js'
import {type SlRadioGroup} from "@shoelace-style/shoelace";
import {map} from 'lit/directives/map.js';
import type {PhiNADetails} from "./phi-na-details.ts";
import type {PhiNADetails10} from "./phi-na-details-10.ts";

/**
 * Health insurance needs analysis.
 */
export class PhiNeedsAnalysis extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            padding: 0;
            background-color: var(--sl-color-gray-100);
            border-radius: 8px;
        }
        /**
        Details 2 (state and cover type) formatting
         */
        phi-na-details#details-2::part(content) {
            display: flex;
            flex-direction: column;
            gap: 2em;
        }
        sl-icon-button, sl-icon {
            font-size: 2rem;
        }
    `
    
//    @state() details1Heading = "Do you have existing insurance?";

    @state() selectedState = "";

//    @query('phi-keyword-search#product-1') product1Input!: PhiKeywordSearch;
//    @query('phi-keyword-search#product-2') product2Input!: PhiKeywordSearch;

    @query('phi-na-details#details-1') details1!: PhiNADetails;
    @query('phi-na-details#details-2') details2!: PhiNADetails;

    @query('phi-na-details-10') details10!: PhiNADetails10;

    @query('sl-radio-group#rg-cover-type') coverTypeRG!: SlRadioGroup;
    @query('sl-radio-group#rg-state') stateRG!: SlRadioGroup;


    /**
     * Called when the user clicks the "Continue" button.  Verifies that the user has selected a product, and if so,
     * sets the summary and state of the openDetails panel.
     * @param e - Event object.  This is ignored and propagation suppressed.
     */
    verifyProducts(e: Event) {
        this.details1.summary = this.details10.summary || "No existing cover";
        this.coverTypeRG.value = this.details10.coverType || "";
        this.stateRG.value = this.details10.state || "";
        e.stopPropagation();
    }

    /**
     * Main render routine
     */
    render() {
        return html`
            <phi-page-details>
                
                <phi-na-details-group>
                    
                    <phi-na-details 
                            id="details-1"
                            @phi-na-hide=${this.verifyProducts.bind(this)} 
                            @phi-na-continue=${() => this.details2.show()}
                            summary="Do you have existing cover?" open>
    
                        <phi-na-details-10></phi-na-details-10>
    
                    </phi-na-details>
                    
                    <phi-na-details id="details-2" summary="Cover details">
    
                        <sl-radio-group id="rg-cover-type" label="Cover Type" value="">
                            <sl-radio-button value="Combined">Combined</sl-radio-button>
                            <sl-radio-button value="Hospital">Hospital</sl-radio-button>
                            <sl-radio-button value="GeneralHealth">Extras</sl-radio-button>
                        </sl-radio-group>
                        
                        <sl-radio-group id="rg-state" label="State" value="">
                            ${map(["NSW/ACT", "VIC", "QLD", "TAS", "SA", "WA", "NT"], (state) => {return html `
                                <sl-tooltip content="${state}">
                                    <sl-radio-button value=${state.substring(0,3)}>
                                        <sl-icon library="app-icons" name="${state.substring(0,3)}"></sl-icon>
                                    </sl-radio-button>
                                </sl-tooltip>
                            `})}
                        </sl-radio-group>
    
                    </phi-na-details>

                </phi-na-details-group>

            </phi-page-details>
        `
    }
}

