/**
 * components/phi-fund-browser.ts
 * --
 * @author VJP
 * @written 31-Oct-2025
 */

import {LitElement, html, css} from 'lit'
import { customElement, queryAll} from 'lit/decorators.js'
import { FundManager} from "../api-models/funds.ts";


/**
 * Fund browser page..
 */
@customElement('phi-fund-browser')
export class PhiFundBrowser extends LitElement {

    static styles = css`
        :host {
            display: flex;
            padding: 1rem;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 2rem;
        }
        sl-card {
            max-width: 300px;
        }
        sl-card::part(header) {
            background-color: var(--sl-color-gray-200);
        }
        /*noinspection CssUnusedSymbol*/
        img.fund {
            max-width: 80%;
            max-height: 48px;
            min-height: 48px;
            width: auto;
            height: auto;
        }
    `

    @queryAll("img.fund") fundImages!: HTMLImageElement[];

    constructor() {
        super();
    }

    render() {
        return html`
            ${[...FundManager.funds.values()].map((fund) => html`
                <sl-card>
                    <div slot="header">
                        <img class="fund" src="${fund.logo}" alt="${fund.code}">
                    </div>
                    <strong>${fund.name}</strong><br/>
                    <small>
                        ${fund.description!.length > 250 ? fund.description!.substring(0,250) + "..." : fund.description}
                    </small>
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
