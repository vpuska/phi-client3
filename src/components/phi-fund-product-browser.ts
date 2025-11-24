/**
 * components/phi-fund--product-browser.ts
 * --
 * @author VJP
 * @written 23-Nov-2025
 */

import {LitElement, html, css} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import {ProductResultSet} from "../api-models/products.ts";
//import {Globals} from "../modules/globals.ts";


/**
 * Fund product browser page..
 */
@customElement('phi-fund-product-browser')
export class PhiFundProductBrowser extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex: 1 1 0;
            flex-flow: column nowrap;
            padding: 0;
        }
    table {
        margin: 0;
    }
        thead th {
            position: sticky;
            top: 0;
            background-color: gray;
            z-index: 1;
        }
    `

    @state() loaded = false;
    @property() fund!: string;

    private productResultSet: ProductResultSet | undefined;

    loadProducts() {
        ProductResultSet.fetch(this.fund).then(rslt => {
            this.productResultSet = rslt;
            this.loaded = true;
        })
    }

    render_not_yet_loaded() {
        return html`
            <sl-spinner style="font-size: 50px; --track-width: 10px;"></sl-spinner>
            <sl-spinner style="font-size: 50px; --track-width: 10px;"></sl-spinner>
            <sl-spinner style="font-size: 50px; --track-width: 10px;"></sl-spinner>
        `
    }

    render() {
        if (!this.loaded || this.productResultSet == undefined)
            return this.render_not_yet_loaded();

        return html`
            <table>
                <thead>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Adults</th>
                    <th>Dependants</th>
                </thead>
                ${this.productResultSet.rows.map(row => html`
                    <tr>
                        <td>${row.code}</td>
                        <td>${row.name}</td>
                        <td>${row.type}</td>
                        <td>${row.adultsCovered}</td>
                        <td>${row.dependantTypesShortDescription}</td>
                    </tr>
                `)}
            </table>
        `
    }
}




declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-fund-product-browser': PhiFundProductBrowser,
    }
}
