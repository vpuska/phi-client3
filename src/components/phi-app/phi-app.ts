/**
 * components/application/application.component.ts
 * --
 * Top-Level application element.
 * @author VJP
 * @written 28-Sep-2025
 */

import {LitElement, html, css} from 'lit'
import {state, property, customElement} from 'lit/decorators.js'
import {Task} from "@lit/task";

import {FundManager} from "../../api-models/funds.ts";
import {Theming} from "../../modules/theming.ts";
import {ServiceManager} from "../../api-models/services.ts";

import "./phi-app-splash.ts";
import "./phi-app-main.ts";
import "./phi-app-pager.ts";
import "./phi-app-header.ts";

/**
 * Top-level PHI application element used in `index.html`.  Displays a splash-screen during startup
 * and then shows the main application page
 */
@customElement('phi-app')
export class PhiApp extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            width: 100vw;
            height: 100vh;
        }
    `
    /**
     * Number of 1/4 second ticks to keep the splash screen displayed before moving to main application page.
     * */
    @property({attribute: "min-ticks", type: Number}) minTicks = 6;
    @state() tickCount = 1;


    constructor() {
        super();
        Theming.init();
    }


    connectedCallback() {
        super.connectedCallback();
        this.startupTasks.run().then();
    }


    private startupTasks = new Task(this, {
        task: async() => {
            const t1 = this.startupTimerTask();
            const t2 = this.startupFundsTask();
            await Promise.all([t1, t2]);
        }
    })


    private async startupTimerTask() {
        while (this.tickCount <= this.minTicks) {
            await new Promise(resolve => setTimeout(resolve, 250));
            this.tickCount++;
        }
    }


    private async startupFundsTask() {
        const p1 = FundManager.download();
        const p2 = ServiceManager.fetchServices()
        await Promise.all([p1, p2]);
        this.tickCount += 4;
    }


    render_splash_screen() {
        return html`<phi-app-splash ticks="${this.tickCount}"></phi-app-splash>`;
    }


    render_main_screen() {
        return html`<phi-app-main></phi-app-main>`;
    }


    render() {
        return this.startupTasks.render({
            initial: () => this.render_splash_screen(),
            pending: () => this.render_splash_screen(),
            complete: () => this.render_main_screen(),
            error: () => html`Error`,
        })
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'phi-app': PhiApp;
    }
}
