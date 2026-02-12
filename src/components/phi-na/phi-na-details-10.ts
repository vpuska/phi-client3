/**
 * components/phi-na/phi-na-details-10.ts
 * --
 * @author VJP
 * @written 11-Feb-2026
 */

import {LitElement, html, css} from 'lit'
import {query, state} from 'lit/decorators.js'
import type {PhiKeywordSearch} from "../../shared-components/phi-keyword-search.ts";

/**
 * Health insurance needs analysis - Prior cover details
 */
export class PhiNADetails10 extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            padding: 0;
            background-color: var(--sl-color-gray-100);
            border-radius: 8px;
        }
    `

    @state() searchResults: { fund: string, name: string, fundName: string, fundShortName: string }[] = [];

    @query('phi-keyword-search#product-1') product1Input!: PhiKeywordSearch;
    @query('phi-keyword-search#product-2') product2Input!: PhiKeywordSearch;

    get product1() {
        return this.product1Input.value ? this.product1Input.value : null;
    }

    get product2() {
        return this.product2Input.value ? this.product2Input.value : null;
    }

    get coverType() {
        let cover = "None";
        if (this.product1Input.value) {
            cover = this.product1Input.value.type;
            if (this.product2Input.value)
                cover = "Combined"
        }
        return cover;
    }

    get summary() {
        return {
            "None": "No existing cover",
            "Combined": "Existing combined hospital and extras cover",
            "Hospital": "Existing hospital cover",
            "GeneralHealth": "Existing extras cover"
        } [this.coverType];
    }

    get state() {
        return this.product1Input.value ? this.product1Input.value.state : "";
    }

    /**
     * Handles updates to product search inputs:
     * - No existing cover (no products selected)
     * - Disables product 2 if product 1.
     * - Disables product 2 if product 1 is a combined or general health product.
     * - Applies product 1 attributes (state and coverage) to product 2 search parameters
     * */
    productSearchUpdated() {
        if (this.product1Input.value === null && this.product2Input.value === null) {
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

    /**
     * Main render routine
     */
    render() {
        return html`
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
        `
    }
}

