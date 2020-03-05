export class GaussianBlur2 extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game: Phaser.Game) {
        let config = {
            game: game,
            renderer: game.renderer,
            fragShader: `
            precision mediump float;

            uniform sampler2D iChannel0;
            uniform vec2 iResolution;
            uniform vec2 iMouse;

            vec4 texture(sampler2D s, vec2 c) {
                return texture2D(s, c);
            }

            float SCurve (float x) {
                x = x * 2.0 - 1.0;
                return -x * abs(x) * 0.5 + x + 0.5;
            }

            vec4 BlurH (sampler2D source, vec2 size, vec2 uv, float radius) {
                if (radius >= 1.0)
                {
                    vec4 A = vec4(0.0); 
                    vec4 C = vec4(0.0); 
            
                    float width = 1.0 / size.x;
            
                    float divisor = 0.0; 
                    float weight = 0.0;
                    
                    float radiusMultiplier = 1.0 / radius;
                    
                    // Hardcoded for radius 20 (normally we input the radius
                    // in there), needs to be literal here
                    
                    for (float x = -20.0; x <= 20.0; x++)
                    {
                        A = texture(source, uv + vec2(x * width, 0.0));
                        
                            weight = SCurve(1.0 - (abs(x) * radiusMultiplier)); 
                        
                            C += A * weight; 
                        
                        divisor += weight; 
                    }
            
                    return vec4(C.r / divisor, C.g / divisor, C.b / divisor, 1.0);
                }
            
                return texture(source, uv);
            }

            void main(){
                vec2 uv = gl_FragCoord.xy / iResolution.xy;

                uv.y = 1.0 - uv.y;
    
                // Apply horizontal blur to final output
                gl_FragColor = BlurH(iChannel0, iResolution.xy, uv, 20.0);
            }
            `
        };
        super(config);
    }
}