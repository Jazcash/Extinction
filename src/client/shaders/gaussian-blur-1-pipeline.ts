export class GaussianBlur1 extends Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline {
    constructor(game: Phaser.Game) {
        let config = {
            game: game,
            renderer: game.renderer,
            fragShader: `
            precision mediump float;

            uniform sampler2D iChannel0;
            uniform vec2 iResolution;
            uniform vec2 iMouse;

            uniform float Size;

            void main()
            {
                const float Pi = 6.28318530718; // Pi*2
    
                const float Directions = 32.0; // BLUR DIRECTIONS (Default 16.0 - More is better but slower)
                const float Quality = 10.0; // BLUR QUALITY (Default 4.0 - More is better but slower)
               
                vec2 Radius = vec2(Size/iResolution.x, Size/iResolution.y);
                
                // Normalized pixel coordinates (from 0 to 1)
                vec2 uv = gl_FragCoord.xy / iResolution.xy;

                uv.y = 1.0 - uv.y;

                // Pixel colour
                vec4 Color = texture2D(iChannel0, uv);
                
                // Blur calculations
                for( float d=0.0; d<Pi; d+=Pi/Directions)
                {
                    for(float i=1.0/Quality; i<=1.0; i+=1.0/Quality)
                    {
                        Color += texture2D( iChannel0, uv+vec2(cos(d),sin(d))*Radius*i);		
                    }
                }
                
                // Output to screen
                Color /= Quality * Directions - 15.0;
                gl_FragColor =  Color;
            }
            `
        };
        super(config);
    }
}