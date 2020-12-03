/* Based on:
 * © 2009 ROBO Design
 * http://www.robodesign.ro
 */

// Keep everything in anonymous function, called on window load.
if (window.addEventListener)
{
    window.addEventListener('load', function ()
    {
        //////////////////////////////// PARAMETERS ///////////////////////////////

        let canvas_img: HTMLCanvasElement;
        let context_img: CanvasRenderingContext2D;
        let canvas_draw: HTMLCanvasElement;
        let context_draw: CanvasRenderingContext2D;
        //var canvas_cur, context_cur;		// cursor
        
        // active tool instance
        let toolCurrent: ITool;
        let tool_default : string= 'pencil';
        
        // active symmetry
        let symmetry: string;
        let symmetry_default: string = 'horizontal_vertical';
        
        // cursor parameters
        let cursorsize: number;
        let cursorsize_default: number = 20;
        
        // active colors
        let forecolor: string, backcolor: string;
        var forecolor_default = '#880088';
        var backcolor_default = '#ffffff';
        var forecolor_cycle = new Array();
        forecolor_cycle = [pixelHexToRGB(forecolor_default), pixelHexToRGB('#992299'), pixelHexToRGB('#aa44aa'), pixelHexToRGB('#bb66bb'), pixelHexToRGB('#cc88cc'), pixelHexToRGB('#ddaadd'), pixelHexToRGB('#eeccee'), pixelHexToRGB('#ffeeff')];
        
        let color_cycle_active: boolean = false;
        let color_cycle_timer: number;
        
        // image cleared boolean
        let is_cleared: boolean = true;
        
        // grid parameters
        let use_grid: boolean = false;
        let size_grid: number = 20;

        function init ()
        {
            // find the canvas element
            canvas_img = document.getElementById('imageView') as HTMLCanvasElement;
            if (!canvas_img) {
                alert('Error: I cannot find the canvas element!');
                return;
            }

            if (!canvas_img.getContext) {
                alert('Error: no canvas_draw.getContext!');
                return;
            }

            // get the 2D canvas context
            context_img = canvas_img.getContext('2d') as CanvasRenderingContext2D;
            if (!context_img) {
                alert('Error: failed to getContext!');
                return;
            }

            // create the temporary drawing tool canvas
        
            let container: Node = canvas_img.parentNode as Node;
            canvas_draw = document.createElement('canvas');
            if (!canvas_draw) {
                alert('Error: I cannot create a new canvas element!');
                return;
            }

            canvas_draw.id     = 'imageTemp';
            canvas_draw.width  = canvas_img.width;
            canvas_draw.height = canvas_img.height;
            container.appendChild(canvas_draw);
        
            context_draw = canvas_draw.getContext('2d') as CanvasRenderingContext2D;
        
            // interface elements
            
            // bind event handler to clear button
            const clear_button: HTMLButtonElement = document.getElementById('clear') as HTMLButtonElement;
            if (!clear_button)
            {
                alert('Error: failed to get the clear element!');
                return;
            }
            clear_button.addEventListener('click', ev_clear, false);
        
            // get the tool select input
            let tool_select: HTMLSelectElement = document.getElementById('dtool') as HTMLSelectElement;
            if (!tool_select)
            {
                alert('Error: failed to get the dtool element!');
                return;
            }
            tool_select.addEventListener('change', ev_tool_change, false);
        
            // activate the default tool
            //if (tools[tool_default])
            {
                toolCurrent = tools.get(tool_default) as ITool;
                tool_select.value = tool_default;
            }
        
            // get the symmetry select input
            const symmetry_select: HTMLSelectElement = document.getElementById('symmetry') as HTMLSelectElement;
            if (!symmetry_select)
            {
                alert('Error: failed to get the symmetry element!');
                return;
            }
            symmetry_select.addEventListener('change', ev_symmetry_change, false);
        
            // get the foreground color select input
            const forecolor_select: HTMLSelectElement = document.getElementById('forecolorpicker') as HTMLSelectElement;
            if (!forecolor_select)
            {
                alert('Error: failed to get the forecolorpicker element!');
                return;
            }
            forecolor_select.addEventListener('change', ev_forecolor_change, false);
        
            // get the background color select input
            const backcolor_select: HTMLSelectElement = document.getElementById('backcolorpicker') as HTMLSelectElement;
            if (!backcolor_select)
            {
                alert('Error: failed to get the backcolorpicker element!');
                return;
            }
            backcolor_select.addEventListener('change', ev_backcolor_change, false);
        
            // get the cursor size select input
            const cursorsize_select: HTMLInputElement = document.getElementById('cursorsizerange') as HTMLInputElement;
            if (!cursorsize_select)
            {
                alert('Error: failed to get the cursorsizerange element!');
                return;
            }
            cursorsize_select.addEventListener('change', ev_cursorsize_change, false);
        
            // download button
            const button_download: HTMLButtonElement = document.getElementById('buttondownload') as HTMLButtonElement;
            if (button_download != null)
                button_download.addEventListener('click', function (e)
                {
                    // obsolete
                    //var dataURL = canvas_img.toDataURL('image/png');
                    //button_download.href = dataURL;

                    let canvasImage = (document.getElementById('imageView') as HTMLCanvasElement).toDataURL('image/png');

                    // this can be used to download any image from webpage to local disk
                    let xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob';
                    xhr.onload = function () {
                        let a = document.createElement('a');
                        a.href = window.URL.createObjectURL(xhr.response);
                        a.download = 'ImageWebDraw.png';
                        a.style.display = 'none';
                        document.body.appendChild(a);
                        a.click();
                        a.remove()
                    };

                    xhr.open('GET', canvasImage); // This is to download the canvas Image
                    xhr.send();
                });
        
            // activate default values
            symmetry = symmetry_default;
            symmetry_select.value = symmetry_default;
            forecolor = forecolor_default;
            forecolor_select.value = forecolor_default;
            backcolor = backcolor_default;
            backcolor_select.value = backcolor_default;
            ev_clear(/*event*/);
            cursorsize = cursorsize_default;
            cursorsize_select.value = cursorsize_default.toString();

            // attach mouse and keyboard event listeners
            canvas_draw.addEventListener('mousedown', ev_canvas, false);
            canvas_draw.addEventListener('mousemove', ev_canvas, false);
            canvas_draw.addEventListener('mouseup'  , ev_canvas, false);
            canvas_draw.addEventListener('mouseout' , ev_canvas, false);
            canvas_draw.addEventListener("dblclick" , ev_canvas, false);
            
            document.addEventListener("keydown", on_keydown, false);
            document.addEventListener("keyup"  , on_keyup, false);
        }
        
        
        ////////////////////////////////// CALLBACKS ////////////////////////////////

        // general-purpose event handler
        function ev_canvas(ev: MouseEvent)
        {
            // not standard
            // // determine mouse position relative to the canvas element
            // if (ev.layerX || ev.layerX == 0)	// Firefox
            // {
            //     ev.x = (ev as UIEvent).layerX;
            //     ev.y = ev.layerY;
            // }
            // else
            //if (ev.offsetX || ev.offsetX == 0)	// Opera
            //{
            //    ev.x = ev.offsetX;
            //    ev.y = ev.offsetY;
            //}

            // call the corresponding event handler of the tool
            switch(ev.type)
            {
                case "mousedown":
                    toolCurrent.mousedown(ev);
                    break;
                
                case "mousemove":
                    toolCurrent.mousemove(ev);
                    break;

                case "mouseup":
                    toolCurrent.mouseup(ev);
                    break;

                case "mouseout":
                    toolCurrent.mouseout(ev);
                    break;
                    
                case "dblclick":
                    toolCurrent.dblclick(ev);
                    break; 
            }

            /*var func = toolCurrent[ev.type];
            if (func)
                func(ev);*/
        }
        
        // clear image
        function ev_clear(/*ev: Event*/)
        {  
            //if (backcolor == "#ffffff")
            //	context_img.clearRect(0, 0, canvas_draw.width, canvas_draw.height); // transparent
            //else
            {
                context_img.fillStyle = backcolor;
                context_img.fillRect(0,0, canvas_draw.width, canvas_draw.height);
            }
            
            clearInterval(color_cycle_timer);
            color_cycle_active = false;
            
            is_cleared = true;
            
            // calls the corresponding clear tool function
            /*var func = toolCurrent["clear"];
            if (func)
                func(ev);*/
            toolCurrent.cancel();
        }

        // tool selector callback
        function ev_tool_change(ev: Event)
        {
            const toolSelected: string = this.value;
            if (!tools.has(toolSelected))
            {
                alert(`Tool ${toolSelected} is not avalaible yet`);
                return;
            }

            toolCurrent = tools.get(toolSelected) as ITool;
        }
        
        // symmetry selector callback
        function ev_symmetry_change(ev: Event)
        {
            symmetry = this.value;
            //console.log('symmetry = ' + symmetry);
        }
        
        function ev_forecolor_change(colorValue: Event)
        {
            forecolor = this.value;
            //console.log(this.value);
        }
        
        function ev_backcolor_change(ev: Event)
        {
            backcolor = this.value;
            //console.log(this.value);
            
            if (is_cleared)
                ev_clear();
        }
        
        function ev_cursorsize_change(ev: Event)
        {
            cursorsize = this.value;
            //console.log(this.value);
        }

        
        ////////////////////////////////// KEY EVENTS ///////////////////////////////
        
        function on_keydown(ev: KeyboardEvent)
        {
            //console.log(ev.keyCode)
            switch(ev.key.toUpperCase())
            {
                case "BACKSPACE":
                    // calls the corresponding clear tool function
                    // TODO: handle hasClicked
                    toolCurrent.cancel();
                    break;
                case "SHIFT":	// SHIFT keys
                    use_grid = true;
                    break;
                case "CONTROL":	// CTRL keys
                    //use_slow = true;
                    break;
                case "ESCAPE":
                    // clear image
                    ev_clear();
                    break;
                //case "F":
                //	// fill image test
                //	imgFill4(context_img, canvas_img, 100, 100, forecolor);
                //	break;
                case "N":
                    // negative image test
                    imgInvert(context_img, canvas_img);
                    break;
                case "A":
                    // toggle color cycle animation
                    if (color_cycle_active)
                        clearInterval(color_cycle_timer);
                    else
                        color_cycle_timer = setInterval(img_color_cycle_step, 200);
                    
                    color_cycle_active = !color_cycle_active;
                    //img_color_cycle_step();
                    break;
            }
        }
        
        function on_keyup(ev: KeyboardEvent)
        {
            //console.log(ev.key)
            use_grid = false;
        }
            
        // computes mouse coordinates given grid parameters
        function compute_coords(x: number, y: number): [number, number]
        {
            let x_new: number = -1;
            let y_new: number = -1;
            if (use_grid)
            {
                if ((x % size_grid) < size_grid/2)
                    x_new = x - (x % size_grid);
                else
                    x_new = x - (x % size_grid) + size_grid;
                    
                if ((y % size_grid) < size_grid/2)
                    y_new = y - (y % size_grid);
                else
                    y_new = y - (y % size_grid) + size_grid;
            }
            else
            {
                x_new = x;
                y_new = y;
            }
            
            return [x_new, y_new];
        }
        
        // this object holds the implementation of each drawing tool
        var tools: Map<string, ITool> = new Map<string, ITool>();
        
        var symmetries = {};


        //////////////////////////////// TOOLS ////////////////////////////////

        interface ITool
        {
            xCurr: number; yCurr: number;
            xPrev: number; yPrev: number;
            x0: number; y0: number;
            index_cycle: number;

            hasClicked: boolean; hasMoved: boolean;
            hasDrawnCursor: boolean;
            hasPoint0: boolean; nbPointsClicked: number;

            points: Array<[number, number]>;

            mousedown(ev: MouseEvent): void;
            mousemove(ev: MouseEvent): void;
            mouseup(ev: MouseEvent): void;
            mouseout(ev: MouseEvent): void;
            dblclick(ev: MouseEvent): void;

            cancel(): void;
        }

        
        ///////////////////////////// PENCIL TOOL /////////////////////////////
        
        tools.set("pencil", 
        {
            xCurr: -1, yCurr: -1,
            xPrev: -1, yPrev: -1,
            x0: -1, y0: -1,
            index_cycle: 0,

            hasClicked: false, hasMoved: false,
            hasDrawnCursor: false,
            hasPoint0: false, nbPointsClicked: -1,
            points: [],

            mousedown(ev: MouseEvent): void
            {
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            
                context_draw.strokeStyle = forecolor;
                context_draw.fillStyle = forecolor;
                this.xPrev = this.xCurr;
                this.yPrev = this.yCurr;
                this.hasClicked = true;
                
                // draw cursor
                cursorDraw(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor, cursorsize, symmetry, true /*stroke*/);
                this.hasDrawnCursor = true;
            },

            mousemove(ev: MouseEvent): void
            {
                // TODO: handle borders
                
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                
                // // experimental: color animation cycle
                // context_draw.strokeStyle = pixelRGBToHex(forecolor_cycle[index_cycle]);
                // context_draw.fillStyle = pixelRGBToHex(forecolor_cycle[index_cycle]);
                // index_cycle++;
                // if (index_cycle == forecolor_cycle.length)
                // index_cycle = 0;
                
                // show cursor
                if (!this.hasClicked)
                {
                    cursorDraw(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor, cursorsize, symmetry);
                    return;
                }
                else
                {
                    // remove cursor draw at first move
                    if (this.hasDrawnCursor)
                    if (!(this.xPrev == this.xCurr && this.yPrev == this.yCurr))
                    {
                        context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
                        this.hasDrawnCursor = false;
                    }
                    
                    // draw
                    // TODO: handle invert diagonal lines for diagonal cursor
                    for (let i = -cursorsize/2; i <= cursorsize/2; i++)
                    {
                        // mouse position
                        context_draw.beginPath();
                        context_draw.moveTo(this.xPrev + i, this.yPrev + i);
                        context_draw.lineTo(this.xCurr + i, this.yCurr + i);
                        context_draw.stroke();
                        context_draw.closePath();
                        //drawLineNoAliasing(context_draw, xPrev + i, yPrev + i, xCurr + i, yCurr + i);
                        //drawLineNoAliasing(context_draw, xPrev + i + 1, yPrev + i, xCurr + i + 1, yCurr + i);
                    
                        // draw x symmetric
                        if (symmetry == "vertical"
                         || symmetry == "horizontal_vertical")
                        {
                            context_draw.beginPath();
                            context_draw.moveTo(canvas_draw.width - this.xPrev - i, this.yPrev + i);
                            context_draw.lineTo(canvas_draw.width - this.xCurr - i, this.yCurr + i);
                            context_draw.stroke();
                            context_draw.closePath();
                        }
                        
                        // draw y symmetric
                        if (symmetry == "horizontal"
                         || symmetry == "horizontal_vertical")
                        {
                            context_draw.beginPath();
                            context_draw.moveTo(this.xPrev + i, canvas_draw.height - this.yPrev - i);
                            context_draw.lineTo(this.xCurr + i, canvas_draw.height - this.yCurr - i);
                            context_draw.stroke();
                            context_draw.closePath();
                        }
                        
                        // draw center symmetric
                        if (symmetry == "center"
                         || symmetry == "horizontal_vertical")
                        {
                            context_draw.beginPath();
                            context_draw.moveTo(canvas_draw.width - this.xPrev - i, canvas_draw.height - this.yPrev - i);
                            context_draw.lineTo(canvas_draw.width - this.xCurr - i, canvas_draw.height - this.yCurr - i);
                            context_draw.stroke();
                            context_draw.closePath();
                        }
                    }
                
                    this.xPrev = this.xCurr;
                    this.yPrev = this.yCurr;
                }
            },

            mouseup(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    //this.mousemove(ev);
                    this.hasClicked = false;
                    this.hasDrawnCursor = false;
                    img_update();
                }
            },

            mouseout(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    this.hasClicked = false;
                    this.hasDrawnCursor = false;
                    img_update();
                }
                else
                    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },

            dblclick(ev: MouseEvent): void{},

            cancel(): void
            {
                this.hasClicked = false;
                this.hasDrawnCursor = false;
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            }
        });
        
        // //////////////////////////////// STIPPLE TOOL ///////////////////////////////
        
        
        tools.set("stipple",
        {
            xCurr: -1, yCurr: -1,
            xPrev: -1, yPrev: -1,
            x0: -1, y0: -1,
            index_cycle: 0,

            hasClicked: false, hasMoved: false,
            hasDrawnCursor: false,
            hasPoint0: false, nbPointsClicked: -1,
            points: [],

            mousedown(ev: MouseEvent): void
            {
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
                context_draw.fillStyle = forecolor;
                this.hasClicked = true;
                
                // TODO: stipple at idle
            },

            mousemove(ev: MouseEvent): void
            {
                // TODO: handle borders
                
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                
                // show cursor
                if (!this.hasClicked)
                {
                    cursorDrawStipple(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor, cursorsize, symmetry);
                    return;
                }
                else
                {	  
                    // draw
                    //nbPoints = cursorsize/2;
                    let nbPoints: number = Math.round(1 + Math.random() * cursorsize);
                    for (let i = 0; i < nbPoints; i++)
                    {
                        // compute a random delta for position
                        const dist: number = Math.round(Math.random() * cursorsize/2);
                        const angle: number = Math.random() * 2 * Math.PI;
                        const xRand: number = this.xCurr + dist*Math.cos(angle);
                        const yRand: number = this.yCurr + dist*Math.sin(angle);
                    
                        // mouse position
                        context_draw.fillRect(xRand, yRand, 1, 1);
                    
                        // draw x symmetric
                        if (symmetry == "vertical" || symmetry == "horizontal_vertical")
                            context_draw.fillRect(canvas_draw.width - xRand, yRand, 1, 1);
                        
                        // draw y symmetric
                        if (symmetry == "horizontal" || symmetry == "horizontal_vertical")
                            context_draw.fillRect(xRand, canvas_draw.height - yRand, 1, 1);
                        
                        // draw center symmetric
                        if (symmetry == "center" || symmetry == "horizontal_vertical")
                            context_draw.fillRect(canvas_draw.width - xRand, canvas_draw.height - yRand, 1, 1);
                    }
                }
            },

            mouseup(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    //this.mousemove(ev);
                    this.hasClicked = false;
                    this.hasDrawnCursor = false;
                    img_update();
                }
            },
        
            mouseout(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    this.hasClicked = false;
                    this.hasDrawnCursor = false;
                    img_update();
                }
                else
                    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },

            dblclick(ev: MouseEvent): void{},
            
            cancel(): void
            {
                this.hasClicked = false;
                this.hasDrawnCursor = false;
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            }
        });

        // ////////////////////////////////// LINE TOOL ////////////////////////////////
        
        tools.set("line",
        {
            xCurr: -1, yCurr: -1,
            xPrev: -1, yPrev: -1,
            x0: -1, y0: -1,
            index_cycle: 0,

            hasClicked: false, hasMoved: false,
            hasDrawnCursor: false,
            hasPoint0: false, nbPointsClicked: -1,
            points: [],

            mousedown(ev: MouseEvent): void
            {
                context_draw.strokeStyle = forecolor;
                if (!this.hasPoint0)
                {
                    [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                    this.x0 = this.xCurr;
                    this.y0 = this.yCurr;
                    
                }
                this.hasClicked = true;
            },

            mousemove(ev: MouseEvent): void
            {
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
            
                // show cursor if no click and origin point not set
                if (!this.hasClicked && !this.hasPoint0)
                {
                    cursorDraw(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor, cursorsize, symmetry);
                    return;
                }
                
                // nop if no move
                if (this.x0 == this.xCurr && this.y0 == this.yCurr)
                    return;
                    
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

                for (let i = -cursorsize/2; i <= cursorsize/2; i++)
                {	
                    // mouse position
                    context_draw.beginPath();
                    context_draw.moveTo(this.x0 + i, this.y0 + i);
                    context_draw.lineTo(this.xCurr + i,   this.yCurr + i);
                    context_draw.stroke();
                    context_draw.closePath();
                    
                    // draw x symmetric
                    if (symmetry == "vertical"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(canvas_draw.width - this.x0 - i, this.y0 + i);
                        context_draw.lineTo(canvas_draw.width - this.xCurr - i, this.yCurr + i);
                        context_draw.stroke();
                        context_draw.closePath();
                    }
                    
                    // draw y symmetric
                    if (symmetry == "horizontal"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(this.x0 + i, canvas_draw.height - this.y0 - i);
                        context_draw.lineTo(this.xCurr + i,   canvas_draw.height - this.yCurr - i);
                        context_draw.stroke();
                        context_draw.closePath();
                    }
                    
                    // draw center symmetric
                    if (symmetry == "center"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(canvas_draw.width - this.x0 - i, canvas_draw.height - this.y0 - i);
                        context_draw.lineTo(canvas_draw.width - this.xCurr - i,   canvas_draw.height - this.yCurr - i);
                        context_draw.stroke();
                        context_draw.closePath();
                    }
                }
                    
                //console.log("Moved: " + ev.x + "," + ev.y + " - " + this.x0 + "," + this.y0);
                this.hasMoved = true;
            },

            mouseup(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    this.hasClicked = false;
                
                    if (this.hasPoint0 || this.hasMoved)
                    {
                        img_update();
                        this.hasPoint0 = false;
                        this.hasMoved = false;
                        //console.log("Moved or Point 0");
                    }
                    else
                    {
                        this.hasPoint0 = true;
                        this.hasMoved = false;
                        //console.log("Point 0 set");
                    }
                }
            },
        
            mouseout(ev: MouseEvent): void
            {
                if (!this.hasClicked && !this.hasPoint0)
                    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },

            dblclick(ev: MouseEvent): void{},
        
            cancel(): void
            {
                //console.log("clear line tool");
                this.hasClicked = false;
                this.hasMoved = false;
                this.hasPoint0 = false;
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },
        });
        
        
        // ///////////////////////////////// K-LINE TOOL ///////////////////////////////
        
        tools.set("k_line",
        {
            xCurr: -1, yCurr: -1,
            xPrev: -1, yPrev: -1,
            x0: -1, y0: -1,
            index_cycle: 0,

            hasClicked: false, hasMoved: false,
            hasDrawnCursor: false,
            hasPoint0: false, nbPointsClicked: -1,
            points: [],

            mousedown(ev: MouseEvent): void
            {
                context_draw.strokeStyle = forecolor;
                //if (!this.hasPoint0)
                {
                    [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                    this.points.push([this.xCurr, this.yCurr]);
                }
                this.hasClicked = true;
            },

            mousemove(ev: MouseEvent): void
            {
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
            
                // show cursor if no click and no point set
                if (!this.hasClicked && this.points.length == 0)
                {
                    cursorDraw(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor, cursorsize, symmetry);
                    return;
                }
                
                // TODO: nop if no move
                //if (this.x0 == this.xCurr && this.y0 == this.yCurr)
                //	return;
                    
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

                [this.x0, this.y0] = this.points[0];
                const nbPoints: number = this.points.length;
                for (let i = -cursorsize/2; i <= cursorsize/2; i++)
                {	
                    // mouse position
                    context_draw.beginPath();
                    context_draw.moveTo(this.x0 + i, this.y0 + i); // first point
                    for (let j = 1; j < nbPoints; j++)
                    {
                        const [xj, yj]: [number, number] = this.points[j];
                        context_draw.lineTo(xj + i, yj + i); // 2nd to (n-1)th point(s)
                    }
                    context_draw.lineTo(this.xCurr + i, this.yCurr + i); // last point = current point
                    context_draw.stroke();
                    //closePath();
                    
                    // draw x symmetric
                    if (symmetry == "vertical"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(canvas_draw.width - this.x0 - i, this.y0 + i); // first point
                        for (let j = 1; j < nbPoints; j++)
                        {
                            const [xj, yj]: [number, number] = this.points[j];
                            context_draw.lineTo(canvas_draw.width - xj - i, yj + i); // 2nd to (n-1)th point(s)
                        }
                        context_draw.lineTo(canvas_draw.width - this.xCurr - i, this.yCurr + i); // last point = current point
                        context_draw.stroke();
                    }
                    
                    // draw y symmetric
                    if (symmetry == "horizontal"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(this.x0 + i, canvas_draw.height - this.y0 - i); // first point
                        for (var j = 1; j < nbPoints; j++)
                        {
                            const [xj, yj]: [number, number] = this.points[j];
                            context_draw.lineTo(xj + i, canvas_draw.height - yj - i); // 2nd to (n-1)th point(s)
                        }
                        context_draw.lineTo(this.xCurr + i, canvas_draw.height - this.yCurr - i); // last point = current point
                        context_draw.stroke();
                    }
                    
                    // draw center symmetric
                    if (symmetry == "center"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(canvas_draw.width - this.x0 - i, canvas_draw.height - this.y0 - i); // first point
                        for (var j = 1; j < nbPoints; j++)
                        {
                            const [xj, yj]: [number, number] = this.points[j];
                            context_draw.lineTo(canvas_draw.width - xj - i, canvas_draw.height - yj - i); // 2nd to (n-1)th
                        }
                        context_draw.lineTo(canvas_draw.width - this.xCurr - i, canvas_draw.height - this.yCurr - i); // last point = current point
                        context_draw.stroke();
                    }
                }
                    
                //console.log("Moved: " + ev.x + "," + ev.y + " - " + this.x0 + "," + this.y0);
                this.hasMoved = true;
            },

            mouseup(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    /*this.hasClicked = false;
                
                    if (this.hasPoint0 || this.hasMoved)
                    {
                        img_update();
                        this.hasPoint0 = false;
                        this.hasMoved = false;
                        //console.log("Moved or Point 0");
                    }
                    else
                    {
                        this.hasPoint0 = true;
                        this.hasMoved = false;
                        //console.log("Point 0 set");
                    }*/
                }
            },
        
            dblclick(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    img_update();
                    this.hasClicked = false;
                    this.hasMoved = false;
                    this.points = new Array();
                    //console.log("Moved or Point 0");
                }
            },
        
            mouseout(ev: MouseEvent): void
            {
                if (!this.hasClicked && this.points.length == 0)
                    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },
        
            cancel(): void
            {
                //console.log("clear k-line tool");
                this.hasClicked = false;
                this.hasMoved = false;
                this.points = new Array();
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },
        });
        
        
        // ////////////////////////////////// RAYS TOOL ////////////////////////////////
        
        tools.set("rays",
        {
            xCurr: -1, yCurr: -1,
            xPrev: -1, yPrev: -1,
            x0: -1, y0: -1,
            index_cycle: 0,

            hasClicked: false, hasMoved: false,
            hasDrawnCursor: false,
            hasPoint0: false, nbPointsClicked: -1,
            points: [],

            mousedown(ev: MouseEvent): void
            {
                context_draw.strokeStyle = forecolor;
                //if (!this.hasPoint0)
                {
                    [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                    this.points.push([this.xCurr, this.yCurr]);
                }
                this.hasClicked = true;
            },

            mousemove(ev: MouseEvent): void
            {
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
            
                // show cursor if no click and no point set
                if (!this.hasClicked && this.points.length == 0)
                {
                    cursorDraw(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor, cursorsize, symmetry);
                    return;
                }
                
                // TODO: nop if no move
                //if (this.x0 == this.xCurr && this.y0 == this.yCurr)
                //	return;
                    
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

                [this.x0, this.y0] = this.points[0];
                const nbPoints = this.points.length;
                for (let i = -cursorsize/2; i <= cursorsize/2; i++)
                {	
                    // mouse position
                    context_draw.beginPath();
                    context_draw.moveTo(this.x0 + i, this.y0 + i); // origin point
                    for (let j = 1; j < nbPoints; j++ )
                    {
                        const [xj, yj]: [number, number] = this.points[j];
                        context_draw.lineTo(xj + i, yj + i); // 1st to (n-1)th point(s)
                        context_draw.moveTo(this.x0 + i, this.y0 + i); // back to origin point
                    }
                    context_draw.lineTo(this.xCurr + i, this.yCurr + i); // last point = current point
                    context_draw.stroke();
                    //closePath();
                    
                    // draw x symmetric
                    if (symmetry == "vertical"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(canvas_draw.width - this.x0 - i, this.y0 + i); // origin point
                        for (let j = 1; j < nbPoints; j++ )
                        {
                            const [xj, yj]: [number, number] = this.points[j];
                            context_draw.lineTo(canvas_draw.width - xj - i, yj + i); // 1st to (n-1)th point(s)
                            context_draw.moveTo(canvas_draw.width - this.x0 - i, this.y0 + i); // back to origin point
                        }
                        context_draw.lineTo(canvas_draw.width - this.xCurr - i, this.yCurr + i); // last point = current point
                        context_draw.stroke();
                    }
                    
                    // draw y symmetric
                    if (symmetry == "horizontal"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(this.x0 + i, canvas_draw.height - this.y0 - i); // origin point
                        for (var j = 1; j < nbPoints; j++ )
                        {
                            const [xj, yj]: [number, number] = this.points[j];
                            context_draw.lineTo(xj + i, canvas_draw.height - yj - i); // 1st to (n-1)th point(s)
                            context_draw.moveTo(this.x0 + i, canvas_draw.height - this.y0 - i); // back to origin point
                        }
                        context_draw.lineTo(this.xCurr + i, canvas_draw.height - this.yCurr - i); // last point = current point
                        context_draw.stroke();
                    }
                    
                    // draw center symmetric
                    if (symmetry == "center"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(canvas_draw.width - this.x0 - i, canvas_draw.height - this.y0 - i); // origin point
                        for (var j = 1; j < nbPoints; j++ )
                        {
                            const [xj, yj]: [number, number] = this.points[j];
                            context_draw.lineTo(canvas_draw.width - xj - i, canvas_draw.height - yj - i); // 1st to (n-1)th
                            context_draw.moveTo(canvas_draw.width - this.x0 - i, canvas_draw.height - this.y0 - i); // back to origin point
                        }
                        context_draw.lineTo(canvas_draw.width - this.xCurr - i, canvas_draw.height - this.yCurr - i); // last point = current point
                        context_draw.stroke();
                    }
                }
                    
                //console.log("Moved: " + ev.x + "," + ev.y + " - " + this.x0 + "," + this.y0);
                this.hasMoved = true;
            },

            mouseup(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    /*this.hasClicked = false;
                
                    if (this.hasPoint0 || this.hasMoved)
                    {
                        img_update();
                        this.hasPoint0 = false;
                        this.hasMoved = false;
                        //console.log("Moved or Point 0");
                    }
                    else
                    {
                        this.hasPoint0 = true;
                        this.hasMoved = false;
                        //console.log("Point 0 set");
                    }*/
                }
            },
        
            dblclick(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    img_update();
                    this.hasClicked = false;
                    this.hasMoved = false;
                    this.points = new Array();
                    //console.log("Moved or Point 0");
                }
            },
            
            mouseout(ev: MouseEvent): void
            {
                if (!this.hasClicked && this.points.length == 0)
                    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },
        
            cancel(): void
            {
                //console.log("clear k-line tool");
                this.hasClicked = false;
                this.hasMoved = false;
                this.points = new Array();
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            }
        });
        
        
        // /////////////////////////////// RECTANGLE TOOL //////////////////////////////
        
        tools.set("rectangle",
        {
            xCurr: -1, yCurr: -1,
            xPrev: -1, yPrev: -1,
            x0: -1, y0: -1,
            index_cycle: 0,

            hasClicked: false, hasMoved: false,
            hasDrawnCursor: false,
            hasPoint0: false, nbPointsClicked: -1,
            points: [],

            mousedown(ev: MouseEvent): void
            {
                context_draw.strokeStyle = forecolor;
                if (!this.hasPoint0)
                {
                    [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                    this.x0 = this.xCurr;
                    this.y0 = this.yCurr;
                }
                this.hasClicked = true;
            },

            mousemove(ev: MouseEvent): void
            {
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
            
                // show cursor if no click and origin point not set
                if (!this.hasClicked && !this.hasPoint0)
                {
                    cursorDraw(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor, cursorsize, symmetry);
                    return;
                }
                
                // nop if no move
                if (this.x0 == this.xCurr && this.y0 == this.yCurr)
                    return;

                var x = Math.min(this.xCurr,  this.x0),
                    y = Math.min(this.yCurr,  this.y0),
                    w = Math.abs(this.xCurr - this.x0),
                    h = Math.abs(this.yCurr - this.y0),
                    xs = Math.min(canvas_draw.width  - this.xCurr,  canvas_draw.width  - this.x0),
                    ys = Math.min(canvas_draw.height - this.yCurr,  canvas_draw.height - this.y0);

                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

                if (!w || !h)
                    return;
                
                for (let i = -cursorsize/2; i <= cursorsize/2; i++)
                {		
                    // mouse position
                    context_draw.strokeRect(x + i, y + i, w, h);
                    
                    // draw x symmetric
                    if (symmetry == "vertical"
                     || symmetry == "horizontal_vertical")
                        context_draw.strokeRect(xs - i, y + i, w, h);
                        
                    // draw y symmetric
                    if (symmetry == "horizontal"
                     || symmetry == "horizontal_vertical")
                        context_draw.strokeRect(x + i, ys - i, w, h);
                        
                    // draw center symmetric
                    if (symmetry == "center"
                     || symmetry == "horizontal_vertical")
                        context_draw.strokeRect(xs - i, ys - i, w, h);
                }
                
                //console.log("Moved: " + ev.x + "," + ev.y + " - " + this.x0 + "," + this.y0);
                this.hasMoved = true;
            },

            mouseup(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    this.hasClicked = false;
                
                    if (this.hasPoint0 || this.hasMoved)
                    {
                        img_update();
                        this.hasPoint0 = false;
                        this.hasMoved = false;
                        //console.log("Moved or Point 0");
                    }
                    else
                    {
                        this.hasPoint0 = true;
                        //console.log("Point 0 set");
                    }
                }
            },
        
            mouseout(ev: MouseEvent): void
            {
                if (!this.hasClicked && !this.hasPoint0)
                    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },

            dblclick(ev: MouseEvent): void{},
        
            cancel(): void
            {
                this.hasClicked = false;
                this.hasMoved = false;
                this.hasPoint0 = false;
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            }
        });

        
        // ////////////////////////////////// BOX TOOL /////////////////////////////////
        
        tools.set("box",
        {
            xCurr: -1, yCurr: -1,
            xPrev: -1, yPrev: -1,
            x0: -1, y0: -1,
            index_cycle: 0,

            hasClicked: false, hasMoved: false,
            hasDrawnCursor: false,
            hasPoint0: false, nbPointsClicked: -1,
            points: [],

            mousedown(ev: MouseEvent): void
            {
                context_draw.fillStyle = forecolor;
                if (!this.hasPoint0)
                {
                    [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                    this.x0 = this.xCurr;
                    this.y0 = this.yCurr;
                }
                this.hasClicked = true;
            },

            mousemove(ev: MouseEvent): void
            {
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
            
                // show cursor if no click and origin point not set
                if (!this.hasClicked && !this.hasPoint0)
                {
                    cursorDraw(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor, cursorsize, symmetry);
                    return;
                }
                
                // nop if no move
                if (this.x0 == this.xCurr && this.y0 == this.yCurr)
                    return;

                var x = Math.min(this.xCurr,  this.x0),
                    y = Math.min(this.yCurr,  this.y0),
                    w = Math.abs(this.xCurr - this.x0),
                    h = Math.abs(this.yCurr - this.y0),
                    xs = Math.min(canvas_draw.width  - this.xCurr,  canvas_draw.width  - this.x0),
                    ys = Math.min(canvas_draw.height - this.yCurr,  canvas_draw.height - this.y0);

                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

                if (!w || !h)
                    return;
                
                for (let i = -cursorsize/2; i <= cursorsize/2; i++)
                {		
                    // mouse position
                    context_draw.fillRect(x + i, y + i, w, h);
                    
                    // draw x symmetric
                    if (symmetry == "vertical"
                     || symmetry == "horizontal_vertical")
                        context_draw.fillRect(xs - i, y + i, w, h);
                        
                    // draw y symmetric
                    if (symmetry == "horizontal"
                     || symmetry == "horizontal_vertical")
                        context_draw.fillRect(x + i, ys - i, w, h);
                        
                    // draw center symmetric
                    if (symmetry == "center"
                     || symmetry == "horizontal_vertical")
                        context_draw.fillRect(xs - i, ys - i, w, h);
                }
                
                //console.log("Moved: " + ev.x + "," + ev.y + " - " + this.x0 + "," + this.y0);
                this.hasMoved = true;
            },

            mouseup(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    this.hasClicked = false;
                
                    if (this.hasPoint0 || this.hasMoved)
                    {
                        img_update();
                        this.hasPoint0 = false;
                        this.hasMoved = false;
                        //console.log("Moved or Point 0");
                    }
                    else
                    {
                        this.hasPoint0 = true;
                        //console.log("Point 0 set");
                    }
                }
            },
        
            mouseout(ev: MouseEvent): void
            {
                if (!this.hasClicked && !this.hasPoint0)
                    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },

            dblclick(ev: MouseEvent): void{},
        
            cancel(): void
            {
                this.hasClicked = false;
                this.hasMoved = false;
                this.hasPoint0 = false;
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },
        });
        
        
        // ///////////////////////////////// POLYGON TOOL //////////////////////////////
        
        tools.set("polygon",
        {
            xCurr: -1, yCurr: -1,
            xPrev: -1, yPrev: -1,
            x0: -1, y0: -1,
            index_cycle: 0,

            hasClicked: false, hasMoved: false,
            hasDrawnCursor: false,
            hasPoint0: false, nbPointsClicked: -1,
            points: [],

            mousedown(ev: MouseEvent): void
            {
                context_draw.strokeStyle = forecolor;
                //if (!this.hasPoint0)
                {
                    [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                    this.points.push([this.xCurr, this.yCurr]);
                }
                this.hasClicked = true;
            },

            mousemove(ev: MouseEvent): void
            {
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
            
                // show cursor if no click and no point set
                if (!this.hasClicked && this.points.length == 0)
                {
                    cursorDraw(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor, cursorsize, symmetry);
                    return;
                }
                
                // TODO: nop if no move
                //if (this.x0 == this.xCurr && this.y0 == this.yCurr)
                //	return;
                    
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

                let [x0, y0]: [number, number] = this.points[0];
                const nbPoints: number = this.points.length;
                for (let i = -cursorsize/2; i <= cursorsize/2; i++)
                {	
                    // mouse position
                    context_draw.beginPath();
                    context_draw.moveTo(x0 + i, y0 + i); // first point
                    for (var j = 1; j < nbPoints; j++ )
                    {
                        const [xj, yj]: [number, number] = this.points[j];
                        context_draw.lineTo(xj + i, yj + i); // 2nd to (n-1)th point(s)
                    }
                    context_draw.lineTo(this.xCurr + i, this.yCurr + i); // last point = current point
                    context_draw.lineTo(x0 + i, y0 + i); // loop to first point
                    context_draw.stroke();
                    //closePath();
                    
                    // draw x symmetric
                    if (symmetry == "vertical"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(canvas_draw.width - x0 - i, y0 + i); // first point
                        for (var j = 1; j < nbPoints; j++ )
                        {
                            const [xj, yj]: [number, number] = this.points[j];
                            context_draw.lineTo(canvas_draw.width - xj - i, yj + i); // 2nd to (n-1)th point(s)
                        }
                        context_draw.lineTo(canvas_draw.width - this.xCurr - i, this.yCurr + i); // last point = current point
                        context_draw.lineTo(canvas_draw.width - x0 - i, y0 + i); // loop to first point
                        context_draw.stroke();
                    }
                    
                    // draw y symmetric
                    if (symmetry == "horizontal"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(x0 + i, canvas_draw.height - y0 - i); // first point
                        for (let j = 1; j < nbPoints; j++ )
                        {
                            const [xj, yj]: [number, number] = this.points[j];
                            context_draw.lineTo(xj + i, canvas_draw.height - yj - i); // 2nd to (n-1)th point(s)
                        }
                        context_draw.lineTo(this.xCurr + i, canvas_draw.height - this.yCurr - i); // last point = current point
                        context_draw.lineTo(x0 + i, canvas_draw.height - y0 - i); // loop to first point
                        context_draw.stroke();
                    }
                    
                    // draw center symmetric
                    if (symmetry == "center"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(canvas_draw.width - x0 - i, canvas_draw.height - y0 - i); // first point
                        for (let j = 1; j < nbPoints; j++ )
                        {
                            const [xj, yj]: [number, number] = this.points[j];
                            context_draw.lineTo(canvas_draw.width - xj - i, canvas_draw.height - yj - i); // 2nd to (n-1)th
                        }
                        context_draw.lineTo(canvas_draw.width - this.xCurr - i, canvas_draw.height - this.yCurr - i); // last point = current point
                        context_draw.lineTo(canvas_draw.width - x0 - i, canvas_draw.height - y0 - i); // loop to first point
                        context_draw.stroke();
                    }
                }
                    
                //console.log("Moved: " + ev.x + "," + ev.y + " - " + this.x0 + "," + this.y0);
                this.hasMoved = true;
            },

            mouseup(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    /*this.hasClicked = false;
                
                    if (this.hasPoint0 || this.hasMoved)
                    {
                        img_update();
                        this.hasPoint0 = false;
                        this.hasMoved = false;
                        //console.log("Moved or Point 0");
                    }
                    else
                    {
                        this.hasPoint0 = true;
                        this.hasMoved = false;
                        //console.log("Point 0 set");
                    }*/
                }
            },
        
            dblclick(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    img_update();
                    this.hasClicked = false;
                    this.hasMoved = false;
                    this.points = new Array();
                    //console.log("Moved or Point 0");
                }
            },
            
            mouseout(ev: MouseEvent): void
            {
                if (!this.hasClicked && this.points.length == 0)
                    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },
        
            cancel(): void
            {
                //console.log("clear k-line tool");
                this.hasClicked = false;
                this.hasMoved = false;
                this.points = new Array();
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },
        });
        
        
        // //////////////////////////////// CIRCLE TOOL ////////////////////////////////
        
        tools.set("circle",
        {
            xCurr: -1, yCurr: -1,
            xPrev: -1, yPrev: -1,
            x0: -1, y0: -1,
            index_cycle: 0,

            hasClicked: false, hasMoved: false,
            hasDrawnCursor: false,
            hasPoint0: false, nbPointsClicked: -1,
            points: [],

            mousedown(ev: MouseEvent): void
            {
                context_draw.strokeStyle = forecolor;
                //context_draw.fillStyle = forecolor;
                if (!this.hasPoint0)
                {
                    // circle center
                    [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                    this.x0 = this.xCurr;
                    this.y0 = this.yCurr;
                }
                this.hasClicked = true;
            },

            mousemove(ev: MouseEvent): void
            {
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
            
                // show cursor if no click and origin point not set
                if (!this.hasClicked && !this.hasPoint0)
                {
                    cursorDraw(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor, cursorsize, symmetry);
                    return;
                }
                
                // nop if no move
                if (this.x0 == this.xCurr && this.y0 == this.yCurr)
                    return;

                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

                var radius = Math.sqrt((this.x0 - this.xCurr)*(this.x0 - this.xCurr) + (this.y0 - this.yCurr)*(this.y0 - this.yCurr));
                for (let i = -cursorsize/2; i <= cursorsize/2; i++)
                {
                    // mouse position
                    context_draw.beginPath();
                    context_draw.arc(this.x0 + i, this.y0 + i, radius, 0, 2 * Math.PI, false);
                    context_draw.stroke();
                    //context_draw.fill();
                    context_draw.closePath();
                    
                    // draw x symmetric
                    if (symmetry == "vertical"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.arc(canvas_draw.width - this.x0 - i, this.y0 + i, radius, 0, 2 * Math.PI, false);
                        context_draw.stroke();
                        context_draw.closePath();
                    }
                        
                    // draw y symmetric
                    if (symmetry == "horizontal"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.arc(this.x0 + i, canvas_draw.height - this.y0 - i, radius, 0, 2 * Math.PI, false);
                        context_draw.stroke();
                        context_draw.closePath();
                    }
                        
                    // draw center symmetric
                    if (symmetry == "center"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.arc(canvas_draw.width - this.x0 - i, canvas_draw.height - this.y0 - i, radius, 0, 2 * Math.PI, false);
                        context_draw.stroke();
                        context_draw.closePath();
                    }
                }
                
                //console.log("Moved: " + ev.x + "," + ev.y + " - " + this.x0 + "," + this.y0);
                this.hasMoved = true;
            },

            mouseup(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    //console.log("Mouse has clicked");
                    this.hasClicked = false;
                
                    if (this.hasPoint0 || this.hasMoved)
                    {
                        img_update();
                        this.hasPoint0 = false;
                        this.hasMoved = false;
                        //console.log("Moved or Point 0");
                    }
                    else
                    {
                        this.hasPoint0 = true;
                        //console.log("Point 0 set");
                    }
                }
            },
        
            mouseout(ev: MouseEvent): void
            {
                if (!this.hasClicked && !this.hasPoint0)
                    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },

            dblclick(ev: MouseEvent): void{},
        
            cancel(): void
            {
                this.hasClicked = false;
                this.hasMoved = false;
                this.hasPoint0 = false;
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },
        });
        
    
        // ///////////////////////////////// DISC TOOL /////////////////////////////////
        
        tools.set("disc",
        {
            xCurr: -1, yCurr: -1,
            xPrev: -1, yPrev: -1,
            x0: -1, y0: -1,
            index_cycle: 0,

            hasClicked: false, hasMoved: false,
            hasDrawnCursor: false,
            hasPoint0: false, nbPointsClicked: -1,
            points: [],

            mousedown(ev: MouseEvent): void
            {
                context_draw.fillStyle = forecolor;
                if (!this.hasPoint0)
                {
                    // circle center
                    [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                    this.x0 = this.xCurr;
                    this.y0 = this.yCurr;
                }
                this.hasClicked = true;
            },

            mousemove(ev: MouseEvent): void
            {
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
            
                // show cursor if no click and origin point not set
                if (!this.hasClicked && !this.hasPoint0)
                {
                    cursorDraw(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor, cursorsize, symmetry);
                    return;
                }
                
                // nop if no move
                if (this.x0 == this.xCurr && this.y0 == this.yCurr)
                    return;

                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

                const radius: number = Math.sqrt((this.x0 - this.xCurr)*(this.x0 - this.xCurr) + (this.y0 - this.yCurr)*(this.y0 - this.yCurr));
                for (let i = -cursorsize/2; i <= cursorsize/2; i++)
                {
                    // mouse position
                    context_draw.beginPath();
                    context_draw.arc(this.x0 + i, this.y0 + i, radius, 0, 2 * Math.PI, false);
                    context_draw.fill();
                    context_draw.closePath();
                    
                    // draw x symmetric
                    if (symmetry == "vertical"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.arc(canvas_draw.width - this.x0 - i, this.y0 + i, radius, 0, 2 * Math.PI, false);
                        context_draw.fill();
                        context_draw.closePath();
                    }
                        
                    // draw y symmetric
                    if (symmetry == "horizontal"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.arc(this.x0 + i, canvas_draw.height - this.y0 - i, radius, 0, 2 * Math.PI, false);
                        context_draw.fill();
                        context_draw.closePath();
                    }
                        
                    // draw center symmetric
                    if (symmetry == "center"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.arc(canvas_draw.width - this.x0 - i, canvas_draw.height - this.y0 - i, radius, 0, 2 * Math.PI, false);
                        context_draw.fill();
                        context_draw.closePath();
                    }
                }
                
                //console.log("Moved: " + ev.x + "," + ev.y + " - " + this.x0 + "," + this.y0);
                this.hasMoved = true;
            },

            mouseup(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    //console.log("Mouse has clicked");
                    this.hasClicked = false;
                
                    if (this.hasPoint0 || this.hasMoved)
                    {
                        img_update();
                        this.hasPoint0 = false;
                        this.hasMoved = false;
                        //console.log("Moved or Point 0");
                    }
                    else
                    {
                        this.hasPoint0 = true;
                        //console.log("Point 0 set");
                    }
                }
            },
        
            mouseout(ev: MouseEvent): void
            {
                if (!this.hasClicked && !this.hasPoint0)
                    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },

            dblclick(ev: MouseEvent): void{},
        
            cancel(): void
            {
                this.hasClicked = false;
                this.hasMoved = false;
                this.hasPoint0 = false;
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },
        });
    
    
        // ////////////////////////////////// ARC TOOL /////////////////////////////////
        
        tools.set("arc",
        {
            xCurr: -1, yCurr: -1,
            xPrev: -1, yPrev: -1,
            x0: -1, y0: -1,
            index_cycle: 0,

            hasClicked: false, hasMoved: false,
            hasDrawnCursor: false,
            hasPoint0: false, nbPointsClicked: 0,
            points: [],

            mousedown(ev: MouseEvent): void
            {
                context_draw.strokeStyle = forecolor;
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                switch(this.nbPointsClicked)
                {
                    case 0:
                        this.x0 = this.xCurr;
                        this.y0 = this.yCurr;
                        break;
                    case 1:
                        this.x1 = this.xCurr;
                        this.y1 = this.yCurr;
                        break;
                }
                
                this.hasClicked = true;
            },

            mousemove(ev: MouseEvent): void
            {
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);

                // show cursor if no click and first point not set
                if (!this.hasClicked && this.nbPointsClicked == 0)
                {
                    cursorDraw(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor, cursorsize, symmetry);
                    return;
                }
                
                // nop if no move
                if (this.nbPointsClicked == 0 && this.x0 == this.xCurr && this.y0 == this.yCurr)
                    return;
                if (this.nbPointsClicked == 1 && this.x1 == this.xCurr && this.y1 == this.yCurr)
                    return;
                    
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

                // extrapolate control point
                var xmid = (this.x0 + this.x1) / 2;	// middle between point 0 and point 1
                var ymid = (this.y0 + this.y1) / 2;
                var xc = xmid + 2*(this.xCurr - xmid);	// quadratic curve control point:
                var yc = ymid + 2*(this.yCurr - ymid);
                
                var drawPoints1To2 = (this.nbPointsClicked == 1) || (this.nbPointsClicked == 0 && this.hasMoved);
                var drawPoints2To3 = (this.nbPointsClicked == 2) || (this.nbPointsClicked == 1 && this.hasMoved);
                
                for (let i = -cursorsize/2; i <= cursorsize/2; i++)
                {	
                    // mouse position
                    context_draw.beginPath();
                    context_draw.moveTo(this.x0 + i, this.y0 + i);
                    if (drawPoints1To2)
                        context_draw.lineTo(this.xCurr + i, this.yCurr + i);
                    else if (drawPoints2To3)
                        context_draw.quadraticCurveTo(xc, yc, this.x1 + i, this.y1 + i);
                    context_draw.stroke();
                    context_draw.closePath();
                    
                    // draw x symmetric
                    if (symmetry == "vertical"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(canvas_draw.width - this.x0 - i, this.y0 + i);
                        if (drawPoints1To2)
                            context_draw.lineTo(canvas_draw.width - this.xCurr - i, this.yCurr + i);
                        else if (drawPoints2To3)
                            context_draw.quadraticCurveTo(canvas_draw.width - xc - i, yc + i, canvas_draw.width - this.x1 - i, this.y1 + i);
                        context_draw.stroke();
                        context_draw.closePath();
                    }
                    
                    // draw y symmetric
                    if (symmetry == "horizontal"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(this.x0 + i, canvas_draw.height - this.y0 - i);
                        if (drawPoints1To2)
                            context_draw.lineTo(this.xCurr + i, canvas_draw.height - this.yCurr - i);
                        else if (drawPoints2To3)
                            context_draw.quadraticCurveTo(xc + i, canvas_draw.height - yc - i, this.x1 + i, canvas_draw.height - this.y1 - i);
                        context_draw.stroke();
                        context_draw.closePath();
                    }
                    
                    // draw center symmetric
                    if (symmetry == "center"
                     || symmetry == "horizontal_vertical")
                    {
                        context_draw.beginPath();
                        context_draw.moveTo(canvas_draw.width - this.x0 - i, canvas_draw.height - this.y0 - i);
                        if (drawPoints1To2)
                            context_draw.lineTo(canvas_draw.width - this.xCurr - i, canvas_draw.height - this.yCurr - i);
                        else if (drawPoints2To3)
                            context_draw.quadraticCurveTo(canvas_draw.width - xc - i, canvas_draw.height - yc - i, canvas_draw.width - this.x1 - i, canvas_draw.height - this.y1 - i);
                        context_draw.stroke();
                        context_draw.closePath();
                    }
                }
                    
                //console.log("Moved: " + ev.x + "," + ev.y + " - " + this.x0 + "," + this.y0);
                this.hasMoved = true;
            },

            mouseup(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    this.hasClicked = false;
                    //console.log("this.nbPointsClicked = " + this.nbPointsClicked + " , " + this.hasMoved);

                    [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                    switch(this.nbPointsClicked)
                    {
                        case 0:
                            if (this.hasMoved)
                            {
                                this.x1 = this.xCurr;
                                this.y1 = this.yCurr;
                                this.nbPointsClicked = 2;
                            }
                            else
                                this.nbPointsClicked = 1;
                            break;
                            
                        case 1:
                            this.nbPointsClicked = 2;
                            break;
                        
                        case 2:	// arc finished
                            img_update();
                            this.nbPointsClicked = 0;
                            break;
                    }
                    
                    this.hasMoved = false;
                }
            },
        
            mouseout(ev: MouseEvent): void
            {
                if (!this.hasClicked && this.nbPointsClicked == 0)
                    context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },

            dblclick(ev: MouseEvent): void{},
        
            cancel(): void
            {
                this.hasClicked = false;
                this.hasMoved = false;
                this.nbPointsClicked = 0;
                context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            },
        });
        
    
        ///////////////////////////////// FILL TOOL /////////////////////////////////
        
        tools.set("fill",
        {
            xCurr: -1, yCurr: -1,
            xPrev: -1, yPrev: -1,
            x0: -1, y0: -1,
            index_cycle: 0,

            hasClicked: false, hasMoved: false,
            hasDrawnCursor: false,
            hasPoint0: false, nbPointsClicked: 0,
            points: [],

            mousedown(ev: MouseEvent): void
            {		
                this.hasClicked = true;
            },

            mousemove(ev: MouseEvent): void
            {
                [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                cursorDrawFill(context_draw, canvas_draw, this.xCurr, this.yCurr, forecolor);
                
                // TODO: handle mirroring?
            },

            mouseup(ev: MouseEvent): void
            {
                if (this.hasClicked)
                {
                    this.hasClicked = false;
                    [this.xCurr, this.yCurr] = compute_coords(ev.x, ev.y);
                    imgFill4(context_img, canvas_img, this.xCurr, this.yCurr, forecolor);
                }
            },
        
            mouseout(ev: MouseEvent): void{},

            dblclick(ev: MouseEvent): void{},
            
            cancel(): void{}
        });
        
        init();
        
        
        /////////////////////////////// IMAGE FUNCTIONS /////////////////////////////
        
        // draws the #imageTemp canvas on top of #imageView, and clears #imageTemp.
        // called each time when the user completes a drawing operation.
        function img_update()
        {
            context_img.drawImage(canvas_draw, 0, 0);
            context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
            is_cleared = false;
        }
        
        // execute a color cycle step
        function img_color_cycle_step()
        {
            var dateStart = new Date();
            var timeStart = dateStart.getTime();

            var imgd = context_img.getImageData(0, 0, canvas_img.width, canvas_img.height);
            var pix = imgd.data;
            var pix_cycle = new Uint8ClampedArray(imgd.data);
            
            var w = canvas_img.width;
            var h = canvas_img.height;
            var nbColors = forecolor_cycle.length;
            for (var x = 0; x < w; x++)
            {
                for (var y = 0; y < h; y++)
                {
                    for (var i = 0; i < nbColors; i++)
                    {
                        if (pixelHasColor(pix, w, x, y, forecolor_cycle[i]))
                            pixelSetColor(pix_cycle, w, x, y, forecolor_cycle[(i + 1) % nbColors]);
                    }
                }
            }
            
            imgd.data.set(pix_cycle);
            context_img.putImageData(imgd, 0, 0);
            
            var dateEnd = new Date();
            var timeEnd = dateEnd.getTime();
            //console.log((timeEnd - timeStart) + " ms" + " , color = " + (9 % nbColors));
        }

    }, false);

}


////////////////////////////////// TOOL CLASSES ///////////////////////////////
