//dot product of two vectors
function dot(v1, v2) {
  var total = 0.0;
  for(let i =0; i<3; i++) {
    total += v1[i] * v2[i];
  }
  return total;
}

function multiplyVectors(vec1, vec2) {
  var multiplied_vec = [];
  for(let i = 0; i < vec1.length; i++) {
    multiplied_vec[i] = vec1[i] * vec2[i];
  }
  return multiplied_vec;
}
  
//calculate R 
function calculateR(normal, L) {
  var scalar = 2 * dot(normal, L);
  var scaled_N = [scalar * normal[0], scalar * normal[1], scalar * normal[2]];
  var calculated_R = [scaled_N[0] - L[0], scaled_N[1] - L[1], scaled_N[2] - L[2]];
  return calculated_R;
}
  
function scaleVector(vec, s) {
  var scaled_Vec = [];
  for(let i = 0; i < vec.length; i++) {
    scaled_Vec[i] = vec[i] * s;
  }
  return scaled_Vec;
}
  
function addVectors(vec1, vec2) {
  var added_Vec = [];
  for(let i = 0; i < vec1.length; i++) {
    added_Vec[i] = vec1[i] + vec2[i];
  }
  return added_Vec;
}

function addVectorsMut(vec1, vec2) {

  for(let i = 0; i < vec1.length; i++) {
    vec1[i] += vec2[i];
  }
  return vec1;
}

function toRadians(degree) {
  return degree * (Math.PI/180);
}

function cross(vec1, vec2) {
  let crossProduct = [];
  crossProduct[0] = (vec1[1] * vec2[2] - vec1[2] * vec2[1]);
  crossProduct[1] = -1 * (vec1[0] * vec2[2] - vec1[2] * vec2[0]);
  crossProduct[2] = (vec1[0] * vec2[1] - vec1[1] * vec2[0]);
  return crossProduct;
}
  
//unitize is the same as normalize
function unitize(vec) {
  let total = 0.0;
  for(let i=0; i<vec.length;i++) {
    total += vec[i] * vec[i];
  }
  
  total = Math.sqrt(total)

  for(let i=0; i<vec.length;i++) {
    vec[i]/=total;
  }
  return vec;
}
  
function normalize3(vec) {
  let total = 0.0;
  for(let i=0; i<3;i++) {
    total += vec[i] * vec[i];
  }
  total = Math.sqrt(total)

  for(let i=0; i<3;i++) {
    vec[i]/=total;
  }
  return vec;
}

function f01(x,y,x0,y0,x1,y1) {
  let lineResult = (y0 - y1) * x + (x1 - x0) * y + x0 * y1 - x1 * y0
  return lineResult;
}

function convert_to_matrix(vec) {
  let convertedMatrix = [];
  for(let i=0; i<vec.length;i++) {
    convertedMatrix[i] = [];
    convertedMatrix[i][0] = vec[i];
  }
  return convertedMatrix;
}

function mult(m1, m2) {
  m2 = convert_to_matrix(m2);
  
  return matrix_mult(m1,m2);
}

function four_by_four_mult(m1, m2) {
  
  if(m1[0].length != m2.length) {
    print("INVALID MATRIX MULTIPLICATION");
    return null;
  }
  let toReturn = new Array(4);
  for(let i=0; i< m1.length; i++) {
    toReturn[i] = new Array(m2[0].length);
    for(let j=0; j < m2[0].length; j++) {
      let entry = 0.0;
      for(let k=0; k < m1[0].length; k++) {
        entry += m1[i][k] * m2[k][j];
      }
      toReturn[i][j] = entry;
    }
  }
  return toReturn;
}

function matrix_mult(m1,m2) {
  var multiplied_matrix = [0.0,0.0,0.0,0.0];
  for(var i=0; i < 4; i++) {
    var entry = 0.0;
    for(let j = 0; j < 4; j++) {
      entry += m1[i][j] * m2[j];
    }
    multiplied_matrix[i] = entry;
  }
  return multiplied_matrix;
}


function getInverseTranspose(transforms) {
  let S = transforms[1].S;
  let Ry = toRadians(transforms[0].Ry);
  var sMat = [[1/S[0],0,0,0], [0,1/S[1],0,0], [0,0,1/S[2],0],[0,0,0,1]];
  let yRotMat = [[Math.cos(Ry), 0, Math.sin(Ry), 0],
                 [0, 1, 0, 0],
                 [-1 * Math.sin(Ry), 0, Math.cos(Ry), 0],
                 [0, 0, 0, 1]];
  let inverseSR = four_by_four_mult(yRotMat, sMat);
  return inverseSR;
}

function combineWeightedRGB(x, y) {
  var pixelRGB = [0.0, 0.0, 0.0, 0.0];
  for(i=0; i < NUM_SAMPLES; i++) {
    const ix = ((i*width+x)*height+y)*4;
    var unscaledSample = frameBuffers.subarray(ix,ix+4);
    if(unscaledSample.length > 0) {
      var scaledSample = scaleVector(unscaledSample, aaFilter[i][2]);
      pixelRGB = addVectors(pixelRGB, scaledSample);
    }
    
  }
  return pixelRGB;
}
