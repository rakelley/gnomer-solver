import solveRosters from "./solver/solver";
import { Raid, Raider } from "./types/raiders";
import { SpecName } from "./types/specs";

const TEST_RAIDS: Raid[] = [
    {
        id: 1,
        label: "Gnomer 3/12/24",
        roster: null,
    },
    {
        id: 2,
        label: "Gnomer 3/13/24",
        roster: null,
    },
];

const TEST_RAIDERS: Raider[] = [
    {
        name: "tankWarA",
        spec: SpecName.tankWarrior,
        availableRaids: [1, 2],
        exclusiveWith: ["Cheez/lock"],
    },
    {
        name: "tankLockA",
        spec: SpecName.tankWarlock,
        availableRaids: [1, 2],
        exclusiveWith: ["Cheez"],
    },
    {
        name: "healMageA",
        spec: SpecName.arcaneMage,
        availableRaids: [1],
        exclusiveWith: [],
    },
    {
        name: "retPalA",
        spec: SpecName.retPal,
        availableRaids: [1],
        exclusiveWith: [],
    },
    {
        name: "boomieA",
        spec: SpecName.boomie,
        availableRaids: [1],
        exclusiveWith: [],
    },
    {
        name: "dpsMageA",
        spec: SpecName.fireMage,
        availableRaids: [1],
        exclusiveWith: [],
    },
    {
        name: "feralA",
        spec: SpecName.feral,
        availableRaids: [2],
        exclusiveWith: [],
    },
    {
        name: "priestA",
        spec: SpecName.healPriest,
        availableRaids: [2],
        exclusiveWith: [],
    },
    {
        name: "priestB",
        spec: SpecName.healPriest,
        availableRaids: [2],
        exclusiveWith: [],
    },
    {
        name: "dpsMageB",
        spec: SpecName.fireMage,
        availableRaids: [2],
        exclusiveWith: [],
    },
    {
        name: "retPalB",
        spec: SpecName.retPal,
        availableRaids: [1, 2],
        exclusiveWith: ["altPriestA"],
    },
    {
        name: "altPriestA",
        spec: SpecName.healPriest,
        availableRaids: [1, 2],
        exclusiveWith: ["retPalB"],
    },
    {
        name: "spriestA",
        spec: SpecName.shadow,
        availableRaids: [1, 2],
        exclusiveWith: [],
    },
    {
        name: "hunterA",
        spec: SpecName.meleeHunter,
        availableRaids: [1, 2],
        exclusiveWith: [],
    },
    {
        name: "rogueA",
        spec: SpecName.dpsRogue,
        availableRaids: [1, 2],
        exclusiveWith: [],
    },
    {
        name: "rogueB",
        spec: SpecName.dpsRogue,
        availableRaids: [1, 2],
        exclusiveWith: [],
    },
    {
        name: "tankLockB",
        spec: SpecName.tankWarlock,
        availableRaids: [1, 2],
        exclusiveWith: ["altPriestB"],
    },
    {
        name: "altPriestB",
        spec: SpecName.shadow,
        availableRaids: [1, 2],
        exclusiveWith: ["tankLockB"],
    },
    {
        name: "rogueC",
        spec: SpecName.dpsRogue,
        availableRaids: [1, 2],
        exclusiveWith: [],
    },
    {
        name: "dpsMageC",
        spec: SpecName.fireMage,
        availableRaids: [1, 2],
        exclusiveWith: [],
    },
];

console.log(JSON.stringify(solveRosters(TEST_RAIDS, TEST_RAIDERS), null, 4));
