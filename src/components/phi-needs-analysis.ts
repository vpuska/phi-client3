/**
 * components/phi-needs-analysis.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {LitElement, html, css} from 'lit'
import {customElement, query, state} from 'lit/decorators.js'
import type {PhiKeywordSearch} from "../shared-components/phi-keyword-search.ts";
import {SlDetails, type SlRadioGroup} from "@shoelace-style/shoelace";
import {map} from 'lit/directives/map.js';
/**
 * Health insurance needs analysis.
 */
@customElement('phi-needs-analysis')
export class PhiNeedsAnalysis extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            padding: 0;
            background-color: var(--sl-color-gray-100);
            border-radius: 8px;
        }
        sl-details:first-of-type::part(header) {
            border-radius: 6px 6px 0 0;
        }
        sl-details:not([open]):last-of-type::part(header) {
            border-radius: 0 0 6px 6px;
        }
        sl-details[open]:last-of-type::part(base) {
            border-radius: 0 0 8px 8px;
        }
        sl-details::part(content) {
            padding: 24px 48px;
        }
        sl-details::part(header) {
            background-color: var(--sl-color-gray-400);
        }
        sl-icon-button, sl-icon {
            font-size: 2rem;
        }
    `
    
    @state() details1Heading = "Do you have existing insurance?";

    @state() selectedState = "";
    @state() searchResults: { fund: string, name: string, fundName: string, fundShortName: string }[] = [];

    @query('phi-keyword-search#product-1') product1Input!: PhiKeywordSearch;
    @query('phi-keyword-search#product-2') product2Input!: PhiKeywordSearch;

    @query('sl-details#details-1') details1!: SlDetails;
    @query('sl-details#details-2') details2!: SlDetails;

    @query('sl-radio-group#rg-cover-type') coverTypeRG!: SlRadioGroup;
    @query('sl-radio-group#rg-state') stateRG!: SlRadioGroup;
    /**
     * Create the shadow root.  Add event listeners targeting elements in the shadow DOM.
     */
    createRenderRoot() {
        const root = super.createRenderRoot();

        // Add event to close all other details when one is shown
        root.addEventListener('sl-show', event => {
            const oldDtl = root.querySelector('sl-details[open]') as SlDetails | null;
            if ((event.target as Element).tagName !== 'SL-DETAILS')
                return;
            const newDtl = event.target as SlDetails;
            if (oldDtl) {
                event.preventDefault();
                oldDtl.hide().then(() => {if (!oldDtl.open) newDtl.show().then()});
            }
        });

        return root;
    }

    productSearchUpdated() {
        if (this.product1Input.value === null && this.product2Input.value === null) {
            this.details1Heading = "No existing cover";
            return;
        }

        if (!this.product1Input.value) {
            this.product2Input.value = null;
            this.product2Input.disabled = true;
            return;
        }
        if (this.product1Input.value.type === "Combined" || this.product1Input.value.type === "GeneralHealth") {
            this.product2Input.value = null;
            this.product2Input.disabled = true;
            this.product2Input.placeholder = this.product1Input.value.name;
            this.details1Heading = {
                'Combined': 'Existing combined hospital and extras cover',
                'Hospital': 'Existing hospital cover',
                'GeneralHealth': 'Existing extras cover'
            } [this.product1Input.value.type];
            return;
        }
        this.product2Input.disabled = false;
        this.product2Input.placeholder = "Select extras insurance product";

        let autoKeywords: string = this.product1Input.value.state;
        switch (this.product1Input.value.coverageDescription) {
            case "Single Parent Family":
                autoKeywords = autoKeywords.concat(" Sole Parent");
                break;
            case "Dependants Only":
                autoKeywords = autoKeywords.concat(" Dependent");
                break;
            default:
                autoKeywords = autoKeywords.concat(" ", this.product1Input.value.coverageDescription);
        }

        this.product2Input.autoKeywords = autoKeywords;
    }

    verifyProducts(e: Event) {
        if (this.product1Input.value === null)
            { this.details1.summary = "No existing cover"; this.coverTypeRG.value = ""; }
        else if (this.product1Input.value.type === "Combined")
            { this.details1.summary = "Existing combined hospital and extras cover"; this.coverTypeRG.value = "Combined"; }
        else if (this.product1Input.value.type === "GeneralHealth")
            { this.details1.summary = "Existing extras cover"; this.coverTypeRG.value = "Extras"; }
        else if (this.product2Input.value === null)
            { this.details1.summary = "Existing hospital cover"; this.coverTypeRG.value = "Hospital"; }
        else
            { this.details1.summary = "Existing hospital and extras cover"; this.coverTypeRG.value = "Combined"; }

        if (this.product1Input.value !== null)
            this.stateRG.value = this.product1Input.value.state;

        e.stopPropagation();
    }

    render_continue(label: string) {
        return html`
            <div style="display: flex; padding: 24px; justify-content: right; align-items: center; gap: 0.5rem;">
                <sl-button @click=${() => this.details1.hide().then(() => this.details2.show())}>
                    ${label}
                </sl-button>
            </div>
        `
    }

    render() {
        return html`
            <phi-page-details>
                
                <sl-details id="details-1" @sl-hide=${this.verifyProducts.bind(this)} summary="Do you have existing cover?" open>

                    <p>Enter your existing policies, or skip this section if you are not insured.  Search terms can be full
                    or partial words, and can include the fund name, state and family type.</p>

                    <p style="margin-left: 12px;">
                        Examples:<br>
                        <code>bupa basic plus nsw fam</code><br>
                        <code>hosp gold vic</code><br>
                        <code>defence top hosp</code>
                    </p>

                    <div style="margin: 24px 0; padding:24px 24px 48px; border: 1px solid var(--sl-color-gray-400); border-radius: 6px;">
                        <phi-keyword-search id="product-1"
                                            label="Select combined, hospital or extras insurance product"
                                            style="width: 100%; margin-bottom: 1rem;"
                                            @phi-keyword-search-change=${this.productSearchUpdated.bind(this)}>
                        </phi-keyword-search>

                        <phi-keyword-search id="product-2" search-extras disabled
                                            label="Select extras insurance product"
                                            style="width: 100%"
                                            @phi-keyword-search-change=${this.productSearchUpdated.bind(this)}>
                        </phi-keyword-search>
                    </div>

                    ${this.render_continue("Continue")}
                    
                </sl-details>
                
                <sl-details id="details-2" summary="Cover details">

                    <sl-radio-group id="rg-cover-type" label="Cover Type" value="">
                        <sl-radio-button value="Combined">Combined</sl-radio-button>
                        <sl-radio-button value="Hospital">Hospital</sl-radio-button>
                        <sl-radio-button value="Extras">Extras</sl-radio-button>
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
                    
                </sl-details>
                
            </phi-page-details>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-needs-analysis': PhiNeedsAnalysis,
    }
}
