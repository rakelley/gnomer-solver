import { SpecName } from "./specs";

export type Raider = {
    name: string;
    spec: SpecName;
    availableRaids: number[];
    exclusiveWith?: string[];
};

export type RaidRoster = {
    tanks: Raider[];
    healers: Raider[];
    melee: Raider[];
    ranged: Raider[];
};

export type Raid = {
    id: number;
    label: string;
    roster: RaidRoster | null;
};
