/**
 * components/phi-product-details.ts
 * --
 * @author VJP
 * @written 11-Nov-2025
 */

import {LitElement, html, css, type PropertyValues, type TemplateResult} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import xmlFormat from 'xml-formatter';

import {FundManager} from "../api-models/funds.ts";
import {Globals} from "../modules/globals.ts";
import {Product} from "../api-models/products.ts";

/**
 * Product details page..
 */
@customElement('phi-product-details')
export class PhiProductDetails extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`

        :host {
            display: flex;
            flex-direction: column;
            flex: 1 0 0;    // take up available space in our container (phi-page-manager)
            background-color: var(--sl-color-gray-100);
        }

        /* header block */
        div.header { 
            display: flex;
            flex-direction: row;
            align-items: center;
            height: 32px;
            background-color: var(--sl-color-gray-400);
            border-radius: 8px 8px 0 0;
            border-bottom: 1px solid var(--sl-color-gray-800);
            gap: 32px;
            padding: 16px;
        }

        /* header block - fundCode name */
        div.header > h4 { 
            flex: 1 0 0;
            margin: 0;
        }
        
        /* details block */
        .details { 
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            flex: 1 0 0;
            background-color: var(--sl-color-gray-200);
            border-radius: 0 0 8px 8px;
            overflow-y: auto;
        }

        div#details, div#brands {
            padding: 16px;
        }

        img.logo {
            max-width: 80%;
            max-height: 48px;
            min-height: 48px;
            width: auto;
            height: auto;
        }

        h4 {
            margin-bottom: 0;
        }
        small > *:first-child {
            margin-top: 2px;
        }
    `
    @property({ attribute: "fund-code" }) fundCode!: string;
    @property({ attribute: false}) product: Product | null = null;
    @state() xml: string | undefined;
    @state() xmldoc = new DOMParser().parseFromString("<Product></Product>", "text/xml");
    @state() subPage = "details";
    @query("#details") detailsPage! : HTMLElement;
    @query("#xml") xmlPage! : HTMLElement;

    setPage(page: string) {
        this.detailsPage.style.display = page === "details" ? "flex" : "none";
        this.xmlPage.style.display = page === "xml" ? "flex" : "none";

        if (page === "xml" && this.xml === undefined) {
            this.product?.getXml().then(result => {
                this.xml = result;
                const parser = new DOMParser();
                this.xmldoc = parser.parseFromString(result, "text/xml");
            })
        }
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.setPage("details");
    }

    /**
     * Renders a block of information displaying a title and details using the following template:
     * <pre>
     *  <div>
     *      <h4>${title}</h4>
     *      <small><p>${details}</p></small>
     *  </div>
     *  </pre>
     * @param title
     * @param details
     */
    render_block(title: string | TemplateResult, details: string | TemplateResult) {
        return html`
            <div><h4>${title}</h4><small><p>${details}</p></small></div>
        `
    }

    /**
     * Renders the product's basic details..
     * @param product
     */
    render_description(product: Product | null) {
        if (!product)
            return html`Product loading...`;

        return this.render_block(
            html`Name`,
            product.name
        )
    }

    render() {
        const fund = FundManager.get(this.fundCode)!;

        return html`
            <div class="header">
                <img class="logo" src="${fund.logo}" alt="${fund.code}">
                <h4>${this.product!.code} ${this.product!.name}</h4>
                <sl-button variant="text" size="small" @click=${()=>this.setPage("details")}>DETAILS</sl-button>
                <sl-button variant="text" size="small" @click=${()=>this.setPage("xml")}>XML</sl-button>
                <sl-icon-button
                        style="font-size: 32px"
                        name="x"
                        label="close close detail page"
                        @click=${() => Globals.get.pageManager().popPage()}
                ></sl-icon-button>
            </div>
            
            <div id="details" class="details">
                ${this.render_description(this.product)}
            </div>
            
            <div id="xml" class="details">
                <sl-textarea 
                        size="small" 
                        resize="auto" 
                        value=${this.xml ? xmlFormat(this.xml.trim(), {collapseContent:true}) : 'Loading...'}
                >
                </sl-textarea>
            </div>
        `
    }

}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-product-details': PhiProductDetails,
    }
}
