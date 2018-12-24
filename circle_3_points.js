
  function circle_from_points(x1, y1, x2, y2, x3, y3)
  {
	var det = det3(x1, y1, 1,  x2, y2, 1,  x3, y3, 1);
	
	var dist1 = x1*x1 + y1*y1;
	var dist2 = x2*x2 + y2*y2;
	var dist3 = x3*x3 + y3*y3;
	
	var detxc = det3(dist1, y1, 1,  dist2, y2, 1,  dist3, y3, 1);
	var detyc = det3(x1, dist1, 1,  x2, dist2, 1,  x3, dist3, 1);
  
	var xc = detxc / (2 * det);
	var yc = detyc / (2 * det);
	
	var radius = Math.sqrt((x1-xc)*(x1-xc) + (y1-yc)*(y1-yc));
	
	return [xc, yc, radius];
  }
  
  function det3(a11, a12, a13, a21, a22, a23, a31, a32, a33)
  {
	//return (a11*(a22*a33 − a23*a32) + a12*(a23*a31 - a21*a33) + a13*(a21*a32 − a22*a31));
	var val1 = a11*(a22*a33 - a23*a32);
	var val2 = a12*(a23*a31 - a21*a33);
	//var val3 = a13*(a21*a32 − a22*a31); // don't work??
	var val3 = a13*(a21*a32)-a13*(a22*a31);
	return val1 + val2 + val3;
  }