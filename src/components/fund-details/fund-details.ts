/**
 * components/phi-fundCode-openDetails.ts
 * --
 * @author VJP
 * @written 11-Nov-2025
 */

import {LitElement, html, css, nothing, type PropertyValues, type TemplateResult} from 'lit'
import {property, query, state} from 'lit/decorators.js'
import xmlFormat from 'xml-formatter';

import {Fund, FundManager} from "../../api-models/funds.ts";
import type {PhiFundProductBrowser} from "./fund-product-browser.ts";
import {constructTableRow, properCaseToWords} from "../../modules/utilities.ts";

/**
 * Fund openDetails page..
 */
export class PhiFundDetails extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`

        :host {
            display: flex;
            flex-direction: column;
            flex: 1 0 0;    // take up available space in our container (phi-page-manager)
            background-color: var(--sl-color-gray-100);
        }
        h4 {
            margin-bottom: 0;
        }
        small > *:first-child {
            margin-top: 2px;
        }
        div#brands-list {
            display: flex;
            flex-flow: row wrap;
            gap: 12px;
        }
    `

    @property({ attribute: "fund-code", type: String }) fundCode!: string;
    @state() subPage = "openDetails";
    @query("#openDetails") detailsPage! : HTMLElement;
    @query("#brands") brandsPage! : HTMLElement;
    @query("#xml") xmlPage! : HTMLElement;
    @query("#products") productsPage! : PhiFundProductBrowser;


    setPage(page: string) {
        this.detailsPage.style.display = page === "openDetails" ? "flex" : "none";
        this.brandsPage.style.display = page === "brands" ? "flex" : "none";
        this.xmlPage.style.display = page === "xml" ? "flex" : "none";
        this.productsPage.style.display = page === "products" ? "flex" : "none";

        if (page === "products")
            this.productsPage.loadProducts();
    }

    protected firstUpdated(_changedProperties: PropertyValues) {
        super.firstUpdated(_changedProperties);
        this.setPage("openDetails");
    }

    /**
     * Renders a block of information displaying a title and openDetails using the following template:
     * <pre>
     *  <div>
     *      <h4>${title}</h4>
     *      <small><p>${openDetails}</p></small>
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
     * Renders the fund's restriction information.  Nothing is rendered if the fund is unrestricted.
     * @param fund
     */
    render_restrictions(fund: Fund) {
        if (fund.type === "Restricted")
            return this.render_block(
                html`Restrictions&nbsp;<sl-icon name="exclamation-triangle"></sl-icon>`,
                html `${fund.restrictions.details}`
            )
    }

    /**
     * Renders the fund's address.
     * @param fund
     */
    render_address(fund: Fund) {
        return this.render_block(
            "Address",
            html`
            ${fund.address.lines.map((line) => html`${line}<br>`)}
            ${fund.address.town} ${fund.address.state} ${fund.address.postcode}
        `
        )
    }

    /**
     * Renders an individual fund contact.  Used by `render_contacts()`.
     * @param iconName Icon to prefix the contact title
     * @param text Text title for contact
     */
    render_contact(iconName: string, text: string) {
        return text ? html`
            <sl-icon style="margin-right:0.5em" name=${iconName}></sl-icon>
            <a href=${text} target="_blank">${text}</a><br>
        ` : nothing;
    }

    /**
     * Renders the fundCode's contacts/communication openDetails.
     * @param fund
     */
    render_contacts(fund: Fund) {
        if (fund.communications.email || fund.communications.phone || fund.communications.website) {
            return this.render_block(
                "Communication",
                html`
                ${this.render_contact("telephone", fund.communications.phone)}
                ${this.render_contact("globe2", fund.communications.website)}
                ${this.render_contact("envelope", fund.communications.email)}
            `,
            )
        }
    }

    /**
     * Renders the fundCode's website links in a table.
     * @param fund
     */
    render_websites(fund: Fund) {
        if (fund.websiteLinks.length > 0)
            return this.render_block(
                "Web-sites",
                html`
                <table>
                    ${fund.websiteLinks.map((link) => {
                    return constructTableRow(
                        properCaseToWords(link.title),
                        " : ",
                        html`<a href=${link.link} target="_blank">${link.link}</a>`
                    )
                })}
                </table>
            `
            );
    }

    /**
     * Render the fundCode's dependant limits as a table.
     * @param fund
     */
    render_dependant_limits(fund: Fund) {
        const limits = [ ...fund.dependantLimits.dependantLimits.values() ];
        return this.render_block(
            "Dependant Limits",
            html`
            <table>
                ${limits.map((limit) => {
                const text = limit.supported ? `ages ${limit.minAge}-${limit.maxAge}` : "not supported";
                return constructTableRow(properCaseToWords(limit.title), " : ", " ", text);
            })}
            </table>
            ${fund.dependantLimits.nonClassifiedDependantDescription ?
                html`<p>NOTE Non-classified dependants: ${fund.dependantLimits.nonClassifiedDependantDescription}<\p>`
                : nothing
            }
        `
        )
    }


    render() {
        const fund = FundManager.get(this.fundCode)!;

        return html`
            <phi-page-header logo="${fund.logo}" heading="${fund.name}">
                <sl-button variant="text" size="small" @click=${()=>this.setPage("openDetails")}>DETAILS</sl-button>
                ${fund.brands.length > 0 ?
                        html`<sl-button variant="text" size="small" @click=${()=>this.setPage("brands")}>BRANDS</sl-button>`
                        : nothing
                }
                <sl-button variant="text" size="small" @click=${()=>this.setPage("xml")}>XML</sl-button>
                <sl-button variant="text" size="small" @click=${()=>this.setPage("products")}>PRODUCTS</sl-button>
            </phi-page-header>
            
            <phi-page-details id="details">
                <div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 5%">
                    <div style="min-width:600px; max-width: 45%">
                        ${this.render_block("Description", fund.description!)}
                        ${this.render_restrictions(fund)}
                    </div>
                    <div style="min-width:600px; max-width: 45%">
                        ${this.render_address(fund)}
                        ${this.render_contacts(fund)}
                    </div>
                </div>
                ${this.render_websites(fund)}
                ${this.render_dependant_limits(fund)}
            </phi-page-details>

            <phi-page-details id="brands">
                <div id="brands-list">
                    ${fund.brands.map((brand) => html`
                        <phi-card style="width:200px" header footer>
                            <phi-logo slot="header" src="${brand.logo}" alt="${fund.code}"></phi-logo>
                            <strong>${brand.name}</strong>
                            <div slot="footer">
                                <small>${brand.code}</small>
                            </div>
                        </phi-card>`
                    )}
                </div>
            </phi-page-details>

            <phi-page-details id="xml" style="padding: 0">
                <sl-textarea size="small" resize="auto" value="${xmlFormat(fund.xml.trim(), {collapseContent: true})}">
                </sl-textarea>
            </phi-page-details>
            
            <phi-fund-product-browser id="products" class="details" fund="${fund.code}"></phi-fund-product-browser>
        `
    }
}

