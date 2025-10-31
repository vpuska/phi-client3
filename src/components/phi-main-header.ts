/**
 * components/phi-main-header.ts
 * --
 * @author VJP
 * @written 29-Sep-2025
 */

import {LitElement, html, css} from 'lit'
import { customElement, state} from 'lit/decorators.js'
import type {SlSelectEvent} from "@shoelace-style/shoelace";

import logo from '/phi-logo.svg'

import {Theming, type ThemingType} from "../modules/theming.ts";


/**
 * Main application header
 */
@customElement('phi-main-header')
export class PhiMainHeader extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 4rem;
            height: 64px;
            background-color: var(--sl-color-gray-300);
            border-radius: 8px;
            margin: 8px 8px 0 8px;
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
        p {
            color: var(--sl-color-primary-800);
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
                <p>Funds</p>
                <p>Product Search</p>
                <p>Resources</p>
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
                                    <sl-icon name="square-fill" style="color: ${styles.get(`--${theme}-alternate`)}"></sl-icon>
                                    ${styles.get(`--${theme}-name`)}
                                </div>
                            </sl-menu-item>    
                        `)}
                    </sl-menu>
                </sl-dropdown>
            </div>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-main-header': PhiMainHeader,
    }
}
