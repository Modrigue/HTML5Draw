// Image functions
import * as PixelFunctions from "./utils_pixel.js";
import * as MathFunctions from "./utils_math.js";
// invert image (negative)
export function imgInvert(context_img, canvas_img) {
    // get the CanvasPixelArray from the given coordinates and dimensions.
    var imgd = context_img.getImageData(0, 0, canvas_img.width, canvas_img.height);
    var pix = imgd.data;
    //alert(pix.length);
    // loop over each pixel and invert the color
    for (let i = 0, n = pix.length; i < n; i += 4) {
        pix[i] = 255 - pix[i]; // red
        pix[i + 1] = 255 - pix[i + 1]; // green
        pix[i + 2] = 255 - pix[i + 2]; // blue
        // i+3 is alpha (the fourth element)
    }
    // draw the ImageData at the given (x,y) coordinates
    context_img.putImageData(imgd, 0, 0);
}
// 4-connexity fill algorithm
export function imgFill4(context_img, canvas_img, x0, y0, forecolorStr) {
    // get fill color
    const rgbFill = PixelFunctions.pixelHexToRGB(forecolorStr);
    let imgd = context_img.getImageData(0, 0, canvas_img.width, canvas_img.height);
    let pix = imgd.data;
    let pixelsToFill = new Array();
    const w = canvas_img.width;
    const h = canvas_img.height;
    // get base color from pixel
    var rgbBase = PixelFunctions.pixelGetColor(pix, w, x0, y0);
    // nop if base color = fill color
    if (rgbBase[0] == rgbFill[0] && rgbBase[1] == rgbFill[1] && rgbBase[2] == rgbFill[2])
        return;
    pixelsToFill.push([x0, y0]);
    while (pixelsToFill.length > 0) {
        let xy = pixelsToFill.pop();
        if (typeof xy === 'undefined')
            break;
        let x = xy[0];
        let y = xy[1];
        if (PixelFunctions.pixelHasColor(pix, w, x, y, rgbBase)) {
            // list all east to west pixels to fill
            let xW = x;
            while (xW >= 0 && PixelFunctions.pixelHasColor(pix, w, xW, y, rgbBase))
                xW--;
            let xE = x;
            while (xE < w && PixelFunctions.pixelHasColor(pix, w, xE, y, rgbBase))
                xE++;
            // fill found east and west pixels and check north and south pixels
            for (let xCur = xW; xCur <= xE; xCur++) {
                // fill
                PixelFunctions.pixelSetColor(pix, w, xCur, y, rgbFill);
                // check if north pixel must be processed
                let yN = y - 1;
                if (yN >= 0)
                    if (PixelFunctions.pixelHasColor(pix, w, xCur, yN, rgbBase))
                        pixelsToFill.push([xCur, yN]);
                // check if south pixel must be processed
                let yS = y + 1;
                if (yS < h)
                    if (PixelFunctions.pixelHasColor(pix, w, xCur, yS, rgbBase))
                        pixelsToFill.push([xCur, yS]);
            }
        }
    }
    context_img.putImageData(imgd, 0, 0);
}
// draw line with no aliasing
export function drawLineNoAliasing(ctx, sx, sy, tx, ty) {
    const dist = MathFunctions.distance(sx, sy, tx, ty); // length of line
    const angle = MathFunctions.getAngle(tx - sx, ty - sy); // angle of line
    for (var i = 0; i < dist; i++) {
        // for each point along the line
        ctx.fillRect(Math.round(sx + Math.cos(angle) * i), // round for perfect pixels
        Math.round(sy + Math.sin(angle) * i), // thus no aliasing
        1, 1); // fill in one pixel, 1x1
    }
}
//# sourceMappingURL=utils_image.js.map