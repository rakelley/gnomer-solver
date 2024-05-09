import { Raider } from "../types/raiders";
import specs from "../specs";

export type BinnedRaiders = {
    tanks: Raider[];
    healers: Raider[];
    melee: Raider[];
    ranged: Raider[];
    hybrids: Raider[];
};

export default function binRaiders(raiders: Raider[]): BinnedRaiders {
    const binned: BinnedRaiders = {
        tanks: [],
        healers: [],
        melee: [],
        ranged: [],
        hybrids: [],
    };

    for (let i = 0, max = raiders.length; i < max; ++i) {
        const raider = raiders[i];
        const spec = specs[raider.spec];
        if ((spec.healOrRanged ?? null) !== null) {
            binned.hybrids.push(raider);
            continue;
        }
        if (spec.canTank) {
            binned.tanks.push(raider);
            continue;
        }
        if (spec.canRaidHeal || spec.canTankHeal) {
            binned.healers.push(raider);
            continue;
        }
        if (spec.canRangedDPS) {
            binned.ranged.push(raider);
            continue;
        }
        if (spec.canMeleeDPS) {
            binned.ranged.push(raider);
        }
    }

    return binned;
}
