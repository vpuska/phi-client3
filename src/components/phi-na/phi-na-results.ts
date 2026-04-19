/**
 * components/phi-na/phi-na-results.ts
 * --
 * @author VJP
 * @written 09-Apr-2026
 */

import {css, html, nothing, type TemplateResult} from 'lit'
import {customElement} from "lit/decorators.js";
import {MobxLitElement} from "@adobe/lit-mobx";
import {context as phiNAContext, NeedsAnalysisContext, type ProductPair} from "./context.ts";
import {consume} from "@lit/context";
import type {Product} from "../../api-models/products.ts";
import type {PhiProductDetails} from "../phi-product-details/phi-product-details.ts";
import {Globals} from "../../modules/globals.ts";

@customElement('phi-na-results')
export class PhiNaResults extends MobxLitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-flow: column nowrap;
        }
        img {
            max-width: 80%;
            max-height: 48px;
            min-height: 48px;
            width: auto;
            height: auto;
        }
        table {
            border-spacing: 8px;
        }
        td, th {
            padding: 12px;
            border-radius: 8px;
            text-align: left;
            min-width: 300px;
            max-width: 300px;
        }
        td.dark {
            background-color: var(--sl-color-gray-100);
        }
        td.logo {
            background-color: lightgray;
    `

    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;

    private resultSet: ProductPair[] = [];

    /**
     * Handle click on individual product PHIS code to display the product details page
     */
    displayProductDetailsPage(product: Product) {
        const element: PhiProductDetails = document.createElement("phi-product-details");
        element.setAttribute("fund-code", product.fundCode);
        element.product = product;
        Globals.get.pageManager().pushPage(element)
    }

    render_logo(productPair: ProductPair) {
        const fund = productPair.fund!;
        let logo = fund.logo;
        if (productPair.brand) {
            fund.brands.forEach((brand) => {
                if (brand.code === productPair.brand)
                    logo = brand.logo;
            })
        }
        return html `
            <img src="${logo}" alt="Fund logo">
        `
    }

    render_product(product: Product | null) {
        if (product === null)
            return nothing;
        return html `
            ${product!.name}
        `
    }

    render_phis_code(productPair: ProductPair) {
        const p1 = productPair.hospital || productPair.generalHealth;
        const p2 = productPair.generalHealth !== productPair.hospital ? productPair.generalHealth : null;

        return html `
            <sl-button size="small" @click=${() => this.displayProductDetailsPage(p1!)}>${p1!.code}</sl-button>
            ${p2 ? html`<sl-button size="small" @click=${() => this.displayProductDetailsPage(p2)}>${p2!.code}</sl-button>` : nothing}
        `
    }

    render_row(renderer: (productPair: ProductPair) => TemplateResult, cellClass: string = "default") {
        return html`
            <tr>
                ${this.resultSet.map((productPair) => html`
                    <td class="${cellClass}">${renderer.call(this, productPair)}</td>
                `)}
            </tr>
        `
    }

    render() {
        const resultSet = this.context?.comparisonResults.sort((a, b) => a.premium - b.premium).slice(0,50)
        this.resultSet = resultSet || [];

        return html`
            <table>
                <!-- fund logo -->
                ${this.render_row(this.render_logo, "logo")}
                
                <!-- premium and excess -->
                <tr>
                    ${resultSet?.map((result) => html`
                        <td>
                            <span style="font-size: var(--sl-font-size-x-large); font-weight: bold;">
                                <sl-format-number
                                        type="currency"
                                        currency="AUD"
                                        value="${result?.premium}"
                                        lang="en-AU">
                                </sl-format-number>
                            </span>
                            <span style="font-size: var(--sl-font-size-medium)">
                                ${(result.hospital?.excess || 0 > 0 ? html`<br> 
                                                <sl-format-number 
                                                    type="currency" 
                                                    currency="AUD" 
                                                    value="${result.hospital?.excess}" 
                                                    lang="en-AU">
                                                </sl-format-number> excess`
                                        : nothing)
                                }
                            </span>
                        </td>
                    `)}
                </tr>
                
                <!-- product 1 -->
                ${this.render_row((productPair) => { return html `
                    ${this.render_product(productPair.hospital || productPair.generalHealth)}
                `}, "dark" )}
                
                <!-- product 2 -->
                ${this.context?.coverType === "Combined"
                    ? this.render_row((productPair) => { return html `
                        ${productPair.generalHealth !== productPair.hospital 
                            ? html`${this.render_product(productPair.generalHealth)}`
                            : nothing
                        }`}, "dark" )
                    : nothing 
                }

                <!-- phis code -->
                ${this.render_row(this.render_phis_code)}
            </table>
    `}
}

declare global {
    interface HTMLElementTagNameMap {
        'phi-na-results': PhiNaResults;
    }
}