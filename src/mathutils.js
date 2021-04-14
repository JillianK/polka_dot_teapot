/**
 * Scale [-1,1] to [0,width)
 * @param {number} x
 * @returns {number}
 */
function width_helper(x) {
    return Math.round((x + 1) * (width - 1) / 2);
}

/**
 * Scale [-1,1] to [0,height)
 * @param {number} y
 * @returns {number}
 */
function height_helper(y) {
    return Math.round((y + 1) * (height - 1) / 2);
}

/*** REQUIRED MATRIX OPERATIONS ***/

/**
* @param {Vector3} cam
* @param {Vector3} origin
* @returns
*/
function getCameraMatrix(cam, origin) {
    let n0 = math.subtract(cam, origin);
    let r = cam;
    let n = normalize(n0);
    let u = math.cross([0, 1, 0], n);
    u = math.divide(u, math.norm(u))
    let v = math.cross(n, u);
    v = normalize(v);

    const camera_matrix_helper = (a) => [a[0], a[1], a[2], -dotFn(r,a)]
    return [
                camera_matrix_helper(u),
                camera_matrix_helper(v),
                camera_matrix_helper(n),
                [0, 0, 0, 1]
            ];
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {Matrix}
 */
function getTranslationMatrix(x, y, z) {
    return [
        [1, 0, 0, x],
        [0, 1, 0, y],
        [0, 0, 1, z],
        [0, 0, 0, 1]
    ]
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {Matrix}
 */
function getScaleMatrix(x, y, z) {
    return [
        [x, 0, 0, 0],
        [0, y, 0, 0],
        [0, 0, z, 0],
        [0, 0, 0, 1]
    ]
}

/**
 * @param {number} Rx
 * @param {number} Ry
 * @param {number} Rz
 * @returns {Matrix}
 */
function getRotationMatrix(Dx, Dy, Dz) {
    const Rx = Math.PI / 180 * Dx;
    const Ry = Math.PI / 180 * Dy;
    const Rz = Math.PI / 180 * Dz;
    const [cosa, sina, cosb, sinb, cosc, sinc] = [Math.cos(Rz), Math.sin(Rz), Math.cos(Ry), Math.sin(Ry), Math.cos(Rx), Math.sin(Rx)];
    /** @type {Matrix} */
    const Rmatrix = [
        [cosa * cosb, cosa * sinb * sinc - sina * cosc, cosa * sinb * cosc + sina * sinc, 0],
        [sina * cosb, sina * sinb * sinc + cosa * cosc, sina * sinb * cosc - cosa * sinc, 0],
        [-sinb      , cosb * sinc                     , cosb * cosc, 0],
        [0, 0, 0, 1]];
    return Rmatrix
}

/*** BASIC MATH FUNCTIONS ***/

/**
 * Get the vector norm of array `arr`
 * @param{number[]} arr
 * @returns {number}
 */
function normFn(arr){
    let s = 0;
    for(let i =0; i < arr.length; i++){
        s += arr[i]*arr[i];
    }
    return Math.sqrt(s);
}

/**
 * Element-wise vector multiplication
 * i.e. x .* V
 * @param {number} x
 * @param {number[]} v
 * @returns {number[]}
 */
function dVMultFn(x,v){
    let res = v.slice();
    for(let i = 0; i < res.length; i++){
        res[i] *= x;
    }
    return res;
}

/**
 * Elementwise vector multiplication given 2 vectors
 * i.e. V1 .* V2
 * @param {number[]} v1
 * @param {number[]} v2
 * @returns {number[]}
 */
function VeMultFn(v1,v2){
    let res = v1.slice();
    for(let i = 0; i < res.length; i++){
        res[i] *= v2[i];
    }
    return res;
}

/**
 * Dot product of 2 vectors
 * i.e. V1.V2
 * @param {number[]} v1 
 * @param {number[]} v2 
 * @returns {number}
 */
function dotFn(v1, v2){
    let s = 0;
    for (let i =0; i < v1.length; i++){
        s += v1[i]*v2[i];
    }
    return s;
}

/**
 * Get the unitized version of a vector
 * @param {number[]} arr
 * @returns {number[]} 
 * */
function normalize(arr){
    let s = 0;
    let ret = arr.slice();
    for(let i =0; i < arr.length; i++){
        s += arr[i]*arr[i];
    }
    s = math.sqrt(s);
    for(let i =0; i < ret.length; i++){
        ret[i] /= s;
    }
    return ret;
}

/**
 * Squeeze a multidimensional array into 1 dimension
 * Essentially a transpose
 * @param {number[][]} arr 
 * @returns {number[]}
 */
function squeezeFn(arr){
    return arr.map((n)=>n[0]);
}

/**
 * Add multiple vectors
 * @param {number[]} v 
 * @param  {...number[]} vs 
 * @returns {number[]}
 */
function vecAdd(v,...vs){
    let res = v.slice();
    for(let i = 0; i < vs.length; i++){
        for(let j =0; j < v.length; j++){
            res[j]+= vs[i][j];
        }
    }
    return res;
}

/**
 * V[0:3]/V[3]
 * @param {number[]} v 
 * @returns {number[]}
 */
function v4_2_v3 (v) {
    let v3 = v.slice(0,3);
    for (let i =0; i < 3; i++){
        v3[i] /= v[3];
    }
    return v3;
}