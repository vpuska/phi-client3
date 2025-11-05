/**
 * modules/globals.ts
 * --
 * @author VJP
 * @written 05-Nov-2025
 * @description A static, global namespace for application-wide variables.
 */


import {PhiPageManager} from "../components/phi-page-manager.ts";


let pageManager : PhiPageManager;


/**
 * Register the `<phi-page-manager>` element for the application.
 * @param pageMgr
 */
function registerPageManager(pageMgr : PhiPageManager) {
    pageManager = pageMgr
}


/**
 * Return reference to `<phi-page-manager>` element.
 */
function getPageManager(){
    return pageManager;
}


/**
 * Register/set global application variables.
 */
const register = {
    pageManager: registerPageManager,
}


/**
 * Get/return global application variables.
 */
const get = {
    pageManager: getPageManager,
}


export const Globals = {
    register: register,
    set: register,
    get: get,
}
