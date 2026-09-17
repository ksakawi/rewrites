import { Matrix } from "./matrix"

const A = Matrix.from`
    0 1 -i
    i 0 -1
    -1 i 1
`

const M = Matrix.joinIntoWider(A, Matrix.id(A.rows))

M.rowSwap(0, 1)
M.rowSolveBelow(0, 0)
M.rowSolveBelow(1, 1)
M.rowSolveBelow(2, 2)
M.nullifyAllRowsAbove(2, 2)

console.log(M.toString())
