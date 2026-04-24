/**
 * components/phi-product-details.ts
 * --
 * @author VJP
 * @written 11-Nov-2025
 */

import {LitElement, html, css, type PropertyValues, type TemplateResult, nothing} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import xmlFormat from 'xml-formatter';

import {FundManager} from "../../api-models/funds.ts";
import {Product} from "../../api-models/products.ts";
import {type HospitalTier, ServiceManager, type ServiceType} from "../../api-models/services.ts";

/**
 * Display product details for a single product.
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

        phi-card::part(body) {
            display: flex;
            align-items: center;
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
        
        table.services td:nth-child(1) {
            width: 32px;
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
            new Promise((resolve) => setTimeout(resolve, 100)).then(() => {
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
                    ${this.render_table_row("Brands", this.product!.brandCodes || "-")}
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

    render_hospital_services(serviceType: ServiceType, tier: HospitalTier = "None") {
        const icons = {
            Y : "check-circle-fill",
            N : "x-circle-fill",
            R : "question-circle-fill",
        }
        const style = {
            Y : "color:var(--sl-color-success-500)",
            N : "color:var(--sl-color-danger-500)",
            R : "color:var(--sl-color-warning-500)",
        }
        const tooltip = {
            Y: "For information on what is covered under each category, see https://www.privatehealth.gov.au/categories",
            N: "This categories is not covered by this policy.",
            R: "Restricted categories partially cover your hospital costs as a private patient in a public hospital. You may incur significant expenses in a private room or private hospital."
        }
        return html`
            <table class="services">
                ${ServiceManager.getAll(serviceType, tier).map((service) => html`
                    <tr>
                        <td>
                            <sl-tooltip>
                                <div slot="content">${tooltip[this.product?.coversService(service.key) ?? "N"]}</div>
                                <sl-icon 
                                    name="${icons[this.product?.coversService(service.key) ?? "N"]}" 
                                    style="${style[this.product?.coversService(service.key) ?? "N"]}">
                                </sl-icon>
                            </sl-tooltip>
                        </td>
                        <td>${service.description}</td>
                    </tr>
                `)}
            </table>
        `
    }

    render_hospital() {
        return html`
            <h3>Gold</h3>
            ${this.render_hospital_services("H", "Gold")}
            <h3>Silver</h3>
            ${this.render_hospital_services("H", "Silver")}
            <h3>Bronze</h3>
            ${this.render_hospital_services("H", "Bronze")}
            <h3>Basic</h3>
            ${this.render_hospital_services("H", "Basic")}
        `
    }

    render_general_health() {
        return html`
            ${this.render_hospital_services("G", "None")}
        `
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

            <phi-page-header logo="${fund.logo}" heading="${this.product!.code} - ${this.product!.name}">
                <sl-button variant="text" size="small" @click=${()=>this.setPage("details")}>DETAILS</sl-button>
                ${this.product?.isHospital ? html`<sl-button variant="text" size="small" @click=${()=>this.setPage("hospital")}>HOSPITAL</sl-button>` : nothing}
                ${this.product?.isGeneralHealth ? html`<sl-button variant="text" size="small" @click=${()=>this.setPage("extras")}>EXTRAS</sl-button>` : nothing}
                <sl-button variant="text" size="small" @click=${()=>this.setPage("xml")}>XML</sl-button>
            </phi-page-header>

            <phi-page-details id="details">

                <phi-headline>
                    <phi-card slot="left">${typeLabel[this.product?.type!]}</phi-card>
                    <phi-card slot="left">${this.product?.coverageDescription}</phi-card>
                    <phi-card slot="left">${this.product?.state === "ALL" ? "All States" : this.product?.state}</phi-card>
                    ${this.product?.excess ? html`<phi-card slot="left">$${this.product?.excess} Excess</phi-card>` : nothing}

                    <phi-card slot="right">
                        <div> Premium:
                            <sl-format-number type="currency" currency="AUD" value="${this.product?.premium}"
                                              lang="en-AU"></sl-format-number>
                            <br>
                            <span style="font-size: xx-small">
                                # excludes Australian Government Rebate or Lifetime Healthcover Loadings 
                            </span>
                        </div>
                    </phi-card>
                </phi-headline>


                <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 5%">
                    <div style="min-width:600px; max-width: 45%">
                        ${this.render_summary()}
                    </div>
                    <div style="min-width:600px; max-width: 45%">
                        ${this.render_coverage()}
                    </div>
                </div>

                ${this.render_otherProductDetails(this.xmldoc)}
            </phi-page-details>

            <phi-page-details id="hospital">
                ${this.render_hospital()}
            </phi-page-details>

            <phi-page-details id="extras">
                ${this.render_general_health()}
            </phi-page-details>
            
            <phi-page-details id="xml" style="padding: 0">
                <sl-textarea 
                        size="small" 
                        resize="auto" 
                        value=${this.xml ? xmlFormat(this.xml.trim(), {collapseContent:true}) : 'Loading...'}
                >
                </sl-textarea>
            </phi-page-details>
        `
    }

}declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-product-details': PhiProductDetails;
    }
}


