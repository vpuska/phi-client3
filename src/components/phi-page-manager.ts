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
 * Page manager..
 */
@customElement('phi-page-manager')
export class PhiPageManager extends LitElement {

    static styles = css`
        div {
            height: 100%;
        }
    `

    homePage: LitElement = document.createElement("phi-home");
    currentPage: LitElement = this.homePage;

    @query("#page") contentHolder: HTMLDivElement | undefined;

    constructor() {
        super();
        Globals.register.pageManager(this);
    }

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
