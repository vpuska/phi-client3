/**
 * components/phi-product-details.ts
 * --
 * @author VJP
 * @written 11-Nov-2025
 */

import {LitElement, html, css, type PropertyValues, type TemplateResult, nothing} from 'lit'
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

        div#details {
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
        
        table.mini-table tr th {
            padding-right: 16px;
            text-align: left;
            font-weight: normal;
        }
    `

    @property({ attribute: "fund-code" }) fundCode!: string;
    @property({ attribute: false}) product: Product | null = null;
    @state() xml: string | undefined;
    @state() xmldoc = new DOMParser().parseFromString("<Product></Product>", "text/xml");
    @state() subPage = "details";
    @query("#details") detailsPage! : HTMLElement;
    @query("#xml") xmlPage! : HTMLElement;
    @query("#hospital") hospitalPage! : HTMLElement;
    @query("#extras") extrasPage! : HTMLElement;

    setPage(page: string) {
        this.detailsPage.style.display = page === "details" ? "flex" : "none";
        this.xmlPage.style.display = page === "xml" ? "flex" : "none";
        this.hospitalPage.style.display = page === "hospital" ? "flex" : "none";
        this.extrasPage.style.display = page === "extras" ? "flex" : "none";
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);

        this.product?.getXml().then(result => {
            // deliberate delay for testing!
            new Promise((resolve) => setTimeout(resolve, 2000)).then(() => {
                this.xml = result;
                const parser = new DOMParser();
                this.xmldoc = parser.parseFromString(result, "text/xml");
            })
        })

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

    render_table_row(label: string | TemplateResult, details: string | TemplateResult) {
        return html`
            <tr>
                <th scope="row">${label}</th>
                <td>${details}</td>
            </tr>
        `
    }

    render_summary() {
        const phis = `https://www.privatehealth.gov.au/dynamic/Premium/PHIS/${this.fundCode}/${this.product?.code}`
        return this.render_block(
            "Summary",
            html`
                <table class="mini-table">
                    ${this.render_table_row("Name", this.product!.name)}
                    ${this.render_table_row("Type", this.product!.type)}
                    ${this.render_table_row("Corporate?", this.product!.isCorporate ? "Yes" : "No")}
                    ${this.render_table_row("Brands", this.product!.brands || "-")}
                    ${this.render_table_row("PHIS", html`<a href="${phis}" target="_blank">${phis}</a>`)}
                </table>
        `)
    }

    render_coverage() {
        const check = html`<sl-icon style="color:var(--sl-color-success-500)" name="check-circle-fill"></sl-icon>`
        const cross = html`<sl-icon style="color:var(--sl-color-danger-500)" name="x-circle-fill"></sl-icon>`


        return this.render_block(
            `Coverage: ${this.product?.coverageDescription}`,
            html`
                <table class="mini-table">
                    ${this.render_table_row("Number of Adults", this.product!.adultsCovered.toString())}
                    ${this.render_table_row("Children", this.product!.childCover ? check : cross)}
                    ${this.render_table_row("Students", this.product!.studentCover ? check : cross)}
                    ${this.render_table_row("Non-students", this.product!.nonStudentCover ? check : cross)}
                    ${this.render_table_row("Young Adults", this.product!.youngAdultCover ? check : cross)}
                    ${this.render_table_row("Non Classified Dependants", this.product!.nonClassifiedCover ? check : cross)}
                    ${this.render_table_row("Disabled Dependants", this.product!.disabilityCover ? check : cross)}
                </table>
            `
        )
    }

    render_otherProductDetails(xmldoc: Document) {
        let details: string = "Still waiting..."
        if (this.xml) {
            // noinspection CssInvalidHtmlTagReference
            details = xmldoc.querySelector("Product > HospitalCover > OtherProductFeatures")?.textContent || "Oops!";
        }
        return this.render_block("Other Product Details", details);
    }

    render() {
        const fund = FundManager.get(this.fundCode)!;

        const typeLabel = {
            Combined: "Hospital + Extras",
            Hospital: "Hospital",
            GeneralHealth: "Extras",
        }

        return html`
            <div class="header">
                <img class="logo" src="${fund.logo}" alt="${fund.code}">
                <h4>${this.product!.code} - ${this.product!.name}</h4>
                <sl-button variant="text" size="small" @click=${()=>this.setPage("details")}>DETAILS</sl-button>
                ${this.product?.isHospital ? html`<sl-button variant="text" size="small" @click=${()=>this.setPage("hospital")}>HOSPITAL</sl-button>` : nothing}
                ${this.product?.isGeneralHealth ? html`<sl-button variant="text" size="small" @click=${()=>this.setPage("extras")}>EXTRAS</sl-button>` : nothing}
                <sl-button variant="text" size="small" @click=${()=>this.setPage("xml")}>XML</sl-button>
                <sl-icon-button
                        style="font-size: 32px"
                        name="x"
                        label="close close detail page"
                        @click=${() => Globals.get.pageManager().popPage()}
                ></sl-icon-button>
            </div>
            
            <div id="details" class="details">

                <div style="display:flex; flex-direction: row; justify-content: space-between; font-size: x-large; font-weight: bold">
                    <div>
                        <sl-card>${typeLabel[this.product?.type!]}</sl-card>
                        <sl-card>${this.product?.coverageDescription}</sl-card>
                        <sl-card>${this.product?.state === "ALL" ? "All States" : this.product?.state}</sl-card>
                        ${this.product?.excess ? html`<sl-card>$${this.product?.excess} Excess</sl-card>` : nothing}
                    </div>
                    <div>
                        <sl-card>
                            Premium: <sl-format-number type="currency" currency="AUD" value="${this.product?.premium}" lang="en-AU"></sl-format-number>
                        </sl-card>
                    </div>
                </div>

                <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 5%">
                    <div style="min-width:600px; max-width: 45%">
                        ${this.render_summary()}
                    </div>
                    <div style="min-width:600px; max-width: 45%">
                        ${this.render_coverage()}
                    </div>
                </div>

                ${this.render_otherProductDetails(this.xmldoc)}
            </div>

            <div id="hospital" class="details">
                This is the hospital page
            </div>

            <div id="extras" class="details">
                This is the extras page
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
