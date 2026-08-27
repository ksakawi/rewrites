import { Matrix } from "./matrix"

const M = Matrix.from`
     1 2  0 -3
    -1 2  1 -6
    -2 0 -3  1
`

console.log(M.toString())

console.log(M.rowNullify(0, 0, 1))
console.log(M.toString())

console.log(M.rowNullify(0, 0, 2))
console.log(M.toString())

console.log(M.rowNullify(1, 1, 2))
console.log(M.toString())

console.log(M.rowNullify(2, 2, 1))
console.log(M.toString())

console.log(M.rowNullify(1, 1, 0))
console.log(M.toString())

// console.log(M.toString())
