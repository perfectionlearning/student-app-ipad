/********************************************************************************
 Creates a graph display with optional input
 The Canvas system has the (x,y) screen coordinate as such that
 the upper-left corner is (0,0)
 the lower-right corner is (w-1,h-1)

 Arguments:
  id
  x, y, w, h

  eq: Array of objects that contains the items to plot.  If empty, no items are plotted.
      [ eq: "", color: "" ]
      eq strings are types followed by parameters:

    point x,y,label

    line m,b

    circle x,y,radius

    ellipse center point x (h), center point y (k), distance from foci 1 (a), distance from foci 2 (b)

    hyperbolaXpos center point x (h), center point y (k), distance from center to vertex on the x origin (a), distance from center to vertex on the y origin (b) -- using formula (x-h)^2 / a^2 - (y-k)^2 / b^2 = 1
    hyperbolaYpos center point x (h), center point y (k), distance from center to vertex on the x origin (a), distance from center to vertex on the y origin (b) -- using formula (y-k)^2 / a^2 - (x-h)^2 / b^2 = 1

    parabolaX2 h,k,p -- using formula 4p(y-k)=(x-h)^2
    parabolaY2 h,k,p -- using formula 4p(x-h)=(y-k)^2

    (more later)

  inputCount: Number of points the user can enter (0 means the graph is in _readOnly mode)

  xRange: [min, max, grid step size]
  yRange: [min, max, grid step size]
  labelSkip: Number of axis ticks to skip when labeling (0 = label every tick)
  usePiLabels: Use pi for labeling

  parentAddPoint: function(x,y) to add a point to the parent widget (returns FALSE on failure)
  parentRemovePoint: function(x,y) to remove a point from the parent widget (returns FALSE on failure)
********************************************************************************/
framework.widget.graph = function()
{
    var that = this;
    var style = app.style.graph;

    var _readOnly = false;

    // Create a canvas to draw on
    var canvas = that.add('canvas', {
            id: 'graph',
            x: that.x,
            y: that.y,
            w: that.w,
            h: that.h,
            depth: 1
    });

    // Get the 2D context
    var ctx = canvas.context();
	that.canvas = canvas.el[0];

    var _grid = that.add('graphGrid', $.extend({}, that.graphGrid, {
      w: that.w,
      h: that.h,
      xRange: that.xRange,
      yRange: that.yRange,
      labelSkip: that.labelSkip,
      usePiLabels: that.usePiLabels,
      ctx: ctx,
      drawLine: drawLine,
      drawDashLine: drawDashLine,
      drawArrow: drawArrow,
      transform: transform
    }));

    // index values for xRange, yRange to replace the magic numbers:
    var minIdx = 0, maxIdx=1, StepSize=2;

    var _xMax_lgc = that.xRange[maxIdx],
        _xMin_lgc = that.xRange[minIdx],
        _xStep_lgc = that.xRange[StepSize];

    var _yMax_lgc = that.yRange[maxIdx],
        _yMin_lgc = that.yRange[minIdx],
        _yStep_lgc = that.yRange[StepSize];

	var clearanceFactor = 1.2, // make sure the graph draws to the border
	xUpperBound = _xMax_lgc * clearanceFactor, 
	xLowerBound = _xMin_lgc * clearanceFactor,
	yUpperBound = _yMax_lgc * clearanceFactor,
	yLowerBound = _yMin_lgc * clearanceFactor;

    var _mousePt = {
        bWritable:  true,
        bClicked:   false,
        x:0, y:0
    }

    var _aryEq =that.eq.slice(0);
    var _aryMouseClicked = [];

//    var _timer = { interval: 1000, // milliseconds
//                   hdl: null }

//    var _maxPt_px = _grid.LgcPtToCanvasPt(_xMax_lgc, _yMax_lgc),
//        _minPt_px = _grid.LgcPtToCanvasPt(_xMin_lgc, _yMin_lgc);

    drawGraph();

    //===============================================================================
    // Required API for Input Types
    //===============================================================================
    // input: xLogic, yLogic - logic coords of the point to be removed
    this.removePoint = function(xLogic, yLogic)
    {
        for (var i=0; i < _aryMouseClicked.length; i++)
            if (xLogic == _aryMouseClicked[i].x && yLogic == _aryMouseClicked[i].y)
            {
                _aryMouseClicked.splice(i, 1); // remove the entry from array
                drawGraph();
                return true;
            }
        return false; // remove not successful
    }

    //=======================================================
    // Display the answer (if isInput === true, draw the equation as if isInput === false)
    //=======================================================
    this.clear = function()
    {
        // clear stored mouse-click points:
        _aryMouseClicked.length = 0;

        // clear stored equations:
        _aryEq.length = 0;

        drawGraph();
    }

    //=======================================================
    // Display the answer (if isInput === true, draw the equation as if isInput === false)
    //=======================================================
    this.addEq = function(eq)
    {
        // add new equations:
        if (eq && eq.length > 0)
        {
            drawEquations(eq);

            for (var i=0; i<eq.length; i++)
                _aryEq.push(eq[i]);
        }
    }

    //=======================================================
    // Prevent further input (only useful if isInput === true)
    //=======================================================
    this.readOnly = function()
    {
        _readOnly = true;
    }

    //=======================================================
    // Allow further input (only useful if isInput === true)
    //=======================================================
    this.allowInput = function()
    {
        _readOnly = false;
    }

    //===============================================================================
    // Widget-specific Code

    //===================== mouse functions: ============================
    /************************************************
     The user clicked inside the widget
    ************************************************/
    this.mouseClick = function(xMouse, yMouse) {
      if (_readOnly) return;

      var ptLgc =  _grid.CanvasPtToLgcPt(xMouse, yMouse);

      if (that.removePoint(ptLgc.x, ptLgc.y)) {
        that.parentRemovePoint(ptLgc.x, ptLgc.y);
      } else if( _aryMouseClicked.length < that.inputCount) {
        var xStr = _grid.xToStr(ptLgc.x),
            yStr = _grid.yToStr(ptLgc.y);

        _aryMouseClicked.push( ptLgc );

        if (that.usePiLabels)
            xStr = _grid.decToFracPiStr(ptLgc.x, 8);

        that.parentAddPoint(ptLgc.x, ptLgc.y, xStr, yStr);
      }
    }

    /****************************************************************************
     The mouse just moved outside the canvas
    ****************************************************************************/
    this.mouseOut = function()
    {
        if (_readOnly) return;
        _grid.draw();
        drawEquations();
        drawClickedMousePts(style.pointColor);
        _mousePt.x = _mousePt.y = 0; // clear the old trace
    }

    /****************************************************************************
     The user moved the mouse
    ****************************************************************************/
    this.mouseMove = function(x, y)
    {
        if (_readOnly) return;

        if (_mousePt.bWritable)
        {
            _mousePt.x = x;
            _mousePt.y = y;
        }
        drawGraph();
    }
    this.logicalPoint = function(x, y) {
      return _grid.CanvasPtToLgcPt(x, y);
    }

    /****************************************************************************
     draw clicked mouse points
    ****************************************************************************/
    function drawClickedMousePts(color)
    {
        if (!_aryMouseClicked)  return;

        for (var i = 0; i < _aryMouseClicked.length; i++)
        {
            _grid.drawMouseLgcPt(_aryMouseClicked[i], color);
        }
    }

    /*************************************************************************
     Draw both the clicked points and the current moving point of the mouse.
    *************************************************************************/
    function drawMousePoints(color)
    {
        var xMouseCanvas, yMouseCanvas;

        drawClickedMousePts(color);

        if (!nearBorder(_mousePt.x, _mousePt.y))
        {
            _mousePt.bWritable = false;
                xMouseCanvas = _mousePt.x;
                yMouseCanvas = _mousePt.y;
            _mousePt.bWritable = true;

            _grid.drawMousePt(xMouseCanvas, yMouseCanvas, color, true, true);
        }
    }

    function nearBorder(x, y)
    {
        // Change border region according to moving speed of the mouse:
        var _borderRegion = 0; //Math.max( Math.abs(x - xLast), Math.abs(y - yLast));

        return (
            x <= _borderRegion || x >= that.w - _borderRegion ||
            y <= _borderRegion || y >= that.h - _borderRegion
        )
    }

    //===================== draw equations ============================
    function appendColorFn(arg, color, drawFn)
    {
        drawFn.apply(that, arg.concat(color));
    }

	//=================================================
	//=================================================
    function initConicFn(arg, color)
    {
        arg.unshift(color); // Add elements at beginning of args array
        return initConics.apply(that, arg);
    }

	//=================================================
	// set transform matrix to identity
	//=================================================
	function setTransformToIdentity(canvasContext)
	{
		canvasContext.setTransform(1, 0, 0, 1, 0, 0);
	}

	//=================================================
	//=================================================
    function drawEquations(newEq)
    {
        var drawAry;

        if (newEq)  drawAry = newEq;
        else
        {
            if (!_aryEq || _aryEq.length == 0)  return;
            drawAry = _aryEq;
        }

		setTransformToIdentity(ctx);

        var strEq, colorEq, eqType, args, option;

        var eq = {
		log: { nParam:4,   fn: function(arg, color){ appendColorFn(arg, color, drawLogEqn) } },// 'logarithm',

		exponent: { nParam:4,   fn: function(arg, color){ appendColorFn(arg, color, drawExpEqn) } },// 'exponent',

		radical: { nParam:4,   fn: function(arg, color){ appendColorFn(arg, color, drawRadEqn) } },// 'radical',

		rational: { nParam:3,   fn: function(arg, color){ appendColorFn(arg, color, drawRatEqn) } },// 'rational',

		sin: { nParam:3,   fn: function(arg, color){ appendColorFn(arg, color, drawSinEqn) } },// 'sine',

		cos: { nParam:3,   fn: function(arg, color){ appendColorFn(arg, color, drawCosEqn) } },// 'cosine',

		tan: { nParam:3,   fn: function(arg, color){ appendColorFn(arg, color, drawTanEqn) } },// 'tangent',

		parabolastd: { nParam:3, fn: function(arg, color){ appendColorFn(arg, color, drawQuadSEqn) } },// 'quadratic (Standard)',

//		quadv: { nParam:3, fn: function(arg, color){ appendColorFn(arg, color, drawQuadVEqn) } },// 'quadratic (Vertex)',

		line: { nParam:2,   fn: function(arg, color){ appendColorFn(arg, color, drawLineEqn) } },// 'line',
  
		circle: { nParam:3,   fn: function(arg, color){ appendColorFn(arg, color, drawCircle) } }, // 'circle',
  
		//=================================================================================
		parabolax2: { nParam:3,   fn: function (arg, color)                              // 'parabolax2',
	                    {   var cnc = initConicFn(arg, color);

                        // parabolaX2 h,k,p -- using formula 4p(y-k)=(x-h)^2
                        // after translate to (h, k): y = +- x^2 / 4p
                        cnc.bDrawPositiveY = false;
                        cnc.Eq = function(x, a) { return x*x / (4*a); }
                        var p = arg[3], h = arg[1]; // color, h, k, a, b
                        var xMaxY_lgc = Math.sqrt(4 * p * _yMax_lgc); // since 4py = x^2

						cnc.xStart = 0;
						cnc.dX = -cnc.dX; // make it positive
						cnc.xCompare = function(x, h) { return x >=0 && x <= xUpperBound + Math.abs(h); }

						arg.unshift(cnc);	// stuff extra param at beginning of arg

						// set up for drawConicsYtoX:
						cnc.EqYtoX = function(y, p) { return (Math.sqrt(4*p*y)); }
						cnc.yStart = 0;
						if (p < 0)
							cnc.yCompare = function(y, k) { return y <= 0 && y >= yLowerBound - Math.abs(k);  }
						else
						{
							cnc.dY = -cnc.dY; // make it positive
							cnc.yCompare = function(y, k) { return y >= 0 && y <= yUpperBound + Math.abs(k); }
                        }

                        drawConics.apply(that, arg); }
                    },

		//=================================================================================
		parabolay2: { nParam:3,   fn: function (arg, color)                              // 'parabolay2',
	                    {   var cnc = initConicFn(arg, color);

                        // parabolaY2 h,k,p -- using formula 4p(x-h)=(y-k)^2
                        // after translate to (h, k): y = +- sqrt(4px)
                        cnc.bDrawNegativeX = false;

						var a = arg[3]; // color, h, k, a, b
						var Sign = Math.sign(a); // sign of a
						cnc.xStart *= Sign;
						cnc.dX *= Sign; // keep going forever with this condition??
						if (Sign < 0)
						{
							cnc.xCompare = function(x) { return x <= cnc.xVertex; };
							cnc.yCompare = function(y, k) { return y >= 0 && y <= yUpperBound + Math.abs(k); }
						}

                        cnc.Eq = function(x, a) { return 2 * Math.sqrt( a * x ); }
                        arg.unshift(cnc); // stuff extra param at beginning of arg

						// set up for drawConicsYtoX:
						cnc.EqYtoX = function(y, p) { return (y*y/(4*p)); }
						cnc.yStart *= Sign;

                        drawConics.apply(that, arg); }
                    },

		//=================================================================================
		ellipse: { nParam:4,   fn: function (arg, color)                              // 'ellipse',
	                    {   var cnc = initConicFn(arg, color);
						var a = arg[3], b = arg[4]; // color, h, k, a, b
                        cnc.xVertex = a;
                        cnc.xVertexPx = _grid.xLgcLengthToPx(a);
						cnc.yVertex = b;
						cnc.yVertexPx = _grid.yLgcLengthToPx(b);
                        cnc.xStart = 0;

						if (a < 0)
						{
							cnc.xCompare = function(x, h, a)
										{ return x >= Math.max(a, xLowerBound-Math.abs(h)); };
						}
						else
						{
							cnc.dX = -cnc.dX; // make it positive
							cnc.xCompare = function(x, h, a)
										{ return x <= Math.min(a, xUpperBound+Math.abs(h)); };
						}

                        /**********************************************************************
                            Draw an ellipse in the equation of (x-h)^2/a^2 + (y-k)^2/b^2 = 1;
                            if h, k are zeros (we translate the system origin to h,k),
                            the resulting equation will be     x^2/a^2 + y^2/b^2 = 1;

                            therefore:   y = +- sqrt(1 - x^2/a^2) * b
                         **********************************************************************/
                        cnc.Eq = function(x, a, b) { return Math.sqrt( 1 - x*x / (a*a) ) * b; }

						// set up for drawConicsYtoX:
						cnc.EqYtoX = function(y, a, b) { return a* Math.sqrt(1 - y*y/(b*b)); }

						if (b<0) {
							cnc.dY = -cnc.dY; // make it positive
							cnc.yCompare = function(y, k, b)
										{ return y < 0 && y >= Math.min(b, yLowerBound-Math.abs(k)); }
						}
						else
							cnc.yCompare = function(y, k, b)
										{ return y > 0 && y <= Math.min(b, yUpperBound+Math.abs(k)); }

                        arg.unshift(cnc); // stuff extra param at beginning of arg
                        drawConics.apply(that, arg); }
                    },

		//=================================================================================
		hyperbolaxpos: { nParam:4,   fn: function (arg, color)                           // 'hyperbolaxpos',
	                    {   var cnc = initConicFn(arg, color);
                        var a = arg[3], b = arg[4]; // color, h, k, a, b
                        cnc.xVertex = a;
                        cnc.xVertexPx = _grid.xLgcLengthToPx(a);

						cnc.yVertex = b;
						cnc.yVertexPx = _grid.yLgcLengthToPx(b);

						cnc.xCompare = function(x, h, a) { return x >=a; }// && x <= xUpperBound; }

                        // (x-h)^2/a^2 - (y-k)^2/b^2 = 1
                        cnc.Eq = function(x, a, b) { return b * Math.sqrt( x*x / (a*a) - 1); }

						// set up for drawConicsYtoX:
						cnc.EqYtoX = function(y, a, b) { return (a* Math.sqrt(1 + y*y/(b*b))); }

						if (b < 0)
						{
							cnc.dY = -cnc.dY; // make it positive
							cnc.yCompare = function(y) { return y <= 0;  }
						}
						else
							cnc.yCompare = function(y) { return y >= 0; }// && y <= yUpperBound; }

                        arg.unshift(cnc); // stuff extra param at beginning of arg
                        drawConics.apply(that, arg); }
                    },

		//=================================================================================
		hyperbolaypos: { nParam:4,   fn: function (arg, color)                            // 'hyperbolaypos',
                    {   var cnc = initConicFn(arg, color);
						var a = arg[3], b = arg[4]; // color, h, k, a, b

                        // (y-k)^2/b^2 - (x-h)^2/a^2 = 1
                        cnc.Eq = function(x, a, b) { return b * Math.sqrt( x*x / (a*a) + 1); }

						// set up for drawConicsYtoX:
						cnc.EqYtoX = function(y, a, b) { return (a* Math.sqrt(y*y/(b*b)-1)); }

						if (a < 0)
						{
							cnc.dX = -cnc.dX; // make it positive
							cnc.xStart = -cnc.xStart;
							cnc.xCompare = function(x) { return x <= 0;  }
						}

						if (b < 0)
							cnc.dY = -cnc.dY; // make it positive

						cnc.yCompare = function(y, k, b) { return Math.abs(y) >= Math.abs(b); }// && y <= yUpperBound; }

                        arg.unshift(cnc); // stuff extra param at beginning of arg
                        drawConics.apply(that, arg); }
                    },

		//=================================================================================
		point:  { nParam:2,   fn: function(arg, color, option)
                        {   arg.unshift(color, option); // stuff extra param at beginning,
                                                    // since label in the arg is an optional param
                            drawDotEq.apply(that, arg); }
				}
							
	    };

		//--------------------------------------------------------
        for (var i=0; i < drawAry.length; i++)
        {
            strEq = drawAry[i].eq;
            colorEq = drawAry[i].color || 'black';
            option = drawAry[i].option;

            // parse the parameters:
            strEq = strEq.replace(/\s*/g, "").toLowerCase();
            eqType = strEq.slice(0, strEq.indexOf('='));
            args = strEq.slice(strEq.indexOf('=')+1).split(','); //.concat(colorEq);

            // build parameters and then draw the equation:
            if ( defined(eq[eqType]) )
            {
                // parse the parameters for current equation:
                for (var j=0; j < eq[eqType].nParam; j++) // string to number:
                    if ( isNaN( args[j] = parseFloat(args[j]) ) )
                        fw.error(eqType + " equation parameter has to be a number!");

                if (args.length >= eq[eqType].nParam)
                    eq[eqType].fn(args, colorEq, option);
                else
                    fw.error(eqType + " equation does not have right number of parameters!");
            }
		else
			fw.warning('Attempting to graph unknown type: ' + eqType);
        }
    }

    /*************************************************************************
     This is the main function of the graph object
     Input:
        _aryEq - arry of equations to draw
    *************************************************************************/
    function drawGraph()
    {
        _grid.draw();

        drawEquations();

        drawMousePoints(style.pointColor);
    }

    /************************************************************************************
      Draw a straight line.
      Input:
        x1, y1  - start point in pixel unit
        x2, y2  - end point in pixel unit
        width   - line width in pixel unit
        color   - line color
    ************************************************************************************/
    function drawLine(x1, y1, x2, y2, width, color)
    {
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        x2 = Math.round(x2);
        y2 = Math.round(y2);

    ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.stroke();
        ctx.closePath();
    }

	//=======================================================
	//=======================================================
    function drawDotEq(color, option, x, y, label)
    {
        //pt_px = _grid.LgcPtToCanvasPt(x, y);
        _grid.drawMouseLgcPt({x:x, y:y}, color, false, option, label);
    }

    /************************************************************************************
      Draw a straight dash line.
      Input:
        x1, y1  - start point in pixel unit
        x2, y2  - end point in pixel unit
        width   - line width in pixel unit
        color   - line color
    ************************************************************************************/
    function drawDashLine(x1, y1, x2, y2, width, color)
    {
        var xTmp, xTmp, nDashes, dX, dY, gX, gY, sinA, cosA, diagLength,
            bSwap   = false, xEnd, yEnd,
            dashLength = 20,    gapLength = dashLength / 4;

        // make sure x1 < x2:
        if (x1 != x2)
        {
            if (x2 < x1)
                bSwap = true;
        }
        else // moving along y axis:
        {
            if (y2 < y1)
                bSwap = true;
        }

        if (bSwap)
        {
            xTmp = x2;      yTmp = y2;
            x2   = x1;      y2 = y1;
            x1   = xTmp;    y1 = yTmp;
        }

        dX = x2 - x1;
        dY = y2 - y1;
        diagLength = Math.sqrt( dX * dX + dY *dY );
        sinA = dY / diagLength;
        cosA = dX / diagLength;

        if (dashLength > diagLength)
            dashLength = diagLength;
        else
            nDashes = Math.round(diagLength / dashLength);

        dX = dashLength * cosA;
        dY = dashLength * sinA;

        var gX = gapLength * cosA,
            gY = gapLength * sinA;

        for (var x = x1, y = y1, i = 0;
                                i < nDashes-1;
                                            x += dX+gX, y += dY+gY, i++)
        {
            xEnd = x + dX;
            yEnd = y + dY;

            if (xEnd > x2) xEnd = x2;
            if (yEnd > y2) yEnd = y2;

            drawLine(x, y, xEnd, yEnd, width, color);
        }
    }

    /************************************************************************************
      Take the input degree and return the translated radians.
    ************************************************************************************/
    function degToRadian(deg)
    {
        return deg * Math.PI / 180;
    }

    /************************************************************************************
      x, y             - position of the local object coordinates in pixel unit to
                         translate system origin to before rotation.
      directionDegree  - rotation in degrees
    ************************************************************************************/
    function transform(x, y, rotateDeg)
    {
        var directionInRad = degToRadian(rotateDeg);

		setTransformToIdentity(ctx);

        // translate rotation center to the tip position:
        ctx.translate(x, y);
        ctx.rotate(directionInRad);
    }

    /************************************************************************************
      x, y             - position of the arrow tip in pixel unit
      directionDegree  - direction in degrees where the arrow points to
                         zero degree - arrow points to the right
      length           - length of the arrow along the opposite direction of arrow tip
    ************************************************************************************/
    function drawArrow(x, y, directionDegree, length, color)
    {
        var arrowSlentDegree = 5;
        var width = length * Math.tan(degToRadian(arrowSlentDegree));

        transform(x, y, directionDegree);

        // pretend the rotation degree is zero so we draw an arrow points to the right,
        // the trasform call above will take care the rotation effect.
        // since the screen origin has been translated to the tip of the arraw,
        // we need to use the local coordinate instead of original x,y:
        //
        drawLine(0, 0, -length, +width, 2, color);
        drawLine(0, 0, -length, -width, 2, color);
    }

	//=======================================================
	//=======================================================
    function drawDot(x, y, size)
    {
        ctx.fillRect(x-size/2, y-size/2, size, size);
    }

	//=======================================================
	//=======================================================
    function drawLineEqn(slope_lgc, intersect_lgc, color)
    {
        var ptScn1, ptScn2,
			x1 = xLowerBound,
            x2 = xUpperBound;

        var y1 = (x1 * slope_lgc + intersect_lgc),
            y2 = (x2 * slope_lgc + intersect_lgc);

        ptScn1 = _grid.LgcPtToCanvasPt(x1, y1);
        ptScn2 = _grid.LgcPtToCanvasPt(x2, y2);

		setTransformToIdentity(ctx);

        drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
    }

	//=======================================================
	// calculate y-value of exponential function at a given x-value
	// a: base of exponent
	// b: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	// x: x-value to calculate value at
	//=======================================================
	function exponent(a,b,h,k,x)
	{
		if( (a == 0) && (x == 0) )
		{
			return Number.NaN;
		}
		else
		{
			return b * Math.pow(a,x-h)+k;
		}
	}

	//=======================================================
	// draw an exponential function
	// a: base of exponent
	// b: coefficient of exponent term
	// h: horizontal shift
	// k: vertical shift
	//=======================================================
	function drawExpEqn(a, b, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value

		// determine minimum canvas point
		var canvasMinPt = _grid.LgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = _grid.LgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of exponential function
			var y = exponent(a,b,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, y);
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
			}

			// if this is not the first point, draw a line between the previous point and the current one
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
		}
	}

	//=======================================================
	// calculate y-value of logarithm function at a given x-value
	// a: vertical scaling factor
	// b: base of logarithm
	// h: horizontal shift
	// k: vertical shift
	// x: x-value to calculate value at
	//=======================================================
	function logarithm(a, b, h, k, x)
	{
	  if(x-h <= 0)
	  {
	    return -Infinity;
	  }
	  else if( (b <= 0) || (b == 1) )
	  {
	    return Number.NaN;
	  }
	  else
	  {
	    var y;
	    y = Math.log(x-h)/Math.log(b);
	    y *= a;
	    y += k;
	    return y;
	  }
    }

	//=======================================================
    // draw a logarithmic function
	// a: vertical scaling factor
	// b: base of logarithm
	// h: horizontal shift
	// k: vertical shift
	//=======================================================
	function drawLogEqn(a, b, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound, // logical maximum x-value
			prevX = 0, prevY = 0;

		// determine minimum canvas point
		var canvasMinPt = _grid.LgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = _grid.LgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// for each pixel:
		//for(var x = x1; x < x2; x += pixelDist)
		for(var x = h; x < x2; x += pixelDist)
		{
			// determine value of log function
			var y = logarithm(a,b,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, y);
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
			}

			// if this is not the first point, draw a line between the previous point and the current one
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				if(prevY == -Infinity)
				{
					if(a>0)
					{
						ptScn1 = _grid.LgcPtToCanvasPt(x, yLowerBound);
					}
					else
					{
						ptScn1 = _grid.LgcPtToCanvasPt(x, yUpperBound);
					}
				}
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
			prevX = x;
			prevY = y;
		}
	}

	//=======================================================
	// calculate y-value of radical function at a given x-value
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	// n: degree of the root
	// x: x-value to calculate value at
	//=======================================================
	function radical(a,h,k,n,x)
	{
		// I think we only want to allow integers for the degree of the root.
		// Consider removing this check if it degrades performance too much.
		if(n % 1 != 0)
		{
			return Number.NaN;
		}

		// determine the value of the radicand so as to avoid having multiple subtractions in this function
		var radicand = x-h;

		// if the degree of the root is even:
		if(n % 2 == 0)
		{
			// negative numbers do not have real roots of even degree
			if(radicand < 0)
			{
				return Number.NaN;
			}

			// raising a number to the 1/nth power is the same as taking the nth root of that number
			else
			{
				return a*Math.pow(radicand,1/n)+k;
			}
		}

		// if the degree of the root is odd:
		else
		{
			if(n % 2 == 0)
			{
				Console.log('Something went wrong.');
			}
			// there is a bug in the Math.pow() function where it does not return the correct answer when
			// raising a negative number to a fractional power.
			var factor = (radicand < 0) ? -1 : 1;

			return factor*a*Math.pow(factor*radicand,1/n)+k;
		}
	}

	//=======================================================
	// draw a radical function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	// n: degree of the root
	//=======================================================
	function drawRadEqn(a, h, k, n, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
		    ptScn0 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value

		// determine minimum canvas point
		var canvasMinPt = _grid.LgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = _grid.LgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// if n is even, start graphing at h instead of the left edge of the grid
		if(n%2 == 0)
		{
			x1 = h;
		}

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of radical function
			var y = radical(a,h,k,n,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, y);
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
			}

			// if this is not the first point:
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
		}
	}

	//=======================================================
	// calculate y-value of rational function at a given x-value
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	//=======================================================
	function rational(a, h, k, x)
	{
		if(x == h)
		{
			return Number.NaN;
		}
		else
		{
			return a/(x-h)+k;
		}
	}

	//=======================================================
	// draw a rational function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	//=======================================================
	function drawRatEqn(a, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value
			var topPt;
			var botPt;
			var prevX=0;
			var prevY=0;

		// determine minimum canvas point
		var canvasMinPt = _grid.LgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = _grid.LgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of radical function
			var y = rational(a,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, y);
			}

			// otherwise, set ptScn1 to the old point, and set ptScn2 to the new point
			else
			{
				ptScn1 = ptScn2;
			}
			ptScn2 = _grid.LgcPtToCanvasPt(x, y);

			// if they are on opposite sides of the asymptote,
			// draw lines to the edge of the canvase as appropriate
			if( (x >= h) && (prevX <= h) )
			{
				// if a is positive, draw a line from the last point on the first arm to the bottom of the grid,
 				// and a line from the top of the grid to the first point on the second arm
 				if(a > 0)
 				{
					ptScn2 = _grid.LgcPtToCanvasPt(x, y);
					botPt = _grid.LgcPtToCanvasPt(prevX, yLowerBound);
 					drawLine(ptScn1.x, ptScn1.y, botPt.x, botPt.y, color);

 					topPt = _grid.LgcPtToCanvasPt(x, yUpperBound);
 					drawLine(topPt.x, topPt.y, ptScn2.x, ptScn2.y, color);
 				}

 				// if a is negative, draw a line from the last point on the first arm to the top of the grid,
 				// and a line from the bottom of the grid to the first point on the second arm
 				else
 				{
					ptScn2 = _grid.LgcPtToCanvasPt(x, y);
 					var topPt = _grid.LgcPtToCanvasPt(prevX, yUpperBound);
 					drawLine(ptScn1.x, ptScn1.y, topPt.x, topPt.y, color);

 					var botPt = _grid.LgcPtToCanvasPt(x, yLowerBound);
 					drawLine(botPt.x, botPt.y, ptScn2.x, ptScn2.y, color);
				}
			}

			// if the new point is off the canvas, and the old point is on the canvas,
			// draw a vertical line from the old point to the appropriate canvas edge.
			else if( (prevY < yUpperBound) &&
				(prevY > yLowerBound) &&
				(y > yUpperBound) )
			{
				topPt = _grid.LgcPtToCanvasPt(prevX, yUpperBound);
				drawLine(ptScn1.x, ptScn1.y, topPt.x, topPt.y, 1, color); //that.graphColor);
			}
			else if( (prevY < yUpperBound) &&
					 (prevY > yLowerBound) &&
					 (y < yLowerBound) )
			{
				botPt = _grid.LgcPtToCanvasPt(prevX, yLowerBound);
				drawLine(ptScn1.x, ptScn1.y, botPt.x, botPt.y, 1, color); //that.graphColor);
			}

			// if the new point is on the canvas, and the old point is off the canvas,
			// draw a vertical line from the appropriate canvas edge to the new point.
			else if( (y < yUpperBound) &&
					 (y > yLowerBound) &&
					 (prevY < yLowerBound) )
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, yLowerBound);
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
			else if( (y < yUpperBound) &&
					 (y > yLowerBound) &&
					 (prevY > yUpperBound) )
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, yUpperBound);
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}

			// if both points are on the canvas:
			else if( (prevY < yUpperBound) &&
					 (prevY > yLowerBound) &&
					 (y < yUpperBound) &&
			    	 (y > yLowerBound) )
			{
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
			prevX = x;
			prevY = y;
		}
	}

	//=======================================================
	// calculate a sine function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	//=======================================================
	function sin(a, h, k, x)
	{
		return a*Math.sin(x-h)+k;
	}

	//=======================================================
	// calculate a cosine function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	//=======================================================
	function cos(a, h, k, x)
	{
		return a*Math.cos(x-h)+k;
	}

	//=======================================================
	// calculate a tangent function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	//=======================================================
	function tan(a, h, k, x)
	{
		if( (x-h) % Math.PI == 0)
		{
			return Number.NaN;
		}
		else
		{
			return a*Math.tan(x-h)+k;
		}
	}

	//=======================================================
	// draw a sine function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	//=======================================================
	function drawSinEqn(a, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value

		// determine minimum canvas point
		var canvasMinPt = _grid.LgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = _grid.LgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of sine function
			var y = sin(a,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, y);
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
			}

			// if this is not the first point, draw a line between the previous point and the current one
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
		}
	}

	//=======================================================
	// draw a cosine function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	//=======================================================
	function drawCosEqn(a, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value

		// determine minimum canvas point
		var canvasMinPt = _grid.LgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = _grid.LgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of cosine function
			var y = cos(a,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, y);
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
			}

			// if this is not the first point, draw a line between the previous point and the current one
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
		}
	}
	//=======================================================
	// draw a tangent function
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	//=======================================================
	function drawTanEqn(a, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value
			var prevX, prevY;

		// determine minimum canvas point
		var canvasMinPt = _grid.LgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = _grid.LgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of tangent function
			var y = tan(a,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, y);
			}

			// otherwise, set ptScn1 to the old point, and set ptScn2 to the new point
			else
			{
				ptScn1 = ptScn2;
			}
			ptScn2 = _grid.LgcPtToCanvasPt(x, y);

			// if they are on opposite sides of the asymptote,
			// draw lines to the edge of the canvase as appropriate
			if( (a > 0) && (y < prevY) )
			{
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				var topPt = _grid.LgcPtToCanvasPt(prevX, yUpperBound);
				drawLine(ptScn1.x, ptScn1.y, topPt.x, topPt.y, color);

				var botPt = _grid.LgcPtToCanvasPt(x, yLowerBound);
				drawLine(botPt.x, botPt.y, ptScn2.x, ptScn2.y, color);
			}

 				// if a is negative, draw a line from the last point on the first arm to the top of the grid,
 				// and a line from the bottom of the grid to the first point on the second arm
 			else if( (a < 0) && (y > prevY) )
			{
				// if a is positive, draw a line from the last point on the first arm to the bottom of the grid,
 				// and a line from the top of the grid to the first point on the second arm
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				botPt = _grid.LgcPtToCanvasPt(prevX, yLowerBound);
				drawLine(ptScn1.x, ptScn1.y, botPt.x, botPt.y, color);

				topPt = _grid.LgcPtToCanvasPt(x, yUpperBound);
				drawLine(topPt.x, topPt.y, ptScn2.x, ptScn2.y, color);
			}

			// if the new point is off the canvas, and the old point is on the canvas,
			// draw a vertical line from the old point to the appropriate canvas edge.
			else if( (prevY < yUpperBound) &&
				(prevY > yLowerBound) &&
				(y > yUpperBound) )
			{
				topPt = _grid.LgcPtToCanvasPt(prevX, yUpperBound);
				drawLine(ptScn1.x, ptScn1.y, topPt.x, topPt.y, 1, color); //that.graphColor);
			}
			else if( (prevY < yUpperBound) &&
					 (prevY > yLowerBound) &&
					 (y < yLowerBound) )
			{
				botPt = _grid.LgcPtToCanvasPt(prevX, yLowerBound);
				drawLine(ptScn1.x, ptScn1.y, botPt.x, botPt.y, 1, color); //that.graphColor);
			}

			// if the new point is on the canvas, and the old point is off the canvas,
			// draw a vertical line from the appropriate canvas edge to the new point.
			else if( (y < yUpperBound) &&
					 (y > yLowerBound) &&
					 (prevY < yLowerBound) )
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, yLowerBound);
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
			else if( (y < yUpperBound) &&
					 (y > yLowerBound) &&
					 (prevY > yUpperBound) )
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, yUpperBound);
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}

			// if both points are on the canvas:
			else if( (prevY < yUpperBound) &&
					 (prevY > yLowerBound) &&
					 (y < yUpperBound) &&
			    	 (y > yLowerBound) )
			{
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
			prevX = x;
			prevY = y;

		}
	}

	//=======================================================
	// calculate a quadratic function in standard form at a given x-value
	// a: coefficient of squared term
	// b: coefficient of linear term
	// c: constant term
	//=======================================================
	function qS(a, b, c, x)
	{
		return a*x*x + b*x + c;
	}

	//=======================================================
	// draw a quadratic function in standard form
	// a: coefficient of squared term
	// b: coefficient of linear term
	// c: constant term
	//=======================================================
	function drawQuadSEqn(a, b, c, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound, // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value

		// determine minimum canvas point
		var canvasMinPt = _grid.LgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = _grid.LgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of quadratic function
			var y = qS(a,b,c,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, y);
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
			}

			// if this is not the first point, draw a line between the previous point and the current one
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
		}
	}

	//=======================================================
	// calculate a quadratic function in vertex form at a given x-value
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	//=======================================================

	function qV(a, h, k, x)
	{
		return a*(x-h)*(x-h)+k;
	}

	//=======================================================
	// draw a quadratic function in standard form
	// a: vertical scaling factor
	// h: horizontal shift
	// k: vertical shift
	//=======================================================
	function drawQuadVEqn(a, h, k, color)
	{
		var ptScn1 = null,
		    ptScn2 = null,
			x1 = xLowerBound,   // logical minimum x-value
			x2 = xUpperBound; // logical maximum x-value

		// determine minimum canvas point
		var canvasMinPt = _grid.LgcPtToCanvasPt(x1,0);

		// determine maximum canvas point
		var canvasMaxPt = _grid.LgcPtToCanvasPt(x2,0);

		// determine distance covered by a pixel
		var pixelDist = (x2 - x1) / (canvasMaxPt.x - canvasMinPt.x);

		// set transform matrix to identity:
		setTransformToIdentity(ctx);

		// for each pixel:
		for(var x = x1; x < x2; x += pixelDist)
		{
			// determine value of quadratic function
			var y = qV(a,h,k,x);

			// if this is the first point, move to the first point
			if(ptScn1 == null)
			{
				ptScn1 = _grid.LgcPtToCanvasPt(x, y);
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
			}

			// if this is not the first point, draw a line between the previous point and the current one
			else
			{
				ptScn1 = ptScn2;
				ptScn2 = _grid.LgcPtToCanvasPt(x, y);
				drawLine(ptScn1.x, ptScn1.y, ptScn2.x, ptScn2.y, 1, color); //that.graphColor);
			}
		}
	}

	//=======================================================
	//=======================================================
    function drawCircle(x_lgc, y_lgc, r_lgc, color)
    {
        var ptScn1, ptScn2,
            r_px = _grid.xLgcLengthToPx(r_lgc);

        ptScn1 = _grid.LgcPtToCanvasPt(x_lgc, y_lgc);

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

		setTransformToIdentity(ctx);

        ctx.arc(ptScn1.x, ptScn1.y, r_px, 0, Math.PI * 2, false);

        ctx.stroke();
        ctx.closePath();
    }

    /******************************************************************************
     Input (all in logic unit and need to be converted to Canvas px unit):
          a, b - x and y axis of the hyperbola.
          h, k - x,y distances from the center of hyperbola to the origin
                 of x,y system.

      Note: The cnc.Eq is to compute y according to x as if h, k are zeros;
      x type:
                hyperbola equation is:   x^2 / a^2 - y^2 / b^2 = 1;

                            therefore:   y = +- b * sqrt(x^2 / a^2 - 1)

      y type:
                hyperbola equation is:   y^2 / b^2 - x^2 / a^2 = 1;

                            therefore:   y = +- b * sqrt(x^2 / a^2 + 1)

	  Algorithm:
	  	All the rendering is from the furthest opening points on the curve to the
	  center point where the degenerate points are (eccept for eliipse, which is
	  rendered from the center point to the furthest points on the x axis where the
	  degenarate points are).
	  When the curve becomes too steep (y increases faster than x does), the rendering
	  swhiches to the algorithm that uses y to generate x coordinate. -- NF, 6/5/2015
    *****************************************************************************/
    function initConics(color, h, k, a, b)
    {
        var cnc = {
            dotSize:     1,
            hyperCenter: _grid.LgcPtToCanvasPt(h, k),
			xVertex:     0,		yVertex:     0,
			xVertexPx:   0,		yVertexPx:   0,
            bDrawNegativeX: true,
            bDrawPositiveY: true,
			xStart: xUpperBound + Math.abs(h), // consider after axis shifting
			yStart: yUpperBound + Math.abs(k),

			xCompare: function(x, h, a) { return x >= cnc.xVertex; },
			yCompare: function(y, k, b) { return y >= cnc.yVertex; },
        };

        cnc.dX = a / _grid.xLgcLengthToPx(a); // normalize the delta x

		if (b)
			cnc.dY = b / _grid.yLgcLengthToPx(b); // normalize the delta y
		else // hyperabla only has p which uses the position of a:
			cnc.dY = a / _grid.yLgcLengthToPx(a); // normalize the delta y

		cnc.dX = -cnc.dX;
		cnc.dY = -cnc.dY;

		setTransformToIdentity(ctx);
        ctx.translate(cnc.hyperCenter.x, cnc.hyperCenter.y);

        ctx.fillStyle = color;
        return cnc;
    }

	//======================================================================
	// return true 	= use drawConics function for rendering
	//		  false	= use drawConicsYtoX function for rendering
	//======================================================================
	function shouldRenderConicsXtoY(cnc, x0, y0, h, k, a, b)
	{
		var deltaY = cnc.Eq(x0, a, b) - cnc.Eq(x0 + cnc.dX, a, b);
		var deltaX = cnc.EqYtoX(y0, a, b) - cnc.EqYtoX(y0 + cnc.dY, a, b);

		if (!deltaX ||	// when y is close to zero
			Math.abs(deltaY) <= Math.abs(deltaX))
			return true;

		return false;
	}

    /******************************************************************************
        Draw a conic type such as hyperbola in the equation (x type)
            (x-h)^2/a^2 - (y-k)^2/b^2 = 1
        or y type :
            (y-k)^2/b^2 - (x-h)^2/a^2 = 1

        Input (all in logic unit and need to be converted to Canvas px unit):
          a, b - x and y axis of the hyperbola.
          h, k - x,y distances from the center of hyperbola to the origin
                 of x,y system.

        algorithm:
        1. translate the system origin to h,k;
        2. compute y according to x as if h, k are zeros;

        therefore:   y = +- b * sqrt(x^2/a^2 - 1)
     *****************************************************************************/
    function drawConics(cnc, color, h, k, a, b)
    {
        var x, y;
        var pt = {x:0, y:0};

//		ctx.fillStyle = color; // change color for debugging

		// use logic x to calculate logic y,
		// then convert to canvas coords before drawing it:
		for (x = cnc.xStart; 	cnc.xCompare(x, h, a); 	x += cnc.dX)
		{
			if (!y || shouldRenderConicsXtoY(cnc, x, y, h, k, a, b))
				y = cnc.Eq(x, a, b); //b * Math.sqrt( x*x / (a*a) - 1);
			else
			{
				cnc.yStart = y + cnc.dY;
				drawConicsYtoX(cnc, color, h, k, a, b);
				return;
			}

            pt.x = _grid.xLgcLengthToPx(x);
            pt.y = _grid.yLgcLengthToPx(y);

            drawDot( pt.x,  -pt.y, cnc.dotSize);

            if (cnc.bDrawNegativeX)    //conicType != 'parabolay2')
                drawDot(-pt.x,  -pt.y, cnc.dotSize);

            if (cnc.bDrawPositiveY) //conicType != 'parabolax2')
            {
                drawDot( pt.x, pt.y, cnc.dotSize);

                if (cnc.bDrawNegativeX) //conicType != 'parabolay2')
                    drawDot(-pt.x, pt.y, cnc.dotSize);
            }
        }

        // be nice to next function and reset transform:
		setTransformToIdentity(ctx);
    }

	/******************************************************************************
	When a conic curve changes rapidly in the Y direction, marching an uniform step
	size along the x direction to compute Y will result missed rendering spaces on
	the curve. To solve the problem we need to march an uniform step along the Y
	direction to compute X at such locations. When the curve becomes gentle again
	along the Y direction we go back to march along the X direction for rendering.
	The result will be a clean and smoothly rendered conic curve. -- NF, 6/5/2015

	Input (all in logic unit and need to be converted to Canvas px unit):
	  a, b - x and y axis of the hyperbola.
	  h, k - x,y distances from the center of hyperbola to the origin
			 of x,y system.

	algorithm:
	1. translate the system origin to h, k;
	2. compute x according to y as if h, k are zeros;

	To draw a conic type such as hyperbola in the equation (x type)
			(x-h)^2/a^2 - (y-k)^2/b^2 = 1
	therefore:   x = +- a * sqrt(y^2/b^2 + 1)
	*****************************************************************************/
	function drawConicsYtoX(cnc, color, h, k, a, b)
	{
//		ctx.fillStyle = 'red'; // change color for debugging
		var x, y;
		var pt = {x:0, y:0};

		// use logic y to calculate logic x,
		// then convert to canvas coords before drawing it:
		for (y = cnc.yStart;	cnc.yCompare(y, k, b);	y += cnc.dY)
		{
			if (x && shouldRenderConicsXtoY(cnc, x, y, h, k, a, b))
			{
				cnc.xStart = x + cnc.dX;
				drawConics(cnc, color, h, k, a, b);
				return;
			}
			else
				x = cnc.EqYtoX(y, a, b);

			pt.x = _grid.xLgcLengthToPx(x);
			pt.y = _grid.yLgcLengthToPx(y);

			drawDot( pt.x,  -pt.y, cnc.dotSize);

			if (cnc.bDrawNegativeX)    //conicType != 'parabolay2')
				drawDot(-pt.x,  -pt.y, cnc.dotSize);

			if (cnc.bDrawPositiveY) //conicType != 'parabolax2')
			{
				drawDot( pt.x, pt.y, cnc.dotSize);

				if (cnc.bDrawNegativeX) //conicType != 'parabolay2')
					drawDot(-pt.x, pt.y, cnc.dotSize);
			}
		}

		// be nice to next function and reset transform:
		setTransformToIdentity(ctx);
	}
}
