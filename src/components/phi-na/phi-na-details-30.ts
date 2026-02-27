/**
 * components/phi-na/phi-na-details-30.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {html, css, nothing} from 'lit'
import {query, state} from "lit/decorators.js";
import {consume} from "@lit/context";
import {MobxLitElement} from "@adobe/lit-mobx";
import {SlCheckbox, SlInput} from "@shoelace-style/shoelace";
import {FundManager} from "../../api-models/funds.ts";
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";

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
    @state() error: string = "";

    @query('sl-checkbox#children') childrenCheckbox!: SlCheckbox;
    @query('sl-checkbox#student') studentCheckbox!: SlCheckbox;
    @query('sl-checkbox#youngAdult') youngAdultCheckbox!: SlCheckbox;
    @query('sl-checkbox#disability') disabilityCheckbox!: SlCheckbox;
    @query('sl-input#studentAge') studentAgeInput!: SlInput;
    @query('sl-input#youngAdultAge') youngAdultAgeInput!: SlInput;

    maxYoungAdultAge = FundManager.youngAdultAgeTiers()[0];
    maxStudentAge = FundManager.studentAgeTiers()[0];

    validate() {
        let studentAge = 0;
        let youngAdultAge = 0;

        this.error = "";

        if (!this.childrenCheckbox.checked && !this.studentCheckbox.checked && !this.youngAdultCheckbox.checked && !this.disabilityCheckbox.checked) {
            this.error = "Please select at least one dependant group";
            return false;
        }

        if (this.studentCheckbox.checked) {
            const text = this.studentAgeInput.value.trim() || "0";
            studentAge = (text === "" || text === "0") ? this.maxStudentAge : this.studentAgeInput.valueAsNumber;
            if (studentAge === undefined || studentAge < 18 || studentAge > this.maxStudentAge || studentAge !== Math.trunc(studentAge)) {
                this.error = `Please enter a valid age for students between 18 and ${this.maxStudentAge}`;
                return false;
            }
        }

        if (this.youngAdultCheckbox.checked) {
            const text = this.youngAdultAgeInput.value.trim() || "0";
            youngAdultAge = (text === "" || text === "0") ? this.maxYoungAdultAge : this.youngAdultAgeInput.valueAsNumber;
            if (youngAdultAge === undefined || youngAdultAge < 18 || youngAdultAge > this.maxYoungAdultAge || youngAdultAge !== Math.trunc(youngAdultAge)) {
                this.error = `Please enter a valid age for young adults between 18 and ${this.maxYoungAdultAge}`;
                return false;
            }
        }

        this.context?.change({
            children: this.childrenCheckbox.checked,
            students: this.studentCheckbox.checked,
            youngAdults: this.youngAdultCheckbox.checked,
            disabilityDependants: this.disabilityCheckbox.checked,
            maxStudentAge: studentAge,
            maxYoungAdultAge: youngAdultAge
        })
        return true;
    }

    /**
     * Main render routine
     */
    render() {
        return html`

            <sl-checkbox id="children" checked>Children (under 18)</sl-checkbox>

            <sl-input id="studentAge" 
                type="number" 
                min="18"
                max="${this.maxStudentAge}"
                help-text="Enter age of oldest student"
                ?disabled=${!this.students}>

                    <sl-checkbox id="student" slot="label" @sl-change=${(e: Event) => {
                        this.students = (e.target as SlCheckbox)?.checked
                    }}>
                        Students (18-${this.maxStudentAge})
                    </sl-checkbox>
                    
            </sl-input>
            
            <sl-input id="youngAdultAge" 
                type="number" 
                min="18"
                max="${this.maxYoungAdultAge}"
                help-text="Enter age of oldest young adult"
                ?disabled=${!this.youngAdults}>

                    <sl-checkbox id="youngAdult" slot="label" @sl-change=${(e: Event) => {
                        this.youngAdults = (e.target as SlCheckbox)?.checked
                    }}>
                        Young adults (18-${this.maxYoungAdultAge})
                    </sl-checkbox>
    
            </sl-input>

            <sl-checkbox id="disability">Disabled dependants</sl-checkbox>

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

