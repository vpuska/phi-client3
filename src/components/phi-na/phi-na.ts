/**
 * components/phi-na/phi-na.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {html, css} from 'lit'
import {provide} from "@lit/context";
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";
import {MobxLitElement} from "@adobe/lit-mobx";
import type {PhiNADetails10} from "./phi-na-details-10.ts";
import type {PhiNADetails20} from "./phi-na-details-20.ts";
import {SlTabGroup} from "@shoelace-style/shoelace";
import {query} from "lit/decorators.js";

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
        sl-tab-group::part(nav) sl-tab {
            color: var(--sl-color-gray-600);
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
            const details = this.renderRoot.querySelector(tab) as PhiNADetails10 | PhiNADetails20;
            if (details) {
                if ("show" in details)
                    if (typeof details.show === "function")
                        details.show();
            }
        }))
        this.addEventListener('sl-tab-hide', ((event: CustomEvent) => {
            const tab = event.detail.name;
            const details = this.renderRoot.querySelector(tab) as PhiNADetails10 | PhiNADetails20;
            if (details) {
                if ("hide" in details)
                    if (typeof details.hide === "function")
                        if (!details.hide())
                            event.preventDefault();
            }
        }))
    }

    @provide({context: phiNAContext}) context = new NeedsAnalysisContext();
    @query("sl-tab-group") tabGroup!: SlTabGroup;

    /**
     * Main render routine
     */
    render() {
        return html`
            <phi-page-details>

                <sl-tab-group placement="start">
                    
                    <sl-tab slot="nav" panel="phi-na-details-10">Existing Policy</sl-tab>
                    <sl-tab slot="nav" panel="phi-na-details-20">Coverage</sl-tab>
                    <sl-tab slot="nav" panel="phi-na-details-30">Dependants</sl-tab>
                    <sl-tab slot="nav" panel="phi-na-details-40">Hospital Services</sl-tab>
                    <sl-tab slot="nav" panel="phi-na-details-50">General Services</sl-tab>
                    <sl-tab slot="nav" panel="phi-na-details-60">Funds</sl-tab>
                    

                    <sl-tab-panel name="phi-na-details-10">
                        <phi-na-details @phi-na-continue=${() => this.tabGroup?.show("phi-na-details-20")}>
                            <phi-na-details-10></phi-na-details-10></sl-tab-panel>
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="phi-na-details-20">
                        <phi-na-details @phi-na-continue=${() => this.tabGroup?.show("phi-na-details-30")}>
                            <phi-na-details-20></phi-na-details-20></sl-tab-panel>
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="phi-na-details-30">This is the dependants tab panel.</sl-tab-panel>
                    <sl-tab-panel name="phi-na-details-40">This is the hospital services tab panel.</sl-tab-panel>
                    <sl-tab-panel name="phi-na-details-50">This is the general services tab panel.</sl-tab-panel>
                    <sl-tab-panel name="phi-na-details-60">This is the funds tab panel.</sl-tab-panel>

                </sl-tab-group>
                
            </phi-page-details>
        `
    }
}

