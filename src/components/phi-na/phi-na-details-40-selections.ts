/**
 * components/phi-na/phi-na-details-40-selections.ts
 * --
 * @author VJP
 * @written 28-Feb-2026
 */

import {html, css} from 'lit'
import {property, query, queryAll, state} from 'lit/decorators.js'
import {consume} from "@lit/context";

import {MobxLitElement} from "@adobe/lit-mobx";
import {SlCheckbox} from "@shoelace-style/shoelace";

import {context as phiNAContext, NeedsAnalysisContext} from "./context.ts";
import {type HospitalTier, ServiceManager, type ServiceType} from "../../api-models/services.ts";

/**
 * Health insurance needs analysis component to hospital and general health services selections.  Renders a
 * list of checkboxes for a single service type or service type/hospital tier combination.
 * @event phi-select-all - Fired when the "Select All" checkbox is clicked.
 * @event phi-select-change - Fired when any of the service checkboxes are checked/unchecked by the user.
 * @event phi-select-updated - Fired when any of the service checkboxes are updated.  For example, when loading values
 * from the context.
 */
export class PhiNaDetails40Selections extends MobxLitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
        }
        div#heading {
            width: 100%;
            padding: 0.5em 1em;
            background-color: var(--sl-color-neutral-100);
            border: 1px solid var(--sl-color-neutral-500);
            border-radius: 0.5em;
        }
        div#selections {
            display: flex;
            flex-flow: row wrap;
            column-gap: 2em;
            row-gap: 0.5em;
            width: 100%;
            padding: 0.5em 1em;
        }
    `
    @consume({context: phiNAContext}) context: NeedsAnalysisContext | null = null;

    /**
     * The medical service type.
     */
    @property({attribute: "service-type", type: String}) serviceType: string = "";
    /**
     * The hospital tier.
     */
    @property({attribute: "hospital-tier", type: String}) hospitalTier: HospitalTier = "None";
    /**
     * The heading for the selection group.
     */
    @property({attribute: "heading", type: String}) heading: string = "Select all";

    // A search term used to highlight text in the service descriptions.
    @state() searchTerm: string = "";

    // The "Select All" checkbox shown at the top of the selection group.  The label is set by the `heading` property.`
    @query('div#heading sl-checkbox') selectAll!: SlCheckbox;
    // `NodeList` of all the service checkboxes in the selection group.`
    @queryAll('div#selections sl-checkbox') selections!: NodeListOf<SlCheckbox>;

    /**
     * Set the `checked` property of all service checkboxes to the given value.
     */
    changeSelections(value: boolean) {
        for (const selection of this.selections) {
            selection.checked = value;
        }
    }

    /**
     * Evaluates whether all service checkboxes are checked.  Returns true if all are checked, false otherwise.
     */
    evaluateAll() {
        for (const selection of this.selections) {
            if (!selection.checked)
                return false;
        }
        return true;
    }

    /**
     * Validates the user input for completeness.  Returns `true` if valid, `false` otherwise.  Save the selections
     * to the context.
     */
    validate() {
        //  extract the list of services displayed on our web component
        const checkbox_services = [...this.selections]
            .filter(checkbox => checkbox.hasAttribute("data-key"))
            .map(checkbox => {return checkbox.getAttribute("data-key")});
        // convert context services from a semicolon-delimited string to an array and remove services that are displayed on our web component.
        let context_services = (this.context?.services || "")
            .split(";")
            .filter(service => {return service !== ""})
            .map(service => {return service.substring(0, 3)})
            .filter(service => {return !checkbox_services.includes(service)})
            .sort();
        // get the services selected on our component...
        const selected_services = [...this.selections]
            .filter(checkbox => {return checkbox.checked && checkbox.hasAttribute("data-key")})
            .map(checkbox => {return checkbox.getAttribute("data-key")!});
        // ...and add them back to the context services
        context_services = context_services.concat(selected_services).sort();
        this.context?.change({services: context_services.join(";")});
        return true;
    }

    /**
     * Dispatches a custom event to notify listeners that the selection state has been updated.
     */
    updated() {
        this.dispatchEvent(new CustomEvent("phi-select-updated", {bubbles: true, composed: true}))
    }

    render_description(service: string, searchTerm: string) {
        let serviceUC = service.toUpperCase();
        let textUC = searchTerm.toUpperCase();
        let textLen = searchTerm.length;
        const segments = serviceUC.split(textUC);
        const separators: string[] = [];

        let i = 0;
        for (let j = 0; j < segments.length; j++) {
            segments[j] = service.substring(i, i + segments[j].length);
            i = i + segments[j].length;
            separators.push(service.substring(i, i + textLen));
            i = i + textLen;
        }

        return html`
            ${segments.map((segment, index) => {
                return html`${segment}<span style="background-color: var(--sl-color-primary-300)">${separators[index]}</span>`
            })}
        `
    }

    /**
     * Main render routine
     */
    render() {
        return html`
            
            <div id="heading">
                <sl-checkbox @sl-change=${() => {
                    this.dispatchEvent(new CustomEvent("phi-select-all", {bubbles: true, composed: true}))
                }}>
                    ${this.heading}
                </sl-checkbox>
            </div>
            
            <div id="selections" @sl-change=${() => {
                this.dispatchEvent(new CustomEvent("phi-select-change", {bubbles: true, composed: true}))
            }}>
                ${ServiceManager.getAll(this.serviceType as ServiceType, this.hospitalTier).map((service) => { return html`
                    <sl-checkbox 
                            style="width: 30em" 
                            data-key="${service.key}"
                            ?checked=${this.context?.services.includes(service.key)}
                    >${this.render_description(service.description, this.searchTerm)}</sl-checkbox>
                `})}
            </div>
        `
    }
}

