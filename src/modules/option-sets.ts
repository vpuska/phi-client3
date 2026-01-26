/***
 * common/option-sets.ts
 * ---
 * Define the choices for `phi-option-sets`.
 */

export type OptionEntryType<T> = {
    value: string;
    data: T;
    icon?: string;
    label: string
    tooltip: string;
    helptext?: string;
}


const coverTypeOptions = new Map<string, OptionEntryType<{ hospital: boolean, extras: boolean }>>;
coverTypeOptions.set("Hospital", {
    value: "Hospital",
    data: {hospital: true, extras: false},
    label: "Hospital",
    tooltip: "Hospital",
    helptext: "Hospital only policy selected",
});
coverTypeOptions.set("GeneralHealth", {
    value: "GeneralHealth",
    data: {hospital: false, extras: true},
    label: "Extras",
    tooltip: "Extras/General Health",
    helptext: "Extras only policy selected",
});
coverTypeOptions.set("All", {
    value: "All",
    data: {hospital: true, extras: true},
    label: "Combined",
    tooltip: "Combined Hospital & Extras/General Health",
    helptext: "Combined Hospital & Extras/General Health policy selected",
});


const childCoverOptions = new Map<string, OptionEntryType<boolean>>;
childCoverOptions.set("Yes", {
    value: "Yes",
    data: true,
    label: "Yes",
    tooltip: "Child cover",
    helptext: "Policy will cover children up to 17yrs"
})
childCoverOptions.set("No", {
    value: "No",
    data: false,
    label: "No",
    tooltip: "No child cover",
    helptext: "Children will not be included on the policy"
})


const disabledCoverOptions = new Map<string, OptionEntryType<boolean>>;
disabledCoverOptions.set("Yes", {
    value: "Yes",
    data: true,
    label: "Yes",
    tooltip: "Disabled cover",
    helptext: "Disabled dependants will be covered by this policy"
})
disabledCoverOptions.set("No", {
    value: "No",
    data: false,
    label: "No",
    tooltip: "No disabled dependant cover",
    helptext: "Disabled dependants will not be covered by this policy"
})


const studentCoverOptions = new Map<string, OptionEntryType<number>>;
const youngAdultCoverOptions = new Map<string, OptionEntryType<number>>;


const stateOptions = new Map<string, OptionEntryType<string>>();
["NSW", "VIC", "QLD", "TAS", "SA", "WA", "NT"].map(state => {
    const label = state === "NSW" ? "NSW/ACT" : state;
    stateOptions.set(state, {
        value: state,
        data: state,
        icon: state,
        label: label,
        tooltip: label,
        helptext: "Reside in " + label
    })
});


const familyOptions = new Map<string, OptionEntryType<{ numberOfAdults: number, dependants: boolean }>>();
familyOptions.set("1", {
    value: "1",
    data: {numberOfAdults: 1, dependants: false},
    label: "Single",
    tooltip: "Single",
    icon: 'single',
    helptext: "One adult will be covered by the policy"
})
familyOptions.set("2", {
    value: "2",
    data: {numberOfAdults: 2, dependants: false},
    label: "Couple",
    tooltip: "Couple",
    icon: 'couple.svg',
    helptext: "2 adults will be covered by the policy"
})
familyOptions.set("2D", {
    value: "2D",
    data: {numberOfAdults: 2, dependants: true},
    label: "Family",
    tooltip: "Family",
    icon: 'family',
    helptext: "2 adults plus dependants will be covered by the policy"
})
familyOptions.set("1D", {
    value: "1D",
    data: {numberOfAdults: 1, dependants: true},
    label: "Single Parent Family",
    tooltip: "Single Parent Family",
    icon: 'single_parent',
    helptext: "1 adult plus dependants will be covered by the policy",
})
familyOptions.set("0D", {
    value: "0D",
    data: {numberOfAdults: 0, dependants: true},
    label: "Dependents Only",
    tooltip: "Dependants Only",
    icon: 'dependants',
    helptext: "Only dependants will be covered by the policy"
})


export const OptionSets = {
    coverTypeOptions: coverTypeOptions,
    stateOptions: stateOptions,
    familyOptions: familyOptions,
    childCoverOptions: childCoverOptions,
    disabledCoverOptions: disabledCoverOptions,
    studentCoverOptions: studentCoverOptions,
    youngAdultCoverOptions: youngAdultCoverOptions
}