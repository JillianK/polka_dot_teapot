const sin5 = 0.0871557427;
const cos5 = 0.996194698;
const remoteControls = {
    state: 'ROT',
    'ROT': {
        down() {
            const from = CAMERA_from;
            const to = CAMERA_to;
            const [x, y, z] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
            const newPos = [
                x,
                cos5 * y - sin5 * z,
                sin5 * y + cos5 * z];
            CAMERA_from = [to[0] - newPos[0], to[1] - newPos[1], to[2] - newPos[2]];
        },
        up() {
            const from = CAMERA_from;
            const to = CAMERA_to;
            const [x, y, z] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
            const newPos = [
                x,
                cos5 * y + sin5 * z,
                -sin5 * y + cos5 * z];
            CAMERA_from = [to[0] - newPos[0], to[1] - newPos[1], to[2] - newPos[2]];
        },
        right() {
            const from = CAMERA_from;
            const to = CAMERA_to;
            const [x, y, z] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
            const newPos = [
                cos5 * x + sin5 * z,
                y,
                -sin5 * x + cos5 * z];
            CAMERA_from = [to[0] - newPos[0], to[1] - newPos[1], to[2] - newPos[2]];
        },
        left() {
            const from = CAMERA_from;
            const to = CAMERA_to;
            const [x, y, z] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
            const newPos = [
                cos5 * x - sin5 * z,
                y,
                sin5 * x + cos5 * z];
            CAMERA_from = [to[0] - newPos[0], to[1] - newPos[1], to[2] - newPos[2]];
        },
        in() {
            const from = CAMERA_from;
            const to = CAMERA_to;
            const [x, y, z] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
            const newPos = [
                cos5 * x - sin5 * y,
                sin5 * x + cos5 * y,
                z];
            CAMERA_from = [to[0] - newPos[0], to[1] - newPos[1], to[2] - newPos[2]];
        },
        out() {
            const from = CAMERA_from;
            const to = CAMERA_to;
            const [x, y, z] = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
            const newPos = [
                cos5 * x + sin5 * y,
                -sin5 * x + cos5 * y,
                z];
            CAMERA_from = [to[0] - newPos[0], to[1] - newPos[1], to[2] - newPos[2]];
        },
    },
    'TRN': {
        left() {
            CAMERA_from[0] -= 0.1;
            CAMERA_to[0] -= 0.1;

        },
        right() {
            CAMERA_from[0] += 0.1;
            CAMERA_to[0] += 0.1;


        },
        up() {
            CAMERA_from[1] += 0.1;
            CAMERA_to[1] += 0.1;

        },
        down() {
            CAMERA_from[1] -= 0.1;
            CAMERA_to[1] -= 0.1;

        },
        in() {
            CAMERA_from[2] += 0.1;
            CAMERA_to[2] += 0.1;


        },
        out() {
            CAMERA_from[2] -= 0.1;
            CAMERA_to[2] -= 0.1;


        },
    }
};

document.getElementById("asc-forms").addEventListener("submit", addASCFile);
document.getElementById("scene-forms").addEventListener("submit", changeSceneFile);
document.getElementById("camera-remote").addEventListener("submit", suppressDefault);
document.getElementById("mindotsize").addEventListener("change", (e) => {
    suppressDefault(e);
    let inputVal = parseInt(e.target.value);
    const currMax = parseInt(document.getElementById("mindotsize").max);
    const currMin = parseInt(document.getElementById("mindotsize").min);
    if (inputVal > currMax) {
        document.getElementById("mindotsize").value = currMax;
        inputVal = currMax;
    }
    if (inputVal < currMin) {
        document.getElementById("mindotsize").value = currMin;
        inputVal = currMin;
    }
    updateDots();
    document.getElementById("maxdotsize").min = inputVal;
});

document.getElementById("maxdotsize").addEventListener("change", (e) => {
    suppressDefault(e);
    let inputVal = parseInt(e.target.value);
    const currMin = parseInt(document.getElementById("maxdotsize").min);
    const currMax = parseInt(document.getElementById("maxdotsize").max);
    if (inputVal < currMin) {
        document.getElementById("maxdotsize").value = currMin;
        inputVal = currMin;
    }
    if (inputVal > currMax) {
        document.getElementById("maxdotsize").value = parseInt(currMax);
        inputVal = currMax;
    }
    updateDots();
    document.getElementById("mindotsize").max = inputVal;
});
document.getElementById("numcolors").addEventListener("change", (e) => {
    suppressDefault(e);

    let inputVal = parseInt(e.target.value);
    const currMin = parseInt(document.getElementById("numcolors").min);
    const currMax = parseInt(document.getElementById("numcolors").max);
    if (inputVal < currMin) {
        document.getElementById("numcolors").value = currMin;
        inputVal = currMin;
    }
    if (inputVal > currMax) {
        document.getElementById("numcolors").value = currMax;
        inputVal = currMax;
    }

    let existingcolors = []
    for (let i = 0; i < document.getElementById("colorsection").rows.length; i += 1) {
        existingcolors.push(document.getElementById("colorsection").rows[i].cells[1].firstChild.value)
    }

    const colorInputElement = '<tr><td>Dot Color '
    const cIE2 = ' :</td><td><input type="color" class="colorpicker" value="';
    const colorInputElementPart2 = '" onchange="updateDots()"></td></tr>';
    let myInnerHtml = "";
    for (let i = 0; i < inputVal; i += 1) {
        myInnerHtml += colorInputElement;
        myInnerHtml += (i + 1);
        myInnerHtml += cIE2
        myInnerHtml += ((i < existingcolors.length) ? existingcolors[i] : '#ff0000'); // TODO maybe switch color
        myInnerHtml += colorInputElementPart2;
    }
    document.getElementById("colorsection").innerHTML = myInnerHtml;
    updateDots();
});
document.getElementById("dotspacing").addEventListener("change", updateDots);
document.getElementById("maxdotsize").max = maxsizetoavoidoverflow;


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

function dotgradientchanged(value) {
    changeRadialMode(value);
    updateDots();
}

function updateDots() {
    let basecolor = document.getElementById("basecolor").value;
    let mindot = document.getElementById("mindotsize").value;
    let maxdot = document.getElementById("maxdotsize").value;
    let dotspacing = document.getElementById("dotspacing").value;
    print(basecolor);

    let colors = []
    for (let i = 0; i < document.getElementById("colorsection").rows.length; i += 1) {
        colors.push(document.getElementById("colorsection").rows[i].cells[1].firstChild.value)
    }

    print(colors)

    changesettings(mindot, maxdot, dotspacing, colors, basecolor)
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
        const direction = [help("nx0"), help("ny0"), help("nz0")];
        CAMERA_from  = [help("rx"), help("ry"), help("rz")];
        CAMERA_to = [CAMERA_from[0]+help("nx0"), CAMERA_from[1]+help("ny0"), CAMERA_from[2]+help("nz0")]
    } else {
        CAMERA_from = [help("off0"), help("off1"), help("off2")];
        CAMERA_to = [help("o0"), help("o1"), help("o2")];
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

    [p_left,p_right,p_bottom,p_top,near,far] = ["left", "right", "bottom", "top", "near", "far"].map(help);
    myredraw();
}


function changeShader(e) {
    /** @type {HTMLFormElement} */
    const form = (document.getElementById("shader"));
    switch (form.elements["shader"].value) {
        case "phong":
            gourad = false;
            break;
        case "goraud":
            gourad = true;
            break;
        default:
            // state.myshader = defaultShader;
            // Maybe todo?
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

function updateTextureMap(){
    texture_image = getDots();
    myredraw();
}