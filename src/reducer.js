function init () {
  return {
    input:'',
    output:'',
    regex:'',
    replacement:'',
    regexError:null,
    flags:'gi',
    showMatches:false,
    showHTML:false,
    global:true,
    insensitive:true,
    dotall:false,
    multiline:false,
    buffers:Object.keys(sessionStorage),
    buffer:Object.keys(sessionStorage)[0],
  };
}


function reducer(state2, action) {
  let state = structuredClone(state2);
  let regex=null;

  function showMatches() {
    try {
      regex = new RegExp(`(${state.regex})`, state.flags);
      state.matches = state.input.replace(regex, '<mark>$1</mark>');
      state.regexError=null;
    } catch (err) {
      state.regexError = err.toString();
    }
  }

  
  switch (action.type) {

    
  case 'clear':
    sessionStorage.clear();
    state.buffer=null;
    state.buffers=[];
    break;
    
  case 'load':
    // copy sessionStorage[key] to state.input
    state.input = sessionStorage.getItem(state.buffer);
    state.output='';
    state.showMatches=false;
    break;
    
  case 'save':
    // save state.output to sessionStorage
    sessionStorage.setItem(sessionStorage.length+1, state.output);
    state.buffers = Object.keys(sessionStorage);
    break;
    
  case 'match':
    showMatches();
    state.showMatches=true;
    break;

  case 'updateFlags':
    let flags='';
    flags += (state.global ? 'g' : '');
    flags += (state.insensitive ? 'i' : '');
    flags += (state.dotall ? 's' : '');
    flags += (state.multiline ? 'm' : '');
    state.flags=flags;
    break;

  case 'updateMatches':
    state.showMatches=true;
    showMatches();
    break;

  case 'extract':
    regex = new RegExp(state.regex, state.flags);
    let matches = state.input.match(regex);
    if (matches?.length>0) 
      state.output = state.input.match(regex).join("<br />");
    break;

  case 'replace':
    regex = new RegExp(state.regex, state.flags);
    state.output = state.input.replace(regex, state.replacement);
    break;

  case 'useReplacements':
    state.input = state.output;
    state.output='';
    state.replacement='';
    state.showMatches=false;
    break;

  case 'edit':
    state.showMatches=false;
    break;

  case 'setData':
    state[action.key] = action.value;
    break;

  }
  
  return state;
}

export {init, reducer};
