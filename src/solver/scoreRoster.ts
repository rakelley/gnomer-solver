import { RaidRoster } from "../types/raiders";
import { SpecName, ClassName } from "../types/specs";
import specs from "../specs";

const NON_VIABLE = -999999999;

function getTankScore(roster: RaidRoster): number {
    let tankScore = roster.tanks.length * 250;

    let hasRanged = false;
    let hasWarrior = false;
    for (let i = 0; i < roster.tanks.length; ++i) {
        const spec = specs[roster.tanks[i].spec];
        hasRanged = hasRanged || (spec.canRangedDPS ?? false);
        hasWarrior = hasWarrior || spec.id === SpecName.tankWarrior;
    }

    let hasFeral = false;
    for (let i = 0; i < roster.melee.length; ++i) {
        const spec = specs[roster.melee[i].spec];
        hasFeral = hasFeral || spec.id === SpecName.feral;
    }

    // having a ranged tank makes menagerie easier
    tankScore += hasRanged ? 100 : 0;

    // warriors really need rage help
    // TODO add shaman windfury check
    tankScore += hasWarrior && !hasFeral ? -50 : 0;

    return tankScore;
}

function getHealerScore(roster: RaidRoster): number {
    let healerScore = roster.healers.length * 250;

    let hasOffheals = false;
    for (let i = 0; i < roster.ranged.length; ++i) {
        const spec = specs[roster.ranged[i].spec];
        hasOffheals = hasOffheals || (spec.canOffheal ?? false);
    }

    healerScore += hasOffheals ? 100 : 0;

    return healerScore;
}

function getMechanicsScore(roster: RaidRoster): number {
    let mechanicsScore = 0;

    let hasKicker = false;
    let hasTankKicker = false;
    let bombsCounter = 0;
    let hasMajorArmorDebuff = false;
    let hasReck = false;
    let hasFF = false;
    let hasFeral = false;

    for (let i = 0; i < roster.tanks.length; ++i) {
        const spec = specs[roster.tanks[i].spec];
        hasTankKicker = hasTankKicker || (spec.canKick ?? false);
        hasMajorArmorDebuff = hasMajorArmorDebuff || (spec.canMajorArmorDebuff ?? false);
        hasReck = hasReck || spec.id === SpecName.tankWarlock;
        if (spec.id === SpecName.feral) {
            hasFF = true;
            hasFeral = true;
        }
    }
    if (hasReck || hasFF) {
        //druid or lock offtank can cover bombs
        ++bombsCounter;
    }

    for (let i = 0; i < roster.melee.length; ++i) {
        const spec = specs[roster.melee[i].spec];
        hasKicker = hasKicker || (spec.canKick ?? false);
        hasMajorArmorDebuff = hasMajorArmorDebuff || (spec.canMajorArmorDebuff ?? false);
        if (spec.id === SpecName.feral) {
            hasFF = true;
            hasFeral = true;
        }
        if (spec.canBombs ?? false) {
            ++bombsCounter;
        }
    }

    for (let i = 0; i < roster.ranged.length; ++i) {
        const spec = specs[roster.ranged[i].spec];
        hasMajorArmorDebuff = hasMajorArmorDebuff || (spec.canMajorArmorDebuff ?? false);
        if (spec.canBombs ?? false) {
            ++bombsCounter;
        }
        hasReck = hasReck || spec.id === SpecName.dpsWarlock;
        hasFF = hasFF || spec.id === SpecName.boomie;
    }

    const openSlots = 8 - roster.tanks.length - roster.melee.length - roster.ranged.length;
    mechanicsScore += hasKicker ? 100 : hasTankKicker ? 0 : openSlots > 0 ? -200 : NON_VIABLE;
    mechanicsScore += bombsCounter >= 2 ? 100 : bombsCounter === 1 ? -100 : openSlots > 0 ? -200 : NON_VIABLE;
    mechanicsScore += hasMajorArmorDebuff ? 200 : 0;
    mechanicsScore += hasReck ? 50 : 0;
    mechanicsScore += hasFF ? 50 : 0;
    mechanicsScore += hasFeral ? 50 : 0;

    return mechanicsScore;
}

function getDPSScore(roster: RaidRoster): number {
    const openSlots = 6 - roster.melee.length - roster.ranged.length;
    let dpsScore = openSlots * -50;

    const ranged = roster.ranged.length + openSlots;
    dpsScore += ranged >= 2 ? 0 : ranged === 1 ? -200 : NON_VIABLE;

    return dpsScore;
}

function getClassBalanceScore(roster: RaidRoster): number {
    const classMap: Map<ClassName, number> = new Map();
    [roster.tanks, roster.healers, roster.melee, roster.ranged].forEach((set) => {
        for (let i = 0; i < set.length; ++i) {
            const className = specs[set[i].spec].className;
            classMap.set(className, (classMap.get(className) ?? 0) + 1);
        }
    });
    let overstacked = 0;
    for (const classCount of classMap) {
        if (classCount[1] >= 3) {
            ++overstacked;
        }
    }

    let classScore = overstacked * -100;
    classScore += (classMap.get(ClassName.Priest) ?? 0) > 0 ? 100 : 0;
    classScore += (classMap.get(ClassName.Druid) ?? 0) > 0 ? 100 : 0;
    classScore += (classMap.get(ClassName.Mage) ?? 0) > 0 ? 50 : 0;
    classScore += (classMap.get(ClassName.Paladin) ?? 0) > 0 ? 100 : 0;
    classScore += (classMap.get(ClassName.Warrior) ?? 0) > 0 ? 50 : 0;
    classScore += (classMap.get(ClassName.Hunter) ?? 0) > 0 ? 100 : 0;

    return classScore;
}

export default function scoreRoster(roster: RaidRoster): number {
    return (
        getTankScore(roster) +
        getHealerScore(roster) +
        getMechanicsScore(roster) +
        getDPSScore(roster) +
        getClassBalanceScore(roster)
    );
}
