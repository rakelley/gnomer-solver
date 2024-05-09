import { Raid, Raider } from "../types/raiders";
import { default as binRaiders, BinnedRaiders } from "./rolebinner";
import createRoster from "./createRoster";
import scoreRoster from "./scoreRoster";
import { shuffleArray } from "../util";

const ITERATIONS = 100;

function randomizeInputs(raids: Raid[], raiders: BinnedRaiders): [Raid[], BinnedRaiders] {
    return [
        shuffleArray(raids),
        {
            tanks: shuffleArray(raiders.tanks),
            healers: shuffleArray(raiders.healers),
            melee: shuffleArray(raiders.melee),
            ranged: shuffleArray(raiders.ranged),
            hybrids: shuffleArray(raiders.hybrids),
        },
    ];
}

export default function solveRosters(raids: Raid[], raiders: Raider[]): Raid[] {
    const binned = binRaiders(raiders);

    let best = null;
    for (let i = 0; i < ITERATIONS; ++i) {
        const randomized = JSON.parse(JSON.stringify(randomizeInputs(raids, binned)));
        const localRaids = randomized[0];
        let localRaiders = randomized[1];

        let score = 0;
        for (let j = 0; j < localRaids.length; ++j) {
            const result = createRoster(localRaids[j], localRaiders);
            localRaiders = result.remainingRaiders;
            score += scoreRoster(result.roster);
            localRaids[j].roster = result.roster;
        }

        if (best === null || best.score < score) {
            best = { raids: localRaids, score };
        }
    }

    if (best === null) {
        throw new Error("unreachable code path reached");
    }

    return best.raids.sort((a: Raid, b: Raid) => a.id - b.id);
}
