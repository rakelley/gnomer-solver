/**
 * gets random array element
 *
 * @template T
 * @param {T[]} source
 * @return {T}
 */
export function getRandomElement<T>(source: T[]): T {
    if (source.length === 0) {
        throw new Error("Unexpected list underflow");
    }

    return source[Math.floor(source.length * Math.random())];
}

/**
 * Removes all instances of an array member from an array
 *
 * @template T
 * @param {T[]} source
 * @param {T} toRemove
 * @param {(current: T, toRemove: T) => boolean} comparison identity comparison function
 * @return {T[]}
 */
export function removeFromArray<T>(
    source: T[],
    toRemove: T,
    comparison: (current: T, toRemove: T) => boolean = (current, toRemove) => current === toRemove,
): T[] {
    const filtered: T[] = [];
    for (let i = 0, max = source.length; i < max; ++i) {
        if (!comparison(source[i], toRemove)) {
            filtered.push(source[i]);
        }
    }

    return filtered;
}

/**
 * Shuffles an array randomly
 *
 * @template T
 * @param {T[]} source
 * @return {T[]}
 */
export function shuffleArray<T>(source: T[]): T[] {
    return source
        .map((member) => ({ member, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ member }) => member);
}
