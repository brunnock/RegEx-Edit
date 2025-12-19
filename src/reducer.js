function init () {
  return {
    input:'',
    output:'',
    outputType:null,
    regex:'',
    replacement:'',
    regexError:null,
    flags:'gim',
    showMatches:false,
    renderHTML:false,
    global:true,
    insensitive:true,
    dotall:false,
    multiline:true,
    buffers:Object.keys(sessionStorage),
    buffer:Object.keys(sessionStorage)[0],
  };
}


function reducer(state2, action) {
  let state = structuredClone(state2);
  let input=null;
  let regex=null;
  let flags='';
  let matches = null;
  let replacement=null;
  
  function showMatches() {
    try {
      // replace < in regex with &lt;
      input = state.input.replace(/&/g, '&amp;'); // escape the &
      input = input.replace(/</g, '&lt;'); // escape the <

      regex = state.regex.replace(/</g, '&lt;');
      regex = new RegExp(`(${regex})`, state.flags);
      state.matches = input.replace(regex, '<mark>$1</mark>');
      state.regexError=null;
    } catch (err) {
      state.regexError = err.toString();
    }
  }


  function html2raw (html) {
    // convert HTML to nonrendering text
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;');
  }

  function normalizeEscapes(input) {
    // following from chatgpt
    return input
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r");
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
    //sessionStorage.setItem(sessionStorage.length+1, state.output);
    sessionStorage.setItem(action.sessionID, state.output);
    state.buffers = Object.keys(sessionStorage);
    break;
    
  case 'match':
    showMatches();
    state.showMatches=true;
    break;

  case 'updateFlags':
    flags += (state.global ? 'g' : '');
    flags += (state.insensitive ? 'i' : '');
    flags += (state.dotall ? 's' : '');
    flags += (state.multiline ? 'm' : '');
    state.flags=flags;
    break;

  case 'updateMatches':
    if (state.input.length>0 && state.regex.length>0) {
      state.showMatches=true;
      showMatches();
    } else {
      state.showMatches=false;
    }
    break;

  case 'extract':
    regex = new RegExp(state.regex, state.flags);
    state.extractions = state.input.match(regex).join("\n");
    state.output='';
    if (state.extractions?.length>0) {
      state.output = state.input.match(regex).join("\n");
      state.outputDisplay = html2raw(state.output);
      state.outputType='extract';
    }
    break;

  case 'replace':
    // the following 2 lines do a straightforward replacement
    regex = new RegExp(state.regex, state.flags);
    replacement = normalizeEscapes(state.replacement);
    state.output = state.input.replace(regex, replacement);
    
    // for outputDisplay, neuter the HTML
    input = state.input.replace(/&/g, '&amp;'); // escape the &
    input = input.replace(/</g, '&lt;'); // escape the <
    regex = state.regex.replace(/</g, '&lt;');
    //regex = new RegExp(`(${regex})`, state.flags);
    regex = new RegExp(regex, state.flags);
    if (state.replacement.length>0) {
      //let replace = state.replacement.replace(/&/g, '&amp;');
      //replace = state.replacement.replace(/</g, '&lt;');
      replacement = html2raw(state.replacement);
      replacement = normalizeEscapes(replacement);
      state.outputDisplay = input.replace(regex, `<mark>${replacement}</mark>`);
    } else {
      state.outputDisplay = input.replace(regex, '');
    }

    state.outputType='replace';
    state.extractions='';
    
    break;

  case 'useReplacements':
    state.input = state.output;
    state.output=state.outputDisplay='';
    state.regex='';
    state.replacement='';
    state.showMatches=false;
    break;

  case 'useExtractions':
    state.input = state.extractions;
    state.extractions=state.output=state.outputDisplay='';
    state.regex='';
    state.replacement='';
    state.showMatches=false;
    break;

  case 'edit':
    state.showMatches=false;
    break;

  case 'setInput':
    state.input = action.data;
    state.matches='';
    state.showMatches=false;
    break;
    
  case 'setData':
    state[action.key] = action.value;
    break;

  }

  return state;
}

export {init, reducer};
