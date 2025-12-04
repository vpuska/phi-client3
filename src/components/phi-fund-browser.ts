/**
 * components/phi-fund-browser.ts
 * --
 * @author VJP
 * @written 31-Oct-2025
 */

import {LitElement, html, css, nothing} from 'lit'
import {customElement, property} from 'lit/decorators.js'
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
    `

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        const root = super.createRenderRoot();

        root.addEventListener('phi-fund-card-click', (e : Event) => {
            const target = e.target as PhiFundCard;
            const page = document.createElement("phi-fund-details");
            page.fundCode = target.fundCode;
            Globals.get.pageManager().pushPage(page);
        })

        return root;
    }

    render() {
        return html`
            ${[...FundManager.funds.values()].map((fund) => html`
                <phi-fund-card fund-code="${fund.code}">
                </phi-fund-card>
            `)}
    `}
}


@customElement('phi-fund-card')
export class PhiFundCard extends LitElement {
    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            max-width: 300px;
        }
        sl-card {
            height: 100%;
        }
        sl-card::part(base) {
            height: 100%;
        }
        sl-card::part(header) {
            background-color: var(--sl-color-gray-400);
        }
        sl-card::part(body) {
            flex: 1 0 0;
        }
        sl-card::part(footer) {
            padding: 4px 12px;
        }
        img.logo {
            max-width: 80%;
            max-height: 48px;
            min-height: 48px;
            width: auto;
            height: auto;
        }
        sl-tooltip {
            --show-delay: 1s;
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
        }
    `

    @property({ attribute: "fund-code", type: String }) fundCode!: string;


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
        const fund = FundManager.get(this.fundCode)!;
        return html`
            <sl-card>
                <div slot="header">
                    <img class="logo" src="${fund.logo}" alt="${fund.code}">
                </div>
                <strong>${fund.name}</strong><br/>
                <small>
                    ${fund.description!.length > 250 ? fund.description!.substring(0,250) + "..." : fund.description}
                </small>
                <div slot="footer">
                    ${this.render_restriction(fund)}
                    <small style="flex:1 0 0">${fund.code}</small>
                    <sl-tooltip content="display fund details">
                        <sl-icon-button 
                            name="arrow-right" 
                            label="Display fund details"
                            @click=${(e: MouseEvent) => {
                                e.stopPropagation();
                                this.dispatchEvent(new CustomEvent('phi-fund-card-click', { bubbles: true, composed: true }));
                            }}
                        ></sl-icon-button>
                    </sl-tooltip>
                </div>
            </sl-card>            
    `}
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-fund-browser': PhiFundBrowser,
        'phi-fund-card': PhiFundCard,
    }
}
