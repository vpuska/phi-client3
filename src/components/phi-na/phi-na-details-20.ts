/**
 * components/phi-na/phi-na-details-20.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {html, css, nothing} from 'lit'
import {customElement, query, state} from 'lit/decorators.js'
import {consume} from "@lit/context";
import {MobxLitElement} from "@adobe/lit-mobx";
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";

import type {PhiRgCoverType} from "../shared/phi-rg-cover-type.ts";
import type {PhiRgState} from "../shared/phi-rg-state.ts";
import type {PhiRgFamilyType} from "../shared/phi-rg-family-type.ts";

/**
 * Health insurance needs analysis component to capture cover type, family type and state.  Also fetches
 * product data from the database based on the selected state and family type.
 */
@customElement('phi-na-details-20')
export class PhiNADetails20 extends MobxLitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 2em;
        }
    `
    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;
    @state() error: string = "";
    @query('phi-rg-cover-type') coverTypeRG!: PhiRgCoverType;
    @query('phi-rg-state') stateRG!: PhiRgState;
    @query('phi-rg-family-type') familyRG!: PhiRgFamilyType;

    // the last state queried from the database
    queriedState: string = "";
    // the last family type queried from the database
    queriedFamily: string = "";

    constructor() {
        super();
        // Update the context immediately on any change because of dependencies enabling/disabling tabs
        this.addEventListener('sl-change', () => {
            this.context?.change({
                coverType: this.coverTypeRG.value,
                state: this.stateRG.value,
                familyType: this.familyRG.value
            })
        })
    }


    /**
     * Validates the user input for completeness.  Returns true if valid, false otherwise.
     */
    validate() {
        this.queriedState = this.context?.state || "";
        this.queriedFamily = this.context?.familyType || "";
        this.requestUpdate(); // forces run of fetchTask if state or familyType changes

        if (this.context?.coverType === "" || this.context?.state === "" || this.context?.familyType === "") {
            this.error = "Please select all options";
            return false;
        } else {
            this.error = "";
            return true;
        }
    }

    /**
     * Main render routine
     */
    render() {
        return html`

            <phi-rg-cover-type value=${this.context?.coverType || ""}></phi-rg-cover-type>
            
            <phi-rg-state value=${this.context?.state || ""}></phi-rg-state>
            
            <phi-rg-family-type value=${this.context?.familyType || ""}></phi-rg-family-type>            
            
            ${(this.error !== "") ? html`
                <sl-alert variant="warning" open>
                    <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
                    <strong>Invalid input</strong><br />
                    ${this.error}<br />
                </sl-alert>
            ` : nothing }
        `
    }
}

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-na-details-20': PhiNADetails20;
    }
}

