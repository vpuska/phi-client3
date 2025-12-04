/**
 * components/phi-fundCode-details.ts
 * --
 * @author VJP
 * @written 11-Nov-2025
 */

import {LitElement, html, css, nothing, type PropertyValues, type TemplateResult} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import {Fund, FundManager} from "../../api-models/funds.ts";
import {Globals} from "../../modules/globals.ts";
import xmlFormat from 'xml-formatter';
import type {PhiFundProductBrowser} from "./phi-fund-product-browser.ts";
import {constructTableRow, properCaseToWords} from "../../modules/utilities.ts";

/**
 * Fund details page..
 */
@customElement('phi-fund-details')
export class PhiFundDetails extends LitElement {

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
            height: 96px;
            background-color: var(--sl-color-gray-400);
            border-radius: 8px 8px 0 0;
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
    @property({ attribute: "fundCode-code", type: String }) fundCode!: string;
    @state() subPage = "details";
    @query("#details") detailsPage! : HTMLElement;
    @query("#brands") brandsPage! : HTMLElement;
    @query("#xml") xmlPage! : HTMLElement;
    @query("#products") productsPage! : PhiFundProductBrowser;


    setPage(page: string) {
        this.detailsPage.style.display = page === "details" ? "flex" : "none";
        this.brandsPage.style.display = page === "brands" ? "flex" : "none";
        this.xmlPage.style.display = page === "xml" ? "flex" : "none";
        this.productsPage.style.display = page === "products" ? "flex" : "none";

        if (page === "products")
            this.productsPage.loadProducts();
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
     * Renders the fund's restriction information.  Nothing is rendered if the fund is unrestricted.
     * @param fund
     */
    render_restrictions(fund: Fund) {
        if (fund.type === "Restricted")
            return this.render_block(
                html`Restrictions&nbsp;<sl-icon name="exclamation-triangle"></sl-icon>`,
                fund.restrictions.details
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
     * Renders the fundCode's contacts/communication details.
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
            <div class="header">
                <img class="logo" src="${fund.logo}" alt="${fund.code}">
                <h4>${fund.name}</h4>
                <sl-button variant="text" size="small" @click=${()=>this.setPage("details")}>DETAILS</sl-button>
                ${fund.brands.length > 0 ?
                    html`<sl-button variant="text" size="small" @click=${()=>this.setPage("brands")}>BRANDS</sl-button>`
                    : nothing
                }
                <sl-button variant="text" size="small" @click=${()=>this.setPage("xml")}>XML</sl-button>
                <sl-button variant="text" size="small" @click=${()=>this.setPage("products")}>PRODUCTS</sl-button>
                <sl-icon-button
                        style="font-size: 32px"
                        name="x"
                        label="close fund detail page"
                        @click=${() => Globals.get.pageManager().popPage()}
                ></sl-icon-button>
            </div>
            
            <div id="details" class="details">
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
            </div>
            
            <div id="brands" class="details">
                <phi-fund-brands fund="${this.fundCode}"></phi-fund-brands>
            </div>
            
            <div id="xml" class="details">
                <sl-textarea size="small" resize="auto" value="${xmlFormat(fund.xml.trim(), {collapseContent: true})}">
                </sl-textarea>
            </div>
            
            <phi-fund-product-browser id="products" class="details" fund="${fund.code}"></phi-fund-product-browser>
        `
    }
}


@customElement('phi-fund-brands')
export class PhiFundBrands extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
        }
        sl-card::part(base) {
            margin: 8px;
            width: 200px;
            height: 100%;  // ensure card gets stretched
        }
        sl-card::part(header) {
            background-color: var(--sl-color-gray-400);
        }
        sl-card::part(body) {
            flex: 1 0 0;
        }
        img.logo {
            max-width: 80%;
            max-height: 48px;
            min-height: 48px;
            width: auto;
            height: auto;
        }
        div[slot="header"] {
            display: flex;
            gap: 16px;
            justify-content: start;
            align-items: center;
        }
    `

    @property() fund: string = "";


    render() {
        const fund = FundManager.get(this.fund)!;

        return html`
            ${fund.brands.map((brand) => html`
                <sl-card>
                    <div slot="header"><img class="logo" src="${brand.logo}" alt="${fund.code}"></div>
                    <strong>${brand.name}</strong>
                    <div slot="footer">
                        <small style="flex:1 0 0">${brand.code}</small>
                        <sl-tooltip content="display brand details">
                            <sl-icon-button
                                    name="arrow-right"
                                    label="Display fund details"
                                    @click=${() => {
                                    }}
                            ></sl-icon-button>
                        </sl-tooltip>
                    </div>
                </sl-card>`
            )}
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-fund-details': PhiFundDetails,
        'phi-fund-brands': PhiFundBrands,
    }
}
