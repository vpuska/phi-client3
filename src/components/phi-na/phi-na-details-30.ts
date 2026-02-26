/**
 * components/phi-na/phi-na-details-30.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {html, css} from 'lit'
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";
import {consume} from "@lit/context";
import {MobxLitElement} from "@adobe/lit-mobx";
import {FundManager} from "../../api-models/funds.ts";
import {state} from "lit/decorators.js";
import {SlCheckbox} from "@shoelace-style/shoelace";

/**
 * Health insurance needs analysis - dependants.
 */
export class PhiNADetails30 extends MobxLitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 3em;
        }
        sl-input {
            width: 20rem;
        }
    `
    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;
    @state() youngAdults = false;
    @state() students = false;

    verify() {
        return true;
    }

    hide() {
        return this.verify();
    }

    /**
     * Main render routine
     */
    render() {
        if (this.context?.hasDependants === false)
            return html`No dependants covered`;

        const maxYoungAdultAge = FundManager.youngAdultAgeTiers()[0];
        const maxStudentAge = FundManager.studentAgeTiers()[0];

        return html`

            <sl-checkbox checked>Children (under 18)</sl-checkbox>

            <sl-input 
                type="number" 
                min="18"
                max="${maxStudentAge}"
                help-text="Enter age of oldest student"
                ?disabled=${!this.students}>

                    <sl-checkbox slot="label" @sl-change=${(e: Event) => {
                        this.students = (e.target as SlCheckbox)?.checked
                    }}>
                        Students (18-${maxStudentAge})
                    </sl-checkbox>
                    
            </sl-input>
            
            <sl-input 
                type="number" 
                min="18"
                max="${maxYoungAdultAge}"
                help-text="Enter age of oldest young adult"
                ?disabled=${!this.youngAdults}>

                    <sl-checkbox slot="label" @sl-change=${(e: Event) => {
                        this.youngAdults = (e.target as SlCheckbox)?.checked
                    }}>
                        Young adults (18-${maxYoungAdultAge})
                    </sl-checkbox>
    
            </sl-input>

            <sl-checkbox>Disabled dependants</sl-checkbox>
        `
    }
}

