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

    if (card.end[row] <= roll) return

    if (roll === 12) {
        ret.push(add12(card, row))
    } else {
        ret.push(addCross(card, row, roll))
    }
}

function next1(card: Card, roll: RollCommunal): Card[] {
    const ret: Card[] = []

    const sum = (roll.d1 + roll.d2) as Sum
    check(ret, card, 0, sum)
    check(ret, card, 1, sum)
    check(ret, card, 2, sum)
    check(ret, card, 3, sum)

    return ret
}

function next2(card: Card, { d1, d2 }: RollCommunal, { r, y, g, b }: RollIndividual): Card[] {
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

function next12(card: Card, c: RollCommunal, i: RollIndividual): Card[] {
    const ret: Card[] = []
    ret.push(addPenalty(card))

    for (const n1 of next1(card, c)) {
        for (const n2 of next2(n1, c, i)) {
            ret.push(n2)
        }
    }

    return ret
}
