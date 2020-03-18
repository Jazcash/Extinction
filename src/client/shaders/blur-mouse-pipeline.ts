export class BlurMousePipeline extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game: Phaser.Game) {
        const config = {
            game,
            renderer: game.renderer,
            fragShader: `
            precision mediump float;

            uniform sampler2D iChannel0;
            uniform vec2 iResolution;
            uniform vec2 iMouse;

            const int   filterSize    = 15;  // must be odd
            const float textureSize = 512.0;
            
            const int   halfFilterSize = filterSize / 2;
            const float pixelSize = (1.0 / textureSize);
            
            float Gaussian (float x, float sigma)
            {
                return exp(-(x*x) / (2.0 * sigma*sigma));
            }
            
            vec3 BlurredPixel (in vec2 uv)
            {
                float sigma = 5.0 * length(iMouse.xy / iResolution.xy - uv);
                
                float total = 0.0;
                vec3 ret = vec3(0);
                    
                for (int iy = 0; iy < filterSize; iy++)
                {
                    float fy = Gaussian (float(iy) - float(halfFilterSize), sigma);
                    float offsety = float(iy-halfFilterSize) * pixelSize;
                    
                    for (int ix = 0; ix < filterSize; ix++)
                    {
                        float fx = Gaussian (float(ix) - float(halfFilterSize), sigma);
                        float offsetx = float(ix-halfFilterSize) * pixelSize;
                        
                        float f = fx*fy;
                        total += f;
                        ret += texture2D(iChannel0, uv + vec2(offsetx, offsety)).rgb * f;
                    }
                }
                return ret / total;
            }

            void main(void) {
                vec2 uv = gl_FragCoord.xy / iResolution.xy;

                uv.y = 1.0 - uv.y;

	            gl_FragColor = vec4(BlurredPixel(uv), 1.0);
            }
            `
        };
        super(config);
    }
}