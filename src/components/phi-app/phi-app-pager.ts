/**
 * components/phi-app/phi-app-pager.ts
 * --
 * @author VJP
 * @written 31-Oct-2025
 */

import {LitElement, html, css} from 'lit'
import {customElement, query} from 'lit/decorators.js'
import {Globals} from "../../modules/globals.ts";


/**
 * Component to manage switching between application pages (Funds, Search, etc.).
 */
@customElement('phi-app-pager')
export class PhiAppPager extends LitElement {

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            flex: 1 1 0;
        }
        div {
            display: flex;
            flex-direction: column;
            flex: 1 0 0;
        }
    `

    // Container for content pages.
    @query("#pageHolder") pageHolder: HTMLDivElement | undefined;

    constructor() {
        super();
        Globals.register.pageManager(this);
    }

    // Set the currently displayed content.
    setPage(page: LitElement) {
        const pageHolder = this.pageHolder!
        while(pageHolder.children.length > 0)
            pageHolder.removeChild(pageHolder.lastChild!);
        pageHolder.appendChild(page);
        page.style.display = 'flex'
    }

    // Push page onto the stack and display it.
    pushPage(page: LitElement) {
        const pageHolder = this.pageHolder!;
        (pageHolder.lastChild as LitElement).style.display = 'none';
        pageHolder.appendChild(page);
        page.style.display = 'flex';
    }

    // Pop page off the stack and display next page.
    popPage() {
        const pageHolder = this.pageHolder!;
        pageHolder.removeChild(pageHolder.lastChild!);
        (pageHolder.lastChild as LitElement).style.display = 'flex';
    }

    render() {
        return html`<div id="pageHolder">
            <phi-home></phi-home>
        </div>`
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'phi-app-pager': PhiAppPager;
    }
}
