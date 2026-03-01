/**
 * components/phi-na/phi-na-details-10.ts
 * --
 * @author VJP
 * @written 11-Feb-2026
 */

import {html, css} from 'lit'
import {query, state} from 'lit/decorators.js'
import type {PhiKeywordSearch} from "../../shared-components/phi-keyword-search.ts";
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";
import {consume} from "@lit/context";
import {MobxLitElement} from "@adobe/lit-mobx";

/**
 * Health insurance needs analysis - Prior cover details
 */
export class PhiNADetails10 extends MobxLitElement {

    static styles = css`
        :host {
            height: 100%
        }
    `

    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;

    @state() searchResults: { fund: string, name: string, fundName: string, fundShortName: string }[] = [];
    @state() _summary: string = "Enter existing cover details";

    @query('phi-keyword-search#product-1') product1Input!: PhiKeywordSearch;
    @query('phi-keyword-search#product-2') product2Input!: PhiKeywordSearch;

    get coverType() {
        let cover = "None";
        if (this.product1Input.value) {
            cover = this.product1Input.value.type;
            if (this.product2Input.value)
                cover = "Combined"
        }
        return cover;
    }

    get state() {
        return this.product1Input.value ? this.product1Input.value.state : "";
    }

    validate() : boolean {
        const product1 = this.product1Input.value;
        const product2 = this.product2Input.value;

        if (!this.context)
            return true;

        if (!product1)
            return true;

        if (product1 === this.context.product1 && product2 === this.context.product2)
            return true;

        this.context.change({
            state: this.state,
            coverType: this.coverType,
            familyType: product1.adultsCovered.toString() + (product1.dependantCover ? "D" : ""),
            product1: product1,
            product2: product2,
            services: `${(product1.services || "")}${(product2?.services || "")}`,
        })

        return true;
    }

    /**
     * Handles updates to product search inputs:
     * - No existing cover (no products selected)
     * - Disables product 2 if product 1 is a combined or general health product.
     * - Applies product 1 attributes (state and coverage) to product 2 search parameters
     * */
    updateProducts() {
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
            
            Enter your existing policies, or skip this section if you are not insured.  Search terms can be full
            or partial words, and can include the fund name, state and family type.

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
                                    @phi-keyword-search-change=${this.updateProducts.bind(this)}>
                </phi-keyword-search>

                <phi-keyword-search id="product-2" search-extras disabled
                                    label="Select extras insurance product"
                                    style="width: 100%"
                                    @phi-keyword-search-change=${this.updateProducts.bind(this)}>
                </phi-keyword-search>
            </div>

        `
    }
}

