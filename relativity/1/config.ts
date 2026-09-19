export class Config {
    constructor(
        readonly color: string,
        readonly textAlign: "left" | "right",
    ) {
        this.textOffset = this.textAlign === "left" ? 8 : -8
    }

    readonly textOffset: number
}
