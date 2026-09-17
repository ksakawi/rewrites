import { Matrix } from "./matrix"

const A = Matrix.from`
    1 4 -1
    2 7 -2
    -1 -5 2
`

const M = Matrix.joinIntoWider(A, Matrix.id(A.rows))

M.rowSolveBelow(0, 0)
M.rowSolveBelow(1, 1)
M.nullifyAllRowsAbove(1, 1)
M.nullifyAllRowsAbove(2, 2)

console.log(M.sliceCols(3, 6).toString())
