document.getElementById("asc-forms").addEventListener("submit", addASCFile);
document.getElementById("scene-forms").addEventListener("submit", changeSceneFile);
document.getElementById("camera-remote").addEventListener("submit", suppressDefault);
document.getElementById("mindotsize").addEventListener("change", updateDots);
document.getElementById("maxdotsize").addEventListener("change", updateDots);
document.getElementById("dotspacing").addEventListener("change", updateDots);
const sin5 = 0.0871557427;
const cos5 = 0.996194698;
const remoteControls = {
  state: 'ROT',
  'ROT': {
    down() {
      const from = state.scene.scene.camera.from;
      const to = state.scene.scene.camera.to;
      const [x, y, z] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
      const newPos = [
        x,
        cos5 * y - sin5 * z,
        sin5 * y + cos5 * z];
      state.scene.scene.camera.from = [to[0] - newPos[0], to[1] - newPos[1], to[2] - newPos[2]];
    },
    up() {
      const from = state.scene.scene.camera.from;
      const to = state.scene.scene.camera.to;
      const [x, y, z] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
      const newPos = [
        x,
        cos5 * y + sin5 * z,
        -sin5 * y + cos5 * z];
      state.scene.scene.camera.from = [to[0] - newPos[0], to[1] - newPos[1], to[2] - newPos[2]];
    },
    right() {
      const from = state.scene.scene.camera.from;
      const to = state.scene.scene.camera.to;
      const [x, y, z] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
      const newPos = [
        cos5 * x + sin5 * z,
        y,
        -sin5 * x + cos5 * z];
      state.scene.scene.camera.from = [to[0] - newPos[0], to[1] - newPos[1], to[2] - newPos[2]];
    },
    left() {
      const from = state.scene.scene.camera.from;
      const to = state.scene.scene.camera.to;
      const [x, y, z] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
      const newPos = [
        cos5 * x - sin5 * z,
        y,
        sin5 * x + cos5 * z];
      state.scene.scene.camera.from = [to[0] - newPos[0], to[1] - newPos[1], to[2] - newPos[2]];
    },
    in() {
      const from = state.scene.scene.camera.from;
      const to = state.scene.scene.camera.to;
      const [x, y, z] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
      const newPos = [
        cos5 * x - sin5 * y,
        sin5 * x + cos5 * y,
        z];
      state.scene.scene.camera.from = [to[0] - newPos[0], to[1] - newPos[1], to[2] - newPos[2]];
    },
    out() {
      const from = state.scene.scene.camera.from;
      const to = state.scene.scene.camera.to;
      const [x, y, z] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
      const newPos = [
        cos5 * x + sin5 * y,
        -sin5 * x + cos5 * y,
        z];
      state.scene.scene.camera.from = [to[0] - newPos[0], to[1] - newPos[1], to[2] - newPos[2]];
    },
  },
  'TRN': {
    left() {
      state.scene.scene.camera.from[0] -= 0.1;
      state.scene.scene.camera.to[0] -= 0.1;

    },
    right() {
      state.scene.scene.camera.from[0] += 0.1;
      state.scene.scene.camera.to[0] += 0.1;


    },
    up() {
      state.scene.scene.camera.from[1] += 0.1;
      state.scene.scene.camera.to[1] += 0.1;

    },
    down() {
      state.scene.scene.camera.from[1] -= 0.1;
      state.scene.scene.camera.to[1] -= 0.1;

    },
    in() {
      state.scene.scene.camera.from[2] += 0.1;
      state.scene.scene.camera.to[2] += 0.1;


    },
    out() {
      state.scene.scene.camera.from[2] -= 0.1;
      state.scene.scene.camera.to[2] -= 0.1;


    },
  }
}

/**
 * 
 * @param {Event} e 
 */
function addASCFile(e) {
  e.preventDefault();

  const formData = document.getElementById("asc-forms").elements;
  const name = formData["name"].value;
  const file = formData["file"];
  if (geometries.hasOwnProperty(name)) {
    alert("Do not copy names");
  } else {
    const reader = new FileReader();
    reader.onload = (e) => {
      geometries[name] = processText(e.target.result);
    };
    reader.readAsText(file.files[0]);

    const fileDisp = document.getElementById("asc-files");
    const newFile = document.getElementById("file-template").cloneNode(true);
    newFile.firstChild.innerText = name;
    newFile.lastChild.addEventListener("click", () => {
      delete geometries[name];

    });
    fileDisp.appendChild(newFile);
    newFile.style.display = "block";
  }
}

/**
 * 
 * @param {Event} e 
 */
function changeSceneFile(e) {
  e.preventDefault();

  const formData = document.getElementById("scene-forms").elements;
  const file = formData["file"];
  const reader = new FileReader();
  reader.onload = (e) => {
    state.scene = JSON.parse(e.target.result);
    console.log(state.scene);
    myredraw();
  };
  reader.readAsText(file.files[0]);
}


function typeChange() {
  let t_elem = document.getElementById("camera-type");

  if (t_elem.value == "cam-dir") {
    document.getElementById("dir-f").hidden = false;
    document.getElementById("place-f").hidden = true;

  } else {
    document.getElementById("place-f").hidden = false;
    document.getElementById("dir-f").hidden = true;

  }
}

function updateDots() {
  let mindot = document.getElementById("mindotsize").value;
  let maxdot = document.getElementById("maxdotsize").value;
  let dotspacing = document.getElementById("dotspacing").value;
  print(mindot + " " + maxdot + " " + dotspacing)

  changesettings(mindot, maxdot, dotspacing)
  updateTextureMap();
}

function updateCamera() {
  const help = (name) => Number(document.getElementById(name).value);

  const output = (names, values) => {
    names.forEach(
      (name, i) => document.getElementById(name).value = values[i]);
  };
  let n0, r;
  if (document.getElementById("camera-type").value == "cam-dir") {
    console.log("dir+offset");
    n0 = [help("nx0"), help("ny0"), help("nz0")];
    r = [help("rx"), help("ry"), help("rz")];
  } else {
    let cam = [help("off0"), help("off1"), help("off2")];
    let origin = [help("o0"), help("o1"), help("o2")];
    n0 = math.subtract(cam, origin);
    r = [help("off0"), help("off1"), help("off2")];
    console.log(n0, r);

  }

  let n = math.divide(n0, math.norm(n0));
  let u = math.cross([0, 1, 0], n);
  u = math.divide(u, math.norm(u))
  let v = math.cross(n, u);
  v = math.divide(v, math.norm(v));

  output(['ux', 'uy', 'uz'], u);
  output(['vx', 'vy', 'vz'], v);
  output(['nx', 'ny', 'nz'], n);

  camera = [
    u, v, n, r
  ];
  camera_matrix = _camera_matrix(camera);

  raw_persp = ["left", "right", "bottom", "top", "near", "far"].map(help);
  myredraw();
}


function changeShader(e) {
  /** @type {HTMLFormElement} */
  const form = (document.getElementById("shader"));
  switch (form.elements["shader"].value) {
    case "phong":
      state.myshader = phongShader;
      break;
    case "goraud":
      state.myshader = goraudShader;
      break;
    default:
      state.myshader = defaultShader;
  }
  myredraw();
}

/**
 * 
 * @param {Event} e 
 */
function suppressDefault(e) {
  e.preventDefault();
}

/**
 */
function switchRemoteMode() {
  /** @type {HTMLFormElement} */
  const form = (document.getElementById("camera-remote"));
  remoteControls.state = form.elements['mode'].value;
}

function remote(button) {
  remoteControls[remoteControls.state][button]();
  myredraw();
}