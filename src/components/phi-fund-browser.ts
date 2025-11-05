/**
 * components/phi-fund-browser.ts
 * --
 * @author VJP
 * @written 31-Oct-2025
 */

import {LitElement, html} from 'lit'
import { customElement} from 'lit/decorators.js'
import { FundManager} from "../api-models/funds.ts";


/**
 * Fund browser page..
 */
@customElement('phi-fund-browser')
export class PhiFundBrowser extends LitElement {

    render() {
        return html`
            ${[...FundManager.funds.values()].map((fund) => html`
                <p>${fund.code}</p>
            `)}
        `}
    }


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-fund-browser': PhiFundBrowser,
    }
}
