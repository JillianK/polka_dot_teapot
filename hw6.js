let exampleTriangle = {
  "data":
    [

      {
        "v0":
        {
          "v": [1, 1, -5],
          "n": [1, 1, -0.5],
          "t": [1, 1]
        },
        "v1":
        {
          "v": [-1, -1, 5],
          "n": [-1, -1, 0.5],
          "t": [0, 0]
        },
        "v2":
        {
          "v": [1, -1, 5],
          "n": [1, -1, 0.5],
          "t": [1, 0]
        }
      },

      {
        "v0":
        {
          "v": [1, 1, -5],
          "n": [1, 1, -0.5],
          "t": [1, 1]
        },
        "v1":
        {
          "v": [-1, 1, -5],
          "n": [-1, 1, -0.5],
          "t": [0, 1]
        },
        "v2":
        {
          "v": [-1, -1, 5],
          "n": [-1, -1, 0.5],
          "t": [0, 0]
        }
      }

    ]
};

var frameBuffers = [];
var aaFilter = [[-0.52, 0.38, 0.128],
[0.42, 0.56, 0.119],
[0.27, 0.08, 0.294],
[-0.17, -0.29, 0.249],
[0.58, -0.55, 0.104],
[-0.31, -0.71, 0.106]];

var NUM_SAMPLES = 6;

let zBufferArray = (x, y) => [...Array(x)].map(x => Array(y).fill(Infinity));
var zBuffer = [];

var cMatrix;

var CAMERA_from = sceneData.scene.camera.from;
//var from = [0,0,5];
var CAMERA_to = sceneData.scene.camera.to;
var near = sceneData.scene.camera.bounds[0];
var far = sceneData.scene.camera.bounds[1];
var p_right = sceneData.scene.camera.bounds[2];
var p_left = sceneData.scene.camera.bounds[3];

var p_top = sceneData.scene.camera.bounds[4];
var p_bottom = sceneData.scene.camera.bounds[5];

var p_width = sceneData.scene.camera.resolution[0];
var p_height = sceneData.scene.camera.resolution[1];

var texture_image;

var Kt = 0.7;


//use to switch between gourad and phong shading
//true = use gourad, false = use phong
let gourad = false;
//use to switch between textures and flat coloring
//true = use textures, false = use material colors
var useTextures = true;

//use to switch between bump mapping on and off
let useBumpMap = false;

var localURL = 'assets/logo.jpg';

var perspective_mat = [[2 * near / (p_right - p_left), 0, (p_right + p_left) / (p_right - p_left), 0],
[0, 2 * near / (p_top - p_bottom), (p_top + p_bottom) / (p_top - p_bottom), 0],
[0, 0, -1 * (far + near) / (far - near), -1 * (2 * far * near) / (far - near)],
[0, 0, -1, 0]];

const get_perspective_mat = () => [[2 * near / (p_right - p_left), 0, (p_right + p_left) / (p_right - p_left), 0],
[0, 2 * near / (p_top - p_bottom), (p_top + p_bottom) / (p_top - p_bottom), 0],
[0, 0, -1 * (far + near) / (far - near), -1 * (2 * far * near) / (far - near)],
[0, 0, -1, 0]];

let pointilism_img


function preload() {
  //texture_image = loadImage(localURL);
  texture_image = getDots();
}


function setup() {
  createCanvas(p_width, p_height);
  strokeWeight(1);
  frameRate(1);
  //testSuite();
  //background(0,0,0);

  frameBuffers = new Uint16Array(NUM_SAMPLES*p_width*p_height*4);
  
  CAMERA_from = sceneData.scene.camera.from;
  CAMERA_to = sceneData.scene.camera.to;
  perspective_mat = get_perspective_mat();

  //texture_image.loadPixels();
  console.log(CAMERA_from,CAMERA_to);
  cMatrix = createCamMatrix(CAMERA_from, CAMERA_to);
  // print("camera matrix", cMatrix);
  // print("perspective matrix", perspective_mat);
}

function myredraw() {
  createCanvas(p_width, p_height);
  strokeWeight(1);
  frameRate(1);
  //background(0,0,0);

  frameBuffers.fill(0);

  cMatrix = createCamMatrix(CAMERA_from, CAMERA_to);
  // print("camera matrix", cMatrix);
  // print("perspective matrix", perspective_mat);
  redraw();
}
var d;
function draw() {
  frameStart = Date.now();
  d = pixelDensity();
  loadPixels();
  for (i = 0; i < NUM_SAMPLES; i++) {
    if (zBuffer[i]) {
      zBuffer[i].fill(Number.POSITIVE_INFINITY);
    } else {
      zBuffer[i] = new Float32Array(4 * width * height);
      zBuffer[i].fill(Number.POSITIVE_INFINITY);
    }
  }

  for (let k = 0; k < sceneData.scene.shapes.length; k++) {
    let shape = sceneData.scene.shapes[k];
    let RTS_mat = createTransformationMatrix(shape.transforms);
    if (shape.geometry == "teapot") {
      for (let i = 0; i < teapot.data.length; i++) {

        var v0 = {};
        var v1 = {};
        var v2 = {};
        v0 = convertCoordinates(teapot.data[i].v0, RTS_mat, shape.transforms);
        v1 = convertCoordinates(teapot.data[i].v1, RTS_mat, shape.transforms);
        v2 = convertCoordinates(teapot.data[i].v2, RTS_mat, shape.transforms);
        scanTriangle(v0, v1, v2, shape.material);
      }
    }
  }
  for (var x = 0; x < p_width; x++) {
    for (var y = 0; y < p_height; y++) {
      //Create and set color using final color values.
      var RGB_c = combineWeightedRGB(x, y);
      //var c = color(RGB_c[0], RGB_c[1], RGB_c[2]);
      setPixel(x, y, RGB_c);
    }
  }
  updatePixels();
  print("Render time: ", Date.now() - frameStart, 'ms')

  noLoop();
}

function createTransformationMatrix(transforms) {
  let Ry = toRadians(transforms[0].Ry);
  let T = transforms[2].T;
  let S = transforms[1].S;

  let trans_rot_mat = [[Math.cos(Ry), 0, Math.sin(Ry), T[0]],
  [0, 1, 0, T[1]],
  [-1 * Math.sin(Ry), 0, Math.cos(Ry), T[2]],
  [0, 0, 0, 1]];
  let scaleMat = [[S[0], 0, 0, 0],
  [0, S[1], 0, 0],
  [0, 0, S[2], 0],
  [0, 0, 0, 1]];

  return four_by_four_mult(trans_rot_mat, scaleMat);
}

function createCamMatrix(camR, to) {
  let camN = [];
  for (let i = 0; i < 3; i++) {
    camN[i] = camR[i] - to[i]; //from-to
  }
  camN = unitize(camN);

  let camV = [];
  camV[0] = 0; camV[1] = 1; camV[2] = 0; // fake V to create U
  let camU = cross(camV, camN);
  camU = unitize(camU);

  camV = cross(camN, camU); //real

  //construct mat, given camR, camU, camV, camN
  let camMat = [[camU[0], camU[1], camU[2], (camR[0] * camU[0] + camR[1] * camU[1] + camR[2] * camU[2])],
  [camV[0], camV[1], camV[2], (camR[0] * camV[0] + camR[1] * camV[1] + camR[2] * camV[2])],
  [camN[0], camN[1], camN[2], -1 * (camR[0] * camN[0] + camR[1] * camN[1] + camR[2] * camN[2])],
  [0, 0, 0, 1]];

  return camMat;
}

//Bump Mapping Function.
function perturbNormal(originalN, bumpNorm) {
  let normN = originalN;
  let normV = [0,1,0];
  let normU = cross(normV, normN);
  normV = cross(normN, normU);
  /*let normalSpaceMatrix = math.matrix([[normU[0], normU[1], normU[2], 0],
    [normV[0], normV[1], normV[2], 0],
    [normN[0], normN[1], normN[2], 0],
    [0, 0, 0, 1]]);
  let normalInverseMatrix = math.inv(normalSpaceMatrix);
  let normalInverseData = normalInverseMatrix._data;
  //let identity_hopefully = four_by_four_mult(normalSpaceMatrix._data, normalInverseData);
  let perturbedNorm = matrix_mult(normalInverseData, bumpNorm);
  */
  let perturbedNorm = [bumpNorm[0] * normU[0] + bumpNorm[1] * normV[0] + bumpNorm[2] * normN[0],
                       bumpNorm[0] * normU[1] + bumpNorm[1] * normV[1] + bumpNorm[2] * normN[1],
                       bumpNorm[0] * normU[2] + bumpNorm[1] * normV[2] + bumpNorm[2] * normN[2]];
  
  
  return perturbedNorm;
}

function convertCoordinates(vertex, worldTransform, transforms) {

  var vec = [vertex.v[0], vertex.v[1], vertex.v[2], 1];
  var world_vec = matrix_mult(worldTransform, vec);
  var camera_vec = matrix_mult(cMatrix, world_vec);
  var perspective_vec = matrix_mult(perspective_mat, camera_vec);
  for (let i = 0; i < 4; i++) {
    perspective_vec[i] /= perspective_vec[3];
  }

  var norm = [vertex.n[0], vertex.n[1], vertex.n[2], 1];
  //var normalized_norm = normalize3(norm);
  var worldInverse = getInverseTranspose(transforms);
  var world_norm = normalize3(matrix_mult(worldInverse, norm));

  var world_norm_point = [world_norm[0] + world_vec[0], world_norm[1] + world_vec[1], world_norm[2] + world_vec[2], 1];
  //var world_norm = matrix_mult(worldTransform, norm);
  var camera_norm_point = matrix_mult(cMatrix, world_norm_point);
  var camera_norm = [camera_norm_point[0] - camera_vec[0], camera_norm_point[1] - camera_vec[1], camera_norm_point[2] - camera_vec[2], 1];

  var returnVertices = [];
  var perspective_vertices = [];
  var rasterized_vertices = [];
  for (var i = 0; i < NUM_SAMPLES; i++) {
    //perspective_vertices[i] = addVectors(perspective_vec, [aaFilter[i][0] / (p_width-1), aaFilter[i][1] / (p_height-1), 0, 0]);
    perspective_vertices[i] = [perspective_vec[0] + aaFilter[i][0] / (p_width - 1), perspective_vec[1] + aaFilter[i][1] / (p_height - 1),
    perspective_vec[2], perspective_vec[3]];
    rasterized_vertices[i] = rasterize(perspective_vertices[i]);
  }
  var unaltered_rasterized_vec = rasterize(perspective_vec);
  var returnVertex = {};
  returnVertex.v = rasterized_vertices;
  returnVertex.r = unaltered_rasterized_vec;
  returnVertex.n = camera_norm;
  returnVertex.world_n = world_norm;
  returnVertex.t = vertex.t;
  returnVertex.camV = camera_vec;
  return returnVertex;
}

function rasterize(perspective_vec) {
  var rasterized_vec = [];
  rasterized_vec[0] = (perspective_vec[0] + 1) * (p_width - 1) / 2;
  rasterized_vec[1] = (perspective_vec[1] + 1) * (p_height - 1) / 2;
  rasterized_vec[2] = perspective_vec[2];
  rasterized_vec[3] = perspective_vec[3];
  rasterized_vec[1] = p_height - 1 - rasterized_vec[1];
  return rasterized_vec;
}