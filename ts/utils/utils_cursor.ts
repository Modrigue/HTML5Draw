// Cursor functions


// normal cursor
function cursorDraw(context_draw: CanvasRenderingContext2D, canvas_draw: HTMLCanvasElement, xCurr: number, yCurr: number, forecolor: string, cursorSize: number, symmetry: string, isStroke: boolean = false)
{
    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

    context_draw.strokeStyle = forecolor;
    let symcolor = '#aaaaaa';
    
    // current position
    if (cursorSize == 0 && !isStroke) // specific cursor if hover at size 0
    {
        context_draw.beginPath();
        context_draw.moveTo(xCurr + 1, yCurr); context_draw.lineTo(xCurr + 10, yCurr); context_draw.stroke();
        context_draw.moveTo(xCurr - 1, yCurr); context_draw.lineTo(xCurr - 10, yCurr); context_draw.stroke();
        context_draw.moveTo(xCurr, yCurr + 1); context_draw.lineTo(xCurr, yCurr + 10); context_draw.stroke();
        context_draw.moveTo(xCurr, yCurr - 1); context_draw.lineTo(xCurr, yCurr - 10); context_draw.stroke();
    }
    else
    {
        context_draw.beginPath();
        context_draw.moveTo(xCurr - cursorSize/2, yCurr - cursorSize/2);
        context_draw.lineTo(xCurr + cursorSize/2, yCurr + cursorSize/2);
        if (cursorSize == 0)
            context_draw.fillRect(xCurr, yCurr, 1, 1);	
        context_draw.stroke();
        context_draw.closePath();
    }
    
    // draw x symmetric
    if (symmetry == "vertical"
     || symmetry == "horizontal_vertical")
    {
        if (!isStroke)
            context_draw.strokeStyle = symcolor;
            
        if (cursorSize == 0 && !isStroke) // specific cursor if hover at size 0
        {
            context_draw.beginPath();
            context_draw.moveTo(canvas_draw.width - xCurr + 1, yCurr); context_draw.lineTo(canvas_draw.width - xCurr + 10, yCurr); context_draw.stroke();
            context_draw.moveTo(canvas_draw.width - xCurr - 1, yCurr); context_draw.lineTo(canvas_draw.width - xCurr - 10, yCurr); context_draw.stroke();
            context_draw.moveTo(canvas_draw.width - xCurr, yCurr + 1); context_draw.lineTo(canvas_draw.width - xCurr, yCurr + 10); context_draw.stroke();
            context_draw.moveTo(canvas_draw.width - xCurr, yCurr - 1); context_draw.lineTo(canvas_draw.width - xCurr, yCurr - 10); context_draw.stroke();
        }
        else
        {
            context_draw.beginPath();
            context_draw.moveTo(canvas_draw.width - xCurr + cursorSize/2, yCurr - cursorSize/2);
            context_draw.lineTo(canvas_draw.width - xCurr - cursorSize/2, yCurr + cursorSize/2);
            if (cursorSize == 0)
                context_draw.fillRect(canvas_draw.width - xCurr, yCurr, 1, 1);
            context_draw.stroke();
            context_draw.closePath();
        }
    }
    
    // draw y symmetric
    if (symmetry == "horizontal"
     || symmetry == "horizontal_vertical")
    {
        if (!isStroke)
            context_draw.strokeStyle = symcolor;
            
        if (cursorSize == 0 && !isStroke) // specific cursor if hover at size 0
        {
            context_draw.beginPath();
            context_draw.moveTo(xCurr + 1, canvas_draw.height - yCurr); context_draw.lineTo(xCurr + 10, canvas_draw.height - yCurr); context_draw.stroke();
            context_draw.moveTo(xCurr - 1, canvas_draw.height - yCurr); context_draw.lineTo(xCurr - 10, canvas_draw.height - yCurr); context_draw.stroke();
            context_draw.moveTo(xCurr, canvas_draw.height - yCurr + 1); context_draw.lineTo(xCurr, canvas_draw.height - yCurr + 10); context_draw.stroke();
            context_draw.moveTo(xCurr, canvas_draw.height - yCurr - 1); context_draw.lineTo(xCurr, canvas_draw.height - yCurr - 10); context_draw.stroke();
        }
        else
        {
            context_draw.beginPath();
            context_draw.moveTo(xCurr - cursorSize/2, canvas_draw.height - yCurr + cursorSize/2);
            context_draw.lineTo(xCurr + cursorSize/2, canvas_draw.height - yCurr - cursorSize/2);
            if (cursorSize == 0)
                context_draw.fillRect(xCurr, canvas_draw.height - yCurr, 1, 1);		
            context_draw.stroke();
            context_draw.closePath();
        }
    }
    
    // draw center symmetric
    if (symmetry == "center"
     || symmetry == "horizontal_vertical")
    {
        if (!isStroke)
            context_draw.strokeStyle = symcolor;
            
        if (cursorSize == 0 && !isStroke) // specific cursor if hover at size 0
        {
            context_draw.beginPath();
            context_draw.moveTo(canvas_draw.width - xCurr + 1, canvas_draw.height - yCurr); context_draw.lineTo(canvas_draw.width - xCurr + 10, canvas_draw.height - yCurr); context_draw.stroke();
            context_draw.moveTo(canvas_draw.width - xCurr - 1, canvas_draw.height - yCurr); context_draw.lineTo(canvas_draw.width - xCurr - 10, canvas_draw.height - yCurr); context_draw.stroke();
            context_draw.moveTo(canvas_draw.width - xCurr, canvas_draw.height - yCurr + 1); context_draw.lineTo(canvas_draw.width - xCurr, canvas_draw.height - yCurr + 10); context_draw.stroke();
            context_draw.moveTo(canvas_draw.width - xCurr, canvas_draw.height - yCurr - 1); context_draw.lineTo(canvas_draw.width - xCurr, canvas_draw.height - yCurr - 10); context_draw.stroke();
        }
        else
        {
            context_draw.beginPath();
            context_draw.moveTo(canvas_draw.width - xCurr + cursorSize/2, canvas_draw.height - yCurr + cursorSize/2);
            context_draw.lineTo(canvas_draw.width - xCurr - cursorSize/2, canvas_draw.height - yCurr - cursorSize/2);
            if (cursorSize == 0)
                context_draw.fillRect(canvas_draw.width - xCurr, canvas_draw.height - yCurr, 1, 1);		
            context_draw.stroke();
            context_draw.closePath();
        }
    }
}

// stipple cursor (circle)
function cursorDrawStipple(context_draw: CanvasRenderingContext2D, canvas_draw: HTMLCanvasElement, xCurr: number, yCurr: number, forecolor: string, cursorSize: number, symmetry: string)
{
    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    
    context_draw.strokeStyle = forecolor;
    let symcolor = '#aaaaaa';
    
    // current position
    context_draw.beginPath();
    context_draw.arc(xCurr, yCurr, cursorSize/2, 0, 2 * Math.PI, false);
    if (cursorSize == 0)
        context_draw.fillRect(xCurr, yCurr, 1, 1);	
    context_draw.stroke();
    context_draw.closePath();
    
    // draw x symmetric
    if (symmetry == "vertical"
     || symmetry == "horizontal_vertical")
    {
        context_draw.strokeStyle = symcolor;
        context_draw.beginPath();
        context_draw.arc(canvas_draw.width - xCurr, yCurr, cursorSize/2, 0, 2 * Math.PI, false);
        if (cursorSize == 0)
            context_draw.fillRect(canvas_draw.width - xCurr, yCurr, 1, 1);
        context_draw.stroke();
        context_draw.closePath();
    }
    
    // draw y symmetric
    if (symmetry == "horizontal"
     || symmetry == "horizontal_vertical")
    {
        context_draw.strokeStyle = symcolor;
        context_draw.beginPath();
        context_draw.arc(xCurr, canvas_draw.height - yCurr, cursorSize/2, 0, 2 * Math.PI, false);
        if (cursorSize == 0)
            context_draw.fillRect(xCurr, canvas_draw.height - yCurr, 1, 1);		
        context_draw.stroke();
        context_draw.closePath();
    }
    
    // draw center symmetric
    if (symmetry == "center"
     || symmetry == "horizontal_vertical")
    {
        context_draw.strokeStyle = symcolor;
        context_draw.beginPath();
        context_draw.arc(canvas_draw.width - xCurr, canvas_draw.height - yCurr, cursorSize/2, 0, 2 * Math.PI, false);
        if (cursorSize == 0)
            context_draw.fillRect(canvas_draw.width - xCurr, canvas_draw.height - yCurr, 1, 1);		
        context_draw.stroke();
        context_draw.closePath();
    }
}

// fill cursor (cross)
function cursorDrawFill(context_draw: CanvasRenderingContext2D, canvas_draw: ImageBitmap, xCurr: number, yCurr: number, forecolor: string)
{
    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    context_draw.strokeStyle = forecolor;
    
    context_draw.beginPath();
    context_draw.moveTo(xCurr + 1, yCurr); context_draw.lineTo(xCurr + 10, yCurr); context_draw.stroke();
    context_draw.moveTo(xCurr - 1, yCurr); context_draw.lineTo(xCurr - 10, yCurr); context_draw.stroke();
    context_draw.moveTo(xCurr, yCurr + 1); context_draw.lineTo(xCurr, yCurr + 10); context_draw.stroke();
    context_draw.moveTo(xCurr, yCurr - 1); context_draw.lineTo(xCurr, yCurr - 10); context_draw.stroke();
}
