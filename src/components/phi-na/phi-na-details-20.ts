/**
 * components/phi-na/phi-na-details-20.ts
 * --
 * @author VJP
 * @written 04-Jan-2026
 */

import {html, css, nothing} from 'lit'
import {query, state} from 'lit/decorators.js'
import {map} from 'lit/directives/map.js';
import {consume} from "@lit/context";
import {Task} from "@lit/task";
import {MobxLitElement} from "@adobe/lit-mobx";
import {type SlRadioGroup} from "@shoelace-style/shoelace";
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";
import {ProductResultSet} from "../../api-models/products.ts";

/**
 * Health insurance needs analysis component to capture cover type, family type and state.  Also fetches
 * product data from the database based on the selected state and family type.
 */
export class PhiNADetails20 extends MobxLitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 2em;
        }
        sl-icon-button, sl-icon {
            font-size: 2rem;
        }
    `
    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;
    @state() error: string = "";
    @query('sl-radio-group#rg-cover-type') coverTypeRG!: SlRadioGroup;
    @query('sl-radio-group#rg-state') stateRG!: SlRadioGroup;
    @query('sl-radio-group#rg-family') familyRG!: SlRadioGroup;

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
     * Fetches product data from the database based on the selected state and family type.  Run automatically
     * when state or family type changes.
     */
    fetchTask = new Task(this, {
        task: async ([state, familyType]) => {
            if (state !== "" && familyType !== "") {
                const result = await ProductResultSet.fetch(`segment/${state}/${familyType}`)
                this.context?.change({productRS: result})
            }},
        args: () => [ this.queriedState, this.queriedFamily ]
    })

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

            <sl-radio-group id="rg-cover-type" label="Cover Type" value=${this.context?.coverType || ""}>
                
                <sl-radio-button value="Combined">Combined</sl-radio-button>
                <sl-radio-button value="Hospital">Hospital</sl-radio-button>
                <sl-radio-button value="GeneralHealth">Extras</sl-radio-button>
            
            </sl-radio-group>
            
            <sl-radio-group id="rg-state" label="State" value=${this.context?.state || ""}>
                
                ${map(["NSW/ACT", "VIC", "QLD", "TAS", "SA", "WA", "NT"], (state) => {return html `
                    <sl-tooltip content="${state}">
                        <sl-radio-button value=${state.substring(0,3)}>
                            <sl-icon library="app-icons" name="${state.substring(0,3)}"></sl-icon>
                        </sl-radio-button>
                    </sl-tooltip>
                `})}
                
            </sl-radio-group>

            <sl-radio-group id="rg-family" label="Persons Covered" value=${this.context?.familyType || ""}>

                <sl-tooltip content="Single">
                    <sl-radio-button value="1">
                        <sl-icon library="app-icons" name="single"></sl-icon>
                    </sl-radio-button>
                </sl-tooltip>

                <sl-tooltip content="Couple">
                    <sl-radio-button value="2">
                        <sl-icon library="app-icons" name="couple"></sl-icon>
                    </sl-radio-button>
                </sl-tooltip>

                <sl-tooltip content="Family">
                    <sl-radio-button value="2D">
                        <sl-icon library="app-icons" name="family"></sl-icon>
                    </sl-radio-button>
                </sl-tooltip>

                <sl-tooltip content="Single Parent Family">
                    <sl-radio-button value="1D">
                        <sl-icon library="app-icons" name="single_parent"></sl-icon>
                    </sl-radio-button>
                </sl-tooltip>

                <sl-tooltip content="Dependants Only">
                    <sl-radio-button value="0D">
                        <sl-icon library="app-icons" name="dependants"></sl-icon>
                    </sl-radio-button>
                </sl-tooltip>

            </sl-radio-group>
            
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

