document.getElementById("asc-forms").addEventListener("submit", addASCFile);
document.getElementById("scene-forms").addEventListener("submit",changeSceneFile);
/**
 * 
 * @param {Event} e 
 */
function addASCFile(e){
    e.preventDefault();
    
    const formData = document.getElementById("asc-forms").elements;
    const name = formData["name"].value;
    const file = formData["file"];
    if(geometries.hasOwnProperty(name)){
        alert("Do not copy names");
    }else{
        const reader = new FileReader();
        reader.onload = (e) =>{
            geometries[name] = processText(e.target.result);
        };
        reader.readAsText(file.files[0]);

        const fileDisp = document.getElementById("asc-files");
        const newFile = document.getElementById("file-template").cloneNode(true);
        newFile.firstChild.innerText = name;
        newFile.lastChild.addEventListener("click", ()=>{
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
function changeSceneFile(e){
    e.preventDefault();
    
    const formData = document.getElementById("scene-forms").elements;
    const file = formData["file"];
    const reader = new FileReader();
    reader.onload = (e) =>{
        state.scene = JSON.parse(e.target.result);
        console.log(state.scene);
        myredraw();
    };
    reader.readAsText(file.files[0]);
}


function typeChange(){
  let t_elem = document.getElementById("camera-type");  

  if (t_elem.value== "cam-dir"){
    document.getElementById("dir-f").hidden = false;
    document.getElementById("place-f").hidden = true;
    
  }else{
    document.getElementById("place-f").hidden = false;
    document.getElementById("dir-f").hidden = true;

  }
}

function updateCamera(){
  const help = (name) => Number(document.getElementById(name).value);

  const output = (names,values) => {
    names.forEach(
      (name,i) => document.getElementById(name).value=values[i]);
  };
  let n0,r;
  if(document.getElementById("camera-type").value == "cam-dir"){
    console.log("dir+offset");
    n0 = [help("nx0"),help("ny0"),help("nz0")];
    r =[help("rx"), help("ry"), help("rz")];
  }else{
    let cam = [help("off0"),help("off1"),help("off2")];
    let origin = [help("o0"),help("o1"),help("o2")];
    n0 = math.subtract(cam,origin);
    r =  [help("off0"),help("off1"),help("off2")];
    console.log(n0, r);

  }
  
  let n = math.divide(n0,math.norm(n0));
  let u = math.cross([0,1,0],n);
  u = math.divide(u,math.norm(u))
  let v = math.cross(n,u);
  v = math.divide(v,math.norm(v));
  
  output(['ux','uy','uz'], u);
  output(['vx','vy','vz'], v);
  output(['nx','ny','nz'],n);

  camera = [
    u,v,n,r
  ];
  camera_matrix = _camera_matrix(camera);

  raw_persp = ["left","right","bottom","top","near","far"].map(help);
  myredraw();
}


function changeShader(){
    const form = document.getElementById("shader");
    switch(form.elements["shader"].value){
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