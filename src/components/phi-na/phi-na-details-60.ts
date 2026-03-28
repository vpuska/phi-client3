/**
 * components/phi-na/phi-na-details-60.ts
 * --
 * @author VJP
 * @written 03-March-2026
 */

import {html, css, nothing, type TemplateResult} from 'lit'
import {customElement, state} from 'lit/decorators.js'
import {consume} from "@lit/context";
import {MobxLitElement} from "@adobe/lit-mobx";
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";
import {FundManager} from "../../api-models/funds.ts";
import {type HospitalTier, ServiceManager, type ServiceType} from "../../api-models/services.ts";

/**
 * Health insurance needs analysis component to capture cover type, family type and state.  Also fetches
 * product data from the database based on the selected state and family type.
 */
@customElement('phi-na-details-60')
export class PhiNADetails60 extends MobxLitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 1em;
        }
        h4 {
            margin-bottom: 0;
        }
    `
    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;
    @state() error: string = "";


    render_block(heading: string | TemplateResult, detail: string | TemplateResult) {
        return html`
            <div><h4>${heading}</h4>${detail}<div>
        `
    }

    render_existing() {
        const product1 = this.context?.product1;
        const product2 = this.context?.product2;
        if (product1 || product2) {
            return this.render_block("Current Policy", html`
                ${product1?.fund.name}: ${product1?.name}<br>
                ${product2?.fund.name}: ${product2?.name}
            `)
        }
    }

    render_cover() {
        const familyDesc = {
            "1": "Single",
            "2": "Couple",
            "2D": "Family",
            "1D": "Single Parent Family",
            "0D": "Dependants Only",
            "" : "Unknown family type"
        }[this.context?.familyType || ""];
        return this.render_block("Cover", html`
            ${this.context?.coverType}, ${this.context?.state}, ${familyDesc}
        `)
    }

    render_dependant(hasDependant: boolean, dependantText: string | TemplateResult) {
        if (!hasDependant)
            return nothing;
        return html`${dependantText}<br>`
    }

    render_dependants() {
        if (!this.context?.hasDependants)
            return nothing;
        return this.render_block("Dependants", html`
            ${this.render_dependant(this.context?.children, "Children to age 17")}
            ${this.render_dependant(this.context?.students, `Students to age ${this.context?.maxStudentAge}`)}
            ${this.render_dependant(this.context?.youngAdults, `Young Adults to age ${this.context?.maxYoungAdultAge}`)}
            ${this.render_dependant(this.context?.disabilityDependants, "Disabled dependants")}
        `)
    }

    render_service(type: ServiceType, tier: HospitalTier, label: string) : TemplateResult | typeof nothing {
        if (type === "H" && this.context!.coverType === "GeneralHealth") return nothing;
        if (type === "G" && this.context!.coverType === "Hospital") return nothing;
        const services = ServiceManager.getAll(type, tier);
        const selected = services.filter(service => this.context!.services.includes(service.key));
        return html `<tr>
            <td style="width:10em">${label}:</td>
            <td>${selected.length} of ${services.length} services</td>
        </tr>
    `}

    render_services() {
        return this.render_block("Services", html`
            <table>
                ${this.render_service("H", "Gold", "Gold hospital")}
                ${this.render_service("H", "Silver", "Silver hospital")}
                ${this.render_service("H", "Bronze", "Bronze hospital")}
                ${this.render_service("H", "Basic", "Basic hospital")}
                ${this.render_service("G", "None", "General health")}
            </table>
        `)
    }

    render_funds() {
        const openFunds = [...FundManager.funds.values()].filter(fund => fund.type === "Open").length;
        const restrictedFunds = [...FundManager.funds.values()].filter(fund => fund.type === "Restricted").length;
        const selectedOpenFunds = this.context!.funds.split(";").filter(fund => FundManager.funds.get(fund)?.type === "Open");
        const selectedRestrictedFunds = this.context!.funds.split(";").filter(fund => FundManager.funds.get(fund)?.type === "Restricted");
        return html`
            <div>
                <h4>Funds</h4>
                <div>
                    <sl-tooltip content="${selectedOpenFunds.join(', ')}">
                        <span>${selectedOpenFunds.length} of ${openFunds} open funds</span>
                    </sl-tooltip>
                    <br>
                    <sl-tooltip content="${selectedRestrictedFunds.join(', ')}">
                        <span>${selectedRestrictedFunds.length} of ${restrictedFunds} restricted funds</span>
                    </sl-tooltip>
                </div>
            </div>
        `
    }

    /**
     * Main render routine
     */
    render() {
        const filteredProducts = this.context!.filteredProducts;
        const combinedProducts = filteredProducts.filter(product => product.type === "Combined").length;
        const hospitalProducts = filteredProducts.filter(product => product.type === "Hospital").length;
        const generalProducts = filteredProducts.filter(product => product.type === "GeneralHealth").length;
        return html`

            ${this.render_existing()}
            ${this.render_cover()}
            ${this.render_dependants()}
            ${this.render_services()}
            ${this.render_funds()}
            
            ${this.context?.productRS?.rows.length} / ${combinedProducts} / ${hospitalProducts} / ${generalProducts} products selected.<br>
            ${this.context?.comparisonResults.length} pairs found.
            
            ${(this.error !== "") ? html`
                <sl-alert variant="warning" open>
                    <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
                    <strong>Invalid input</strong><br />
                    ${this.error}<br />
                </sl-alert>
            ` : nothing }
        `
    }
}

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-na-details-60': PhiNADetails60;
    }
}

