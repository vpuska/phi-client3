/**
 * components/needs-analysis/phi-na-details-group.ts
 * --
 * @author VJP
 * @written 11-Feb-2026
 */

import {html, LitElement} from "lit";
import {queryAssignedElements} from "lit/decorators.js";
import type {PhiNADetails} from "./phi-na-details.ts";

/**
 * Container for `phi-na-details` elements.  Automatically sets the `first` and `last` attributes of first and last `phi-na-details` elements
 * in the group.
 */
export class PhiNADetailsGroup extends LitElement {

    // List of open `phi-na-details` elements
    @queryAssignedElements({selector: 'phi-na-details[open]', flatten: false}) openDetails!: PhiNADetails[];
    // List of all `phi-na-details` elements
    @queryAssignedElements({selector: 'phi-na-details', flatten: false}) allDetails!: PhiNADetails[];

    constructor() {
        super();
        // Event listener responsible for closing any open details when a new one is opened.
        this.addEventListener('phi-na-show', async event =>  {
            if ((event.target as Element).tagName !== 'PHI-NA-DETAILS')
                return;
            const newDtl = event.target as PhiNADetails;
            // Should only be one open detail at a time, but just in case...
            for (const dtl of this.openDetails.filter(dtl => dtl !== newDtl)) {
                await dtl.hide();
                if (dtl.open) {
                    // Currently open details refused to close, so prevent the new one from opening.
                    event.preventDefault();
                    return;
                }
            }
        });
    }

    firstUpdated() {
        // Ensure that the first and last details are marked as such.
        this.allDetails.forEach((dtl, idx) => {
            dtl.first = idx === 0;
            dtl.last = idx === this.allDetails.length - 1;
        });
    }

    render() {
        return html`
            <slot></slot>
        `
    }
}


