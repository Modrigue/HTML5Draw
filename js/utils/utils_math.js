// Math functions
// computes the distance between points (x1,y1) and (x2,y2)
export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}
// computes the angle of (x,y) on a plane given the origin
export function getAngle(x, y) {
    return Math.atan(y / (x == 0 ? 0.01 : x)) + (x < 0 ? Math.PI : 0);
}
// circle from 3 points function
export function circle_from_points(x1, y1, x2, y2, x3, y3) {
    const det = det3(x1, y1, 1, x2, y2, 1, x3, y3, 1);
    const dist1 = x1 * x1 + y1 * y1;
    const dist2 = x2 * x2 + y2 * y2;
    const dist3 = x3 * x3 + y3 * y3;
    const detxc = det3(dist1, y1, 1, dist2, y2, 1, dist3, y3, 1);
    const detyc = det3(x1, dist1, 1, x2, dist2, 1, x3, dist3, 1);
    const xc = detxc / (2 * det);
    const yc = detyc / (2 * det);
    const radius = Math.sqrt((x1 - xc) * (x1 - xc) + (y1 - yc) * (y1 - yc));
    return [xc, yc, radius];
}
function det3(a11, a12, a13, a21, a22, a23, a31, a32, a33) {
    //return (a11*(a22*a33 − a23*a32) + a12*(a23*a31 - a21*a33) + a13*(a21*a32 − a22*a31));
    const val1 = a11 * (a22 * a33 - a23 * a32);
    const val2 = a12 * (a23 * a31 - a21 * a33);
    //var val3 = a13*(a21*a32 − a22*a31); // don't work??
    const val3 = a13 * (a21 * a32) - a13 * (a22 * a31);
    return val1 + val2 + val3;
}
//# sourceMappingURL=utils_math.js.map