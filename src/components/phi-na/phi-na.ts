/**
 * components/phi-na/phi-na.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {html, css, nothing} from 'lit'
import {provide} from "@lit/context";
import {query} from "lit/decorators.js";
import {MobxLitElement} from "@adobe/lit-mobx";
import {SlTabGroup} from "@shoelace-style/shoelace";
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";

/**
 * Health insurance needs analysis.
 */
export class PhiNeedsAnalysis extends MobxLitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            flex: 1 1 0;
            padding: 0;
            background-color: var(--sl-color-gray-100);
            border-radius: 8px;
        }
        
        sl-tab-group {
            height: 100%;
        }
        sl-tab-group::part(base) {
            height: 100%;
        }
        sl-tab-group::part(nav) {
            background-color: var(--sl-color-gray-100);
        }
        sl-tab-group::part(body) {
            margin: 2rem 4em;
        }
        sl-tab-panel {
            height: 100%;
        }
        sl-tab-panel::part(base) {
            height: 100%;
        }
        
    `
    constructor() {
        super();
        this.addEventListener('sl-tab-show', ((event: CustomEvent) => {
            const tab = event.detail.name;
            const details = this.renderRoot.querySelector(tab);
            if (details) {
                if ("show" in details)
                    if (typeof details.show === "function")
                        details.show();
            }
        }))
        this.addEventListener('sl-tab-hide', ((event: CustomEvent) => {
            const tab = event.detail.name;
            const details = this.renderRoot.querySelector(tab);
            if (details) {
                if ("validate" in details) {
                    if (typeof details.validate === "function")
                        if (!details.validate()) {
                            // remain on the current tab
                            this.tabGroup?.show(tab);
                        }
                }
            }
        }))
    }

    @provide({context: phiNAContext}) context = new NeedsAnalysisContext();
    @query("sl-tab-group") tabGroup!: SlTabGroup;

    /**
     * Show the tab panel for the first condition that is true.  At least one condition must be true (typically the last one).
     * @note The existing panel may refuse to relinquish active status if validation fails..
     * @param targets
     */
    gotoTab(targets: {condition: boolean, tab: string}[]) {
        for (const target of targets) {
            if (target.condition) {
                this.tabGroup?.show(target.tab);
                return;
            }
        }
    }

    /**
     * Main render routine
     */
    render() {
        return html`
            <phi-page-details style="padding: 0">

                <sl-tab-group placement="start">
                    
                    <sl-tab slot="nav" panel="phi-na-details-10">Existing Policy</sl-tab>
                    <sl-tab slot="nav" panel="phi-na-details-20">Coverage</sl-tab>
                    <sl-tab slot="nav" panel="phi-na-details-30" ?disabled=${!this.context.hasDependants}>Dependants</sl-tab>
                    <sl-tab slot="nav" panel="phi-na-details-40" ?disabled=${!this.context.needsHospitalServices}>Hospital Services</sl-tab>
                    <sl-tab slot="nav" panel="phi-na-details-50" ?disabled=${!this.context.needsGeneralHealthServices}>General Services</sl-tab>
                    <sl-tab slot="nav" panel="phi-na-details-60">Funds</sl-tab>
                    <sl-tab slot="nav" panel="phi-na-details-70">Summary</sl-tab>

                    <div slot="nav" style="color:var(--sl-color-neutral-600); padding-top: 40px; padding-left: 20px; font-size: x-small">
                        ${this.context.productRS ? html`Rows extracted: ${this.context.productRS.rows.length}` : nothing}
                    </div>

                    <sl-tab-panel name="phi-na-details-10">
                        <phi-na-details @phi-na-continue=${() => this.tabGroup?.show("phi-na-details-20")}>
                            <phi-na-details-10></phi-na-details-10></sl-tab-panel>
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="phi-na-details-20">
                        <phi-na-details @phi-na-continue=${() => {
                            this.gotoTab([
                                {condition: this.context.hasDependants, tab: "phi-na-details-30"},
                                {condition: this.context.needsHospitalServices, tab: "phi-na-details-40"},
                                {condition: this.context.needsGeneralHealthServices, tab: "phi-na-details-50"},
                            ])
                        }}>
                            <phi-na-details-20></phi-na-details-20></sl-tab-panel>
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="phi-na-details-30">
                        <phi-na-details @phi-na-continue=${() => {
                            this.gotoTab([
                                {condition: this.context.needsHospitalServices, tab: "phi-na-details-40"},
                                {condition: this.context.needsGeneralHealthServices, tab: "phi-na-details-50"},
                            ])
                        }}>
                            <phi-na-details-30></phi-na-details-30>
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="phi-na-details-40">
                        <phi-na-details @phi-na-continue=${() => {
                            this.gotoTab([
                                {condition: this.context.needsGeneralHealthServices, tab: "phi-na-details-50"},
                                {condition: true, tab: "phi-na-details-60"},
                            ])
                        }}>
                            This is the hospital services tab panel.
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="phi-na-details-50">
                        <phi-na-details @phi-na-continue=${() => {
                            this.tabGroup?.show("phi-na-details-60")
                        }}>
                            This is the general services tab panel.
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="phi-na-details-60">
                        <phi-na-details @phi-na-continue=${() => {
                            this.tabGroup?.show("phi-na-details-70")
                        }}>
                            This is the funds tab panel.
                        </phi-na-details>
                    </sl-tab-panel>

                    <sl-tab-panel name="phi-na-details-70">
                        <phi-na-details>
                            This is the summary tab panel.
                        </phi-na-details>
                    </sl-tab-panel>

                </sl-tab-group>
                
            </phi-page-details>
        `
    }
}

