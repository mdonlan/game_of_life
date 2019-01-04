let checkIfNum = new RegExp('^[0-9]+$');

function setInitialUI() {
    // set up all nessesary starting ui data
    fpsElem.innerHTML = targetFPS;
    spawnChanceElem.innerHTML = spawnAliveChance;
    showDiscoveredElem.innerHTML = showDiscoveredTiles;

    if(showDiscoveredTiles) {
        showDiscoveredElem.classList.add('bool_button_enabled');    
    }
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

function toggleUiValue(e) {
    // toggle a ui bool value
    
    if(e.target.innerHTML == 'true') {
        e.target.innerHTML = 'false';
        window[e.target.dataset.value] = false;
        e.target.classList.remove("bool_button_enabled");
        e.target.classList.add("bool_button_disabled");
    } else if(e.target.innerHTML = 'false') {
        e.target.innerHTML = 'true';
        window[e.target.dataset.value] = true;
        e.target.classList.add("bool_button_enabled");
        e.target.classList.remove("bool_button_disabled");
    }
}