export enum ClassName {
    Druid,
    Hunter,
    Mage,
    Paladin,
    Priest,
    Rogue,
    //    Shaman,
    Warlock,
    Warrior,
}

export enum SpecName {
    boomie = "boomie",
    feral = "feral",
    resto = "resto",
    flexDruid = "flexDruid",
    meleeHunter = "meleeHunter",
    rangedHunter = "rangedHunter",
    frostMage = "frostMage",
    fireMage = "fireMage",
    arcaneMage = "arcaneMage",
    flexMage = "flexMage",
    holyPal = "holyPal",
    retPal = "retPal",
    tankPal = "tankPal",
    healPriest = "healPriest",
    shadow = "shadow",
    tankRogue = "tankRogue",
    dpsRogue = "dpsRogue",
    //    restoShaman = "restoShaman",
    //    dpsShaman = "dpsShaman",
    //    tankShaman = "tankShaman",
    tankWarlock = "tankWarlock",
    dpsWarlock = "dpsWarlock",
    tankWarrior = "tankWarrior",
    dpsWarrior = "dpsWarrior",
}

export type ClassSpec = {
    id: SpecName;
    className: ClassName;
    humanLabel: string;
    canTank?: boolean;
    canTankHeal?: boolean;
    canRaidHeal?: boolean;
    canMeleeDPS?: boolean;
    canRangedDPS?: boolean;
    canBombs?: boolean;
    canBombsNonIdeal?: boolean;
    canKick?: boolean;
    canOffheal?: boolean;
    canCleanseDisease?: boolean;
    canCleanseMagic?: boolean;
    canResistAura?: boolean;
    canMajorArmorDebuff?: boolean;
    healOrRanged?: { heal: SpecName; ranged: SpecName };
};
