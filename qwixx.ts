import { randomItem } from "./random-item"

type Roll = 1 | 2 | 3 | 4 | 5 | 6
type Sum = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type RowIndex = 0 | 1 | 2 | 3

type ByRow<T> = [r: T, y: T, g: T, b: T]

/**
 * Representation of a card.
 *
 * We normalize rolls, so that the green and blue rows actually run from 2-12, just like red and
 * yellow. We take care to invert dice rolls to preserve how RY and GB work opposite with respect to
 * dice rolls.
 */
interface Card {
    /** Position of the last cross in each row. If no cross is written yet, `1`. */
    end: ByRow<1 | Sum>

    /** How many crosses a row has. */
    crosses: ByRow<number>

    /** How many penalties the card has taken. */
    penalties: number

    /** The total score of the card. */
    score: number
}

interface RollCommunal {
    d1: Roll
    d2: Roll
}

interface RollIndividual {
    r: Roll
    y: Roll
    g: Roll
    b: Roll
}

function addCross(card: Card, row: RowIndex, roll: Exclude<Sum, 12>): Card {
    const end: ByRow<1 | Sum> = [...card.end]
    const crosses: ByRow<number> = [...card.crosses]
    end[row] = roll
    crosses[row]++

    return {
        end,
        crosses,
        penalties: card.penalties,
        score: card.score + crosses[row],
    }
}

function add12(card: Card, row: RowIndex): Card {
    const end: ByRow<1 | Sum> = [...card.end]
    const crosses: ByRow<number> = [...card.crosses]
    end[row] = 12
    crosses[row] += 2

    return {
        end,
        crosses,
        penalties: card.penalties,
        score: card.score + 2 * crosses[row] - 1,
    }
}

function addPenalty(card: Card): Card {
    return {
        end: card.end,
        crosses: card.crosses,
        penalties: card.penalties + 1,
        score: card.score - 5,
    }
}

function isDone(card: Card): boolean {
    return card.end.includes(12) || card.penalties === 4
}

function check(ret: Card[], card: Card, row: RowIndex, roll: Sum) {
    if (row === 2 || row === 3) {
        roll = 14 - roll
    }

    if (card.end[row] >= roll) return

    if (roll === 12) {
        ret.push(add12(card, row))
    } else {
        ret.push(addCross(card, row, roll))
    }
}

function next1(card: Card, d1: Roll, d2: Roll): Card[] {
    const ret: Card[] = []

    const sum = (d1 + d2) as Sum
    check(ret, card, 0, sum)
    check(ret, card, 1, sum)
    check(ret, card, 2, sum)
    check(ret, card, 3, sum)

    return ret
}

function next2(card: Card, d1: Roll, d2: Roll, r: Roll, y: Roll, g: Roll, b: Roll): Card[] {
    const ret: Card[] = []

    check(ret, card, 0, (d1 + r) as Sum)
    check(ret, card, 0, (d2 + r) as Sum)
    check(ret, card, 1, (d1 + y) as Sum)
    check(ret, card, 1, (d2 + y) as Sum)
    check(ret, card, 2, (d1 + g) as Sum)
    check(ret, card, 2, (d2 + g) as Sum)
    check(ret, card, 3, (d1 + b) as Sum)
    check(ret, card, 3, (d2 + b) as Sum)

    return ret
}

function next12(card: Card, d1: Roll, d2: Roll, r: Roll, y: Roll, g: Roll, b: Roll): Card[] {
    const ret: Card[] = []
    ret.push(addPenalty(card))

    for (const n1 of next1(card, d1, d2)) {
        for (const n2 of next2(n1, d1, d2, r, y, g, b)) {
            ret.push(n2)
        }
    }

    return ret
}

const ROLL: Roll[] = [1, 2, 3, 4, 5, 6]

const RC: RollCommunal[] = ROLL.flatMap((d1) => ROLL.map((d2) => ({ d1, d2 })))
const RI: RollIndividual[] = ROLL.flatMap((r) =>
    ROLL.flatMap((y) => ROLL.flatMap((g) => ROLL.flatMap((b) => ({ r, y, g, b })))),
)

interface ExecResult {
    optimal: Card
    expectedScore: number
}

function exec(
    card: Card,
    depth: number,
    d1: Roll,
    d2: Roll,
    r: Roll,
    y: Roll,
    g: Roll,
    b: Roll,
): ExecResult {
    if (isDone(card)) {
        return { optimal: card, expectedScore: card.score }
    }

    if (depth === 0) {
        const optimal = next12(card, d1, d2, r, y, g, b).reduce((a, b) =>
            a.score > b.score ? a : b,
        )
        return { optimal, expectedScore: optimal.score }
    }

    return next12(card, d1, d2, r, y, g, b)
        .map<ExecResult>((el) => expectedScore(el, depth - 1))
        .reduce((a, b) => (a.expectedScore > b.expectedScore ? a : b))
}

type CacheKey = string & { __cache_key?: never }

function cacheKey(el: Card): CacheKey {
    return el.crosses.join() + "," + el.end.join(",") + "," + el.penalties
}

const CACHE: Map<CacheKey, ExecResult>[] = [
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
    new Map(),
]

function expectedScore(el: Card, depth: number): ExecResult {
    const ckey = cacheKey(el)

    if (CACHE[depth]!.has(ckey)) return CACHE[depth]!.get(ckey)!

    let totalScore = 0
    let positions = 0

    for (let d1 = 1; d1 <= 6; d1++)
        for (let d2 = 1; d2 <= 6; d2++)
            for (let r = 1; r <= 6; r++)
                for (let y = 1; y <= 6; y++)
                    for (let g = 1; g <= 6; g++)
                        for (let b = 1; b <= 6; b++) {
                            positions++
                            const next = exec(el, depth, d1, d2, r, y, g, b)
                            totalScore += next.expectedScore
                        }

    const ret: ExecResult = { optimal: el, expectedScore: totalScore / positions }
    CACHE[depth]!.set(ckey, ret)
    return ret
}

const BLANK: Card = {
    end: [1, 1, 1, 1],
    crosses: [0, 0, 0, 0],
    penalties: 0,
    score: 0,
}

const c = randomItem(RC)!
const r = randomItem(RI)!

const best = exec(BLANK, 2, c.d1, c.d2, r.r, r.y, r.g, r.b)
console.log({ c, r, ...best })
