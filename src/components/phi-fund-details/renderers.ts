import {html, nothing, type TemplateResult} from "lit";
import {Fund} from "../../api-models/funds.ts";
import {constructTableRow, properCaseToWords} from "../../modules/utilities.ts";

/**
 * Renders a block of information displaying a title and details using the following template:
 * <pre>
 *  <div>
 *      <h4>${title}</h4>
 *      <small><p>${details}</p></small>
 *  </div>
 *  </pre>
 * @param title
 * @param details
 */
export function render_block(title: string | TemplateResult, details: string | TemplateResult) {
    return html`
            <div><h4>${title}</h4><small><p>${details}</p></small></div>
        `
}

/**
 * Renders the fundCode's restriction information.  Nothing is rendered if the fundCode is unrestricted.
 * @param fund
 */
// noinspection JSUnusedGlobalSymbols
export function render_restrictions(fund: Fund) {
    if (fund.type === "Restricted")
        return render_block(
            html`Restrictions&nbsp;<sl-icon name="exclamation-triangle"></sl-icon>`,
            fund.restrictions.details
        )
}

/**
 * Renders the fundCode's address.
 * @param fund
 */
// noinspection JSUnusedGlobalSymbols
export function render_address(fund: Fund) {
    return render_block(
        "Address",
        html`
            ${fund.address.lines.map((line) => html`${line}<br>`)}
            ${fund.address.town} ${fund.address.state} ${fund.address.postcode}
        `
    )
}

/**
 * Renders an individual fundCode contact.  Used by `render_contacts()`.
 * @param iconName Icon to prefix the contact title
 * @param text Text title for contact
 */
// noinspection JSUnusedGlobalSymbols
export function render_contact(iconName: string, text: string) {
    return text ? html`
            <sl-icon style="margin-right:0.5em" name=${iconName}></sl-icon>
            <a href=${text} target="_blank">${text}</a><br>
        ` : nothing;
}

/**
 * Renders the fundCode's contacts/communication details.
 * @param fund
 */
// noinspection JSUnusedGlobalSymbols
export function render_contacts(fund: Fund) {
    if (fund.communications.email || fund.communications.phone || fund.communications.website) {
        return render_block(
            "Communication",
            html`
                ${render_contact("telephone", fund.communications.phone)}
                ${render_contact("globe2", fund.communications.website)}
                ${render_contact("envelope", fund.communications.email)}
            `,
        )
    }
}

/**
 * Renders the fundCode's website links in a table.
 * @param fund
 */
// noinspection JSUnusedGlobalSymbols
export function render_websites(fund: Fund) {
    if (fund.websiteLinks.length > 0)
        return render_block(
            "Web-sites",
            html`
                <table>
                    ${fund.websiteLinks.map((link) => {
                        return constructTableRow(
                                properCaseToWords(link.title),
                                " : ",
                                html`<a href=${link.link} target="_blank">${link.link}</a>`
                        )
                    })}
                </table>
            `
        );
}

/**
 * Render the fundCode's dependant limits as a table.
 * @param fund
 */
// noinspection JSUnusedGlobalSymbols
export function render_dependant_limits(fund: Fund) {
    const limits = [ ...fund.dependantLimits.dependantLimits.values() ];
    return render_block(
        "Dependant Limits",
        html`
            <table>
                ${limits.map((limit) => {
                    const text = limit.supported ? `ages ${limit.minAge}-${limit.maxAge}` : "not supported";
                    return constructTableRow(properCaseToWords(limit.title), " : ", " ", text);
                })}
            </table>
            ${fund.dependantLimits.nonClassifiedDependantDescription ?
                    html`<p>NOTE Non-classified dependants: ${fund.dependantLimits.nonClassifiedDependantDescription}<\p>`
                    : nothing
            }
        `
    )
}
