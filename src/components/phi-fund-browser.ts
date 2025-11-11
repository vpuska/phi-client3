/**
 * components/phi-fund-browser.ts
 * --
 * @author VJP
 * @written 31-Oct-2025
 */

import {LitElement, html, css, nothing} from 'lit'
import { customElement} from 'lit/decorators.js'
import {Fund, FundManager} from "../api-models/funds.ts";


/**
 * Fund browser page..
 */
@customElement('phi-fund-browser')
export class PhiFundBrowser extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            
            flex: 1 0 0;    // take up available space in our container (phi-page-manager)

            //display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 2rem;
            overflow-y: scroll;

            margin: 8px;
            padding: 8px;
            border-radius: 8px;
            background-color: var(--sl-color-gray-100);
            
        }

        sl-card {
            max-width: 300px;
        }

        sl-card::part(base) {
            height: 100%;  // ensure card gets stretched
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

    constructor() {
        super();
    }

    render_restriction(fund: Fund) {
        if (fund.type === "Open")
            return nothing;

        return html `
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
                            <sl-icon-button name="arrow-right" label="Display fund details"></sl-icon-button>
                        </sl-tooltip>
                    </div>
                </sl-card>            
            `)}
    `}

}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-fund-browser': PhiFundBrowser,
    }
}
