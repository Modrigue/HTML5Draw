// Pixel functions

// conversion HEX <-> RGB

function pixelHexToRGB(hex, opacity)
{
    var h = hex.replace('#', '');
    h = h.match(new RegExp('(.{'+h.length/3+'})', 'g'));

    for(var i=0; i<h.length; i++)
        h[i] = parseInt((h[i].length == 1) ? h[i]+h[i] : h[i], 16);

    if (typeof opacity != 'undefined')  h.push(opacity);

    //return 'rgba('+h.join(',')+')'; // format: "rgba(r,g,b)"
    return h;
}
  
function pixelRGBToHex(rgb)
{
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
}


// return true if pixel (x,y) of image data <pix> with width <w> has color array [r,g,b]

function pixelHasColor(pix, w, x, y, rgb)
//function pixelHasColor(pix, w, x, y, r, g, b)
{
    var [rB, gB, bB] = pixelGetColor(pix, w, x, y);
    return (rgb[0] == rB && rgb[1] == gB && rgb[2] == bB);
    //return (r == rB && g == gB && b == bB);
}

function pixelHasHexColor(pix, w, x, y, color)
{
    return pixelHasColor(pix, w, x, y, pixelHexToRGB(color));
}

// get color of pixel (x,y) of image data <pix> with width <w>
function pixelGetColor(pix, w, x, y)
{
    return [ pix[4*(x + w*y)], pix[4*(x + w*y)+1], pix[4*(x + w*y)+2] ];
}

// set color array [r,g,b] to pixel (x,y) of image data <pix> with width <w>
//function pixelSetColor(pix, w, x, y, r, g, b)

function pixelSetColor(pix, w, x, y, rgb)
{
    pix[4*(x + w*y)+0] = rgb[0];
    pix[4*(x + w*y)+1] = rgb[1];
    pix[4*(x + w*y)+2] = rgb[2];
}

function pixelSetHexColor(pix, w, x, y, color)
{
    var rgb = pixelHexToRGB(color);
    pixelSetColor(pix, w, x, y, rgb);
}