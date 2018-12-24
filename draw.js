/* © 2009 ROBO Design
 * http://www.robodesign.ro
 */

// Keep everything in anonymous function, called on window load.
if(window.addEventListener) {
window.addEventListener('load', function ()
{
  ///////////////////////////////// PARAMETERS ////////////////////////////////

  var canvas_img, context_img;		// image
  var canvas_draw, context_draw;	// drawing tool
  //var canvas_cur, context_cur;		// cursor
  
  // active tool instance
  var tool;
  var tool_default = 'pencil';
  
  // active symmetry
  var symmetry;
  var symmetry_default = 'horizontal_vertical';
  
  // cursor parameters
  var cursorsize;
  var cursorsize_default = 20;
  
  // active colors
  var forecolor, backcolor;
  var forecolor_default = '#880088';
  var backcolor_default = '#ffffff';
  var forecolor_cycle = new Array();
  forecolor_cycle = [hex2rgb(forecolor_default), hex2rgb('#992299'), hex2rgb('#aa44aa'), hex2rgb('#bb66bb'), hex2rgb('#cc88cc'), hex2rgb('#ddaadd'), hex2rgb('#eeccee'), hex2rgb('#ffeeff')];
  
  var color_cycle_active = false;
  var color_cycle_timer;
  
  // image cleared boolean
  var is_cleared = true;
  
  // grid parameters
  var use_grid = false;
  var size_grid = 20;

  function init ()
  {
    // find the canvas element
    canvas_img = document.getElementById('imageView');
    if (!canvas_img) {
      alert('Error: I cannot find the canvas element!');
      return;
    }

    if (!canvas_img.getContext) {
      alert('Error: no canvas_draw.getContext!');
      return;
    }

    // get the 2D canvas context
    context_img = canvas_img.getContext('2d');
    if (!context_img) {
      alert('Error: failed to getContext!');
      return;
    }

    // create the temporary drawing tool canvas
	
    var container = canvas_img.parentNode;
    canvas_draw = document.createElement('canvas');
    if (!canvas_draw) {
      alert('Error: I cannot create a new canvas element!');
      return;
    }

    canvas_draw.id     = 'imageTemp';
    canvas_draw.width  = canvas_img.width;
    canvas_draw.height = canvas_img.height;
    container.appendChild(canvas_draw);
	
    context_draw = canvas_draw.getContext('2d');
	
	
	// interface elements
	
	// bind event handler to clear button
	var clear_button = document.getElementById('clear');
    if (!clear_button) {
      alert('Error: failed to get the clear element!');
      return;
    }
	clear_button.addEventListener('click', ev_clear, false);
	
    // get the tool select input
    var tool_select = document.getElementById('dtool');
    if (!tool_select) {
      alert('Error: failed to get the dtool element!');
      return;
    }
    tool_select.addEventListener('change', ev_tool_change, false);
	
    // activate the default tool
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }
	
    // get the symmetry select input
    var symmetry_select = document.getElementById('symmetry');
    if (!symmetry_select) {
      alert('Error: failed to get the symmetry element!');
      return;
    }
    symmetry_select.addEventListener('change', ev_symmetry_change, false);
	
	// get the foreground color select input
    var forecolor_select = document.getElementById('forecolorpicker');
    if (!forecolor_select) {
      alert('Error: failed to get the forecolorpicker element!');
      return;
    }
    forecolor_select.addEventListener('change', ev_forecolor_change, false);
	
	// get the background color select input
    var backcolor_select = document.getElementById('backcolorpicker');
    if (!backcolor_select) {
      alert('Error: failed to get the backcolorpicker element!');
      return;
    }
    backcolor_select.addEventListener('change', ev_backcolor_change, false);
	
	// get the cursor size select input
    var cursorsize_select = document.getElementById('cursorsizerange');
    if (!cursorsize_select) {
      alert('Error: failed to get the cursorsizerange element!');
      return;
    }
    cursorsize_select.addEventListener('change', ev_cursorsize_change, false);
	
	var button_download = document.getElementById('buttondownload');
	button_download.addEventListener('click', function (e)
	{
		var dataURL = canvas_img.toDataURL('image/png');
		button_download.href = dataURL;
	});
	
	// activate default values
	symmetry = symmetry_default;
    symmetry_select.value = symmetry_default;
	forecolor = forecolor_default;
	forecolor_select.value = forecolor_default;
	backcolor = backcolor_default;
	backcolor_select.value = backcolor_default;
	ev_clear(canvas_img);
	cursorsize = cursorsize_default;
	cursorsize_select.value = cursorsize_default;

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
  function ev_canvas(ev)
  {
	// determine mouse position relative to the canvas element
    if (ev.layerX || ev.layerX == 0)	// Firefox
	{
      ev._x = ev.layerX;
      ev._y = ev.layerY;
    }
	else if (ev.offsetX || ev.offsetX == 0)	// Opera
	{
      ev._x = ev.offsetX;
      ev._y = ev.offsetY;
    }

    // call the corresponding event handler of the tool
    var func = tool[ev.type];
    if (func)
      func(ev);
  }
  
  // clear image
  function ev_clear(ev)
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
	var func = tool["clear"];
    if (func)
      func(ev);
  }

  // tool selector callback
  function ev_tool_change(ev)
  {
    if (tools[this.value])
      tool = new tools[this.value]();
  }
  
  // symmetry selector callback
  function ev_symmetry_change(ev)
  {
      symmetry = this.value;
	  //alert('symmetry = ' + symmetry);
  }
  
  function ev_forecolor_change(colorValue)
  {
	forecolor = this.value;
     //alert(this.value);
  }
  
  function ev_backcolor_change(colorValue)
  {
	backcolor = this.value;
    //alert(this.value);
	
	if (is_cleared)
		ev_clear(canvas_draw);
  }
  
  function ev_cursorsize_change(colorValue)
  {
	cursorsize = this.value;
    //alert(this.value);
  }

  
  ////////////////////////////////// KEY EVENTS ///////////////////////////////
  
  function on_keydown(ev)
  {
	//alert(ev.keyCode)
	switch(ev.keyCode)
	{
		case 8:	// BACKSPACE
			// calls the corresponding clear tool function
			var func = tool["clear"];
			// TODO: handle tool.hasClicked
			if (func /*&& hasClicked*/)
			  func(ev);
			break;
		case 16:	// SHIFT keys
			use_grid = true;
			break;
		case 17:	// CTRL keys
			//use_slow = true;
			break;
		case 27:	// ESC
			// clear image
			ev_clear(canvas_draw);
			break;
		//case 70:	// 'F'
		//	// fill image test
		//	img_fill4(100, 100);
		//	break;
		case 78:	// 'N'
			// negative image test
			img_invert();
			break;
		case 65:	// 'A'
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
  
  function on_keyup(ev)
  {
	//alert(ev.keyCode)
	use_grid = false;
	//use_slow = false;
  }
    
  // computes mouse coordinates given grid parameters
  function compute_coords(x, y)
  {
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
  var tools = {};
  
  var symmetries = {};

  
  ///////////////////////////////// PENCIL TOOL ///////////////////////////////
  
  tools.pencil = function ()
  {
    var tool = this;
	var index_cycle = 0;

    this.mousedown = function (ev)
	{
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);
		
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	
		context_draw.strokeStyle = forecolor;
		context_draw.fillStyle = forecolor;
		xPrev = xCurr;
		yPrev = yCurr;
        tool.hasClicked = true;
		
		// draw cursor
		draw_cursor(xCurr, yCurr, true /*stroke*/);
		tool.hasDrawedCursor = true;
    };

    this.mousemove = function (ev)
	{
	  // TODO: handle borders
	  
	  [xCurr, yCurr] = compute_coords(ev._x, ev._y);
	  
	  /*
	  // color animation cycle
	  context_draw.strokeStyle = rgb2hex(forecolor_cycle[index_cycle]);
	  context_draw.fillStyle = rgb2hex(forecolor_cycle[index_cycle]);
	  index_cycle++;
	  if (index_cycle == forecolor_cycle.length)
		index_cycle = 0;
	  */
	  
	  // show cursor
	  if (!tool.hasClicked)
	  {
		draw_cursor(xCurr, yCurr);
		return;
	  }
	  else
	  {
		// remove cursor draw at first move
		if (tool.hasDrawedCursor)
		if (!(xPrev == xCurr && yPrev == yCurr))
		{
			context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
			tool.hasDrawedCursor = false;
		}
	  
		// draw
		// TODO: handle invert diagonal lines for diagonal cursor
		for (i = -cursorsize/2; i <= cursorsize/2; i++)
		{
			// mouse position
			context_draw.beginPath();
			context_draw.moveTo(xPrev + i, yPrev + i);
			context_draw.lineTo(xCurr + i, yCurr + i);
			context_draw.stroke();
			context_draw.closePath();
			//drawLineNoAliasing(context_draw, xPrev + i, yPrev + i, xCurr + i, yCurr + i);
			//drawLineNoAliasing(context_draw, xPrev + i + 1, yPrev + i, xCurr + i + 1, yCurr + i);
		
			// draw x symmetric
			if (symmetry == "vertical"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(canvas_draw.width - xPrev - i, yPrev + i);
				context_draw.lineTo(canvas_draw.width - xCurr - i, yCurr + i);
				context_draw.stroke();
				context_draw.closePath();
			}
			
			// draw y symmetric
			if (symmetry == "horizontal"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(xPrev + i, canvas_draw.height - yPrev - i);
				context_draw.lineTo(xCurr + i, canvas_draw.height - yCurr - i);
				context_draw.stroke();
				context_draw.closePath();
			}
			
			// draw center symmetric
			if (symmetry == "center"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(canvas_draw.width - xPrev - i, canvas_draw.height - yPrev - i);
				context_draw.lineTo(canvas_draw.width - xCurr - i, canvas_draw.height - yCurr - i);
				context_draw.stroke();
				context_draw.closePath();
			}
		}
		
		xPrev = xCurr;
		yPrev = yCurr;
      }
    };

    this.mouseup = function (ev)
	{
		if (tool.hasClicked)
		{
			//tool.mousemove(ev);
			tool.hasClicked = false;
			tool.hasDrawedCursor = false;
			img_update();
		}
    };
	
	this.mouseout = function (ev)
	{
      if (tool.hasClicked) {
        tool.hasClicked = false;
		tool.hasDrawedCursor = false;
        img_update();
      }
	  else
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    };
		
	this.clear = function (ev)
	{
		tool.hasClicked = false;
		tool.hasDrawedCursor = false;
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	};
  };
  
  
  //////////////////////////////// STIPPLE TOOL ///////////////////////////////
  
  tools.stipple = function ()
  {
    var tool = this;

    this.mousedown = function (ev)
	{
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);
		
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	
		context_draw.fillStyle = forecolor;
        tool.hasClicked = true;
		
		// TODO: stipple at idle
    };

    this.mousemove = function (ev)
	{
	  // TODO: handle borders
	  
	  [xCurr, yCurr] = compute_coords(ev._x, ev._y);
	  
	  // show cursor
	  if (!tool.hasClicked)
	  {
		draw_stipple_cursor(xCurr, yCurr);
		return;
	  }
	  else
	  {	  
		// draw
		//nbPoints = cursorsize/2;
		nbPoints = Math.round(1 + Math.random() * cursorsize);
		for (i = 0; i < nbPoints; i++)
		{
			// compute a random delta for position
			dist = Math.round(Math.random() * cursorsize/2);
			angle = Math.random() * 2 * Math.PI;
			xRand = xCurr + dist*Math.cos(angle);
			yRand = yCurr + dist*Math.sin(angle);
		
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
    };

    this.mouseup = function (ev)
	{
      if (tool.hasClicked)
	  {
        //tool.mousemove(ev);
        tool.hasClicked = false;
		tool.hasDrawedCursor = false;
        img_update();
      }
    };
	
	this.mouseout = function (ev)
	{
      if (tool.hasClicked) {
        tool.hasClicked = false;
		tool.hasDrawedCursor = false;
        img_update();
      }
	  else
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    };
		
	this.clear = function (ev)
	{
		tool.hasClicked = false;
		tool.hasDrawedCursor = false;
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	};
  };

  ////////////////////////////////// LINE TOOL ////////////////////////////////
  
  tools.line = function () {
  
    var tool = this;
	tool.hasPoint0 = false;

    this.mousedown = function (ev)
	{
		context_draw.strokeStyle = forecolor;
		if (!tool.hasPoint0)
		{
			[xCurr, yCurr] = compute_coords(ev._x, ev._y);
			tool.x0 = xCurr;
			tool.y0 = yCurr;
		}
		tool.hasClicked = true;
    };

    this.mousemove = function (ev)
	{
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);
	
		// show cursor if no click and origin point not set
		if (!tool.hasClicked && !tool.hasPoint0)
		{
			draw_cursor(xCurr, yCurr);
			return;
		}
		
		// nop if no move
		if (tool.x0 == xCurr && tool.y0 == yCurr)
			return;
			
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

		for (i = -cursorsize/2; i <= cursorsize/2; i++)
		{	
			// mouse position
			context_draw.beginPath();
			context_draw.moveTo(tool.x0 + i, tool.y0 + i);
			context_draw.lineTo(xCurr + i,   yCurr + i);
			context_draw.stroke();
			context_draw.closePath();
			
			// draw x symmetric
			if (symmetry == "vertical"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(canvas_draw.width - tool.x0 - i, tool.y0 + i);
				context_draw.lineTo(canvas_draw.width - xCurr - i,   yCurr + i);
				context_draw.stroke();
				context_draw.closePath();
			}
			
			// draw y symmetric
			if (symmetry == "horizontal"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(tool.x0 + i, canvas_draw.height - tool.y0 - i);
				context_draw.lineTo(xCurr + i,   canvas_draw.height - yCurr - i);
				context_draw.stroke();
				context_draw.closePath();
			}
			
			// draw center symmetric
			if (symmetry == "center"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(canvas_draw.width - tool.x0 - i, canvas_draw.height - tool.y0 - i);
				context_draw.lineTo(canvas_draw.width - xCurr - i,   canvas_draw.height - yCurr - i);
				context_draw.stroke();
				context_draw.closePath();
			}
		}
		  
		//alert("Moved: " + ev._x + "," + ev._y + " - " + tool.x0 + "," + tool.y0);
		tool.hasMoved = true;
    };

    this.mouseup = function (ev)
	{
		if (tool.hasClicked)
		{
			tool.hasClicked = false;
		
			if (tool.hasPoint0 || tool.hasMoved)
			{
				img_update();
				tool.hasPoint0 = false;
				tool.hasMoved = false;
				//alert("Moved or Point 0");
			}
			else
			{
				tool.hasPoint0 = true;
				tool.hasMoved = false;
				//alert("Point 0 set");
			}
		}
    };
	
	this.mouseout = function (ev)
	{
      if (!tool.hasClicked && !tool.hasPoint0)
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    };
	
	this.clear = function (ev)
	{
		//alert("clear line tool");
		tool.hasClicked = false;
		tool.hasMoved = false;
		tool.hasPoint0 = false;
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	};
  };
  
  
  ///////////////////////////////// K-LINE TOOL ///////////////////////////////
  
  tools.k_line = function () {
  
    var tool = this;
	tool.hasClicked = false;
	tool.points = new Array();

    this.mousedown = function (ev)
	{
		context_draw.strokeStyle = forecolor;
		//if (!tool.hasPoint0)
		{
			[xCurr, yCurr] = compute_coords(ev._x, ev._y);
			tool.points.push([xCurr, yCurr]);
		}
		tool.hasClicked = true;
    };

    this.mousemove = function (ev)
	{
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);
	
		// show cursor if no click and no point set
		if (!tool.hasClicked && tool.points.length == 0)
		{
			draw_cursor(xCurr, yCurr);
			return;
		}
		
		// TODO: nop if no move
		//if (tool.x0 == xCurr && tool.y0 == yCurr)
		//	return;
			
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

		[x0, y0] = tool.points[0];
		nbPoints = tool.points.length;
		for (i = -cursorsize/2; i <= cursorsize/2; i++)
		{	
			// mouse position
			context_draw.beginPath();
			context_draw.moveTo(x0 + i, y0 + i); // first point
			for (var j = 1; j < nbPoints; j++)
			{
				[xj, yj] = tool.points[j];
				context_draw.lineTo(xj + i, yj + i); // 2nd to (n-1)th point(s)
			}
			context_draw.lineTo(xCurr + i, yCurr + i); // last point = current point
			context_draw.stroke();
			//closePath();
			
			// draw x symmetric
			if (symmetry == "vertical"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(canvas_draw.width - x0 - i, y0 + i); // first point
				for (var j = 1; j < nbPoints; j++)
				{
					[xj, yj] = tool.points[j];
					context_draw.lineTo(canvas_draw.width - xj - i, yj + i); // 2nd to (n-1)th point(s)
				}
				context_draw.lineTo(canvas_draw.width - xCurr - i, yCurr + i); // last point = current point
				context_draw.stroke();
			}
			
			// draw y symmetric
			if (symmetry == "horizontal"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(x0 + i, canvas_draw.height - y0 - i); // first point
				for (var j = 1; j < nbPoints; j++)
				{
					[xj, yj] = tool.points[j];
					context_draw.lineTo(xj + i, canvas_draw.height - yj - i); // 2nd to (n-1)th point(s)
				}
				context_draw.lineTo(xCurr + i, canvas_draw.height - yCurr - i); // last point = current point
				context_draw.stroke();
			}
			
			// draw center symmetric
			if (symmetry == "center"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(canvas_draw.width - x0 - i, canvas_draw.height - y0 - i); // first point
				for (var j = 1; j < nbPoints; j++)
				{
					[xj, yj] = tool.points[j];
					context_draw.lineTo(canvas_draw.width - xj - i, canvas_draw.height - yj - i); // 2nd to (n-1)th
				}
				context_draw.lineTo(canvas_draw.width - xCurr - i, canvas_draw.height - yCurr - i); // last point = current point
				context_draw.stroke();
			}
		}
		  
		//alert("Moved: " + ev._x + "," + ev._y + " - " + tool.x0 + "," + tool.y0);
		tool.hasMoved = true;
    };

    this.mouseup = function (ev)
	{
		if (tool.hasClicked)
		{
			/*tool.hasClicked = false;
		
			if (tool.hasPoint0 || tool.hasMoved)
			{
				img_update();
				tool.hasPoint0 = false;
				tool.hasMoved = false;
				//alert("Moved or Point 0");
			}
			else
			{
				tool.hasPoint0 = true;
				tool.hasMoved = false;
				//alert("Point 0 set");
			}*/
		}
    };
	
	this.dblclick = function (ev)
	{
		if (tool.hasClicked)
		{
			img_update();
			tool.hasClicked = false;
			tool.hasMoved = false;
			tool.points = new Array();
			//alert("Moved or Point 0");
		}
	}
	
	this.mouseout = function (ev)
	{
      if (!tool.hasClicked && tool.points.length == 0)
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    };
	
	this.clear = function (ev)
	{
		//alert("clear k-line tool");
		tool.hasClicked = false;
		tool.hasMoved = false;
		tool.points = new Array();
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	};
  };
  
  
  ////////////////////////////////// RAYS TOOL ////////////////////////////////
  
  tools.rays = function ()
  {
    var tool = this;
	tool.hasClicked = false;
	tool.points = new Array();

    this.mousedown = function (ev)
	{
		context_draw.strokeStyle = forecolor;
		//if (!tool.hasPoint0)
		{
			[xCurr, yCurr] = compute_coords(ev._x, ev._y);
			tool.points.push([xCurr, yCurr]);
		}
		tool.hasClicked = true;
    };

    this.mousemove = function (ev)
	{
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);
	
		// show cursor if no click and no point set
		if (!tool.hasClicked && tool.points.length == 0)
		{
			draw_cursor(xCurr, yCurr);
			return;
		}
		
		// TODO: nop if no move
		//if (tool.x0 == xCurr && tool.y0 == yCurr)
		//	return;
			
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

		[x0, y0] = tool.points[0];
		nbPoints = tool.points.length;
		for (i = -cursorsize/2; i <= cursorsize/2; i++)
		{	
			// mouse position
			context_draw.beginPath();
			context_draw.moveTo(x0 + i, y0 + i); // origin point
			for (var j = 1; j < nbPoints; j++ )
			{
				[xj, yj] = tool.points[j];
				context_draw.lineTo(xj + i, yj + i); // 1st to (n-1)th point(s)
				context_draw.moveTo(x0 + i, y0 + i); // back to origin point
			}
			context_draw.lineTo(xCurr + i, yCurr + i); // last point = current point
			context_draw.stroke();
			//closePath();
			
			// draw x symmetric
			if (symmetry == "vertical"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(canvas_draw.width - x0 - i, y0 + i); // origin point
				for (var j = 1; j < nbPoints; j++ )
				{
					[xj, yj] = tool.points[j];
					context_draw.lineTo(canvas_draw.width - xj - i, yj + i); // 1st to (n-1)th point(s)
					context_draw.moveTo(canvas_draw.width - x0 - i, y0 + i); // back to origin point
				}
				context_draw.lineTo(canvas_draw.width - xCurr - i, yCurr + i); // last point = current point
				context_draw.stroke();
			}
			
			// draw y symmetric
			if (symmetry == "horizontal"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(x0 + i, canvas_draw.height - y0 - i); // origin point
				for (var j = 1; j < nbPoints; j++ )
				{
					[xj, yj] = tool.points[j];
					context_draw.lineTo(xj + i, canvas_draw.height - yj - i); // 1st to (n-1)th point(s)
					context_draw.moveTo(x0 + i, canvas_draw.height - y0 - i); // back to origin point
				}
				context_draw.lineTo(xCurr + i, canvas_draw.height - yCurr - i); // last point = current point
				context_draw.stroke();
			}
			
			// draw center symmetric
			if (symmetry == "center"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(canvas_draw.width - x0 - i, canvas_draw.height - y0 - i); // origin point
				for (var j = 1; j < nbPoints; j++ )
				{
					[xj, yj] = tool.points[j];
					context_draw.lineTo(canvas_draw.width - xj - i, canvas_draw.height - yj - i); // 1st to (n-1)th
					context_draw.moveTo(canvas_draw.width - x0 - i, canvas_draw.height - y0 - i); // back to origin point
				}
				context_draw.lineTo(canvas_draw.width - xCurr - i, canvas_draw.height - yCurr - i); // last point = current point
				context_draw.stroke();
			}
		}
		  
		//alert("Moved: " + ev._x + "," + ev._y + " - " + tool.x0 + "," + tool.y0);
		tool.hasMoved = true;
    };

    this.mouseup = function (ev)
	{
		if (tool.hasClicked)
		{
			/*tool.hasClicked = false;
		
			if (tool.hasPoint0 || tool.hasMoved)
			{
				img_update();
				tool.hasPoint0 = false;
				tool.hasMoved = false;
				//alert("Moved or Point 0");
			}
			else
			{
				tool.hasPoint0 = true;
				tool.hasMoved = false;
				//alert("Point 0 set");
			}*/
		}
    };
	
	this.dblclick = function (ev)
	{
		if (tool.hasClicked)
		{
			img_update();
			tool.hasClicked = false;
			tool.hasMoved = false;
			tool.points = new Array();
			//alert("Moved or Point 0");
		}
	}
	
	this.mouseout = function (ev)
	{
      if (!tool.hasClicked && tool.points.length == 0)
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    };
	
	this.clear = function (ev)
	{
		//alert("clear k-line tool");
		tool.hasClicked = false;
		tool.hasMoved = false;
		tool.points = new Array();
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	};
  };
  
  
  /////////////////////////////// RECTANGLE TOOL //////////////////////////////
  
  tools.rectangle = function ()
  {
    var tool = this;
	tool.hasClicked = false;
	tool.hasMoved = false;
	tool.hasPoint0 = false;

    this.mousedown = function (ev)
	{
		context_draw.strokeStyle = forecolor;
		if (!tool.hasPoint0)
		{
			[xCurr, yCurr] = compute_coords(ev._x, ev._y);
			tool.x0 = xCurr;
			tool.y0 = yCurr;
		}
		tool.hasClicked = true;
    };

    this.mousemove = function (ev)
	{
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);
	
		// show cursor if no click and origin point not set
		if (!tool.hasClicked && !tool.hasPoint0)
		{
			draw_cursor(xCurr, yCurr);
			return;
		}
		
		// nop if no move
		if (tool.x0 == xCurr && tool.y0 == yCurr)
			return;

		var x = Math.min(xCurr,  tool.x0),
			y = Math.min(yCurr,  tool.y0),
			w = Math.abs(xCurr - tool.x0),
			h = Math.abs(yCurr - tool.y0),
			xs = Math.min(canvas_draw.width  - xCurr,  canvas_draw.width  - tool.x0),
			ys = Math.min(canvas_draw.height - yCurr,  canvas_draw.height - tool.y0);

		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

		if (!w || !h)
			return;
		
		for (i = -cursorsize/2; i <= cursorsize/2; i++)
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
		
		//alert("Moved: " + ev._x + "," + ev._y + " - " + tool.x0 + "," + tool.y0);
		tool.hasMoved = true;
    };

    this.mouseup = function (ev)
	{
		if (tool.hasClicked)
		{
			tool.hasClicked = false;
		
			if (tool.hasPoint0 || tool.hasMoved)
			{
				img_update();
				tool.hasPoint0 = false;
				tool.hasMoved = false;
				//alert("Moved or Point 0");
			}
			else
			{
				tool.hasPoint0 = true;
				//alert("Point 0 set");
			}
		}
    };
	
	this.mouseout = function (ev)
	{
      if (!tool.hasClicked && !tool.hasPoint0)
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    };
	
	this.clear = function (ev)
	{
		tool.hasClicked = false;
		tool.hasMoved = false;
		tool.hasPoint0 = false;
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	};
  };

  
  ////////////////////////////////// BOX TOOL /////////////////////////////////
  
  tools.box = function ()
  {
    var tool = this;
	tool.hasClicked = false;
	tool.hasMoved = false;
	tool.hasPoint0 = false;

    this.mousedown = function (ev)
	{
		context_draw.fillStyle = forecolor;
		if (!tool.hasPoint0)
		{
			[xCurr, yCurr] = compute_coords(ev._x, ev._y);
			tool.x0 = xCurr;
			tool.y0 = yCurr;
		}
		tool.hasClicked = true;
    };

    this.mousemove = function (ev)
	{
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);
	
		// show cursor if no click and origin point not set
		if (!tool.hasClicked && !tool.hasPoint0)
		{
			draw_cursor(xCurr, yCurr);
			return;
		}
		
		// nop if no move
		if (tool.x0 == xCurr && tool.y0 == yCurr)
			return;

		var x = Math.min(xCurr,  tool.x0),
			y = Math.min(yCurr,  tool.y0),
			w = Math.abs(xCurr - tool.x0),
			h = Math.abs(yCurr - tool.y0),
			xs = Math.min(canvas_draw.width  - xCurr,  canvas_draw.width  - tool.x0),
			ys = Math.min(canvas_draw.height - yCurr,  canvas_draw.height - tool.y0);

		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

		if (!w || !h)
			return;
		
		for (i = -cursorsize/2; i <= cursorsize/2; i++)
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
		
		//alert("Moved: " + ev._x + "," + ev._y + " - " + tool.x0 + "," + tool.y0);
		tool.hasMoved = true;
    };

    this.mouseup = function (ev)
	{
		if (tool.hasClicked)
		{
			tool.hasClicked = false;
		
			if (tool.hasPoint0 || tool.hasMoved)
			{
				img_update();
				tool.hasPoint0 = false;
				tool.hasMoved = false;
				//alert("Moved or Point 0");
			}
			else
			{
				tool.hasPoint0 = true;
				//alert("Point 0 set");
			}
		}
    };
	
	this.mouseout = function (ev)
	{
      if (!tool.hasClicked && !tool.hasPoint0)
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    };
	
	this.clear = function (ev)
	{
		tool.hasClicked = false;
		tool.hasMoved = false;
		tool.hasPoint0 = false;
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	};
  };
  
  
  ///////////////////////////////// POLYGON TOOL //////////////////////////////
  
  tools.polygon = function ()
  {
    var tool = this;
	tool.hasClicked = false;
	tool.points = new Array();

    this.mousedown = function (ev)
	{
		context_draw.strokeStyle = forecolor;
		//if (!tool.hasPoint0)
		{
			[xCurr, yCurr] = compute_coords(ev._x, ev._y);
			tool.points.push([xCurr, yCurr]);
		}
		tool.hasClicked = true;
    };

    this.mousemove = function (ev)
	{
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);
	
		// show cursor if no click and no point set
		if (!tool.hasClicked && tool.points.length == 0)
		{
			draw_cursor(xCurr, yCurr);
			return;
		}
		
		// TODO: nop if no move
		//if (tool.x0 == xCurr && tool.y0 == yCurr)
		//	return;
			
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

		[x0, y0] = tool.points[0];
		nbPoints = tool.points.length;
		for (i = -cursorsize/2; i <= cursorsize/2; i++)
		{	
			// mouse position
			context_draw.beginPath();
			context_draw.moveTo(x0 + i, y0 + i); // first point
			for (var j = 1; j < nbPoints; j++ )
			{
				[xj, yj] = tool.points[j];
				context_draw.lineTo(xj + i, yj + i); // 2nd to (n-1)th point(s)
			}
			context_draw.lineTo(xCurr + i, yCurr + i); // last point = current point
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
					[xj, yj] = tool.points[j];
					context_draw.lineTo(canvas_draw.width - xj - i, yj + i); // 2nd to (n-1)th point(s)
				}
				context_draw.lineTo(canvas_draw.width - xCurr - i, yCurr + i); // last point = current point
				context_draw.lineTo(canvas_draw.width - x0 - i, y0 + i); // loop to first point
				context_draw.stroke();
			}
			
			// draw y symmetric
			if (symmetry == "horizontal"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(x0 + i, canvas_draw.height - y0 - i); // first point
				for (var j = 1; j < nbPoints; j++ )
				{
					[xj, yj] = tool.points[j];
					context_draw.lineTo(xj + i, canvas_draw.height - yj - i); // 2nd to (n-1)th point(s)
				}
				context_draw.lineTo(xCurr + i, canvas_draw.height - yCurr - i); // last point = current point
				context_draw.lineTo(x0 + i, canvas_draw.height - y0 - i); // loop to first point
				context_draw.stroke();
			}
			
			// draw center symmetric
			if (symmetry == "center"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(canvas_draw.width - x0 - i, canvas_draw.height - y0 - i); // first point
				for (var j = 1; j < nbPoints; j++ )
				{
					[xj, yj] = tool.points[j];
					context_draw.lineTo(canvas_draw.width - xj - i, canvas_draw.height - yj - i); // 2nd to (n-1)th
				}
				context_draw.lineTo(canvas_draw.width - xCurr - i, canvas_draw.height - yCurr - i); // last point = current point
				context_draw.lineTo(canvas_draw.width - x0 - i, canvas_draw.height - y0 - i); // loop to first point
				context_draw.stroke();
			}
		}
		  
		//alert("Moved: " + ev._x + "," + ev._y + " - " + tool.x0 + "," + tool.y0);
		tool.hasMoved = true;
    };

    this.mouseup = function (ev)
	{
		if (tool.hasClicked)
		{
			/*tool.hasClicked = false;
		
			if (tool.hasPoint0 || tool.hasMoved)
			{
				img_update();
				tool.hasPoint0 = false;
				tool.hasMoved = false;
				//alert("Moved or Point 0");
			}
			else
			{
				tool.hasPoint0 = true;
				tool.hasMoved = false;
				//alert("Point 0 set");
			}*/
		}
    };
	
	this.dblclick = function (ev)
	{
		if (tool.hasClicked)
		{
			img_update();
			tool.hasClicked = false;
			tool.hasMoved = false;
			tool.points = new Array();
			//alert("Moved or Point 0");
		}
	}
	
	this.mouseout = function (ev)
	{
      if (!tool.hasClicked && tool.points.length == 0)
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    };
	
	this.clear = function (ev)
	{
		//alert("clear k-line tool");
		tool.hasClicked = false;
		tool.hasMoved = false;
		tool.points = new Array();
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	};
  };
  
  
  //////////////////////////////// CIRCLE TOOL ////////////////////////////////
  
  tools.circle = function ()
  {
    var tool = this;
	tool.hasClicked = false;
	tool.hasMoved = false;
	tool.hasPoint0 = false;

    this.mousedown = function (ev)
	{
		context_draw.strokeStyle = forecolor;
		//context_draw.fillStyle = forecolor;
		if (!tool.hasPoint0)
		{
			// circle center
			[xCurr, yCurr] = compute_coords(ev._x, ev._y);
			tool.x0 = xCurr;
			tool.y0 = yCurr;
		}
		tool.hasClicked = true;
    };

    this.mousemove = function (ev)
	{
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);
	
		// show cursor if no click and origin point not set
		if (!tool.hasClicked && !tool.hasPoint0)
		{
			draw_cursor(xCurr, yCurr);
			return;
		}
		
		// nop if no move
		if (tool.x0 == xCurr && tool.y0 == yCurr)
			return;

		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

		var radius = Math.sqrt((tool.x0 - xCurr)*(tool.x0 - xCurr) + (tool.y0 - yCurr)*(tool.y0 - yCurr));
		for (i = -cursorsize/2; i <= cursorsize/2; i++)
		{
			// mouse position
			context_draw.beginPath();
			context_draw.arc(tool.x0 + i, tool.y0 + i, radius, 0, 2 * Math.PI, false);
			context_draw.stroke();
			//context_draw.fill();
			context_draw.closePath();
			
			// draw x symmetric
			if (symmetry == "vertical"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.arc(canvas_draw.width - tool.x0 - i, tool.y0 + i, radius, 0, 2 * Math.PI, false);
				context_draw.stroke();
				context_draw.closePath();
			}
				
			// draw y symmetric
			if (symmetry == "horizontal"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.arc(tool.x0 + i, canvas_draw.height - tool.y0 - i, radius, 0, 2 * Math.PI, false);
				context_draw.stroke();
				context_draw.closePath();
			}
				
			// draw center symmetric
			if (symmetry == "center"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.arc(canvas_draw.width - tool.x0 - i, canvas_draw.height - tool.y0 - i, radius, 0, 2 * Math.PI, false);
				context_draw.stroke();
				context_draw.closePath();
			}
		}
		
		//alert("Moved: " + ev._x + "," + ev._y + " - " + tool.x0 + "," + tool.y0);
		tool.hasMoved = true;
    };

    this.mouseup = function (ev)
	{
		if (tool.hasClicked)
		{
			//alert("Mouse has clicked");
			tool.hasClicked = false;
		
			if (tool.hasPoint0 || tool.hasMoved)
			{
				img_update();
				tool.hasPoint0 = false;
				tool.hasMoved = false;
				//alert("Moved or Point 0");
			}
			else
			{
				tool.hasPoint0 = true;
				//alert("Point 0 set");
			}
		}
    };
	
	this.mouseout = function (ev)
	{
      if (!tool.hasClicked && !tool.hasPoint0)
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    };
	
	this.clear = function (ev)
	{
		tool.hasClicked = false;
		tool.hasMoved = false;
		tool.hasPoint0 = false;
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	};
  };
  
 
  ///////////////////////////////// DISC TOOL /////////////////////////////////
  
  tools.disc = function ()
  {
    var tool = this;
	tool.hasClicked = false;
	tool.hasMoved = false;
	tool.hasPoint0 = false;

    this.mousedown = function (ev)
	{
		context_draw.fillStyle = forecolor;
		if (!tool.hasPoint0)
		{
			// circle center
			[xCurr, yCurr] = compute_coords(ev._x, ev._y);
			tool.x0 = xCurr;
			tool.y0 = yCurr;
		}
		tool.hasClicked = true;
    };

    this.mousemove = function (ev)
	{
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);
	
		// show cursor if no click and origin point not set
		if (!tool.hasClicked && !tool.hasPoint0)
		{
			draw_cursor(xCurr, yCurr);
			return;
		}
		
		// nop if no move
		if (tool.x0 == xCurr && tool.y0 == yCurr)
			return;

		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

		var radius = Math.sqrt((tool.x0 - xCurr)*(tool.x0 - xCurr) + (tool.y0 - yCurr)*(tool.y0 - yCurr));
		for (i = -cursorsize/2; i <= cursorsize/2; i++)
		{
			// mouse position
			context_draw.beginPath();
			context_draw.arc(tool.x0 + i, tool.y0 + i, radius, 0, 2 * Math.PI, false);
			context_draw.fill();
			context_draw.closePath();
			
			// draw x symmetric
			if (symmetry == "vertical"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.arc(canvas_draw.width - tool.x0 - i, tool.y0 + i, radius, 0, 2 * Math.PI, false);
				context_draw.fill();
				context_draw.closePath();
			}
				
			// draw y symmetric
			if (symmetry == "horizontal"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.arc(tool.x0 + i, canvas_draw.height - tool.y0 - i, radius, 0, 2 * Math.PI, false);
				context_draw.fill();
				context_draw.closePath();
			}
				
			// draw center symmetric
			if (symmetry == "center"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.arc(canvas_draw.width - tool.x0 - i, canvas_draw.height - tool.y0 - i, radius, 0, 2 * Math.PI, false);
				context_draw.fill();
				context_draw.closePath();
			}
		}
		
		//alert("Moved: " + ev._x + "," + ev._y + " - " + tool.x0 + "," + tool.y0);
		tool.hasMoved = true;
    };

    this.mouseup = function (ev)
	{
		if (tool.hasClicked)
		{
			//alert("Mouse has clicked");
			tool.hasClicked = false;
		
			if (tool.hasPoint0 || tool.hasMoved)
			{
				img_update();
				tool.hasPoint0 = false;
				tool.hasMoved = false;
				//alert("Moved or Point 0");
			}
			else
			{
				tool.hasPoint0 = true;
				//alert("Point 0 set");
			}
		}
    };
	
	this.mouseout = function (ev)
	{
      if (!tool.hasClicked && !tool.hasPoint0)
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    };
	
	this.clear = function (ev)
	{
		tool.hasClicked = false;
		tool.hasMoved = false;
		tool.hasPoint0 = false;
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	};
  };
 
 
  ////////////////////////////////// ARC TOOL /////////////////////////////////
  
  tools.arc = function ()
  {
    var tool = this;
    tool.hasClicked = false;
	tool.hasMoved = false;
	tool.nbPointsClicked = 0;

    this.mousedown = function (ev)
	{
		context_draw.strokeStyle = forecolor;
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);
		switch(tool.nbPointsClicked)
		{
			case 0:
				tool.x0 = xCurr;
				tool.y0 = yCurr;
				break;
			case 1:
				tool.x1 = xCurr;
				tool.y1 = yCurr;
				break;
		}
		
		tool.hasClicked = true;
    };

    this.mousemove = function (ev)
	{
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);

		// show cursor if no click and first point not set
		if (!tool.hasClicked && tool.nbPointsClicked == 0)
		{
			draw_cursor(xCurr, yCurr);
			return;
		}
		
		// nop if no move
		if (tool.nbPointsClicked == 0 && tool.x0 == xCurr && tool.y0 == yCurr)
			return;
		if (tool.nbPointsClicked == 1 && tool.x1 == xCurr && tool.y1 == yCurr)
			return;
			
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);

		// extrapolate control point
		var xmid = (tool.x0 + tool.x1) / 2;	// middle between point 0 and point 1
		var ymid = (tool.y0 + tool.y1) / 2;
		var xc = xmid + 2*(xCurr - xmid);	// quadratic curve control point:
		var yc = ymid + 2*(yCurr - ymid);
		
		var drawPoints1To2 = (tool.nbPointsClicked == 1) || (tool.nbPointsClicked == 0 && tool.hasMoved);
		var drawPoints2To3 = (tool.nbPointsClicked == 2) || (tool.nbPointsClicked == 1 && tool.hasMoved);
		
		for (i = -cursorsize/2; i <= cursorsize/2; i++)
		{	
			// mouse position
			context_draw.beginPath();
			context_draw.moveTo(tool.x0 + i, tool.y0 + i);
			if (drawPoints1To2)
				context_draw.lineTo(xCurr + i, yCurr + i);
			else if (drawPoints2To3)
				context_draw.quadraticCurveTo(xc, yc, tool.x1 + i, tool.y1 + i);
			context_draw.stroke();
			context_draw.closePath();
			
			// draw x symmetric
			if (symmetry == "vertical"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(canvas_draw.width - tool.x0 - i, tool.y0 + i);
				if (drawPoints1To2)
					context_draw.lineTo(canvas_draw.width - xCurr - i, yCurr + i);
				else if (drawPoints2To3)
					context_draw.quadraticCurveTo(canvas_draw.width - xc - i, yc + i, canvas_draw.width - tool.x1 - i, tool.y1 + i);
				context_draw.stroke();
				context_draw.closePath();
			}
			
			// draw y symmetric
			if (symmetry == "horizontal"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(tool.x0 + i, canvas_draw.height - tool.y0 - i);
				if (drawPoints1To2)
					context_draw.lineTo(xCurr + i, canvas_draw.height - yCurr - i);
				else if (drawPoints2To3)
					context_draw.quadraticCurveTo(xc + i, canvas_draw.height - yc - i, tool.x1 + i, canvas_draw.height - tool.y1 - i);
				context_draw.stroke();
				context_draw.closePath();
			}
			
			// draw center symmetric
			if (symmetry == "center"
			 || symmetry == "horizontal_vertical")
			{
				context_draw.beginPath();
				context_draw.moveTo(canvas_draw.width - tool.x0 - i, canvas_draw.height - tool.y0 - i);
				if (drawPoints1To2)
					context_draw.lineTo(canvas_draw.width - xCurr - i, canvas_draw.height - yCurr - i);
				else if (drawPoints2To3)
					context_draw.quadraticCurveTo(canvas_draw.width - xc - i, canvas_draw.height - yc - i, canvas_draw.width - tool.x1 - i, canvas_draw.height - tool.y1 - i);
				context_draw.stroke();
				context_draw.closePath();
			}
		}
		  
		//alert("Moved: " + ev._x + "," + ev._y + " - " + tool.x0 + "," + tool.y0);
		tool.hasMoved = true;
    };

    this.mouseup = function (ev)
	{
		if (tool.hasClicked)
		{
			tool.hasClicked = false;
			//alert("tool.nbPointsClicked = " + tool.nbPointsClicked + " , " + tool.hasMoved);

			[xCurr, yCurr] = compute_coords(ev._x, ev._y);
			switch(tool.nbPointsClicked)
			{
				case 0:
					if (tool.hasMoved)
					{
						tool.x1 = xCurr;
						tool.y1 = yCurr;
						tool.nbPointsClicked = 2;
					}
					else
						tool.nbPointsClicked = 1;
					break;
					
				case 1:
					tool.nbPointsClicked = 2;
					break;
				
				case 2:	// arc finished
					img_update();
					tool.nbPointsClicked = 0;
					break;
			}
			
			tool.hasMoved = false;
		}
    };
	
	this.mouseout = function (ev)
	{
      if (!tool.hasClicked && tool.nbPointsClicked == 0)
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
    };
	
	this.clear = function (ev)
	{
		tool.hasClicked = false;
		tool.hasMoved = false;
		tool.nbPointsClicked = 0;
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	};
  };
  
 
  ///////////////////////////////// FILL TOOL /////////////////////////////////
  
  tools.fill = function ()
  {
    var tool = this;
    tool.hasClicked = false;

    this.mousedown = function (ev)
	{		
		tool.hasClicked = true;
    };

    this.mousemove = function (ev)
	{
		[xCurr, yCurr] = compute_coords(ev._x, ev._y);
		draw_fill_cursor(xCurr, yCurr);
		return;
    };

    this.mouseup = function (ev)
	{
		if (tool.hasClicked)
		{
			tool.hasClicked = false;
			[xCurr, yCurr] = compute_coords(ev._x, ev._y);
			img_fill4(xCurr, yCurr);
		}
    };
	
	this.mouseout = function (ev)
	{
		// nop
	};
	
	this.clear = function (ev)
	{
		// nop
	};
	

  };
  
  
  init();
    
  ///////////////////////////////// CURSOR DRAW ///////////////////////////////
  
  function draw_cursor(xCurr, yCurr, isStroke)
  {
	context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	
	context_draw.strokeStyle = forecolor;
	var symcolor = '#aaaaaa';
	
	// current position
	if (cursorsize == 0 && !isStroke) // specific cursor if hover at size 0
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
		context_draw.moveTo(xCurr - cursorsize/2, yCurr - cursorsize/2);
		context_draw.lineTo(xCurr + cursorsize/2, yCurr + cursorsize/2);
		if (cursorsize == 0)
			context_draw.fillRect(xCurr, yCurr, 1, 1);	
		context_draw.stroke();
		context_draw.closePath();
	}
	
	// draw x symmetric
	if (symmetry == "vertical" || symmetry == "horizontal_vertical")
	{
		if (!isStroke)
			context_draw.strokeStyle = symcolor;
			
		if (cursorsize == 0 && !isStroke) // specific cursor if hover at size 0
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
			context_draw.moveTo(canvas_draw.width - xCurr + cursorsize/2, yCurr - cursorsize/2);
			context_draw.lineTo(canvas_draw.width - xCurr - cursorsize/2, yCurr + cursorsize/2);
			if (cursorsize == 0)
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
			
		if (cursorsize == 0 && !isStroke) // specific cursor if hover at size 0
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
			context_draw.moveTo(xCurr - cursorsize/2, canvas_draw.height - yCurr + cursorsize/2);
			context_draw.lineTo(xCurr + cursorsize/2, canvas_draw.height - yCurr - cursorsize/2);
			if (cursorsize == 0)
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
			
		if (cursorsize == 0 && !isStroke) // specific cursor if hover at size 0
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
			context_draw.moveTo(canvas_draw.width - xCurr + cursorsize/2, canvas_draw.height - yCurr + cursorsize/2);
			context_draw.lineTo(canvas_draw.width - xCurr - cursorsize/2, canvas_draw.height - yCurr - cursorsize/2);
			if (cursorsize == 0)
				context_draw.fillRect(canvas_draw.width - xCurr, canvas_draw.height - yCurr, 1, 1);		
			context_draw.stroke();
			context_draw.closePath();
		}
	}
  }
  
  function draw_stipple_cursor(xCurr, yCurr)
  {
	context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	
	context_draw.strokeStyle = forecolor;
	var symcolor = '#aaaaaa';
	
	// current position
	context_draw.beginPath();
	context_draw.arc(xCurr, yCurr, cursorsize/2, 0, 2 * Math.PI, false);
	if (cursorsize == 0)
		context_draw.fillRect(xCurr, yCurr, 1, 1);	
	context_draw.stroke();
	context_draw.closePath();
	
	// draw x symmetric
	if (symmetry == "vertical" || symmetry == "horizontal_vertical")
	{
		context_draw.strokeStyle = symcolor;
		context_draw.beginPath();
		context_draw.arc(canvas_draw.width - xCurr, yCurr, cursorsize/2, 0, 2 * Math.PI, false);
		if (cursorsize == 0)
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
		context_draw.arc(xCurr, canvas_draw.height - yCurr, cursorsize/2, 0, 2 * Math.PI, false);
		if (cursorsize == 0)
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
		context_draw.arc(canvas_draw.width - xCurr, canvas_draw.height - yCurr, cursorsize/2, 0, 2 * Math.PI, false);
		if (cursorsize == 0)
			context_draw.fillRect(canvas_draw.width - xCurr, canvas_draw.height - yCurr, 1, 1);		
		context_draw.stroke();
		context_draw.closePath();
	}
  }
  
  function draw_fill_cursor(xCurr, yCurr)
  {
	context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
	context_draw.strokeStyle = forecolor;
	
	context_draw.beginPath();
	context_draw.moveTo(xCurr + 1, yCurr); context_draw.lineTo(xCurr + 10, yCurr); context_draw.stroke();
	context_draw.moveTo(xCurr - 1, yCurr); context_draw.lineTo(xCurr - 10, yCurr); context_draw.stroke();
	context_draw.moveTo(xCurr, yCurr + 1); context_draw.lineTo(xCurr, yCurr + 10); context_draw.stroke();
	context_draw.moveTo(xCurr, yCurr - 1); context_draw.lineTo(xCurr, yCurr - 10); context_draw.stroke();
  }
  
  
  /////////////////////////// COLOR & PIXEL FUNCTIONS /////////////////////////
  
  function hex2rgb(hex, opacity)
  {
	var h = hex.replace('#', '');
	h = h.match(new RegExp('(.{'+h.length/3+'})', 'g'));

	for(var i=0; i<h.length; i++)
		h[i] = parseInt((h[i].length == 1) ? h[i]+h[i] : h[i], 16);

	if (typeof opacity != 'undefined')  h.push(opacity);

	//return 'rgba('+h.join(',')+')'; // format: "rgba(r,g,b)"
	return h;
  }
  
  function rgb2hex(rgb)
  {
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
  }

  // return true if pixel (x,y) of image data <pix> with width <w> has color array [r,g,b]
  function hasPixelColor(pix, w, x, y, rgb)
  //function hasPixelColor(pix, w, x, y, r, g, b)
  {
	var [rB, gB, bB] = getPixelColor(pix, w, x, y);
	return (rgb[0] == rB && rgb[1] == gB && rgb[2] == bB);
	//return (r == rB && g == gB && b == bB);
  }
  function hasPixelHexColor(pix, w, x, y, color)
  {
	return hasPixelColor(pix, w, x, y, hex2rgb(color));
  }

  // get color of pixel (x,y) of image data <pix> with width <w>
  function getPixelColor(pix, w, x, y)
  {
	return [ pix[4*(x + w*y)], pix[4*(x + w*y)+1], pix[4*(x + w*y)+2] ];
  }

  // set color array [r,g,b] to pixel (x,y) of image data <pix> with width <w>
  //function setPixelColor(pix, w, x, y, r, g, b)
  function setPixelColor(pix, w, x, y, rgb)
  {
	pix[4*(x + w*y)+0] = rgb[0];
	pix[4*(x + w*y)+1] = rgb[1];
	pix[4*(x + w*y)+2] = rgb[2];
  }
  function setPixelHexColor(pix, w, x, y, color)
  {
	var rgb = hex2rgb(color);
	setPixelColor(pix, w, x, y, rgb);
  }
  
  // draws the #imageTemp canvas on top of #imageView, and clears #imageTemp.
  // called each time when the user completes a drawing operation.
  function img_update()
  {
		context_img.drawImage(canvas_draw, 0, 0);
		context_draw.clearRect(0, 0, canvas_draw.width, canvas_draw.height);
		is_cleared = false;
  }

  // invert image (negative)
  function img_invert()
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
  function img_fill4(x0, y0)
  {
	// get fill color
	var rgbFill = hex2rgb(forecolor);
	//alert("fill color = " + rF + ", " + gF + ", " + bF);

	var imgd = context_img.getImageData(0, 0, canvas_img.width, canvas_img.height);
	var pix = imgd.data;
	
	var pixelsToFill = new Array();
	var w = canvas_img.width;
	var h = canvas_img.height;
	
	// get base color from pixel
	var rgbBase = getPixelColor(pix, w, x0, y0);
	//alert("base color = " + rB + ", " + gB + ", " + bB);
	
	// nop if base color = fill color
	if (rgbBase[0] == rgbFill[0] && rgbBase[1] == rgbFill[1] && rgbBase[2] == rgbFill[2])
		return;
	
	pixelsToFill.push([x0, y0]);
	while (pixelsToFill.length > 0)
	{
		[x, y] = pixelsToFill.pop();
		if (hasPixelColor(pix, w, x, y, rgbBase))
		{
			// list all east to west pixels to fill
			
			xW = x;
			while (xW >= 0 && hasPixelColor(pix, w, xW, y, rgbBase))
				xW--;
			
			xE = x;	
			while (xE < w && hasPixelColor(pix, w, xE, y, rgbBase))
				xE++;
		   
			// fill found east and west pixels and check north and south pixels
			for (var xCur = xW; xCur <= xE; xCur++)
			{
				// fill
				setPixelColor(pix, w, xCur, y, rgbFill);
								
				// check if north pixel must be processed
				yN = y-1;
				if (yN >= 0)
				if (hasPixelColor(pix, w, xCur, yN, rgbBase))
					pixelsToFill.push([xCur, yN]);
					
				// check if south pixel must be processed
				yS = y+1;
				if (yS < h)
				if (hasPixelColor(pix, w, xCur, yS, rgbBase))
					pixelsToFill.push([xCur, yS]);
			}
		}
	}
	
	context_img.putImageData(imgd, 0, 0);
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
				if (hasPixelColor(pix, w, x, y, forecolor_cycle[i]))
					setPixelColor(pix_cycle, w, x, y, forecolor_cycle[(i + 1) % nbColors]);
			}
		}
	}
	
	imgd.data.set(pix_cycle);
	context_img.putImageData(imgd, 0, 0);
	
	var dateEnd = new Date();
	var timeEnd = dateEnd.getTime();
	//alert((timeEnd - timeStart) + " ms" + " , color = " + (9 % nbColors));
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
  

  ////////////////////////////// MATH FUNCTIONS ///////////////////////////////
  
  // computes the distance between points (x1,y1) and (x2,y2)
  function distance(x1, y1, x2, y2)
  {
    return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
  }
  
  // computes the angle of (x,y) on a plane given the origin
  function getAngle(x,y)
  {
	return Math.atan(y / (x==0 ? 0.01 : x)) + (x < 0 ? Math.PI : 0);
  }

  /*
  var person = prompt("Please enter your name", "Harry Potter");

  if (person == null || person == "") {
    txt = "User cancelled the prompt.";
  } else {
    txt = "Hello " + person + "! How are you today?";
  }
  */

}, false); }

// vim:set spell spl=en fo=wan1croql tw=80 ts=2 sw=2 sts=2 sta et ai cin fenc=utf-8 ff=unix:

