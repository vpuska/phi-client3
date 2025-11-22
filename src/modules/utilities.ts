/**
 * modules/globals.ts
 * --
 * @author VJP
 * @written 16-Nov-2025
 * @description General utility functions.
 */


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