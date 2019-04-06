// Image functions

// invert image (negative)
function imgInvert(context_img, canvas_img)
{
    // get the CanvasPixelArray from the given coordinates and dimensions.
    var imgd = context_img.getImageData(0, 0, canvas_img.width, canvas_img.height);
    var pix = imgd.data;
    //alert(pix.length);

    // loop over each pixel and invert the color
    for (var i = 0, n = pix.length; i < n; i += 4) {
        pix[i  ] = 255 - pix[i  ]; // red
        pix[i+1] = 255 - pix[i+1]; // green
        pix[i+2] = 255 - pix[i+2]; // blue
        // i+3 is alpha (the fourth element)
    }

    // draw the ImageData at the given (x,y) coordinates
    context_img.putImageData(imgd, 0, 0);
}

// 4-connexity fill algorithm
function imgFill4(context_img, canvas_img, x0, y0, forecolor)
{
    // get fill color
    var rgbFill = pixelHexToRGB(forecolor);
    //alert("fill color = " + rF + ", " + gF + ", " + bF);

    var imgd = context_img.getImageData(0, 0, canvas_img.width, canvas_img.height);
    var pix = imgd.data;
    
    var pixelsToFill = new Array();
    var w = canvas_img.width;
    var h = canvas_img.height;
    
    // get base color from pixel
    var rgbBase = pixelGetColor(pix, w, x0, y0);
    //alert("base color = " + rB + ", " + gB + ", " + bB);
    
    // nop if base color = fill color
    if (rgbBase[0] == rgbFill[0] && rgbBase[1] == rgbFill[1] && rgbBase[2] == rgbFill[2])
    return;
  
    pixelsToFill.push([x0, y0]);
    while (pixelsToFill.length > 0)
    {
        [x, y] = pixelsToFill.pop();
        if (pixelHasColor(pix, w, x, y, rgbBase))
        {
            // list all east to west pixels to fill
            
            xW = x;
            while (xW >= 0 && pixelHasColor(pix, w, xW, y, rgbBase))
                xW--;
            
            xE = x;	
            while (xE < w && pixelHasColor(pix, w, xE, y, rgbBase))
                xE++;
            
            // fill found east and west pixels and check north and south pixels
            for (var xCur = xW; xCur <= xE; xCur++)
            {
                // fill
                pixelSetColor(pix, w, xCur, y, rgbFill);
                                
                // check if north pixel must be processed
                yN = y-1;
                if (yN >= 0)
                        if (pixelHasColor(pix, w, xCur, yN, rgbBase))
                    pixelsToFill.push([xCur, yN]);
                    
                // check if south pixel must be processed
                yS = y+1;
                    if (yS < h)
                if (pixelHasColor(pix, w, xCur, yS, rgbBase))
                    pixelsToFill.push([xCur, yS]);
            }
        }
    }
  
    context_img.putImageData(imgd, 0, 0);
}


// draw line with no aliasing
function drawLineNoAliasing(ctx, sx, sy, tx, ty)
{
    var dist = distance(sx, sy, tx, ty); // length of line
    var angle = getAngle(tx - sx, ty - sy); // angle of line

    for(var i = 0; i < dist; i++)
    {
        // for each point along the line
        ctx.fillRect(Math.round(sx + Math.cos(angle)*i), // round for perfect pixels
                     Math.round(sy + Math.sin(angle)*i), // thus no aliasing
                     1,1); // fill in one pixel, 1x1
    }
}