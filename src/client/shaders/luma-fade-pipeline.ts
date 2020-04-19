export class LumaFadePipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game: Phaser.Game) {
        const config = {
            game,
            renderer: game.renderer,
            fragShader: `
                precision mediump float;

                #define MASK_INTENSITY 	10. // the higher, brighter areas appear faster

                uniform sampler2D uMainSampler;
                uniform vec2 iResolution;
                varying vec2 outTexCoord;

                const vec4 colorClear = vec4(0., 0., 0., 0.);
                const vec4 colorBlack = vec4(0., 0., 0., 1.);

                uniform float amount;

                void main()
                {
                    vec2 uv = gl_FragCoord.xy / iResolution.xy;
                    uv.y = 1.0 - uv.y;
                    
                    vec4 color = texture2D(uMainSampler, uv);

                    float brightness = length(mix(color, colorClear, amount));
                    float alphaFactor = pow(brightness, MASK_INTENSITY);
                    
                    gl_FragColor = vec4( color.rgb * clamp( alphaFactor, 0., 1. ), 1. );
                }
            `
        };
        super(config);
    }
}