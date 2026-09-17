// Each `n`th index has the value of this position in Fruit Delivery:
//
// 0
//  \
//   \_______0
//   /   n
//  /
//  \
//   \

import { composeParsers } from "arcsecond"
import { mex } from "../game2/nim"

//    0
const N0_10_20: number[] = [0] // `N0_10_20[0]` is never accessed. we leave it as `0` for engines optimizations

// Each `nth` index has the value of this position in Fruit Delivery:
//
// 0
//  \
//   \_______1
//   /   n
//  /
//  \
//   \
//    0
const N1_10_20: number[] = [0]

/** Assunes `N0_10_20` and `N1_10_20` are filled up to the `n-1`th index. Fills in the `n`th index. */
function computeNext(n: number) {
    n0: {
        const subpositions: number[] = []

        subpositions.push(n - 1)

        for (let k = 0; k < n; k++) {
            if (0 < k && k < n - 1) {
                subpositions.push(N0_10_20[k]! /* lhs */ ^ 1 /* 1----0 with (n-k) segments */)
            }

            subpositions.push(N1_10_20[k]!)
        }

        N0_10_20.push(mex(subpositions))
    }

    n1: {
        const subpositions: number[] = []

        subpositions.push(n - 1)

        for (let k = 0; k < n; k++) {
            if (0 < k) {
                subpositions.push(N0_10_20[k]!)
            }

            if (k < n - 1) {
                subpositions.push(N1_10_20[k]! ^ 1)
            }
        }

        N1_10_20.push(mex(subpositions))
    }
}

for (let i = 1; i <= 100; i++) {
    computeNext(i)
}

console.log(N0_10_20.map((x, i) => `(${i},${x})`).join(", "))
console.log(N1_10_20)
