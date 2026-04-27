/**
 * components/phi-na/phi-na-results.ts
 * --
 * @author VJP
 * @written 09-Apr-2026
 */

import {css, html, nothing, type TemplateResult} from 'lit'
import {customElement} from "lit/decorators.js";
import {MobxLitElement} from "@adobe/lit-mobx";
import {consume} from "@lit/context";

import type {Product} from "../../api-models/products.ts";
import type {PhiProductDetails} from "../phi-product-details/phi-product-details.ts";
import {Globals} from "../../modules/globals.ts";
import {context as phiNAContext, NeedsAnalysisContext, type ProductPair} from "./context.ts";

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

    // Needs analysis context.
    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;

    // The final set of results for the comparison saved by the `render` method for display.
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

    /* ************************************************************ */
    /*                    RESULTS ROW RENDERERS                     */
    /* ************************************************************ */

    /**
     * Render the product or brand logo.
     * @param productPair
     */
    render_logo(productPair: ProductPair) : TemplateResult {
        const fund = productPair.fund!;
        let logo = fund.logo;
        if (productPair.brand) {
            fund.brands.forEach((brand) => {
                if (brand.code === productPair.brand)
                    logo = brand.logo;
            })
        }
        return html `<td class="logo"><img src="${logo}" alt="Fund logo"></td>`
    }

    /**
     * Render the premium amount and excess, if applicable.
     * @param productPair
     */
    render_premium(productPair: ProductPair) {
        const curr = function(amt: number) {
            return html`<sl-format-number type="currency" currency="AUD" value="${amt}" lang="en-AU"></sl-format-number>`
        }
        return html`
            <td>
                <span style="font-size: var(--sl-font-size-x-large); font-weight: bold">
                    ${curr(productPair?.premium)}
                </span>
                <span style="font-size: var(--sl-font-size-medium)">
                    ${(productPair.hospital?.excess || 0 > 0 
                        ? html`<br>${curr(productPair.hospital!.excess)} excess`
                        : nothing    
                    )}
                </span>
            </td>
        `
    }

    /**
     * Render the first product name.  If the comparison type is for `GeneralHealth` then this will render the general health product name. Otherwise
     * it will render the hospital or combined product name.
     * @param productPair
     */
    render_product1(productPair: ProductPair) {
        const product = productPair.hospital || productPair.generalHealth;
        return html`<td class="dark">${product!.name}</td>`
    }

    /**
     * Render the second product name.  This will only render a value if the general health product is not null and differs to the
     * hospital product.  It should only be used if the comparison type is `Combined`.
     * @param productPair
     */
    render_product2(productPair: ProductPair) {
        const product = productPair.generalHealth !== productPair.hospital ? productPair.generalHealth : null;
        return product ? html`<td class="dark">${product!.name}</td>` : html `<td></td>`;
    }

    /**
     * Render the PHIS code for the product pair, taking into account whether there are one or two products in the pair.
     * @param productPair
     */
    render_phis_code(productPair: ProductPair) {
        const p1 = productPair.hospital || productPair.generalHealth;
        const p2 = productPair.generalHealth !== productPair.hospital ? productPair.generalHealth : null;
        return html `
            <td>
                <sl-button size="small" @click=${() => this.displayProductDetailsPage(p1!)}>${p1!.code}</sl-button>
                ${p2 ? html`<sl-button size="small" @click=${() => this.displayProductDetailsPage(p2)}>${p2!.code}</sl-button>` : nothing}
            </td>
        `
    }

    /**
     * Render the accommodation type for the product pair.
     * @note Assumes the comparison type is not `GeneralHealth`.
     * @param productPair
     */
    render_accommodation(productPair: ProductPair) {
        return html`<td>${productPair.hospital!.accommodationType}</td>`
    }

    /**
     * Renders an entire row of the resultset table.  The `render_row` method will call the render function for each product; and
     * the render function will return a single table cell.
     * @param renderer The render function that takes a product pair and returns a single table cell.
     */
    render_row(renderer: (productPair: ProductPair) => TemplateResult) {
        return html`
            <tr>
                ${this.resultSet.map((productPair) => {
                    return html`${renderer.call(this, productPair)}`
                })}
            </tr>
        `
    }

    /**
     * Master render routine
     */
    render() {
        const resultSet = this.context?.comparisonResults.sort((a, b) => a.premium - b.premium).slice(0,50)
        this.resultSet = resultSet || [];

        return html`
            <table>
                <!-- fund logo -->
                ${this.render_row(this.render_logo)}
                
                <!-- premium and excess -->
                ${this.render_row(this.render_premium)}
                
                <!-- product 1 -->
                ${this.render_row(this.render_product1)}
                
                <!-- product 2 -->
                ${this.context?.coverType === "Combined" ? this.render_row(this.render_product2) : nothing}
 
                <!-- accommodation type -->
                ${this.context?.coverType !== "GeneralHealth" ? this.render_row(this.render_accommodation) : nothing}
                
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