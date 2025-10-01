/**
 * components/phi-main.ts
 * --
 * @author VJP
 * @written 29-Sep-2025
 */

import {LitElement, html, css} from 'lit'
import { customElement} from 'lit/decorators.js'
import {FundManager} from "../api-models/funds.ts";
//import logo from '/phi-logo.svg'


/**
 * Main application screen containing header, navigation and body
 */
@customElement('phi-main')
export class PhiMain extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
        }
    `

    render() {
        return html`
            <phi-main-header></phi-main-header>
            <p>Item 1</p>
            <p>Item 2</p>
            <p>Item 3</p>
            <sl-button>${FundManager.funds.size}</sl-button>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-main': PhiMain,
    }
}
