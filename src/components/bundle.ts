/**
 * components/application/component.ts
 * --
 * Top-Level application element.
 * @author VJP
 * @written 28-Sep-2025
 */

import {PhiApplication} from "./application/application.ts";
import {PhiSplashScreen} from "./application/splash-screen.ts";
import {PhiMain} from "./application/main.ts";
import {PhiMainHeader} from "./application/phi-main-header.ts";
import {PhiPageManager} from "./application/page-manager.ts";
import {PhiHomePage} from "./home-page/home-page.ts";
import {PhiFundBrowser} from "./fund-browser/fund-browser.ts";
import {PhiFundDetails} from "./fund-details/fund-details.ts";
import {PhiFundProductBrowser} from "./fund-details/fund-product-browser.ts";
import {PhiProductDetails} from "./product-details/product-details.ts";
import {PhiNeedsAnalysis} from "./phi-na/phi-na.ts";
import {PhiNADetails} from "./phi-na/phi-na-details.ts";
import {PhiNADetailsGroup} from "./phi-na/phi-na-details-group.ts";
import {PhiNADetails10} from "./phi-na/phi-na-details-10.ts";
import {PhiNADetails20} from "./phi-na/phi-na-details-20.ts";
import {PhiNADetails30} from "./phi-na/phi-na-details-30.ts";


// Main Application and Page Elements/containers
window.customElements.define('phi-application', PhiApplication);
window.customElements.define('phi-splash-screen', PhiSplashScreen);
window.customElements.define('phi-main', PhiMain)
window.customElements.define('phi-page-manager', PhiPageManager);
window.customElements.define('phi-main-header', PhiMainHeader);
// Home Page
window.customElements.define('phi-home', PhiHomePage);
// Fund Browser
window.customElements.define('phi-fund-browser', PhiFundBrowser);
// Fund Details
window.customElements.define('phi-fund-details', PhiFundDetails);
window.customElements.define('phi-fund-product-browser', PhiFundProductBrowser);
// Product Details
window.customElements.define('phi-product-details', PhiProductDetails);
// Needs Analysis
window.customElements.define('phi-needs-analysis', PhiNeedsAnalysis);
window.customElements.define('phi-na-details', PhiNADetails);
window.customElements.define('phi-na-details-group', PhiNADetailsGroup)
window.customElements.define('phi-na-details-10', PhiNADetails10)
window.customElements.define('phi-na-details-20', PhiNADetails20)
window.customElements.define('phi-na-details-30', PhiNADetails30)

declare global {
    // noinspection JSUnusedGlobalSymbols
    interface HTMLElementTagNameMap {
        // Main Application and Page Elements/containers
        'phi-application': PhiApplication,
        'phi-splash-screen': PhiSplashScreen,
        'phi-main': PhiMain,
        'phi-main-header': PhiMainHeader,
        'phi-page-manager': PhiPageManager,
        // Home Page
        'phi-home': PhiHomePage,
        // Fund Browser
        'phi-fund-browser': PhiFundBrowser,
        // Fund Details
        'phi-fund-details': PhiFundDetails,
        'phi-fund-product-browser': PhiFundProductBrowser,
        // Product Details
        'phi-product-details': PhiProductDetails,
        // Needs Analysis
        'phi-needs-analysis': PhiNeedsAnalysis,
        'phi-na-details': PhiNADetails,
        'phi-na-details-group': PhiNADetailsGroup,
        'phi-na-details-10': PhiNADetails10,
        'phi-na-details-20': PhiNADetails20,
        'phi-na-details-30': PhiNADetails30,
    }
}
