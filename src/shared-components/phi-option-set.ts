/**
 * components/phi-option-set
 * -------------------------
 * Component to render `sl-radio-group` based on {@link OptionEntryType} collection defined in "common/option-sets.ts".
 */
import {LitElement, html} from 'lit'
import {customElement, property, query} from 'lit/decorators.js'

import {type OptionEntryType} from "../modules/option-sets.ts";
import {SlRadioGroup} from "@shoelace-style/shoelace";


export class PhiOptionChangeEvent extends CustomEvent<OptionEntryType<any>> {}

/**
 * Custom component to render `sl-radio-group` based in {@link OptionEntryType} collection defined in "common/option-sets.ts".
 *
 * @property label - Refer `sl-radio-group` label.
 * @property helpText - Refer `sl-radio-group` helpText.  (Attribute name:`help-text`).
 * @property value - The key value of the currently selected `OptionEntryType` in the collection.
 * @property disabled - Disable control.
 * @property options - The option set collection
 * @get selelectedOption - Current selected option
 * @event phi-option-change - The selected option has changed and `value` has changed.  `Event.detail` points to the new OptionEntry.
 */
@customElement('phi-option-set')
export class PhiOptionSet extends LitElement {

    @property()
    label? : string;

    @property({attribute:"help-text"})
    helpText? : string;

    @property({reflect:true})
    value: string | undefined = undefined;

    @property({type: Boolean})
    disabled? : boolean = false;

    @property()
    options? : Map<any,OptionEntryType<any>>;

    @query('sl-radio-group') slRadioGroup? : SlRadioGroup

    get selectedOption () : OptionEntryType<any> | undefined {
        return this.options?.get(this.value);
    }

    changeEventHandler(evt: Event) {
        const target = evt.target as SlRadioGroup;
        this.value = target.value;
        const option = this.selectedOption;
        if (option)
            if (option.helptext)
                target.helpText = option.helptext;
        this.dispatchEvent(new PhiOptionChangeEvent("phi-option-change", {
                detail: option,
                bubbles: true,
            })
        );
    }

    render() {
        return html`
            <sl-radio-group style="padding: 1em 0;"
                            label="${this.label}"
                            value="${this.value}"
                            help-text="${this.helpText}"
                            @sl-change=${this.changeEventHandler.bind(this)}
            >
                ${[...this.options!.values()].map(opt => html`
                    <sl-tooltip content="${opt.tooltip}">
                        <sl-radio-button ?disabled=${this.disabled} value="${opt.value}">
                            ${opt.icon ? html`
                                <sl-icon style="font-size: 2rem" library="app-icons" name="${opt.icon}"></sl-icon>` : html`${opt.label}`}
                        </sl-radio-button>
                    </sl-tooltip>
                `)}
            </sl-radio-group>
        `
    }
}

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-option-set': PhiOptionSet,
    }
}

