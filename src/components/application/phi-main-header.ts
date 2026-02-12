/**
 * components/phi-main-header.ts
 * --
 * @author VJP
 * @written 29-Sep-2025
 */

import {LitElement, html, css} from 'lit'
import {state} from 'lit/decorators.js'
import type {SlSelectEvent} from "@shoelace-style/shoelace";

import logo from '/phi-logo.svg'

import {Theming, type ThemingType} from "../../modules/theming.ts";
import {Globals} from "../../modules/globals.ts";
import {stripQuotes} from "../../modules/utilities.ts";


/**
 * Main application header.
 */
export class PhiMainHeader extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: row;
            flex: 0 0 auto;
            align-items: center;
            gap: 4rem;
            height: 96px;
            background-color: var(--sl-color-primary-200);
            border: 1px solid var(--sl-color-primary-400);
            border-radius: 8px;
        }
        div.title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding-left: 1rem;
        }
        div.menu {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex-grow: 1;
        }
        div.toolbar {
            display: flex;
            align-items: center;
            justify-content: end;
            gap: 0.5rem;
            padding-right: 1rem;
        }
        sl-button::part(base) {
        }
        
    `
    @state() theme: string = Theming.getTheme();
    @state() themeColor: string = Theming.getThemeColor();

    private colorThemes: string[] = [];

    private icons = {
        light: "sun-fill",
        dark: "moon-fill",
        system: "circle-half"
    };


    constructor() {
        super();

        // Build list of themes defined in stylesheet(s).
        for (const key of document.documentElement.computedStyleMap().keys())
            if (key.startsWith('--phi-theme-') && key.endsWith('name'))
                this.colorThemes.push(key.substring(2, 14));

        this.addEventListener('sl-select', (event: Event) => {
            const value = (event as SlSelectEvent).detail.item.value;
            if (value.startsWith("phi-theme-"))
                Theming.setThemeColor(value);
            else
                Theming.setTheme(value as ThemingType);
            this.theme = Theming.getTheme();
            this.themeColor = Theming.getThemeColor();
        })
    }


    render() {
        const styles = document.documentElement.computedStyleMap();

        return html`
            
            <div class="title">
                <img src="${logo}" width="48px" height="48px" alt="PHI Logo"/>
                <h4>Private Health Insurance Comparator</h4>
            </div>
            
            <div class="menu">
                <sl-button variant="text" size="large"
                           @click=${() => {Globals.get.pageManager().setPage(document.createElement("phi-home"))}}>
                    <sl-icon slot="prefix" name="house"></sl-icon>
                    Home
                </sl-button>
                <sl-button variant="text" size="large"
                           @click=${() => {Globals.get.pageManager().setPage(document.createElement("phi-fund-browser"))}}>
                    <sl-icon slot="prefix" name="buildings"></sl-icon>
                    Funds
                </sl-button>
                <sl-button variant="text" size="large"
                           @click=${() => {Globals.get.pageManager().setPage(document.createElement("phi-needs-analysis"))}}>
                    <sl-icon slot="prefix" name="search"></sl-icon>
                    Compare
                </sl-button>

                <sl-dropdown>
                    <sl-button variant="text" size="large" slot="trigger" caret>
                        <sl-icon slot="prefix" name="globe"></sl-icon>
                        Links
                    </sl-button>
                    <sl-menu>
                        <sl-menu-item><a target="_blank" href="https://www.privatehealth.gov.au/">https://www.privatehealth.gov.au/</a></sl-menu-item>
                        <sl-menu-item>
                            <a target="_blank" 
                               href="https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance">
                               Australian Government Rebate (www.ato.gov.au)
                            </a>
                        </sl-menu-item>
                    </sl-menu>
                </sl-dropdown>
                
            </div>
            
            <div class="toolbar">
                <sl-dropdown>
                    <sl-icon-button 
                            slot="trigger" 
                            name="${this.icons[this.theme as keyof typeof this.icons]}" 
                            label="Select display theme">
                    </sl-icon-button>
                    <sl-menu>
                        <sl-menu-item type="checkbox" value="light" ?checked=${this.theme==="light"}>Light mode</sl-menu-item>
                        <sl-menu-item type="checkbox" value="dark" ?checked=${this.theme==="dark"}>Dark mode</sl-menu-item>
                        <sl-divider></sl-divider>
                        <sl-menu-item type="checkbox" value="system" ?checked=${this.theme==="system"}>System</sl-menu-item>
                        <sl-divider></sl-divider>
                        ${this.colorThemes.map((theme) => html`
                            <sl-menu-item type="checkbox" value="${theme}" ?checked="${this.themeColor===theme}">
                                <div style="display:flex; gap: 8px; align-items: center">
                                    <sl-icon name="square-fill" style="color: ${styles.get(`--${theme}-primary`)}"></sl-icon>
                                    ${stripQuotes( styles.get(`--${theme}-name`)?.toString() || "No Name") }
                                </div>
                            </sl-menu-item>    
                        `)}
                    </sl-menu>
                </sl-dropdown>
            </div>
        `
    }
}
