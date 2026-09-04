function check() {
    return Array.from({ length: 57 }, () =>
        Math.floor(365 * Math.random()),
    ).some((x, i, a) => a.slice(0, i).includes(x))
}

function many() {
    let count = 0
    let total = 0

    for (let i = 0; i < 1e6; i++) {
        count++
        total += +check()
    }

    return total / count
}

console.log(many())
