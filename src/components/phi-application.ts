/**
 * components/phi-application.ts
 * --
 * Top-Level application element and splash-screen.
 * @author VJP
 * @written 28-Sep-2025
 */

import {LitElement, html, css} from 'lit'
import { customElement, state, property } from 'lit/decorators.js'
import {Task} from "@lit/task";

import {FundManager} from "../api-models/funds.ts";
import {Theming} from "../modules/theming.ts";
import logo from '/phi-logo.svg'


/**
 * Top-level PHI application element used in `index.html`.  Displays a splash-screen during startup
 * and then shows the main application page
 */
@customElement('phi-application')
export class PhiApplication extends LitElement {

    // noinspection CssUnusedSymbol
    static styles = css`
        :host {
            display: flex;
            width: 100%;
            height: 100%;
        }
    `
    /**
     * Number of 1/4 section ticks to keep the splash screen displayed before moving to main application page.
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
        await FundManager.download();
        this.tickCount += 4;
    }


    render_splash_screen() {
        return html`<phi-splash-screen ticks="${this.tickCount}"></phi-splash-screen>`;
    }


    render_main_screen() {
        return html`<phi-main></phi-main>`;
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


/**
 * PHI Application splash screen
 */
@customElement('phi-splash-screen')
class PhiSplashScreen extends LitElement {
    static styles = css`
        :host {
            display: flex;
            align-items: center;
            width: 100%;
            height: 100%;
        }
        div {
            width: 100%;
            text-align: center;
        }
    `

    /**
     * The number of progress tick counts to display
     */
    @property({attribute:"ticks", type: Number}) tickCount: number = 1;

    render() {
        return html`
            <div>
                <h2>Private Health Insurance Comparator</h2>
                <img width="192px" height="192px" src=${logo} alt="PHI Logo" />
                <p>Please wait while loading</p>
                <p>[ :${" :".repeat(this.tickCount)} ]</p>
            </div>
        `
    }
}


declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        'phi-application': PhiApplication,
        'phi-splash-screen': PhiSplashScreen,
    }
}
