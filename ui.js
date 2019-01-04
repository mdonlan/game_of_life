let checkIfNum = new RegExp('^[0-9]+$');

function setInitialUI() {
  // set up all nessesary starting ui data
  fpsElem.innerHTML = targetFPS;
  spawnChanceElem.innerHTML = spawnAliveChance;
}

function setFps(e) {
//   let checkIfNum = new RegExp('^[0-9]+$');
//   let isNum = checkIfNum.exec(e.data);
//   if(isNum) {
//     let input = parseInt(e.target.innerHTML);
    
//     if(input > 60) { // 60 is max -- not really for any reason though
//       targetFPS = 60;
//       fpsElem.innerHTML = targetFPS;
//     } else {
//       targetFPS = input;
//     }
//   } else { // if not a number
//     // if enter reset text to match fps val by removing linebreak
//     if(e.inputType == 'insertParagraph' || e.inputType == 'insertText') {
//       fpsElem.innerHTML = targetFPS;
//     }
//     // if delete update fps to match new value
//     if(e.inputType == 'deleteContentBackward') {
//       targetFPS = e.target.innerHTML;
//     }
//   }
}

function setUiValue(e) {
    // set a ui value 
    // only accepts numbers as input
    let elemClassName = e.target.className;

    let isNum = checkIfNum.exec(e.data);

    // if is num update value
    if(isNum) {
        let input = parseInt(e.target.innerHTML);
        if(elemClassName == 'spawn_chance_elem') {
            if(input > 1) {
                spawnAliveChance = 1;
                spawnChanceElem.innerHTML = spawnAliveChance;
            } else {
                spawnAliveChance = input;
            }
        }
        if(elemClassName == 'fps') {
            if(input > 60) { // 60 is max -- not really for any reason though
                targetFPS = 60;
                fpsElem.innerHTML = targetFPS;
            } else {
                targetFPS = input;
            }
        }
    } 

    // if not num ignore unless backspace
    if(!isNum) {
        // remove enter
        if(e.inputType == 'insertParagraph' || e.inputType == 'insertText') {
            e.target.innerHTML = e.target.textContent;
        }
        // if delete update js value to match dom value
        if(e.inputType == 'deleteContentBackward') {
            e.target.dataset.value = e.target.innerHTML;
        }
    }
}