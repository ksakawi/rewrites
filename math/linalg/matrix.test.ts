import { Matrix } from "./matrix"

const A = Matrix.from`
    1 -2 1 1
    2 -3 3 0
    3 -7 2 4
    0 2  1 1
`

const M = Matrix.joinIntoWider(A, Matrix.id(4))

M.nullifyAllRowsBelow(0, 0)
M.nullifyAllRowsBelow(1, 1)
M.rowSwap(2, 3)
M.rowScaleTo1(2, 2)
M.rowScaleTo1(3, 3)
M.nullifyAllRowsAbove(3, 3)
M.nullifyAllRowsAbove(2, 2)
M.nullifyAllRowsAbove(1, 1)

console.log(M.toString())
const X = M.sliceCols(4, 8)
console.log(A.mul(X).toString())

// console.log(M.toString())
