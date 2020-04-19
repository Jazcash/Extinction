export namespace Utils {
    export function loadFont(fontName: string, weights?: number[]){
        const fontFace = document.createElement("style");

        if (weights){
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
        } else {
            fontFace.innerHTML += `@font-face{
                font-family: "${fontName}";
                src: url("fonts/${fontName}.ttf") format("truetype");
                src: url("fonts/${fontName}.woff") format("woff");
            }`;

            const fontEl = document.createElement("div");
            fontEl.className = "font-loader";
            fontEl.style.fontFamily = fontName;
            fontEl.innerHTML = fontName;

            document.body.append(fontEl);
        }

        document.body.append(fontFace);
    }

    // https://stackoverflow.com/a/40294058/1864403
    export function deepClone(obj: any, hash = new WeakMap()): any{
        if (Object(obj) !== obj) {return obj;} // primitives
        if (hash.has(obj)) {return hash.get(obj);} // cyclic reference
        const result = obj instanceof Set ? new Set(obj) // See note about this!
            : obj instanceof Map ? new Map(Array.from(obj, ([key, val]) =>
                [key, deepClone(val, hash)]))
                : obj instanceof Date ? new Date(obj)
                    : obj instanceof RegExp ? new RegExp(obj.source, obj.flags)
                    // ... add here any specific treatment for other classes ...
                    // and finally a catch-all:
                        : obj.constructor ? new obj.constructor()
                            : Object.create(null);
        hash.set(obj, result);
        return Object.assign(result, ...Object.keys(obj).map(
            key => ({ [key]: deepClone(obj[key], hash) }) ));
    }

    export function delay(scene: Phaser.Scene, ms: number) : Promise<void>{
        return new Promise(resolve => {
            scene.time.delayedCall(ms, () => resolve());
        });
    }

    export function asArray<T>(target: T | T[]): T[] {
        if (Array.isArray(target)) {
            return target;
        } else {
            return [target];
        }
    }

    export function tween(scene: Phaser.Scene, config: Phaser.Types.Tweens.TweenBuilderConfig | object) : Promise<Phaser.Tweens.Tween> {
        return new Promise(resolve => {
            const tween = scene.tweens.add(config);
            tween.on("complete", () => resolve(tween));
        });
    }

    export function tweenCounter(scene: Phaser.Scene, config: Phaser.Types.Tweens.NumberTweenBuilderConfig | object) : Promise<Phaser.Tweens.Tween> {
        return new Promise(resolve => {
            const tween = scene.tweens.addCounter(config);
            tween.on("complete", () => resolve(tween));
        });
    }
}