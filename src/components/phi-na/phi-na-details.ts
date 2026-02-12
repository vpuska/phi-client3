/**
 * components/needs-analysis/phi-na-openDetails.ts
 * --
 * @author VJP
 * @written 06-Feb-2026
 */

import {css, html, LitElement} from "lit";
import {property, query} from "lit/decorators.js";
import type {SlDetails} from "@shoelace-style/shoelace";


export class PhiNADetails extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`

        :host([first]) sl-details::part(base),
        :host([first]) sl-details::part(header) {
            border-radius: 8px 8px 0 0;
        }
        :host([last]) sl-details:not([open])::part(header) {
            border-radius: 0 0 8px 8px;
        }
        :host([last]) sl-details::part(base) {
            border-radius: 0 0 8px 8px;
        }
        sl-details::part(content) {
            padding: 24px 48px;
        }
        sl-details::part(header) {
            background-color: var(--sl-color-gray-400);
        }

        :host([tail]) sl-details::part(base),
        div#continue {
            display: flex;
            padding: 24px;
            justify-content: right;
            align-items: center;
            gap: 0.5rem;
        }
    `;

    @property({type: String, reflect: true}) summary = "Summary";
    @property({type: Boolean, reflect: true}) open = false;
    @property({type: Boolean, reflect: true}) first = false;
    @property({type: Boolean, reflect: true}) last = false;
    @property({type: String, attribute: "button-label"}) buttonLabel = "Continue";

    @query("sl-details") slDetails!: SlDetails;

    async show() {
        await this.slDetails.show();
    }

    async hide() {
        await this.slDetails.hide();
    }

    private onHide_slDetails(e: Event) {
        if (e.target !== this.slDetails)
            return;
        const event = new CustomEvent("phi-na-hide", {bubbles: true, composed: true});
        if (this.dispatchEvent(event))
            this.open = false;
        else
            e.preventDefault();
        e.stopPropagation();
    }

    private onShow_slDetails(e: Event) {
        if (e.target !== this.slDetails)
            return;
        const event = new CustomEvent("phi-na-show", {bubbles: true, composed: true});
        if (this.dispatchEvent(event))
            this.open = true;
        else
            e.preventDefault();
        e.stopPropagation();
    }

    private onContinue() {
        const event = new CustomEvent("phi-na-continue", {bubbles: true, composed: true});
        this.slDetails.hide().then(() => this.dispatchEvent(event));
    }

    render() {
        return html`
            <sl-details 
                    ?open=${this.open} 
                    summary=${this.summary} 
                    @sl-hide=${this.onHide_slDetails.bind(this)}
                    @sl-show=${this.onShow_slDetails.bind(this)}
            >
                
                <div id="content">
                    <slot></slot>
                </div>  
                
                <div id="continue">
                    <sl-button @click=${this.onContinue.bind(this)}>
                        ${this.buttonLabel}
                    </sl-button>
                </div>

            </sl-details>
        `
    }
}