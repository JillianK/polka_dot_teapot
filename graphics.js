
//Scans triangle pixels and calculates color at each pixel.
function scanTriangle(v0,v1,v2, material) {
  for(var i = 0; i < NUM_SAMPLES; i++) {
    var xmin = Math.floor(Math.min(v0.v[i][0],v1.v[i][0],v2.v[i][0]));
    var xmax = Math.ceil(Math.max(v0.v[i][0],v1.v[i][0],v2.v[i][0]));
    var ymin = Math.floor(Math.min(v0.v[i][1],v1.v[i][1],v2.v[i][1]));
    var ymax = Math.ceil(Math.max(v0.v[i][1],v1.v[i][1],v2.v[i][1]));
    var v0Light;
    var v1Light;
    var v2Light;

    if(gourad) {
      v0Light = computeTriangleLighting(v0.world_n, material);
      v1Light = computeTriangleLighting(v1.world_n, material);
      v2Light = computeTriangleLighting(v2.world_n, material);
    }

    let index = 4*(ymin+(i*width+xmin)*height);
    const xspan = 4*height;
    let original = index;
    for(var x=xmin; x <= xmax; x++,index+=xspan) {
      original = index;
      for(var y=ymin; y <= ymax; y++,index+=4) {
        var t_alpha = f01(x,y,v1.v[i][0],v1.v[i][1],v2.v[i][0],v2.v[i][1]) / f01(v0.v[i][0],v0.v[i][1],v1.v[i][0],v1.v[i][1],v2.v[i][0],v2.v[i][1])
        var t_beta =  f01(x,y,v2.v[i][0],v2.v[i][1],v0.v[i][0],v0.v[i][1]) / f01(v1.v[i][0],v1.v[i][1],v2.v[i][0],v2.v[i][1],v0.v[i][0],v0.v[i][1])
        var t_gamma = f01(x,y,v0.v[i][0],v0.v[i][1],v1.v[i][0],v1.v[i][1]) / f01(v2.v[i][0],v2.v[i][1],v0.v[i][0],v0.v[i][1],v1.v[i][0],v1.v[i][1])
        
        if ((t_alpha >= 0) && (t_beta >= 0) && (t_gamma >= 0)) {
          if(x >= 0 && x < p_width && y >= 0 && y < p_height) {
            var pixelZ = t_alpha * v0.v[i][2] + t_beta * v1.v[i][2] + t_gamma * v2.v[i][2];
            if(pixelZ < zBuffer[i][x*height+y]) {
              zBuffer[i][x*height+y] = pixelZ;

              frameBuffers.set(calculateGraphics(x, y, v0, v1, v2, t_alpha, t_beta, t_gamma, v0Light, v1Light, v2Light, material),index);
            }
          }
        }
      }
      index = original;
    }
  }
  
  //updatePixels();
}


function calculateGraphics(x, y, v0, v1, v2, t_alpha, t_beta, t_gamma, v0Light, v1Light, v2Light, material) {
  //perspective correct and interpolate U and V;
  var uv_values = interpolateUV(v0,v1,v2,t_alpha,t_beta,t_gamma);
  var unscaled_textures = textureLookup(uv_values[0], uv_values[1], texture_image);
  //var textureValues = scaleVector(unscaled_textures, Kt);
  var textureValues = [unscaled_textures[0] * Kt, unscaled_textures[1] * Kt, unscaled_textures[2] * Kt];
  var light_RGB;
  //var RGB_c;
  var v0Color = [0,0,0];
  var v1Color = [0,0,0];
  var v2Color = [0,0,0];
  var interpolated_c;

  if(gourad) {
    for(var i = 0; i < 3; i++) {
      v0Color[i] = v0Light.ambient[i] + v0Light.diffuse[i] + v0Light.specular[i];
      v1Color[i] = v1Light.ambient[i] + v1Light.diffuse[i] + v1Light.specular[i];
      v2Color[i] = v2Light.ambient[i] + v2Light.diffuse[i] + v2Light.specular[i];
    }
    
    interpolated_c = [v0Color[0] * t_alpha + v1Color[0] * t_beta + v2Color[0] * t_gamma,
      v0Color[1] * t_alpha + v1Color[1] * t_beta + v2Color[1] * t_gamma,
      v0Color[2] * t_alpha + v1Color[2] * t_beta + v2Color[2] * t_gamma];
    
    //light_RGB = scaleVector(interpolated_c, 255);
    light_RGB = [interpolated_c[0] * 255, interpolated_c[1] * 255, interpolated_c[2] * 255];
  }
  else {
    var interpolated_normal = [v0.world_n[0] * t_alpha + v1.world_n[0] * t_beta + v2.world_n[0] * t_gamma,
                               v0.world_n[1] * t_alpha + v1.world_n[1] * t_beta + v2.world_n[1] * t_gamma,
                               v0.world_n[2] * t_alpha + v1.world_n[2] * t_beta + v2.world_n[2] * t_gamma, 1];
    var phong_light_values = computeTriangleLighting(interpolated_normal, material, uv_values);
    //var phong_combined = addVectors(phong_light_values.ambient, addVectors(phong_light_values.diffuse, phong_light_values.specular));
    light_RGB = [(phong_light_values.ambient[0] + phong_light_values.diffuse[0] + phong_light_values.specular[0]) * 255,
                 (phong_light_values.ambient[1] + phong_light_values.diffuse[1] + phong_light_values.specular[1]) * 255,
                 (phong_light_values.ambient[2] + phong_light_values.diffuse[2] + phong_light_values.specular[2]) * 255];
    //light_RGB = scaleVector(phong_combined, 255);
    
  }

  //Combine light_RGB and texture values
  return [light_RGB[0] + textureValues[0], light_RGB[1] + textureValues[1], light_RGB[2] + textureValues[2]]; 
  //Create and set color using final color values.
  //var c = color(RGB_c[0], RGB_c[1], RGB_c[2]);
  //setPixel(x,y,c);
}

//Interpolate u and v
function interpolateUV(v0, v1, v2, t_alpha, t_beta, t_gamma) {
  var inv_z0 = 1 / v0.camV[2];
  var inv_z1 = 1 / v1.camV[2];
  var inv_z2 = 1 / v2.camV[2];
  var u_0 = v0.t[0] * inv_z0;
  var v_0 = v0.t[1] * inv_z0;
  var u_1 = v1.t[0] * inv_z1;
  var v_1 = v1.t[1] * inv_z1;
  var u_2 = v2.t[0] * inv_z2;
  var v_2 = v2.t[1] * inv_z2;
  var interpolated_u = t_alpha * u_0 + t_beta * u_1 + t_gamma * u_2;
  var interpolated_v = t_alpha * v_0 + t_beta * v_1 + t_gamma * v_2;
  var interpolated_z = t_alpha * inv_z0 + t_beta * inv_z1 + t_gamma * inv_z2;
  var inv_interpolated_z = 1 / interpolated_z;
  var corrected_UV = [];
  corrected_UV[0] = interpolated_u * inv_interpolated_z;
  corrected_UV[1] = interpolated_v * inv_interpolated_z;
  return corrected_UV;
}

//Look up texture value at u,v
function textureLookup(u,v,texmap) {
  /*
  var unalteredX = (1-u) * (texmap.width - 1);
  var unalteredY = v * (texmap.height - 1);
  var xLocation = floor(unalteredX);
  var yLocation = floor(unalteredY);
  */
  const unalteredX = (1-u) * (width - 1);
  const unalteredY = v * (height - 1);
  const xLocation = Math.trunc(unalteredX);
  const yLocation = Math.trunc(unalteredY);
  const f = unalteredX - xLocation;
  const g = unalteredY - yLocation;
  //blend 4 adjacent pixels at xLocation, yLocation
  /*
  var pixel_index = (xLocation + yLocation * texmap.width) * 4;
  var p00 = [texmap.pixels[pixel_index    ], texmap.pixels[pixel_index + 1], 
             texmap.pixels[pixel_index + 2], texmap.pixels[pixel_index + 3]];

  pixel_index = (1 + xLocation + (1 + yLocation) * texmap.width) * 4;

  var p11 = [texmap.pixels[pixel_index    ], texmap.pixels[pixel_index + 1], 
             texmap.pixels[pixel_index + 2], texmap.pixels[pixel_index + 3]];

  pixel_index = (1 + xLocation + yLocation * texmap.width) * 4;

  var p10 = [texmap.pixels[pixel_index    ], texmap.pixels[pixel_index + 1], 
             texmap.pixels[pixel_index + 2], texmap.pixels[pixel_index + 3]];

  pixel_index = (xLocation + (1 + yLocation) * texmap.width) * 4;

  var p01 = [texmap.pixels[pixel_index    ], texmap.pixels[pixel_index + 1], 
             texmap.pixels[pixel_index + 2], texmap.pixels[pixel_index + 3]];
  */

  var p00 = texmap[xLocation][yLocation];// bottom-left
  var p01 = texmap[xLocation][1+yLocation];// to the top of p00
  var p10 = texmap[1+xLocation][yLocation];// to the right of p00
  var p11 = texmap[1+xLocation][1+yLocation];// top-right (diagonal)

  
  var p0010RGB = [p00[0] + f*(p10[0]-p00[0]),p00[1] + f*(p10[1]-p00[1]), p00[2] + f*(p10[2]-p00[2])];
  var p0111RGB = [p01[0] + f*(p11[0]-p01[0]), p01[1] + f*(p11[1]-p01[1]), p01[2] + f*(p11[2]-p01[2])];
  return [p0010RGB[0] + g * (p0111RGB[0] - p0010RGB[0]),
  p0010RGB[1] + g * (p0111RGB[1] - p0010RGB[1]),
  p0010RGB[2] + g * (p0111RGB[2] - p0010RGB[2])];
}

//convert light to RGB value
function computeTriangleRGB(light_C, colorVal) {
  var rgb_color = [255 * light_C[0] * colorVal[0], 255 * light_C[1] * colorVal[1], 255 * light_C[2] * colorVal[2]];
  return rgb_color;
}

//compute the lighting of the triangle
function computeTriangleLighting(normalVec, material, uv_values) {

  var normal = normalVec;
  if(useBumpMap == true) {
    var u = uv_values[0];
    var v = uv_values[1];
    var unalteredX = (1-u) * (sz - 1);
    var unalteredY = v * (sz - 1);
    var xLocation = floor(unalteredX);
    var yLocation = floor(unalteredY);
    var displacementVec = normalmp[xLocation][yLocation];
    if(displacementVec != [0,0,1,1]) {
      normal = perturbNormal(normalVec, displacementVec);
    }
  }
  

  var Ka = material.Ka;
  var Kd = material.Kd;
  var Ks = material.Ks;

  var lights = sceneData.scene.lights;

  var ambient_light = [0.0, 0.0, 0.0];
  var diffuse_light = [0.0, 0.0, 0.0];
  var specular_light = [0.0, 0.0, 0.0];
  
  for(var light_index in lights) {
    var light_source = lights[light_index];
    if(light_source.type == "ambient") {
       //ambient calculation
       var Ia = light_source.intensity;
       var ambient_color = light_source.color;
       const ambient_coeff =  Ka * Ia;
       ambient_light[0] += ambient_coeff * ambient_color[0];
       ambient_light[1] += ambient_coeff * ambient_color[1];
       ambient_light[2] += ambient_coeff * ambient_color[2];
    }
    else if(light_source.type == "directional") {
      var Ie = light_source.intensity;
      var directional_color = light_source.color;

      //var unadjusted_L = [light_source.to[0] - light_source.from[0], light_source.to[1] - light_source.from[1], light_source.to[2] - light_source.from[2], 1];
      //converted to camera space;
      // var L = normalize3(matrix_mult(cMatrix, unadjusted_L));
      //var E = [0,0,-1];
      //var R = normalize3(calculateR(normal, L));

      var unadjusted_L = [light_source.from[0] - light_source.to[0], light_source.from[1] - light_source.to[1], light_source.from[2] - light_source.to[2], 1];
      var L = normalize3(unadjusted_L);
      var E = normalize3(addVectorsMut(scaleVector(sceneData.scene.camera.to,-1), sceneData.scene.camera.from, ));
      var R = normalize3(calculateR(normal, L));

      //diffuse check
      
      var N_dot_L = dot(normal, L);
      var N_dot_E = dot(normal, E);
      const diffuse_coeff = Kd * N_dot_L * Ie;

      if(N_dot_L < 0 && N_dot_E < 0) {
        //both negative: flip normal and compute lighting model on backside of surface
        diffuse_light[0] = -diffuse_coeff * directional_color[0];
        diffuse_light[1] = -diffuse_coeff * directional_color[1];
        diffuse_light[2] = -diffuse_coeff * directional_color[2];
      }
      else if (N_dot_L > 0 && N_dot_E > 0) {
        //both positive: compute lighting model

        diffuse_light[0] += diffuse_coeff * directional_color[0];
        diffuse_light[1] += diffuse_coeff * directional_color[1];
        diffuse_light[2] += diffuse_coeff * directional_color[2];
      }

      //specular check
      //var normalized_R = normalize3(R);
      var R_dot_E = Math.max(Math.min(dot(R,E),1),0);
      const specular_coeff = Ks * Math.pow(R_dot_E, material.n) * Ie
      specular_light[0] += specular_coeff * directional_color[0];
      specular_light[1] += specular_coeff * directional_color[1];
      specular_light[2] += specular_coeff * directional_color[2];
    }
  }

  //var light_C = [specular_light[0] + diffuse_light[0] + ambient_light[0],
  //               specular_light[1] + diffuse_light[1] + ambient_light[1],
  //               specular_light[2] + diffuse_light[2] + ambient_light[2]];
  var light_C = {};
  light_C.specular = specular_light;
  light_C.diffuse = diffuse_light;
  light_C.ambient = ambient_light;

  return light_C;
  //var return_color = [255 * light_C[0] * Cs[0], 255 * light_C[1] * Cs[1], 255 * light_C[2] * Cs[2]];
  //return return_color;
}

//Set the pixel at x,y to color c
function setPixel(x, y, c) {
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      // loop over
      const index = 4 * ((y * d + j) * width * d + (x * d + i));
      pixels.set(c, index)
      // pixels[index] = c[0];
      // pixels[index+1] = c[1];
      // pixels[index+2] = c[2];
      pixels[index+3] = 255;
    }
  }
}