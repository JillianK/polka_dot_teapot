function generatePPM() {
    let header = `P3\n${width} ${height}\n${255}\n`;
    let body = "";
    let idx = 0;
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        body += `${state.fb[idx]} ${state.fb[idx + 1]} ${state.fb[idx + 2]} `
        idx += 4;
      }
      body += '\n';
    }
  
    return header + body;
  }
  
  function downloadPPM() {
    let element = document.createElement('a');
  
  
    let ppm = generatePPM();
  
    element.setAttribute('href', 'data:text/plain;charset=ascii,' + encodeURIComponent(ppm));
    element.setAttribute('download', "generated.ppm");
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }
  
  function viewPPM() {
    let element = document.getElementById("ppm-view");
  
    let ppm = generatePPM();
    element.innerText = ppm;
  }
  
  function copyPPM() {
    let element = document.createElement('textarea');
    let ppm = generatePPM();
    element.value = ppm;
    element.setAttribute('readonly', 'true');
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.select();
  
    document.execCommand('copy');
    console.log(element.value);
  
    document.body.removeChild(element);
  
  }