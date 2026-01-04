/**
 * components/phi-fund-browser.ts
 * --
 * @author VJP
 * @written 31-Oct-2025
 */

import {LitElement, html, css, nothing} from 'lit'
import {customElement} from 'lit/decorators.js'
import {Fund, FundManager} from "../api-models/funds.ts";
import {Globals} from "../modules/globals.ts";

/**
 * Fund browser page..
 */
@customElement('phi-fund-browser')
export class PhiFundBrowser extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex: 1 1 0;
            flex-flow: row wrap;
            gap: 2rem;
            overflow-y: scroll;

            border-radius: 8px;
            background-color: var(--sl-color-gray-100);
            padding: 16px;
        }
        img {
            max-width: 80%;
            max-height: 48px;
            min-height: 48px;
            width: auto;
            height: auto;
        }
        div[slot="footer"] {
            display: flex;
            justify-content: start;
            flex-direction: row;
            align-items: center;
        }
        sl-icon-button.restriction-icon::part(base) {
            color: var(--sl-color-warning-600);
        }
        sl-icon-button.restriction-icon::part(base):hover {
            color: var(--sl-color-warning-800);

    `
    // Render a warning icon if the fundCode is restricted.
    render_restriction(fund: Fund) {
        if (fund.type === "Open")
            return nothing;
        return html`
            <sl-tooltip content="${fund.restrictions.hint}">
                <sl-icon-button
                        class="restriction-icon"
                        name="exclamation-triangle"
                        label="Fund is restricted">
                </sl-icon-button>
            </sl-tooltip>
        `
    }

    render() {
        return html`
            ${[...FundManager.funds.values()].map((fund) => html`
                <phi-card style="max-width: 300px;" header footer>
                    <div slot="header">
                        <img src="${fund.logo}" alt="${fund.code}">
                    </div>
                    <div>
                        <strong>${fund.name}</strong><br/>
                        <small>
                            ${fund.description!.length > 250 ? fund.description!.substring(0,250) + "..." : fund.description}
                        </small>
                    </div>
                    <div slot="footer">
                        ${this.render_restriction(fund)}
                        <small style="flex:1 0 0">${fund.code}</small>
                        <sl-tooltip content="display fund details">
                            <sl-icon-button
                                    name="arrow-right"
                                    label="Display fund details"
                                    @click=${(e: MouseEvent) => {
                                        const page = document.createElement("phi-fund-details");
                                        page.fundCode = fund.code;
                                        Globals.get.pageManager().pushPage(page);
                                        e.stopPropagation();
                                    }}
                            ></sl-icon-button>
                        </sl-tooltip>
                    </div>
                </phi-card>
            `)}
    `}
}

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-fund-browser': PhiFundBrowser,
    }
}
