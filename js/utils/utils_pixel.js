// Pixel functions
// conversion HEX <-> RGB
export function pixelHexToRGB(hexColorStr, opacity = -1) {
    const hexValuesStr = hexColorStr.replace('#', '');
    const rValueStr = hexValuesStr.substring(0, 2);
    const gValueStr = hexValuesStr.substring(2, 4);
    const bValueStr = hexValuesStr.substring(4, 6);
    const r = parseInt(rValueStr, 16);
    const g = parseInt(gValueStr, 16);
    const b = parseInt(bValueStr, 16);
    // to refactor
    //let rgb: Array<number> = hexValuesStr.match(new RegExp('(.{'+hexValuesStr.length/3+'})', 'g'));
    /*for(var i=0; i<rgb.length; i++)
        rgb[i] = parseInt((rgb[i].length == 1) ? rgb[i]+rgb[i] : rgb[i], 16);
    if (typeof opacity != 'undefined')  rgb.push(opacity);*/
    return [r, g, b];
}
export function pixelRGBToHex(rgb) {
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
}
// returns true if pixel (x,y) of image data <pix> with width <w> has color array [r,g,b]
export function pixelHasColor(pix, w, x, y, rgb) {
    const [rB, gB, bB] = pixelGetColor(pix, w, x, y);
    return (rgb[0] == rB && rgb[1] == gB && rgb[2] == bB);
}
// returns true if pixel (x,y) of image data <pix> with width <w> has hex color string
export function pixelHasHexColor(pix, w, x, y, hexColorStr) {
    return pixelHasColor(pix, w, x, y, pixelHexToRGB(hexColorStr));
}
// get color of pixel (x,y) of image data <pix> with width <w>
export function pixelGetColor(pix, w, x, y) {
    return [pix[4 * (x + w * y)], pix[4 * (x + w * y) + 1], pix[4 * (x + w * y) + 2]];
}
// set color array [r,g,b] to pixel (x,y) of image data <pix> with width <w>
export function pixelSetColor(pix, w, x, y, rgb) {
    pix[4 * (x + w * y) + 0] = rgb[0];
    pix[4 * (x + w * y) + 1] = rgb[1];
    pix[4 * (x + w * y) + 2] = rgb[2];
}
export function pixelSetHexColor(pix, w, x, y, colorStr) {
    const rgb = pixelHexToRGB(colorStr, -1);
    pixelSetColor(pix, w, x, y, rgb);
}
// // from https://mstn.github.io/2018/06/08/fixed-size-arrays-in-typescript/
// type FixedSizeArray<T, N extends number> = N extends 0 ? never[] :
// {
//     0: T;
//     length: N;
// } & ReadonlyArray<T>;
//# sourceMappingURL=utils_pixel.js.map