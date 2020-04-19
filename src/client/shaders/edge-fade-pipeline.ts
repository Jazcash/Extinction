export class EdgeFadePipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game: Phaser.Game) {
        const config = {
            game,
            renderer: game.renderer,
            fragShader: `
                precision mediump float;

                #define EDGE .2

                uniform sampler2D uMainSampler;
                uniform vec2 iResolution;
                varying vec2 outTexCoord;

                uniform float amount;

                void main()
                {
                    vec2 uv = gl_FragCoord.xy / iResolution.xy;
                    uv.y = 1.0 - uv.y;
                    
                    float edge = EDGE * abs(amount / 5.);
                    
                    vec4 color = texture2D(uMainSampler, uv);

                    color *= (smoothstep(0., edge, uv.x)) * (1. - smoothstep(1. - edge, 1., uv.x));
                    color *= (smoothstep(0., edge, uv.y)) * (1. - smoothstep(1. - edge, 1., uv.y));
                    
                    gl_FragColor = color;
                }
            `
        };
        super(config);
    }
}