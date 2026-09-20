export class Style {
    constructor(
        readonly color: string,
        text: "left" | "right",
    ) {
        this.textAlign = text === "left" ? "right" : "left"
        this.textOffset = text === "left" ? -8 : 8
    }

    readonly textAlign: CanvasTextAlign
    readonly textOffset: number
    readonly lineWidth = 2
    readonly tickRadius = 4
}
