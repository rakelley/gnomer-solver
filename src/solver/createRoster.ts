import { Raid, Raider, RaidRoster } from "../types/raiders";
import { SpecName } from "../types/specs";
import { BinnedRaiders } from "./rolebinner";
import specs from "../specs";
import { removeFromArray, shuffleArray } from "../util";

function isAvailable(raid: Raid, prospect: Raider): boolean {
    return prospect.availableRaids.indexOf(raid.id) !== -1;
}

function compareRaiders(a: Raider, b: Raider): boolean {
    return a.name === b.name;
}

function removeRaider(raider: Raider | string, pool: BinnedRaiders): BinnedRaiders {
    const usableRaider: Raider =
        typeof raider === "string"
            ? {
                  //dummy stub if we only have the name
                  name: raider,
                  spec: SpecName.tankWarrior,
                  availableRaids: [],
              }
            : raider;
    const modifiedPool = JSON.parse(JSON.stringify(pool));
    let found = false;
    Object.keys(modifiedPool).forEach((key) => {
        if (found || !Object.prototype.hasOwnProperty.call(modifiedPool, key)) {
            return;
        }
        const set: Raider[] = modifiedPool[key];
        const startingLength = set.length;
        const modifiedSet = removeFromArray(set, usableRaider, compareRaiders);
        if (modifiedSet.length !== startingLength) {
            modifiedPool[key] = modifiedSet;
            found = true;
        }
    });

    return modifiedPool;
}

function getTanks(raid: Raid, availableRaiders: BinnedRaiders): Raider[] {
    const raidOnlyTanks: Raider[] = [];
    const raidInclusiveTanks: Raider[] = [];
    const toUse: Raider[] = [];
    const excludeList: string[] = [];

    // filter tanks that are only available for this raid
    for (let i = 0, max = availableRaiders.tanks.length; i < max; ++i) {
        const current = availableRaiders.tanks[i];
        if (!isAvailable(raid, current) || excludeList.indexOf(current.name) !== -1) {
            continue;
        }

        const currentExclusions = current.exclusiveWith ?? [];
        for (let j = 0; j < currentExclusions.length; ++j) {
            excludeList.push(currentExclusions[j]);
        }

        if (current.availableRaids.length === 1) {
            raidOnlyTanks.push(current);
            continue;
        }
        raidInclusiveTanks.push(current);
    }

    let done = false;
    [raidOnlyTanks, raidInclusiveTanks].forEach((set) => {
        if (done) {
            return;
        }
        for (let i = 0, max = set.length; i < max; ++i) {
            toUse.push(set[i]);
            if (toUse.length >= 2) {
                done = true;
                return;
            }
        }
    });

    return toUse;
}

function getHealers(raid: Raid, availableRaiders: BinnedRaiders): Raider[] {
    const raidOnlyHealers: Raider[] = [];
    const raidInclusiveHealers: Raider[] = [];
    const toUse: Raider[] = [];
    const excludeList: string[] = [];

    // filter healers that are only available for this raid
    [availableRaiders.healers, availableRaiders.hybrids].forEach((set) => {
        for (let i = 0, max = set.length; i < max; ++i) {
            const current = set[i];
            if (!isAvailable(raid, current) || excludeList.indexOf(current.name) !== -1) {
                continue;
            }

            const currentExclusions = current.exclusiveWith ?? [];
            for (let j = 0; j < currentExclusions.length; ++j) {
                excludeList.push(currentExclusions[j]);
            }

            if (current.availableRaids.length === 1) {
                raidOnlyHealers.push(current);
                continue;
            }
            raidInclusiveHealers.push(current);
        }
    });

    let done = false;
    [raidOnlyHealers, raidInclusiveHealers].forEach((set) => {
        if (done) {
            return;
        }
        for (let i = 0, max = set.length; i < max; ++i) {
            const healer = set[i];
            let spec = specs[healer.spec];
            let overrideSpec = false;
            const hybridConfig = spec.healOrRanged ?? null;
            if (hybridConfig !== null) {
                spec = specs[hybridConfig.heal];
                overrideSpec = true;
            }

            // validate healer coverage type
            const existingHealer = toUse.length === 1 ? specs[toUse[0].spec] : null;
            if (
                existingHealer !== null &&
                ((!existingHealer.canTankHeal && !spec.canTankHeal) ||
                    (!existingHealer.canRaidHeal && !spec.canRaidHeal))
            ) {
                continue;
            }

            if (overrideSpec) {
                healer.spec = spec.id;
            }
            toUse.push(healer);
            if (toUse.length >= 2) {
                done = true;
                return;
            }
        }
    });

    return toUse;
}

function getDPS(raid: Raid, availableRaiders: BinnedRaiders, hasBombOfftank: boolean): Raider[] {
    let raidOnlyDPS: Raider[] = [];
    let raidInclusiveDPS: Raider[] = [];
    const toUse: Raider[] = [];
    const excludeList: string[] = [];

    // filter healers that are only available for this raid
    [availableRaiders.melee, availableRaiders.ranged, availableRaiders.hybrids].forEach((set) => {
        for (let i = 0, max = set.length; i < max; ++i) {
            const current = set[i];
            if (!isAvailable(raid, current) || excludeList.indexOf(current.name) !== -1) {
                continue;
            }
            if (current.availableRaids.length === 1) {
                raidOnlyDPS.push(current);
                continue;
            }
            raidInclusiveDPS.push(current);
        }
    });

    raidOnlyDPS = shuffleArray(raidOnlyDPS);
    raidInclusiveDPS = shuffleArray(raidInclusiveDPS);

    // TODO add dps-capable tanks/healers

    let kickerCounter = 0;
    let bombsCounter = hasBombOfftank ? 1 : 0;
    let done = false;
    [raidOnlyDPS, raidInclusiveDPS].forEach((set) => {
        if (done) {
            return;
        }
        for (let i = 0, max = set.length; i < max; ++i) {
            const current = set[i];
            let spec = specs[current.spec];
            let overrideSpec = false;
            const hybridConfig = spec.healOrRanged ?? null;
            if (hybridConfig !== null) {
                spec = specs[hybridConfig.ranged];
                overrideSpec = true;
            }
            const canBombs = spec.canBombs ?? false;
            const canKick = spec.canKick ?? false;

            // cover necessary support roles
            if (
                toUse.length - kickerCounter - bombsCounter >= 3 &&
                bombsCounter < 2 &&
                !canBombs &&
                kickerCounter < 1 &&
                !canKick
            ) {
                continue;
            }

            const currentExclusions = current.exclusiveWith ?? [];
            for (let j = 0; j < currentExclusions.length; ++j) {
                excludeList.push(currentExclusions[j]);
            }

            if (overrideSpec) {
                current.spec = spec.id;
            }
            toUse.push(current);
            if (canBombs && bombsCounter < 2) {
                ++bombsCounter;
            }
            if (canKick && kickerCounter < 1) {
                ++kickerCounter;
            }
            if (toUse.length >= 6) {
                done = true;
                return;
            }
        }
    });

    return toUse;
}

function lockRaiderToRaid(
    raider: Raider,
    sharedPool: BinnedRaiders,
    currentPool: BinnedRaiders,
): [BinnedRaiders, BinnedRaiders] {
    sharedPool = removeRaider(raider, sharedPool);
    currentPool = removeRaider(raider, currentPool);

    // remove alts from consideration for this raid
    const exclusive = raider.exclusiveWith ?? [];
    for (let i = 0; i < exclusive.length; ++i) {
        currentPool = removeRaider(exclusive[i], currentPool);
    }

    return [sharedPool, currentPool];
}

export default function createRoster(
    raid: Raid,
    availableRaiders: BinnedRaiders,
): { roster: RaidRoster; remainingRaiders: BinnedRaiders } {
    let sharedPool: BinnedRaiders = JSON.parse(JSON.stringify(availableRaiders));
    let currentPool: BinnedRaiders = JSON.parse(JSON.stringify(availableRaiders));
    const roster: RaidRoster = {
        tanks: [],
        healers: [],
        melee: [],
        ranged: [],
    };

    // TODO need to add main/alt priority
    // TODO need to add bomb/kick designation

    const lockRaiders = (roleMembers: Raider[]) => {
        for (let i = 0; i < roleMembers.length; ++i) {
            [sharedPool, currentPool] = lockRaiderToRaid(roleMembers[i], sharedPool, currentPool);
        }
    };

    roster.tanks = getTanks(raid, currentPool);
    lockRaiders(roster.tanks);
    roster.healers = getHealers(raid, currentPool);
    lockRaiders(roster.healers);
    const dps = getDPS(
        raid,
        currentPool,
        roster.tanks.filter((tank) => {
            return specs[tank.spec].canBombs ?? false;
        }).length > 0,
    );
    lockRaiders(dps);
    for (let i = 0; i < dps.length; ++i) {
        const raider = dps[i];
        const spec = specs[raider.spec];
        (spec.canRangedDPS ? roster.ranged : roster.melee).push(raider);
    }

    // stripping current raid from availability of reamining raiders so they can
    // be properly prioritized for other raids
    [sharedPool.tanks, sharedPool.healers, sharedPool.melee, sharedPool.ranged, sharedPool.hybrids].forEach((set) => {
        for (let i = 0; i < set.length; ++i) {
            set[i].availableRaids = removeFromArray(set[i].availableRaids, raid.id);
        }
    });

    return { roster, remainingRaiders: sharedPool };
}
