/**
 * Finds a root of the given function, assuming...
 *
 * - its limit is positive infinity as x goes to some infinity
 * - its limit is negative infinity as x goes to the other infinity
 * - it is continuous
 */
export function solve(precision: number, f: (x: number) => number): number {
    // Establish boundaries for the search.

    let xmax = 1
    let fmin!: number
    let fmax!: number
    for (let i = 0; i < 999; i++) {
        fmin = f(-xmax)
        fmax = f(xmax)
        if (Math.sign(fmin) !== Math.sign(fmax)) break
        xmax *= 2
    }
    let xmin = -xmax

    if (fmin === 0) return -xmax
    if (fmax === 0) return xmax
    if (Math.sign(fmin) === Math.sign(fmax)) return NaN

    while (xmax - xmin > precision) {
        const xmid = (xmin + xmax) / 2
        const fmid = f(xmid)
        if (fmid === 0) return xmid

        if (Math.sign(fmid) === Math.sign(fmin)) {
            xmin = xmid
            fmin = fmid
        } else {
            xmax = xmid
            fmax = fmid
        }
    }

    return (xmin + xmax) / 2
}
