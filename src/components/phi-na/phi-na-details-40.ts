/**
 * components/phi-na/phi-na-details-40.ts
 * --
 * @author VJP
 * @written 28-Feb-2026
 */

import {html, css, nothing} from 'lit'
import {query, queryAssignedElements, state} from 'lit/decorators.js'
import {consume} from "@lit/context";

import {MobxLitElement} from "@adobe/lit-mobx";
import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";
import type {PhiNaDetails40Selections} from "./phi-na-details-40-selections.ts";
import type {SlInput} from "@shoelace-style/shoelace";


/**
 * Health insurance needs analysis component to capture hospital and general health services.
 */
export class PhiNADetails40 extends MobxLitElement {

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
    @query('sl-input') searchTerm!: SlInput;
    @queryAssignedElements({selector: 'phi-na-details-40-selections'}) selectionElements!: NodeListOf<PhiNaDetails40Selections>;

    @state() error: string = "";


    protected createRenderRoot(): HTMLElement | DocumentFragment {
        const root = super.createRenderRoot();
        // Listen to phi-select-all events.  When a select all is checked, all selections for that tier and lower tiers are checked (mode 1).
        // When a select all is unchecked, all selections for that tier and higher tiers are unchecked (mode 0).
        root.addEventListener("phi-select-all", (e: Event) => {
            const target = e.target as PhiNaDetails40Selections;
            let mode = 0;
            for (const element of this.selectionElements) {
                if (element === target)
                    { mode = 1; target.changeSelections(target.selectAll.checked); }
                else
                    if (!target.selectAll.checked && mode === 0)
                        {element.selectAll.checked = false; element.changeSelections(false); }
                    else
                        if (target.selectAll.checked && mode === 1)
                            { element.selectAll.checked = true; element.changeSelections(true); }
            }
        })
        root.addEventListener("phi-select-change", () => {
            this.evaluateAll();
        })
        root.addEventListener("phi-select-updated", () => {
            this.evaluateAll();
        })
        return root;
    }

    /**
     * Validates sub-elements (always passes, but gives sub-elements a chance to update context).
     */
    validate() {
        for (const element of this.selectionElements)
            element.validate();
        return true;
    }

    /**
     * Evaluates each selection element, re-evaluating the value of the "select all" checkbox.  This is run when
     * a selection is changed by the user or updated programmatically.
     */
    evaluateAll() {
        let carry = true;
        for(let j = this.selectionElements.length - 1; j >= 0; j--) {
            const element = this.selectionElements[j];
            carry = carry && element.evaluateAll();
            if (element.selectAll)
                element.selectAll.checked = carry;
        }
    }

    /**
     * Main render routine
     */
    render() {
        return html`

            <sl-input placeholder="Search..." clearable style="width: 50em" @sl-input=${() => {
                console.log(this.searchTerm?.value);
                this.selectionElements.forEach(element => element.searchTerm = this.searchTerm?.value || "");
            }}>
                <sl-icon name="search" slot="prefix"></sl-icon>
            </sl-input>

            <slot></slot>
            
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

