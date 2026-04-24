/**
 * components/phi-na/phi-na.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {html, css, nothing} from 'lit'
import {provide} from "@lit/context";
import {customElement, query} from "lit/decorators.js";
import {MobxLitElement} from "@adobe/lit-mobx";
import {SlTabGroup} from "@shoelace-style/shoelace";
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";

import "./phi-na-details.ts";
import "./phi-na-details-10.ts";
import "./phi-na-details-20.ts";
import "./phi-na-details-30.ts";
import "./phi-na-details-35.ts";
import "./phi-na-details-40.ts";
import "./phi-na-details-40-selections.ts";
import "./phi-na-details-50.ts";
import "./phi-na-details-60.ts";
import "./phi-na-results.ts";

/**
 * Health insurance needs analysis component.  This renders all the subcomponents in a tabbed interface and manages navigation between them.
 * The subcomponents are:
 * - phi-na-details-10 (existing policy)
 * - phi-na-details-20 (coverage)
 * - phi-na-details-30 (dependants)
 * - phi-na-details-40 (services)
 * - phi-na-details-50 (funds)
 * - phi-na-details-60 (summary)
 * - phi-na-results (results)
 */
@customElement('phi-needs-analysis')
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
            padding: 1.5rem 3em;
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
        // Event listeners for SHOW and HIDE events.  The tab panel name should correspond to the ID of the details component.
        this.addEventListener('sl-tab-show', ((event: CustomEvent) => {
            const tab = event.detail.name;
            const details = this.renderRoot.querySelector(`#${tab}`);
            if (details) {
                if ("show" in details)
                    if (typeof details.show === "function")
                        details.show();
            }
        }))
        this.addEventListener('sl-tab-hide', ((event: CustomEvent) => {
            const tab = event.detail.name;
            const details = this.renderRoot.querySelector(`#${tab}`);
            if (details) {
                if ("validate" in details) {
                    if (typeof details.validate === "function")
                        if (!details.validate()) {
                            // remain on the current tab
                            this.tabGroup?.show(tab);
                        }
                }
                // remove focus from any active element we might be hiding
                if (document.activeElement instanceof HTMLElement && document.activeElement !== document.body) {
                    document.activeElement.blur();
                }
            }
        }))
    }

    // Context object for the needs analysis component suite.
    @provide({context: phiNAContext}) context = new NeedsAnalysisContext();

    // Needs analysis tab group.
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
     * Main render routine.
     * @note `phi-na-details-xx` components must have an `id` attribute matching the `panel` attribute of the `sl-tab` element.  Otherwise the `show` and `hide` events will not be actioned.
     */
    render() {
        return html`
            <phi-page-details style="padding: 0">

                <sl-tab-group placement="start">
                    
                    <sl-tab slot="nav" panel="start">Existing Policy</sl-tab>
                    <sl-tab slot="nav" panel="cover">Coverage</sl-tab>
                    <sl-tab slot="nav" panel="dependants" ?disabled=${!this.context.hasDependants}>Dependants</sl-tab>
                    <sl-tab slot="nav" panel="hospital-cover" ?disabled=${!this.context.needsHospitalServices}>Accommodation & Excess</sl-tab>
                    <sl-tab slot="nav" panel="hospital" ?disabled=${!this.context.needsHospitalServices}>Hospital Services</sl-tab>
                    <sl-tab slot="nav" panel="general" ?disabled=${!this.context.needsGeneralHealthServices}>General Services</sl-tab>
                    <sl-tab slot="nav" panel="funds" ?disabled=${!this.context.isCoverDefined}>Funds</sl-tab>
                    <sl-tab slot="nav" panel="summary" ?disabled=${!this.context.isCoverDefined}>Summary</sl-tab>
                    <sl-tab slot="nav" panel="results" ?disabled=${!this.context.isCoverDefined}>Compare Results</sl-tab>
                    
                    <div slot="nav" style="color:var(--sl-color-neutral-600); padding-top: 40px; padding-left: 20px; font-size: x-small">
                        ${this.context.productRS ? html`Rows extracted: ${this.context.productRS.rows.length}` : nothing}
                    </div>

                    <sl-tab-panel name="start">
                        <phi-na-details @phi-na-continue=${() => this.tabGroup?.show("cover")}>
                            <phi-na-details-10 id="start"></phi-na-details-10>
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="cover">
                        <phi-na-details @phi-na-continue=${() => {
                            this.gotoTab([
                                {condition: this.context.hasDependants, tab: "dependants"},
                                {condition: this.context.needsHospitalServices, tab: "hospital-cover"},
                                {condition: this.context.needsGeneralHealthServices, tab: "general"},
                            ])
                        }}>
                            <phi-na-details-20 id="cover"></phi-na-details-20>
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="hospital-cover">
                        <phi-na-details @phi-na-continue=${() => {
                            this.gotoTab([
                                {condition: this.context.hasDependants, tab: "dependants"},
                                {condition: this.context.needsHospitalServices, tab: "hospital"},
                                {condition: this.context.needsGeneralHealthServices, tab: "general"},
                            ])
                        }}>
                            <phi-na-details-35 id="hospital-cover"></phi-na-details-35>
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="dependants">
                        <phi-na-details @phi-na-continue=${() => {
                            this.gotoTab([
                                {condition: this.context.needsHospitalServices, tab: "hospital"},
                                {condition: this.context.needsGeneralHealthServices, tab: "general"},
                            ])
                        }}>
                            <phi-na-details-30 id="dependants"></phi-na-details-30>
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="hospital">
                        <phi-na-details @phi-na-continue=${() => {
                            this.gotoTab([
                                {condition: this.context.needsGeneralHealthServices, tab: "general"},
                                {condition: true, tab: "funds"},
                            ])
                        }}>
                            <phi-na-details-40 id="hospital">
                                <phi-na-details-40-selections heading="Gold" service-type="H" hospital-tier="Gold"></phi-na-details-40-selections>
                                <phi-na-details-40-selections heading="Silver" service-type="H" hospital-tier="Silver"></phi-na-details-40-selections>
                                <phi-na-details-40-selections heading="Bronze" service-type="H" hospital-tier="Bronze"></phi-na-details-40-selections>
                                <phi-na-details-40-selections heading="Basic" service-type="H" hospital-tier="Basic"></phi-na-details-40-selections>
                            </phi-na-details-40>
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="general">
                        <phi-na-details @phi-na-continue=${() => {
                            this.tabGroup?.show("funds")
                        }}>
                            <phi-na-details-40 id="general">
                                <phi-na-details-40-selections service-type="G"></phi-na-details-40-selections>
                            </phi-na-details-40>
                        </phi-na-details>
                    </sl-tab-panel>
                    
                    <sl-tab-panel name="funds">
                        <phi-na-details @phi-na-continue=${() => {
                            this.tabGroup?.show("summary")
                        }}>
                            <phi-na-details-50 id="funds"></phi-na-details-50>
                        </phi-na-details>
                    </sl-tab-panel>

                    <sl-tab-panel name="summary">
                        <phi-na-details @phi-na-continue=${() => {
                            this.tabGroup?.show("results")
                        }}>
                            <phi-na-details-60></phi-na-details-60>
                        </phi-na-details>
                    </sl-tab-panel>

                    <sl-tab-panel name="results">
                        <phi-na-results>
                        </phi-na-results>
                    </sl-tab-panel>

                </sl-tab-group>
                
            </phi-page-details>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'phi-needs-analysis': PhiNeedsAnalysis;
    }
}