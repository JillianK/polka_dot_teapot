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


/**
 *
 * @param {Triangle} tri
 * @param {Material} mat
 */
function defaultShader(tri,mat) {
    const [x0_, y0_, z0, , , , r0, g0,b0,u0,v0] = transformPosition(...tri[0]);
    const [x1_, y1_, z1, , , ,   ,   ,  ,u1,v1] = transformPosition(...tri[1]);
    const [x2_, y2_, z2, , , ,   ,   ,  ,u2,v2] = transformPosition(...tri[2]);

    const x0 = width_helper(x0_);
    const y0 = height_helper(y0_);

    const x1 = width_helper(x1_);
    const y1 = height_helper(y1_);

    const x2 = width_helper(x2_);
    const y2 = height_helper(y2_);

    //Inputs: v0, v1, v2 - each an (x,y) [ignore z, normal, uv]; c (an rgb value)
    const f01 = (x, y) => { return (y0 - y1) * x + (x1 - x0) * y + x0 * y1 - x1 * y0 };
    const f12 = (x, y) => { return (y1 - y2) * x + (x2 - x1) * y + x1 * y2 - x2 * y1 };
    const f20 = (x, y) => { return (y2 - y0) * x + (x0 - x2) * y + x2 * y0 - x0 * y2 };
    const zAtPix = (alpha, beta, gamma) => { return alpha * z0 + beta * z1 + gamma * z2 };

    //clip v0,v1,v2 to the buffer ie. (xres,yres)
    const xmin = floor(max(min(x0, x1, x2), 0));
    const xmax = ceil(min(max(x0, x1, x2), width - 1));

    const ymin = floor(max(min(y0, y1, y2), 0));
    const ymax = ceil(min(max(y0, y1, y2), height - 1));

    const alpha0 = f12(x0, y0);
    const beta0 = f20(x1, y1);
    const gamma0 = f01(x2, y2);

    for (let y = ymin; y <= ymax; y++) {
        for (let x = xmin; x <= xmax; x++) {
            const alpha = f12(x, y) / alpha0;
            const beta = f20(x, y) / beta0;
            const gamma = f01(x, y) / gamma0;

            if (alpha >= 0 && beta >= 0 && gamma >= 0) {
                let zPix = zAtPix(alpha, beta, gamma);
                if (zPix < state.z[x + y * width]) {
                    const [r,g,b] = dVMultFn(255,getTexture(
                            (alpha*u0+beta*u1+gamma*u2),
                            (alpha*v0+beta*v1+gamma*v2)
                        ));
                    setPixel(x, y, r0+r, g0+g, b0+b, 255);
                    state.z[x + y * width] = zPix;
                }
            }
        }
    }
}




/**
 *
 * @param {Triangle} tri
 * @param {Material} mat
 */
function goraudShader(tri,mat) {
    const [x0_, y0_, z0, , , , r0,g0,b0,u0,v0] = transformPosition(...tri[0]);
    const [x1_, y1_, z1, , , , r1,g1,b1,u1,v1] = transformPosition(...tri[1]);
    const [x2_, y2_, z2, , , , r2,g2,b2,u2,v2] = transformPosition(...tri[2]);

    const c0 = [r0,g0,b0];
    const c1 = [r1,g1,b1];
    const c2 = [r2,g2,b2];

    const x0 = width_helper(x0_);
    const y0 = height_helper(y0_);

    const x1 = width_helper(x1_);
    const y1 = height_helper(y1_);

    const x2 = width_helper(x2_);
    const y2 = height_helper(y2_);

    //Inputs: v0, v1, v2 - each an (x,y) [ignore z, normal, uv]; c (an rgb value)
    const f01 = (x, y) => { return (y0 - y1) * x + (x1 - x0) * y + x0 * y1 - x1 * y0 };
    const f12 = (x, y) => { return (y1 - y2) * x + (x2 - x1) * y + x1 * y2 - x2 * y1 };
    const f20 = (x, y) => { return (y2 - y0) * x + (x0 - x2) * y + x2 * y0 - x0 * y2 };
    const zAtPix = (alpha, beta, gamma) => { return alpha * z0 + beta * z1 + gamma * z2 };

    //clip v0,v1,v2 to the buffer ie. (xres,yres)
    const xmin = floor(max(min(x0, x1, x2), 0));
    const xmax = ceil(min(max(x0, x1, x2), width - 1));

    const ymin = floor(max(min(y0, y1, y2), 0));
    const ymax = ceil(min(max(y0, y1, y2), height - 1));

    const alpha0 = f12(x0, y0);
    const beta0 = f20(x1, y1);
    const gamma0 = f01(x2, y2);

    for (let y = ymin; y <= ymax; y++) {
        for (let x = xmin; x <= xmax; x++) {
            const alpha = f12(x, y) / alpha0;
            const beta = f20(x, y) / beta0;
            const gamma = f01(x, y) / gamma0;

            if (alpha >= 0 && beta >= 0 && gamma >= 0) {
                let zPix = zAtPix(alpha, beta, gamma);
                if (zPix < state.z[x + y * width]) {
                    /**@type {Color} */
                    const [r,g,b] = math.chain(c0)
                        .multiply(alpha)
                        .add(math.multiply(beta, c1))
                        .add(math.multiply(gamma, c2))
                        .add(dVMultFn(255,getTexture(
                            (alpha*u0/z0+beta*u1/z1+gamma*u2/z2)*zPix,
                            (alpha*v0/z0+beta*v1/z1+gamma*v2/z2)*zPix
                        )))
                        .done();

                    setPixel(x, y, r, g, b, 255);
                    state.z[x + y * width] = zPix;
                }
            }
        }
    }
}

/**
 *
 * @param {Triangle} tri
 */
 function phongShader(tri) {
    const pos0 = tri[0].slice(0,3);
    const pos1 = tri[1].slice(0,3);
    const pos2 = tri[2].slice(0,3);
    const [x0_, y0_, z0, nx0, ny0, nz0,,,,u0,v0] = transformPosition(...tri[0]);
    const [x1_, y1_, z1, nx1, ny1, nz1,,,,u1,v1] = transformPosition(...tri[1]);
    const [x2_, y2_, z2, nx2, ny2, nz2,,,,u2,v2] = transformPosition(...tri[2]);

    const x0 = width_helper(x0_);
    const y0 = height_helper(y0_);

    const x1 = width_helper(x1_);
    const y1 = height_helper(y1_);

    const x2 = width_helper(x2_);
    const y2 = height_helper(y2_);

    //Inputs: v0, v1, v2 - each an (x,y) [ignore z, normal, uv]; c (an rgb /value)
    const f01 = (x, y) => { return (y0 - y1) * x + (x1 - x0) * y + x0 * y1 - x1 * y0 };
    const f12 = (x, y) => { return (y1 - y2) * x + (x2 - x1) * y + x1 * y2 - x2 * y1 };
    const f20 = (x, y) => { return (y2 - y0) * x + (x0 - x2) * y + x2 * y0 - x0 * y2 };
    const zAtPix = (alpha, beta, gamma) => { return alpha * z0 + beta * z1 + gamma * z2 };

    //clip v0,v1,v2 to the buffer ie. (xres,yres)
    const xmin = floor(max(min(x0, x1, x2), 0));
    const xmax = ceil(min(max(x0, x1, x2), width - 1));

    const ymin = floor(max(min(y0, y1, y2), 0));
    const ymax = ceil(min(max(y0, y1, y2), height - 1));

    const alpha0 = f12(x0, y0);
    const beta0 = f20(x1, y1);
    const gamma0 = f01(x2, y2);


    for (let y = ymin; y <= ymax; y++) {
        for (let x = xmin; x <= xmax; x++) {
            const alpha = f12(x, y) / alpha0;
            const beta = f20(x, y) / beta0;
            const gamma = f01(x, y) / gamma0;

            if (alpha >= 0 && beta >= 0 && gamma >= 0) {
                let zPix = zAtPix(alpha, beta, gamma);
                if (zPix < state.z[x + y * width]) {
                    //const invz = 1/zPix;
                    /**@type {Color} */
                    let norm = vecAdd(
                        dVMultFn(alpha,[nx0,ny0,nz0]),
                        dVMultFn(beta,[nx1,ny1,nz1]),
                        dVMultFn(gamma,[nx2,ny2,nz2]));
                    norm = normalize(norm);
                    //console.log(zPix,alpha,beta,gamma,u0,v0);
                    const [r,g,b] = state.computeColor(norm,
                        vecAdd(
                            dVMultFn(alpha,pos0),
                            dVMultFn(beta,pos1),
                            dVMultFn(gamma,pos2)),
                        [
                            (alpha*u0/z0+beta*u1/z1+gamma*u2/z2)*zPix,
                            (alpha*v0/z0+beta*v1/z1+gamma*v2/z2)*zPix
                        ]);

                    setPixel(x, y, r, g, b, 255);
                    state.z[x + y * width] = zPix;
                }
            }
        }
    }
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

    //const n = math.divide(_n,math.norm(_n));
    //const p = math.divide(_p,math.norm(_p));

    //with ambience
    // let color = [0,0,0];
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
    // if(printSparse++ % 500 ==0){

    //     console.log(dVMultFn(255, VeMultFn(color,mat.Cs)),
    //      math.chain(color)
    //     .dotMultiply(mat.Cs)
    //     .multiply(255)
    //     .done());
    // }
    color = vecAdd(color,getTexture(texture[0],texture[1]));
    //console.log(color);
    return dVMultFn(255, VeMultFn(color,mat.Cs));
}

function getTexture(u,v,tmap){
    //console.log(u,v)
    tmap = consts.texture.teapot1;
    const xLoc = (1-u)*(tmap.width-1);
    const yLoc = v*(tmap.height-1);

    // if(u==1 || v==1){
    //     console.log('u and v');
    // }

    const xBase = Math.trunc(xLoc);
    const yBase = Math.trunc(yLoc);

    const xFrac = xLoc - xBase;
    const yFrac = yLoc - yBase;
    //console.log(`${xFrac} ${yFrac}`)

    // xLocation,yLocation will be fractional, ie 100.26, 212.84,
    // and we need to compute its RGB there, taking 4 adjacent
    // pixels at xLocation,yLocation and linearly blending their RGBs:
    const p00 = tmap.get(xBase,yBase).slice(0,3);     // bottom-left
    const p11 = tmap.get(1+xBase,1+yBase).slice(0,3); // top-right (diagonal)
    const p10 = tmap.get(1+xBase,yBase).slice(0,3);   // to the right of p00
    const p01 = tmap.get(xBase,1+yBase).slice(0,3);   // to the top of p00


    // Given RGBs at p00, p10, p11 and p01, what is the blended (bi-lerped) RGB?
    // Look up how to do this :) Hint: you'd use 0..1 fractions (from xLocation and yLocation)
    // to perform three lerps (eg between (p00,p10), between (p01,p11), between those two results)
    // See below :)

    // Given 'f' to be x fraction (ie xLocation - trunc(xLocation)) and 'g' to likewise be consolethe
    // y fraction, and given RGBs at p00, p10, p11, p01, the interps look like so:
    const p0010RGB =  vecAdd(dVMultFn(xFrac,p10),dVMultFn(1-xFrac, p00));// f*p10 + (1-f)*p00 // [note - please rewrite such f 1-f formulae to use just one mult!]
    const p0111RGB =  vecAdd(dVMultFn(xFrac,p11),dVMultFn(1-xFrac,p01))//f*p11RGB + (1-f)*p01RGB
    const pOutputRGB = vecAdd(dVMultFn(yFrac,p0111RGB),dVMultFn(1-yFrac,p0010RGB))//yFrac*p0111RGB + (1-yFrac)*p0010RGB
    // as a quick check, if f=0, g=0 (we are exactly at the bottom-left pixel), we get
    //pOutputRGB != 0*p01RGB + 1*p00RGB = p00RGB

    //console.log(p00,p11,p10,p01);
    // console.log(`${pOutputRGB}`);
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
    // console.log("Color",a_c)
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

/** */
function transformPosition(x, y, z, nx, ny, nz,tu,tv){
    let pos0 = [[x], [y], [z], [1]];
    let pCam = math.multiply(state.O2C, pos0);
    let v = math.multiply(state.persp,pCam);
    v = math.divide(v, v[3][0]);
    v[2][0] = state.z_(v[2][0]);

    let n = math.multiply(state.O2C_i_t, [[nx],[ny],[nz],[1]]);
    n = normalize(v4_2_v3(squeezeFn(n)));


    //console.log(n,pCam);
    const [r,g,b] = state.computeColor(n, [x,y,z],[0,0]);

    return [v[0][0], v[1][0], v[2][0],n[0],n[1],n[2],r,g,b,tu,tv];
}

/**
 *
 * @param {number} x
 * @returns {number}
 */
function width_helper(x) {
    return Math.round((x + 1) * (width - 1) / 2);
}

/**
 *
 * @param {number} y
 * @returns {number}
 */
function height_helper(y) {
    return Math.round((y + 1) * (height - 1) / 2);
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
 *
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
 *
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

// ia ambient intensity
// function shade(ia, ka, lights, camera, normal){
//   let s  = ia*ka;
//   for(let light in lights){

//   }
// }

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
    // const renderMatrix = math.chain(state.W2NDC).multiply(TMatrix).multiply(SRMatrix).done();

    // state.SR_i_t = math.chain(state.cam).multiply(math.chain(SMatrix).inv().transpose().done()).multiply(RMatrix).done();
    // console.log(state.SR_i_t);
    // state.W2NDCR = renderMatrix;
    state.O2C = math.chain(state.cam).multiply(TMatrix).multiply(SRMatrix).done();
    state.O2C_i_t = math.chain(getRotationMatrix(-Rx,-Ry,-Rz)).multiply(math.divide(1,SMatrix)).multiply(math.inv(state.cam)).transpose().done();
    state.O2W = math.chain(TMatrix).multiply(SRMatrix).done();
    state.O2W_i_t = math.chain(RMatrix).inv().multiply(math.divide(1,SMatrix)).done();

    let triangles = geometries[shape['geometry']];

    state.computeColor = (norm,pos,texture) => state.computeColorBase(shape.material,norm,pos,texture)

    // console.log(shape.material);
    // let sparsity = 0;
    for (let triangle of triangles) {
        //const tri = transformTriangle(JSON.parse(JSON.stringify(triangle)));
        // if (sparsity %5 ==0){
        state.myshader(JSON.parse(JSON.stringify(triangle)), shape.material);//},ind*10);
        // }
    }
}

/**
*
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
    loadImage(
    //'https://th.bing.com/th/id/R437375a441f14bf1e2157204e6f6d0b8?rik=mKm79ueelonvyw&riu=http%3a%2f%2f3.bp.blogspot.com%2f-f0rZnopfgIs%2fTZjAqNx8HBI%2fAAAAAAAAAGw%2fxzST5LoV2o4%2fs1600%2fusc.jpg&ehk=G8eosq3gG9p18l4lM1L%2bp%2b8j8%2fKkTm0Vs0pitIL14vQ%3d&risl=&pid=ImgRaw',
    //'https://th.bing.com/th/id/Rb6f389915e8b278e1fa1cbb14d07381f?rik=QZovV6KJ7h%2byKw&riu=http%3a%2f%2fviterbivoices.usc.edu%2fwp-content%2fuploads%2f2013%2f04%2fusc-shield.jpg&ehk=RVgW%2fgwrEI3Ra8GSsnhvnEfA%2fabDbeuiJ4qKCyrgOOg%3d&risl=&pid=ImgRawg',
    'https://th.bing.com/th/id/R1219ecd08aad4d881c9b9f2b59b1d7f6?rik=%2bYVYlooD5gi45Q&riu=http%3a%2f%2feskipaper.com%2fimages%2fusc-logo-wallpaper-1.jpg&ehk=EQxcPWEYQ96rYYFfkrOcF0h97Vj1IQG0MzntTaSIKlk%3d&risl=&pid=ImgRaw',
    (img)=>{consts.texture.teapot1=img}
    );
}

function setup(){
    geometries["teapot"] = processText(consts.geos.teapot);
    geometries["triangle"] = processText(consts.geos.triangle);
    state.myshader = phongShader; // phong goraud default
    let scene = consts.scene;
    state.scene = scene;
    setupScene(scene.scene.camera);
    setupShaders(scene.scene.lights);
}

function myredraw(){
    let scene = state.scene;
    setupScene(scene.scene.camera);
    setupShaders(scene.scene.lights);
    redraw();
}

function draw(){
    let scene = state.scene;
    console.log(scene.scene);
    const start = Date.now();
    setupScene(scene.scene.camera);
    setupShaders(scene.scene.lights);
    state.z = new Float32Array(width*height);
    state.z.fill(Number.POSITIVE_INFINITY);
    state.fb = new Uint8ClampedArray(width*height*4);
    background('lightgray');
    loadPixels();
    renderScene(scene.scene.shapes);
    console.log("Rendered in: ", Date.now()- start);
    updatePixels();
    noLoop();
}

function normFn(arr){
    let s = 0;
    for(let i =0; i < arr.length; i++){
        s += arr[i]*arr[i];
    }
    return Math.sqrt(s);
}

/**
 * distributive vector multiplication
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
 * elementwise vector multiplication
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

function dotFn(v1, v2){
    let s = 0;
    for (let i =0; i < v1.length; i++){
        s += v1[i]*v2[i];
    }
    return s;
}

/**
 * @param {*[]} arr
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

function squeezeFn(arr){
    return arr.map((n)=>n[0]);
}

function vecAdd(v,...vs){
    let res = v.slice();
    for(let i = 0; i < vs.length; i++){
        for(let j =0; j < v.length; j++){
            res[j]+= vs[i][j];
        }
    }
    return res;
}

function v4_2_v3 (v) {
    let v3 = v.slice(0,3);
    for (let i =0; i < 3; i++){
        v3[i] /= v[3];
    }
    return v3;
}

/***************************************** */


// const _persp1 = /* near=1, far = 100 */
//   (left,right,bottom,top, near, far) => {
//     const n2 = 2*near;
//     const fpn = far+near;
//     const fmn = far-near;
//     const rml = right-left;
//     const rpl = right+left;
//     const tmb = top-bottom;
//     const tpb = top+bottom;
//     return math.matrix(
//     [
//       [n2/rml , 0       ,  0, rpl/rml],
//       [0      , n2/tmb  ,  0, tpb/tmb],
//       [0      , 0       , -fpn/fmn, -far*n2 / fmn],
//       [0      , 0       , -1      , 0]
//     ]
//   )};


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
