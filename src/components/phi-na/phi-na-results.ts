/**
 * components/phi-na/phi-na-results.ts
 * --
 * @author VJP
 * @written 09-Apr-2026
 */

import {css, html, nothing, type TemplateResult} from 'lit'
import {customElement, state} from "lit/decorators.js";
import {MobxLitElement} from "@adobe/lit-mobx";
import {consume} from "@lit/context";

import type {Product} from "../../api-models/products.ts";
import type {PhiProductDetails} from "../phi-product-details/phi-product-details.ts";
import {Globals} from "../../modules/globals.ts";
import {context as phiNAContext, NeedsAnalysisContext, type ProductPair} from "./context.ts";
import {Service, ServiceManager} from "../../api-models/services.ts";

/**
 * Render the results page of the needs analysis in a html table.  Each column represents a product pair (hospital and general health) and each
 * row is a product attribute.
 */
@customElement('phi-na-results')
export class PhiNAResults extends MobxLitElement {

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
        }
        td.service {
            font-size: x-small;
            padding: 0;
        }
        td.service div {
            margin: 0 4em;
            padding: 1px 1em;
            border-radius: 4px;
        }
        td.covered div {
            background-color: var(--sl-color-success-200);
        }
        td.not-covered div {
            background-color: var(--sl-color-danger-200);
        }
        td.restricted div {
            background-color: var(--sl-color-warning-200);
        }
        sl-details::part(content) {
            display: none;
        }
    `

    // Needs analysis context.
    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;

    // The final set of results for the comparison saved by the `render` method for display.
    private resultSet: ProductPair[] = [];

    @state() showBasicServices = false;
    @state() showBronzeServices = false;
    @state() showSilverServices = false;
    @state() showGoldServices = false;
    @state() showGeneralServices = false;

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
     * @param productPair
     * @note Assumes the comparison type is not `GeneralHealth`.
     */
    render_accommodation(productPair: ProductPair) {
        return html`<td>${productPair.hospital!.accommodationType}</td>`
    }

    /**
     * Render the dependant types covered by the product pair
     * @param productPair
     */
    render_dependants(productPair: ProductPair) {
        const product = productPair.hospital || productPair.generalHealth;
        const dependants = product?.dependantTypesShortDescription.trim().split(" ");
        const dependant_desc = {
            "Ch" : "Child",
            "St" : "Student",
            "YAdlt" : "Young Adult",
            "NonCls" : "Non-Classified",
            "NonSt" : "Non-Student",
            "Cond": "Conditional Non-student",
            "Dis" : "Disabled",
        }
        return html`<td>
            ${dependants?.map((d) => html`<sl-tag size="small" pill variant="primary">${dependant_desc[d as keyof typeof dependant_desc]}</sl-tag>`)}
        </td>`
    }

    render_service_heading(productPair: ProductPair, args: any[]) {
        const label = args[0] as string;
        const state = args[1] as "showBasicServices" | "showBronzeServices" | "showSilverServices" | "showGoldServices" | "showGeneralServices";
        const services = args[2] as Service[];
        const covered = services.filter((service) => productPair.services.includes(service.key)).length;
        const restricted = services.filter((service) => productPair.services.includes(service.key + "-")).length;
        const notCovered = services.length - covered - restricted;

        return html`
            <td>
                <sl-details 
                    ?open=${this[state]}
                    @sl-show=${() => this[state] = true}
                    @sl-hide=${() => this[state] = false}
                >
                    <div slot="summary">${label} 
                        ${covered > 0 ? html`<sl-badge variant="primary" pill>${covered}</sl-badge>` : nothing}
                        ${restricted > 0 ? html`<sl-badge variant="warning" pill>${restricted}</sl-badge>` : nothing}
                        ${notCovered > 0 ? html`<sl-badge variant="danger" pill>${notCovered}</sl-badge>` : nothing}
                    </div>
                </sl-details>
            </td>`
        }

    render_service(productPair: ProductPair, args: any[]) {
        const targetService = args[0] as Service;
        const s = productPair.services.filter((service) => service.startsWith(targetService.key));
        const label = targetService.description;
        if (s.length===0)
            return html`<td class="service not-covered"><div>${label}</div></td>`;
        else
            if (s[0] === targetService.key)
                return html`<td class="service covered"><div>${label}</div></td>`;
            else
                return html`<td class="service restricted"><div>${label}</div></td>`
    }

    /**
     * Renders an entire row of the resultset table.  The `render_row` method will call the render function for each product; and
     * the render function will return a single table cell.
     * @param renderer The render function that takes a product pair and returns a single table cell.
     * @param args Optional arguments to pass to the renderer.  Arguments depend on the renderer function.
     */
    render_row(renderer: (productPair: ProductPair, ...args: any) => TemplateResult, ...args: any) {
        return html`
            <tr>
                ${this.resultSet.map((productPair) => {
                    return html`${renderer.call(this, productPair, args)}`
                })}
            </tr>
        `
    }

    /**
     * Conditionally renders an entire row of the resultset table.  The row will not be rendered if the condition is `false`.
     * Otherwise, the function is the same as {@link render_row}.
     * the render function will return a single table cell.
     * @param condition If `false`, the row will not be rendered
     * @param renderer The render function that takes a product pair and returns a single table cell.
     * @param args Optional arguments to pass to the renderer.  Arguments depend on the renderer function.
     */
    render_row_if(condition: boolean, renderer: (productPair: ProductPair, ...args: any) => TemplateResult, ...args: any) {
        return condition ? this.render_row(renderer, ...args) : nothing
    }

    /**
     * Master render routine.  Rendering is delegated to the `render_row` method for each product attribute.  The `render_row` method
     * will call the attribute's render function which returns a single table cell.
     */
    render() {
        const resultSet = this.context?.comparisonResults.sort((a, b) => a.premium - b.premium).slice(0,50)
        // save as a class property for easy access...
        this.resultSet = resultSet || [];

        // determine what services are not consistently covered across the result set...
        // step 1 - the union of all services covered in the result set.
        let union = new Set<string>();
        this.resultSet.forEach((result) => {
            union = new Set<string>([...union, ...result.services])
        })
        // step 2 - the intersection of all services covered in the result set.  Ie.  Services that are consistently
        //           covered by all products.
        let intersection = new Set<string>([...union]);
        this.resultSet.forEach((result) => {
            intersection = new Set<string>(result.services.filter((service) => intersection.has(service)))
        })
        // step 3 - services that are not consistently covered by all products in the result set.
        //          Ie: union - intersection
        const differences = new Set<string>([...union]
            .filter((service) => !intersection.has(service))
            .map((service) => service.substring(0,3)))
        const serviceDifferences = [...differences].map((service) => ServiceManager.get(service)!)
        // split into categories
        const goldServices = this.showGoldServices? ServiceManager.goldServices : serviceDifferences.filter((s) => s.isGoldHospital);
        const silverServices = this.showSilverServices? ServiceManager.silverServices : serviceDifferences.filter((s) => s.isSilverHospital);
        const bronzeServices = this.showBronzeServices? ServiceManager.bronzeServices : serviceDifferences.filter((s) => s.isBronzeHospital);
        const basicServices = this.showBasicServices? ServiceManager.basicServices : serviceDifferences.filter((s) => s.isBasicHospital);
        const generalServices = this.showGeneralServices? ServiceManager.generalServices : serviceDifferences.filter((s) => s.isGeneralHealth);

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

                <!-- dependants -->
                ${this.context?.hasDependants ? this.render_row(this.render_dependants) : nothing} 

                <!-- basic service differences -->
                ${this.render_row_if(this.context!.needsHospitalServices, this.render_service_heading, "Basic Hospital", "showBasicServices", ServiceManager.basicServices)}
                ${basicServices.map((service) => this.render_row_if(this.context!.needsHospitalServices, this.render_service, service))}

                <!-- bronze service differences -->
                ${this.render_row_if(this.context!.needsHospitalServices, this.render_service_heading, "Bronze Hospital", "showBronzeServices", ServiceManager.bronzeServices)}
                ${bronzeServices.map((service) => this.render_row_if(this.context!.needsHospitalServices, this.render_service, service))}
                 
                <!-- silver service differences -->
                ${this.render_row_if(this.context!.needsHospitalServices, this.render_service_heading, "Silver Hospital", "showSilverServices", ServiceManager.silverServices)}
                ${silverServices.map((service) => this.render_row_if(this.context!.needsHospitalServices, this.render_service, service))}
 
                <!-- gold service differences -->
                ${this.render_row_if(this.context!.needsHospitalServices, this.render_service_heading, "Gold Hospital", "showGoldServices", ServiceManager.goldServices)}
                ${goldServices.map((service) => this.render_row_if(this.context!.needsHospitalServices, this.render_service, service))}
 
                <!-- general service differences -->
                ${this.render_row_if(this.context!.needsGeneralHealthServices, this.render_service_heading, "General Health", "showGeneralServices", ServiceManager.generalServices)}
                ${generalServices.map((service) => this.render_row_if(this.context!.needsGeneralHealthServices, this.render_service, service))}
 
            </table>
    `}
}

declare global {
    interface HTMLElementTagNameMap {
        'phi-na-results': PhiNAResults;
    }
}