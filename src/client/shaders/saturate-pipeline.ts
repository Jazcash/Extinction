export class SaturatePipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game: Phaser.Game) {
        const config = {
            game,
            renderer: game.renderer,
            fragShader: `
                precision mediump float;

                uniform sampler2D uMainSampler;
                uniform vec2 iResolution;
                varying vec2 outTexCoord;

                uniform float saturation;

                mat4 saturationMatrix( float saturation )
                {
                    vec3 luminance = vec3( 0.3086, 0.6094, 0.0820 );
                    
                    float oneMinusSat = 1.0 - saturation;
                    
                    vec3 red = vec3( luminance.x * oneMinusSat );
                    red+= vec3( saturation, 0, 0 );
                    
                    vec3 green = vec3( luminance.y * oneMinusSat );
                    green += vec3( 0, saturation, 0 );
                    
                    vec3 blue = vec3( luminance.z * oneMinusSat );
                    blue += vec3( 0, 0, saturation );
                    
                    return mat4( red,     0,
                                green,   0,
                                blue,    0,
                                0, 0, 0, 1 );
                }

                void main()
                {
                    vec2 uv = gl_FragCoord.xy / iResolution.xy;
                    uv.y = 1.0 - uv.y;
                    vec4 color = texture2D(uMainSampler, uv);
                    
                    gl_FragColor = saturationMatrix(saturation) * color;
                }
            `
        };
        super(config);
    }
}