const adapter = (await navigator.gpu.requestAdapter())!

const device = await adapter.requestDevice()

const shader = device.createShaderModule({
    code: `
        struct VertexOut {
            @builtin(position) position: vec4f,
            @location(0) color: vec4f,
        }

        @vertex
        fn vertex_main(@location(0) position: vec4f, @location(1) color: vec4f) -> VertexOut {
            var output: VertexOut;
            output.position = position;
            output.color = color;
            return output;
        }

        @fragment
        fn fragment_main(fragData: VertexOut) -> @location(0) vec4f {
            return fragData.color;
        }
    `,
})

const cv = document.createElement("canvas")
const ctx = cv.getContext("webgpu") as GPUCanvasContext

ctx.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
})

device.createRenderPipeline({
    layout: "auto",
    vertex: { module: shader, buffers: [{ arrayStride: 4, attributes: [] }] },
    fragment: {
        module: shader,
        targets: [
            {
                format: navigator.gpu.getPreferredCanvasFormat(),
            },
        ],
    },
})

device.onuncapturederror = (ev) => {
    throw new Error(ev.error.message)
}
