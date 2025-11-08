/**
 * components/phi-page-manager.ts
 * --
 * @author VJP
 * @written 31-Oct-2025
 */

import {LitElement, html, css} from 'lit'
import {customElement, query} from 'lit/decorators.js'
import {Globals} from "../modules/globals.ts";


/**
 * Component to manage switching between application pages (Funds, Search, etc.).
 */
@customElement('phi-page-manager')
export class PhiPageManager extends LitElement {

    static styles = css`
        div {
            height: 100%;
        }
    `

    // Initial/default page displayed.
    private readonly homePage: LitElement = document.createElement("phi-home");
    // Current page displayed.
    currentPage: LitElement = this.homePage;

    // Container for content.
    @query("#page") contentHolder: HTMLDivElement | undefined;

    constructor() {
        super();
        Globals.register.pageManager(this);
    }

    // Set the currently displayed content.
    setPage(page: LitElement) {
        this.currentPage = page;
        this.contentHolder?.replaceChild(page, this.contentHolder!.firstChild!)
    }

    updated() {
        if (!this.contentHolder?.hasChildNodes())
            this.contentHolder?.appendChild(this.currentPage);
    }

    render() {
        return html`<div id="page"></div>`
    }

}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-page-manager': PhiPageManager,
    }
}
