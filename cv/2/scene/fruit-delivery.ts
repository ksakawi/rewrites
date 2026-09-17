import { Game, type Fruit } from "../2d-object/fruit-delivery"
import { Canvas2 } from "../2d/canvas"

const cv = new Canvas2({ sx: 20, sy: 20, tx: 0, ty: 0 })
cv.pushFn(() => {
    cv.ctx.fillStyle = "#e2e8f0"
    cv.ctx.fillRect(0, 0, cv.width, cv.height)
})
document.body.appendChild(cv.el)

for (let i = 0; i <= 4; i++) {
    new Game()
        .push(-10, -2 * i)
        .set(false)
        .line(i, i === 1 ? 0 : -30)
        .set(false)
        .game.addTo(cv)
}

for (let i = 1; i <= 4; i++) {
    new Game()
        .push(-3, -2 * i)
        .set(false)
        .line(i, i === 1 ? 0 : -30)
        .set(true)
        .game.addTo(cv)
}

const x = (x: number, y: number, i: number, f: Fruit) => {
    const g = new Game().push(x, y).n12(4).game
    g.addTo(cv)
    g.nodes[i]!.fruit = f
}

for (let i = 1; i <= 7; i++) {
    new Game()
        .push(2, 12 - 3 * i)
        .n12(i)
        .game.addTo(cv)
}

x(10, 9, 0, true)
x(10, 6, 1, true)
x(10, 3, 1, false)
x(10, 0, 2, false)
x(10, -3, 2, true)
x(10, -6, 3, true)
x(10, -9, 5, true)

new Game().push(-10, 3).loop(3).game.addTo(cv)
new Game().push(-8, 3).loop(4).game.addTo(cv)
new Game().push(-5.5, 3).loop(5).game.addTo(cv)
