
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