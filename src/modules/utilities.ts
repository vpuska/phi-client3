/**
 * modules/globals.ts
 * --
 * @author VJP
 * @written 16-Nov-2025
 * @description General utility functions.
 */


import {html, type TemplateResult} from "lit";

/**
 * Converts a ProperCase / PascalCase / camelCase string
 * into space-delimited words.
 *
 * @examples
 *   <code>
 *   "HelloWorld"   -> "Hello World"<br>
 *   "camelCase"    -> "Camel Case"<br>
 *   "JSONParser"   -> "JSON Parser"<br>
 *   "userIDNumber" -> "User ID Number"<br>
 *   </code>
 */
export function properCaseToWords(input: string): string {
    if (!input.trim()) {
        return "";
    }

    // Insert space before capital letters that are preceded by lowercase or another capital followed by lowercase
    return input
        .replace(/([a-z])([A-Z])/g, "$1 $2") // lower -> Upper
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // acronym -> Word
        .trim();
}

/**
 * Converts an variadic/rest array parameter to a series of cells in a table row.
 * @param cells
 * @examples
 * <code>
 *     "label", "value", "comment" -> `<tr><td>label</td><td>value</td><td>comment</td></tr>`
 * </code>
 */
export function constructTableRow(...cells: (string | TemplateResult)[] ) {
    return html`
        <tr>
            ${cells.map((cell) => {return html`<td>${cell}</td>`})}
        </tr>
    `
}

/**
 * Checks the elements of `data[]` includes ALL the values found in `filters[]`<br>
 * The order of values does not affect result.
 * @param filter
 * @param data
 * @examples
 * <pre>
 *     matchAll([1, 2, 5], [1, 2, 3, 4 ,5]) // => true
 *     matchAll([1, 2, 3], [1, 2, 4 ,5]) // => false
 * </pre>
 */
export function matchAll(filter: any[], data: any[] | string) {
    for (const item of filter)
        if (!data.includes(item))
            return false;
    return true;
}

/**
 * Checks if at least one value in `data[]` is found in `filter[]`  <br>
 * The order of values does not affect result.
 * @param filter
 * @param data
 * @examples
 * <pre>
 *   matchAny([1, 2, 3], [1, 3, 4 ,5]) // => true
 *   matchAny([1, 2, 3], [4 ,5]) // => false
 * </pre>
 * */
export function matchAny(filter: any[], data: any[]) {
    for (const item of filter)
        if (data.includes(item))
            return true;
    return false;
}

/**
 * Checks if `data[]` and `filter[]` are equivalent.
 * The order of values does not affect result.
 * @param filter
 * @param data
 * @examples
 * <pre>
 *   matchExactly([1, 2, 4], [1, 2, 4]) // => true
 *   matchExactly([1, 2, 4], [1, 2, 3, 4]) // => false
 *   matchExactly([1, 2, 4], [1, 4]) // => false
 * </pre>
 */
export function matchExactly(filter: any[], data: any[]) {
    return matchAll(filter, data) && matchAll(data, filter);
}

/**
 * Checks if `data[]` only includes values found in `filter[]`.
 * @param filter
 * @param data
 * @examples
 * <pre>
 *   matchOnly([1, 2, 4], [1, 2]) // => true
 *   matchOnly([1, 2, 4], [1, 2, 5]) // => false
 * </pre>
 */
export function matchOnly(filter: any[], data: any[]) {
    for (const item of data)
        if (!filter.includes(item))
            return false;
    return true;
}

/**
 * Removes containing quotes from a string.  If the string is not contained in quotes, it is
 * returned unaltered.
 * @param input
 * @example
 *      "Victor's string" => Victor's string
 *      Another string => Another string
 *      'Unbalanced quotes => 'Unbalanced quotes
 */
export function stripQuotes(input: string): string {
    if (input.length >= 2) {
        const firstChar = input[0];
        const lastChar = input[input.length - 1];

        // Check if both are matching quotes
        if ((firstChar === '"' && lastChar === '"') ||
            (firstChar === "'" && lastChar === "'")) {
            return input.slice(1, -1);
        }
    }
    return input;
}