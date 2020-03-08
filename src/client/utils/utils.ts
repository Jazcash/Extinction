export namespace Utils {
    export function loadFont(fontName: string, weights: number[]){
        const fontFace = document.createElement("style");

        for (const weight of weights){
            fontFace.innerHTML += `@font-face{
                font-family: "${fontName}";
                src: url("fonts/${fontName}-${weight}.ttf") format("truetype");
                src: url("fonts/${fontName}-${weight}.woff") format("woff");
                font-weight: ${weight}
            }`;

            const fontEl = document.createElement("div");
            fontEl.className = "font-loader";
            fontEl.style.fontFamily = fontName;
            fontEl.style.fontWeight = `${weight}`;
            fontEl.innerHTML = fontName;

            document.body.append(fontEl);
        }

        document.body.append(fontFace);
    }
}