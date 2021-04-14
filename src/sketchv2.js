var state = {

}

/**
 *
 * @param {Camera} camera
 */
function setupScene(camera) {
    let [resX, resY] = camera.resolution;
    let bounds = camera.bounds;
    let from_pos = camera.from;
    let to_pos = camera.to;

    let camMatrix = getCameraMatrix(from_pos, to_pos);
    let perspMatrix = getPerspectiveMatrix(...bounds);
    let W2NDC = math.multiply(perspMatrix,camMatrix);

    state.cam = camMatrix;
    state.persp = perspMatrix;
    state.W2NDC = W2NDC;

    createCanvas(resX, resY);
    pixelDensity(1);
    console.log("Finished setup");
}

var printSparse = 0;
/**
 * @param {Color} a_l Ambient light (light_color* intensity)
 * @param {{d:Vector3,c:Color}[]} d_ls directional light list
 * @param {Material} mat
 * @param {Vector3} n current normal (in camera space)
 * @param {Vector3} p current position (in camera space)
 * @param {[number,number]} texture current texture coordinates
 */
function computeColor(a_l, d_ls, mat,n,p,texture){
    //with ambience
    let color = [...a_l];
    for (let i =0; i < d_ls.length; i++) {
        // // N dot L
        const ln = Math.max(0,math.abs(math.dot(n, d_ls[i].d)));
        //diffusion
        const d = dVMultFn(mat.Kd * ln,d_ls[i].c);

        //specular
        let V = math.subtract([0,0,1],p);
        V = normalize(V);

        let H = math.add(V,d_ls[i].d);
        H = normalize(H);
        //Specularity
        const S = ln > 0? Math.pow(Math.max(0,dotFn(n,H)),mat.n): 0;
        const s = dVMultFn(mat.Ks*S, d_ls[i].c);
        color = vecAdd(color,d,s);
    }
    if(texture){
        const tex = getTexture(texture[0],texture[1],texture);
        color = vecAdd(color,tex);
    }
    return dVMultFn(255, VeMultFn(color,mat.Cs));
}

/**
 * Retrieves texture from currrent texture map in tmap from texture coordinate u,v
 * @param {number} u 
 * @param {number} v 
 * @param {number[][][]} tmap Dimensions of w x h x 3 
 * @returns 
 */
function getTexture(u,v,tmap){
    u = Math.min(u,1);
    v = Math.min(v,1);
    tmap = consts.texture.teapot1;
    const xLoc = (1-u)*(tmap[0].length-2);
    const yLoc = v*(tmap.length-2);

    const xBase = Math.trunc(xLoc);
    const yBase = Math.trunc(yLoc);

    const xFrac = xLoc - xBase;
    const yFrac = yLoc - yBase;
    if(tmap===undefined || tmap[xBase]===undefined || tmap[xBase][yBase]===undefined){
        console.log(u,v,xBase,yBase,tmap.length, tmap[0].length);
    }

    // xLocation,yLocation will be fractional, ie 100.26, 212.84,
    // and we need to compute its RGB there, taking 4 adjacent
    // pixels at xLocation,yLocation and linearly blending their RGBs:
    const p00 = tmap[xBase][yBase].slice(0, 3);// bottom-left
    const p11 = tmap[1+xBase][1+yBase].slice(0, 3);// top-right (diagonal)
    const p10 = tmap[1+xBase][yBase].slice(0, 3);// to the right of p00
    const p01 = tmap[xBase][1+yBase].slice(0, 3);// to the top of p00


    // Given RGBs at p00, p10, p11 and p01, what is the blended (bi-lerped) RGB?
    // Look up how to do this :) Hint: you'd use 0..1 fractions (from xLocation and yLocation)
    // to perform three lerps (eg between (p00,p10), between (p01,p11), between those two results)

    // Given 'f' to be x fraction (ie xLocation - trunc(xLocation)) and 'g' to likewise be consolethe
    // y fraction, and given RGBs at p00, p10, p11, p01, the interps look like so:
    const p0010RGB =  vecAdd(dVMultFn(xFrac,p10),dVMultFn(1-xFrac, p00));
    const p0111RGB =  vecAdd(dVMultFn(xFrac,p11),dVMultFn(1-xFrac,p01));
    const pOutputRGB = vecAdd(dVMultFn(yFrac,p0111RGB),dVMultFn(1-yFrac,p0010RGB));
    // as a quick check, if f=0, g=0 (we are exactly at the bottom-left pixel), we get
    //pOutputRGB != 0*p01RGB + 1*p00RGB = p00RGB

    return dVMultFn(1/255,pOutputRGB);
}

/**
 *
 * @param {Light[]} lights
 */
function setupShaders(lights) {
    /**@type {AmbientLight} */
    let ambient_light;
    /**@type {DirectionalLight[]} */
    let directional_lights = [];

    for(let light of lights){
        if (light.type === 'ambient'){
            ambient_light = light;
        }else{
            directional_lights.push(/**@type {DirectionalLight}*/light);
        }
    }

    const a_c = dVMultFn(ambient_light.intensity,ambient_light.color);

    /**@type {{d:Vector3,c:Color}[]} */
    const d_ls = directional_lights.map(
        (_d) =>  {
            let dir = math.subtract(_d.to,_d.from);
            dir = math.multiply(state.cam,[..._d.from.map(x=>[x]),[1]]);
            return {
            "d": /** @type {Vector3}*/normalize(v4_2_v3(squeezeFn(dir))),
            "c": math.multiply(_d.color,_d.intensity)
            };
        });
    state.computeColorBase = (mat,norm,pos,texture) => computeColor(a_c,d_ls,mat,norm,pos,texture);
}

/**
 *
 * @param {number} left
 * @param {number} right
 * @param {number} bottom
 * @param {number} top
 * @param {number} near
 * @param {number} far
 * @returns
 */
function getPerspectiveMatrix(near,far, left, right, top, bottom) {
    const n2 = 2 * near;
    const fpn = far + near;
    const fmn = far - near;
    const rml = right - left;
    const rpl = right + left;
    const tmb = top - bottom;
    const tpb = top + bottom;

    const z_ = (z) => fpn/fmn + (far*n2 /z);
    state.z_ = z_;

    return [
            [n2 / rml, 0, rpl / rml, 0],
            [0, n2 / tmb, tpb / tmb, 0],
            [0, 0, -fpn / fmn, -far * n2 / fmn],
            [0, 0, 1, 0]
        ];
};

/** 
 * Given Object positions normals and texture coordinates, output NDC position, NDC normal, color and texture coordinates
*/
function transformPosition(x, y, z, nx, ny, nz,tu,tv){
    let pos0 = [[x], [y], [z], [1]];
    let pCam = math.multiply(state.O2C, pos0);
    let v = math.multiply(state.persp,pCam);
    v = math.divide(v, v[3][0]);
    v[2][0] = state.z_(v[2][0]);

    let n = math.multiply(state.O2C_i_t, [[nx],[ny],[nz],[1]]);
    n = normalize(v4_2_v3(squeezeFn(n)));

    const [r,g,b] = state.computeColor(n, [v[0][0], v[1][0], v[2][0]]);

    return [v[0][0], v[1][0], v[2][0],n[0],n[1],n[2],r,g,b,tu,tv];
}

/**
*
* @param {number} x
* @param {number} y
* @param {number} r
* @param {number} g
* @param {number} b
* @param {number} a
*/
function setPixel(x, y, r, g, b, a) {
    const index = 4 * (x + y * width);
    pixels[index] = state.fb[index] = r;
    pixels[index + 1] = state.fb[index + 1] = g;
    pixels[index + 2] = state.fb[index + 2] = b;
    pixels[index + 3] = state.fb[index + 3] = a;
}

/**
 *
 * @param {string} txt
 * @returns
 */
function processText(txt) {
    let lines = txt.trim().split('\n');
    let triangles = [];
    while (lines.length > 0) {
        let [, v1, v2, v3] = lines.splice(0, 4);
        triangles.push(
            [v1.split(/[ \t]/).map(Number),
            v2.split(/[ \t]/).map(Number),
            v3.split(/[ \t]/).map(Number)]);
    }
    return triangles;
}

/**
*
* @param {Shape} shape
*/
function drawObject(shape) {
    let Rx = 0, Ry = 0, Rz = 0, S = [1, 1, 1], T = [0, 0, 0];
    for (let transform of shape.transforms) {
        Rx = transform['Rx'] || Rx;
        Ry = transform['Ry'] || Ry;
        Rz = transform['Rz'] || Rz;
        S = transform['S'] || S;
        T = transform['T'] || T;
    }

    const TMatrix = getTranslationMatrix(...T);
    const RMatrix = getRotationMatrix(Rx, Ry, Rz);
    const SMatrix = getScaleMatrix(...S);
    const SRMatrix = math.multiply(SMatrix,RMatrix);

    state.O2C = math.chain(state.cam).multiply(TMatrix).multiply(SRMatrix).done();
    state.O2C_i_t = math.chain(getRotationMatrix(-Rx,-Ry,-Rz)).multiply(math.divide(1,SMatrix)).multiply(math.inv(state.cam)).transpose().done();
    state.O2W = math.chain(TMatrix).multiply(SRMatrix).done();
    state.O2W_i_t = math.chain(RMatrix).inv().multiply(math.divide(1,SMatrix)).done();

    let triangles = geometries[shape['geometry']];

    state.computeColor = (norm,pos,texture) => state.computeColorBase(shape.material,norm,pos,texture)

    for (let triangle of triangles) {
        state.myshader(JSON.parse(JSON.stringify(triangle)), shape.material);
    }
}

/**
*
* @param {Shape[]} shapes
*/
function renderScene(shapes) {
    console.log("Rendering scene",shapes);
    for (let shape of shapes) {
        console.log("Drawing: ", shape.id);
        const start = Date.now()
        drawObject(shape);
        console.log("Finished in: ", Date.now()-start);
    }
}

var geometries = {};

function preload(){
    consts.texture.teapot1 = getDots();
}

function setup(){
    geometries["teapot"] = processText(consts.geos.teapot);
    geometries["triangle"] = processText(consts.geos.triangle);
    state.myshader = phongShader; // phong goraud default
    let scene = consts.scene;
    state.scene = scene;
    setupScene(scene.scene.camera);
    setupShaders(scene.scene.lights);

    state.z = new Float32Array(width*height);
    state.z.fill(Number.POSITIVE_INFINITY);
    state.fb = new Uint8ClampedArray(width*height*4);
}

function myredraw(){
    let scene = state.scene;
    state.z.fill(Number.POSITIVE_INFINITY);
    state.fb.fill(0);
    setupScene(scene.scene.camera);
    setupShaders(scene.scene.lights);
    redraw();
}

function draw(){
    let scene = state.scene;
    //console.log(scene.scene);
    const start = Date.now();
    background('lightgray');
    loadPixels();
    renderScene(scene.scene.shapes);
    console.log("Rendered in: ", Date.now() - start);
    updatePixels();
    noLoop();
}

/***************************************** */


//-----------------------------------TYPES
/** @typedef {Array<Number>} Color
 * @typedef {Array<Number>} Vertex
 * @typedef {Array<Vertex>} Triangle
 * @typedef {[number,number,number,number]} Vector4
 * @typedef {[number,number,number]} Vector3
 * @typedef {[Vector4,Vector4,Vector4,Vector4]} Matrix
 * @typedef {{Rx?:number,Ry?:number,Rz?:number,S?:Vector3,T?:Vector3}} Transform
 * @typedef {{Cs:Color, Ka:number,Ks:number,Kd:number,n:number}} Material
 * @typedef {{id:string,notes:string,geometry:string,material:Material,transforms:Transform[]}} Shape
 * @typedef {BaseLight & Directional} DirectionalLight
 * @typedef {BaseLight} AmbientLight
 * @typedef {DirectionalLight|AmbientLight} Light
 * @typedef {Directional & {resolution:Vector3,bounds:number[]}} Camera
 * @typedef {{scene:Scene}} SceneObj
 */
 /**
  * @typedef {Object} Directional
  * @property {Vector3} from
  * @property {Vector3} to
  */
/**
 *  @typedef {Object} BaseLight
 *  @property {Color} color
 *  @property {number} intensity
 *  @property {string} id
 *  @property {string} type
 */

/**
 * @typedef {Object} Scene
 * @property {Shape[]} shapes
 * @property {Light[]} lights
 * @property {Camera} camera
 */
