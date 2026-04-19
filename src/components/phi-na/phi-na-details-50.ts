/**
 * components/phi-na/phi-na-details-50.ts
 * --
 * @author VJP
 * @written 02-Mar-2026
 */

import {html, css} from 'lit'
import {customElement, queryAll} from 'lit/decorators.js'
import {consume} from "@lit/context";

import {MobxLitElement} from "@adobe/lit-mobx";
import {SlCheckbox} from "@shoelace-style/shoelace";

import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";
import {FundManager, type FundType} from "../../api-models/funds.ts";

/**
 * Needs analysis funds selection.
 */
@customElement('phi-na-details-50')
export class PhiNaDetails50 extends MobxLitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            align-content: stretch;
            gap: 2em;
            flex-flow: row wrap;
        }
        
        div.container {
            display: block;
            width: 45%;
            min-width: 20em;
        }
        div.heading {
            padding: 0.5em 1em;
            background-color: var(--sl-color-neutral-100);
            border: 1px solid var(--sl-color-neutral-500);
            border-radius: 0.5em;
        }
        div.selections {
            display: flex;
            flex-flow: column;
            row-gap: 0.5em;
            width: 100%;
            padding: 0.5em 1em;
        }
    `
    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;

    @queryAll('sl-checkbox:not([data-fund-code])') selectAllCheckBoxes!: NodeListOf<SlCheckbox>;
    @queryAll('sl-checkbox[data-fund-code]') fundCheckBoxes!: NodeListOf<SlCheckbox>;

    validate() {
        const funds = [...this.fundCheckBoxes]
            .filter(fundCheckbox => fundCheckbox.checked)
            .map(fundCheckbox => fundCheckbox.getAttribute("data-fund-code"))
            .join(";")
        this.context?.change({funds: funds});
        return true;
    }

    onChangeAll(e: Event) {
        const target = e.target as SlCheckbox;
        for (const selection of this.fundCheckBoxes) {
            if (selection.getAttribute("data-fund-type") === target.getAttribute("data-fund-type"))
                selection.checked = target.checked;
        }
    }

    updated() {
        this.selectAllCheckBoxes.forEach((checkbox) => {
            const fundType = checkbox.getAttribute("data-fund-type");
            checkbox.checked = [...this.fundCheckBoxes].filter((fundCheckbox) => fundCheckbox.getAttribute("data-fund-type") === fundType).every((fundCheckbox) => fundCheckbox.checked);
        });
    }

    render_funds(fundType: FundType) {
        const funds = FundManager.fundList(fundType).sort((a, b) => a.name.localeCompare(b.name));
        return html`
            <div class="container">
                <div class="heading">
                    <sl-checkbox data-fund-type=${fundType} @sl-change=${this.onChangeAll.bind(this)}>
                        ${fundType} Funds
                    </sl-checkbox>
                </div>
                <div class="selections" @sl-change=${this.updated.bind(this)}>
                    ${funds.map(fund => {
                        const checked = this.context?.funds.includes(fund.code);
                        return html`
                            <sl-tooltip placement="top-start" content="${fund.code}">
                                <sl-checkbox data-fund-type="${fundType}" data-fund-code="${fund.code}" ?checked=${checked}>
                                    ${fund.name}
                                </sl-checkbox>
                            </sl-tooltip>
                            `
                    })}
                </div>
            </div>
        
        `

    }
    /**
     * Main render routine
     */
    render() {
        return html`
            ${this.render_funds("Open")}
            ${this.render_funds("Restricted")}
        `
    }
}

