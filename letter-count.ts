const texts = {
    sample: "hello world",
}

function count(text: string) {
    const ret = Array.from({ length: 26 }, () => 0)

    for (const char of text) {
        if ("A" <= char && char <= "Z") ret[char.charCodeAt(0) - "A".charCodeAt(0)]!++
        if ("a" <= char && char <= "z") ret[char.charCodeAt(0) - "a".charCodeAt(0)]!++
    }

    return ret
}

console.log(
    Object.values(texts)
        .map((x) => {
            const ret = count(x)
            const sum = ret.reduce((a, b) => a + b, 0)
            return ret.map((x) => (x / sum).toFixed(6)).join(",")
        })
        .join(","),
)
