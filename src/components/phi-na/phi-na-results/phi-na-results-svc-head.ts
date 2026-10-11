/**
 * components/phi-na/phi-na.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {html, css, nothing, LitElement, type TemplateResult} from 'lit'
import {customElement, property, queryAll, state} from "lit/decorators.js";
//import {MobxLitElement} from "@adobe/lit-mobx";
import {SlMenuItem, type SlSelectEvent} from "@shoelace-style/shoelace";

const VALID_MODES = ["varying", "matching"];

/**
 * xxxx
 */
@customElement('phi-na-results-svc-head')
export class PhiNaResultsSvcHead extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
        }
        sl-button.service-heading::part(label) {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex: 1;
        }
    `

    @property() label = "";
    @property() tier : "gold" | "silver" | "bronze" | "basic" | "general" | "none" = "none";
    @property() covered = 0;
    @property() restricted = 0;
    @property({attribute: "not-covered"}) notCovered = 0;
    @property() mode: "varying" | "matching" | "no-cover" = "varying";
    @state() menu: TemplateResult | typeof nothing = nothing;

    @queryAll("sl-menu-item") menuItems!: NodeListOf<SlMenuItem>;

    selectOption(event: SlSelectEvent) {
        const elem = event.detail.item as SlMenuItem;
        this.mode = elem.value as "varying" | "matching";
        this.dispatchEvent(new CustomEvent("phi-service-event", {bubbles: true, composed: true}));
        this.menu = nothing;
    }

    click() {
        switch(this.mode) {
            case "varying":
                this.mode = "matching";
                break;
            case "matching":
                this.mode = "no-cover";
                break;
            case "no-cover":
                this.mode = "varying";
                break;
        }
        this.dispatchEvent(new CustomEvent("phi-service-event", {bubbles: true, composed: true}));
    }

    set_menu() {
        this.menu = html`
            <sl-menu-item type="checkbox" value="varying" ?checked=${this.mode === 'varying'}>
                <sl-icon name="cover_varying" library="app-icons"></sl-icon>
                Service Variations
            </sl-menu-item>
            <sl-menu-item type="checkbox" value="matching" ?checked=${this.mode === 'matching'}>
                <sl-icon name="cover_matching" library="app-icons"></sl-icon>
                Matching coverage
            </sl-menu-item>
            <sl-menu-item type="checkbox" value="no-cover" ?checked=${this.mode === 'no-cover'}>
                <sl-icon name="cover_none" library="app-icons"></sl-icon>
                No cover
            </sl-menu-item>
    `}

    /**
     * Main render routine.
     */
    render() {
        let icon = VALID_MODES.includes(this.mode) ? "cover_" + this.mode : "cover_none";

        return html`
            <sl-dropdown style="width: 100%" @sl-show=${this.set_menu.bind(this)}>
                <sl-button slot="trigger" class="service-heading" style="width: 100%; caret" @sl-click=${this.selectOption.bind(this)}>
                    <div>${this.label}</div>
                    <div>
                        ${this.covered > 0 ? html`<sl-badge variant="success" pill>${this.covered}</sl-badge>` : nothing}
                        ${this.restricted > 0 ? html`<sl-badge variant="warning" pill>${this.restricted}</sl-badge>` : nothing}
                        ${this.notCovered > 0 ? html`<sl-badge variant="danger" pill>${this.notCovered}</sl-badge>` : nothing}
                    </div>
                    <div>
                        <sl-icon name="${icon}" library="app-icons"></sl-icon>
                    </div>
                </sl-button>
                <sl-menu @sl-select=${(e:SlSelectEvent)=>this.selectOption(e)}>
                    ${this.menu}
                </sl-menu>
            </sl-dropdown>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'phi-na-results-svc-head': PhiNaResultsSvcHead;
    }
}