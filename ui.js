function setInitialUI() {
  // set up all nessesary starting ui data
  fpsElem.innerHTML = targetFPS;
}

function setFps(e) {
  console.log(e)
  let checkIfNum = new RegExp('^[0-9]+$');
  let isNum = checkIfNum.exec(e.data);
  if(isNum) {
    let input = parseInt(e.target.innerHTML);
    
    if(input > 60) { // 60 is max -- not really for any reason though
      targetFPS = 60;
      fpsElem.innerHTML = targetFPS;
    } else {
      targetFPS = input;
    }
  } else { // if not a number
    
    // if enter reset text to match fps val by removing linebreak
    if(e.inputType == 'insertParagraph' || e.inputType == 'insertText') {
      fpsElem.innerHTML = targetFPS;
    }

    // if delete update fps to match new value
    if(e.inputType == 'deleteContentBackward') {
      targetFPS = e.target.innerHTML;
    }

  }
}