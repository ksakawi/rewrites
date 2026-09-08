type Roll = 1 | 2 | 3 | 4 | 5 | 6

function roll(): Roll {
    return Math.floor(6 * Math.random()) as Roll
}

type Sum = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

function sum(a: Roll, b: Roll): Sum {
    return (a + b) as Sum
}

function inv(sum: Sum): Sum {
    return (14 - sum) as Sum
}

interface ByRow<T> {
    r: T
    y: T
    g: T
    b: T
}

function cloneRow<T>(row: ByRow<T>): ByRow<T> {
    return {
        r: row.r,
        y: row.y,
        g: row.g,
        b: row.b,
    }
}

interface Card {
    score: number
    penalties: number // 0..=4
    max: ByRow<1 | Sum>
    crosses: ByRow<number>
}

function cardBlank(): Card {
    return {
        score: 0,
        penalties: 0,
        max: { r: 1, y: 1, g: 1, b: 1 },
        crosses: { r: 0, y: 0, g: 0, b: 0 },
    }
}

type Row = "r" | "y" | "g" | "b"

function strike(card: Card, row: Row, value: Exclude<Sum, 12>): Card {
    const max = cloneRow(card.max)
    const crosses = cloneRow(card.crosses)
    max[row] = value

    return {
        score: card.score + ++crosses[row],
        penalties: card.penalties,
        max,
        crosses,
    }
}

function lock(card: Card, row: Row): Card {
    const max = cloneRow(card.max)
    const crosses = cloneRow(card.crosses)
    max[row] = 12

    return {
        score: card.score + ++crosses[row] + ++crosses[row],
        penalties: card.penalties,
        max,
        crosses,
    }
}

function penalty(card: Card): Card {
    return {
        score: card.score - 5,
        penalties: card.penalties + 1,
        max: card.max,
        crosses: card.crosses,
    }
}

function check(ret: Card[], card: Card, row: Row, sum: Sum) {
    if (row === "g" || row === "b") {
        sum = inv(sum)
    }

    if (sum === 12) {
        if (card.crosses[row] >= 5 && card.max[row] !== 12) {
            ret.push(lock(card, row))
        }
    } else {
        if (sum > card.max[row]) {
            ret.push(strike(card, row, sum))
        }
    }
}

function next1(card: Card, d1: Roll, d2: Roll): Card[] {
    const ret: Card[] = []

    check(ret, card, "r", sum(d1, d2))
    check(ret, card, "y", sum(d1, d2))
    check(ret, card, "g", sum(d1, d2))
    check(ret, card, "b", sum(d1, d2))

    return ret
}

function next2(
    card: Card,
    d1: Roll,
    d2: Roll,
    r: Roll,
    y: Roll,
    g: Roll,
    b: Roll,
): Card[] {
    const ret: Card[] = []

    check(ret, card, "r", sum(d1, r))
    check(ret, card, "r", sum(d2, r))

    check(ret, card, "y", sum(d1, y))
    check(ret, card, "y", sum(d2, y))

    check(ret, card, "g", sum(d1, g))
    check(ret, card, "g", sum(d2, g))

    check(ret, card, "b", sum(d1, b))
    check(ret, card, "b", sum(d2, b))

    return ret
}

interface Game {
    locked: ByRow<boolean>
}

function next12(
    game: Game,
    card: Card,
    d1: Roll,
    d2: Roll,
    r: Roll,
    y: Roll,
    g: Roll,
    b: Roll,
): Card[] {
    const n1 = next1(card, d1, d2)
    const n2: Card[] = []

    for (const el of next1(card, d1, d2)) {
    }
}
