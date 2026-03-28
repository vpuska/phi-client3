/**
 * components/phi-home.ts
 * --
 * @author VJP
 * @written 29-Sep-2025
 */

import {LitElement, html, css} from 'lit'
import {customElement} from "lit/decorators.js";
import {Globals} from "../../modules/globals.ts";

/**
 * Application home page.
 */
@customElement('phi-home')
export class PhiHome extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: row;
            flex: 1 0 0;
        } 
        div#image {
            background-image: var(--phi-home-background-image);
            filter: var(--phi-home-background-filter);
            background-size: cover;
            background-position: center;
            width: 50%;
            border-radius: 8px;
        }
        div#buttons {
            display: flex;
            flex-direction: column;
            position: relative;
            justify-content: center;
            width: 33%;
            left: -9%;
            gap: 5%;
        }
       sl-button::part(base) {
            border: 4px double var(--sl-color-primary-200);
            margin: 8px;
        }
    `

    render() {
        return html`
            <div id="image"></div>
            <div id="buttons">
                <sl-button variant="primary" size="large" 
                           @click=${() => {Globals.get.pageManager().setPage(document.createElement("phi-needs-analysis") as LitElement)}}>
                    <sl-icon slot="prefix" name="search"></sl-icon>
                    Compare policies...
                </sl-button>
                <sl-button variant="primary" size="large"
                           @click=${() => {Globals.get.pageManager().setPage(document.createElement("phi-fund-browser") as LitElement)}}>
                    <sl-icon slot="prefix" name="book"></sl-icon>
                    Browse funds...</sl-button>
            </div>
        `
    }
}

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-home': PhiHome;
    }
}