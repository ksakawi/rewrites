import { Game } from "../2d-object/fruit-delivery"
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

new Game().push(5, 0).n12(1).game.addTo(cv)
new Game().push(5, -3).n12(2).game.addTo(cv)
new Game().push(5, -6).n12(3).game.addTo(cv)
new Game().push(5, -9).n12(4).game.addTo(cv)

new Game().push(-10, 3).loop(3).game.addTo(cv)
new Game().push(-8, 3).loop(4).game.addTo(cv)
new Game().push(-5.5, 3).loop(5).game.addTo(cv)
