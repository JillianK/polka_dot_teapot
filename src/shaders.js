
/**
 *
 * @param {Triangle} tri
 */
 function phongShader(tri) {
    const [xi0,yi0,zi0] = tri[0].slice(0,3);
    const [xi1,yi1,zi1] = tri[1].slice(0,3);
    const [xi2,yi2,zi2] = tri[2].slice(0,3);
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
                    /**@type {Color} */ // norm = alpha*n0 + beta*n1 + gamma*n2
                    const norm = normalizeMut([
                        alpha*nx0 + beta*nx1 + gamma*nx2,
                        alpha*ny0 + beta*ny1 + gamma*ny2,
                        alpha*nz0 + beta*nz1 + gamma*nz2]);
                    const [r,g,b] = state.computeColor(norm,
                        /*vecAdd(
                            dVMultFn(alpha,pos0),
                            dVMultFn(beta,pos1),
                            dVMultFn(gamma,pos2)),*/
                        [
                            alpha*xi0 + beta*xi1 + gamma*xi2,
                            alpha*yi0 + beta*yi1 + gamma*yi2,
                            alpha*zi0 + beta*zi1 + gamma*zi2,
                        ],
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
                    const [r,g,b] = dVMultFnMut(255, getTexture(
                            (alpha*u0+beta*u1+gamma*u2),
                            (alpha*v0+beta*v1+gamma*v2)
                        ));
                    setPixel(x, y, r+r0, g+g0, b+b0, 255);
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
                    const [r,g,b] = 
                        
                        vecAdd(
                            [
                                alpha*r0 + beta*g0 + gamma*b0,
                                alpha*r1 + beta*g1 + gamma*b1,
                                alpha*r2 + beta*g2 + gamma*b2
                            ],
                            dVMultFnMut(255,getTexture(
                                (alpha*u0/z0+beta*u1/z1+gamma*u2/z2)*zPix,
                                (alpha*v0/z0+beta*v1/z1+gamma*v2/z2)*zPix
                            ))
                        );
                    // const [r, g, b] = dVMultFn(255, getTexture(
                    //             (alpha*u0/z0+beta*u1/z1+gamma*u2/z2)*zPix,
                    //             (alpha*v0/z0+beta*v1/z1+gamma*v2/z2)*zPix
                    //         ));
                    //console.log(r,g,b,c0[0],c0[1],c0[2]);
                    setPixel(x, y, r, g, b, 255);
                    state.z[x + y * width] = zPix;
                }
            }
        }
    }
}