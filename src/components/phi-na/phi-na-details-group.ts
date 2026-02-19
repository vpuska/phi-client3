/**
 * components/needs-analysis/phi-na-details-group.ts
 * --
 * @author VJP
 * @written 11-Feb-2026
 */

import {html, LitElement} from "lit";
import {PhiNADetails} from "./phi-na-details.ts";

/**
 * Returns the `phi-na-details` element associated with the specified element, or null if none is found.
 * `element` may refer to a `phi-na-details` element, or an element that renders a `phi-na-details` element in its shadow DOM.
 * @param element
 * @returns The `phi-na-details` element associated with the specified element, or null if none is found.
 * @see PhiNADetails
 */
function getPhiNADetailElement(element: Element | EventTarget | null) {
    if (!element)
        return null;
    if (!(element instanceof Element))
        return null;
    if (element instanceof PhiNADetails)
        return element;
    if (element.shadowRoot)
        return element.shadowRoot.querySelector('phi-na-details');
    else
        return null;
}

/**
 * Container for `phi-na-details` elements.  Automatically sets the `first` and `last` attributes of the first and last `phi-na-details` elements
 * in the group. <br>
 * The `phi-na-details` element can be directly inserted into the group, or can be contained within an element in the group's shadow DOM.
 * @see PhiNADetails
 * @eg
 * ```html
 * <phi-na-details-group>
 *     <phi-na-details summary="Summary 1">
 *         Content 1
 *     </phi-na-details>
 *     <!-- my-element renders a phi-na-details element -->
 *     <my-element>
 *     </my-element>
 * </phi-na-details-group>
 *```
 */
export class PhiNADetailsGroup extends LitElement {

    constructor() {
        super();
        // Event listener responsible for closing any open details when a new one is opened.
        this.addEventListener('phi-na-show', async event =>  {
            const newDtl = getPhiNADetailElement(event.target);
            if (!newDtl)
                return;
            // Should only be one open detail at a time, but just in case...
            for (const dtl of this.assignedDetails.filter(dtl => dtl !== newDtl && dtl.open)) {
                await dtl.hide();
                if (dtl.open) {
                    // Currently open details refused to close, so prevent the new one from opening.
                    event.preventDefault();
                    return;
                }
            }
        });
        this.addEventListener('phi-na-continue', event => {
            this.assignedDetails.forEach((dtl, idx, dtls) => {
                if (dtl === getPhiNADetailElement(event.target!) && idx < dtls.length - 1) {
                    dtls[idx + 1]!.show().then();
                    return;
                }
            })
        })
    }

    /**
     * Returns the list of `phi-na-details` elements assigned to this group.
     */
    get assignedDetails() : PhiNADetails[] {
        const slot = this.shadowRoot!.querySelector('slot');
        const elements = slot?.assignedElements({flatten: false}) || [];
        return elements.filter(elem => getPhiNADetailElement(elem) instanceof PhiNADetails).map(elem => getPhiNADetailElement(elem)!);
    }

    updated() {
        // Ensure that the first and last details are marked as such.
        this.updateComplete.then(() => {
            this.assignedDetails.forEach((dtl, idx, dtls) => {
                dtl.first = idx === 0;
                dtl.last = idx === dtls.length - 1;
            });
        })
    }

    render() {
        return html`
            <slot></slot>
        `
    }
}


