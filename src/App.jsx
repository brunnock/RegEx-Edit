import React from 'react'
import {init,reducer} from './reducer.js';

function App() {

  const [state, dispatch] = React.useReducer(reducer, init());

  const setData = (key,value) => dispatch({type:'setData', key:key, value:value});

  function handleFile (e) {
    let file = e.target.files[0];
    if (file) {
      let reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => dispatch({type:'setInput', data:e.target.result})
    }
  }

  function getURL () {
    let url = prompt('Enter URL-');
    if (url) {
      fetch(url)
	.then(response => {
	  if (!response.ok) throw ('Unable to fetch text.');
	  return response.text();
	})
	.then(fetchedText => dispatch({type:'setInput', data:fetchedText}))
	.catch(err=> alert(err.toString()))
    }
  }
      
  React.useEffect( ()=>dispatch({type:'updateMatches'}), [state.regex, state.flags] );
  React.useEffect( ()=>dispatch({type:'updateFlags'}), [state.global, state.insensitive, state.dotall, state.multiline] );

  return (
    <>
      
      <div id='topButtons'>
	<div id='fetchButtonsDiv'>
	  <button onClick={getURL}>Fetch URL</button>
	  {' or '}
	  <input type="file" id="file-input" onChange={handleFile} />
	</div>
	<div id='renderCheckDiv'>
	  <label>
            Render HTML<input type="checkbox" name="htmlCheckbox" value={state.renderHTML} onChange={e=>setData('renderHTML', e.target.checked)} />
	  </label>
	</div>
      </div>
      
      <div id='IO'>
	{(state.showMatches) ?
	 <pre id='matchesPRE' dangerouslySetInnerHTML={{ __html: state.matches }} />
	 :
	 <textarea value={state.input} 
		   placeholder='Enter text here or load a file.'
                   onChange={e=>setData('input', e.target.value)} />
	}

	{state.renderHTML ?
	 <iframe srcDoc={state.output} />
	 :
	 <pre id='outputPRE' dangerouslySetInnerHTML={{ __html: state.outputDisplay }} />
	 
	}
      </div>
      

      <div id='regexDIV'>

	<div id='firstRegexDIV'>
	  <div id='matchbox'>
	    <label>Match
	      <input type="text" onChange={e=>setData('regex', e.target.value)} />
	      {state.regexError && <abbr title={state.regexError}>error</abbr>}
	    </label>
	  </div>

	  <div id="flags">
	    <label>
              g<input type="checkbox" checked={state.global} onChange={e=>setData('global', e.target.checked)} />
	    </label>

	    <label>
              i<input type="checkbox" checked={state.insensitive} onChange={e=>setData('insensitive', e.target.checked)} />
	    </label>

	    <label>
              s<input type="checkbox" checked={state.dotall} onChange={e=>setData('dotall', e.target.checked)} />
	    </label>

	    <label>
              m<input type="checkbox" checked={state.multiline} onChange={e=>setData('multiline', e.target.checked)} />
	    </label>
	  </div>
	</div>

	<div>
	  {(state.showMatches) ?
	   <button onClick={()=>dispatch({type:'edit'})}>Edit</button>
	   :
	   <button onClick={()=>dispatch({type:'match'})}>Match</button>
	  }
	
	  <button onClick={()=>dispatch({type:'extract'})}>Extract</button>
	  <button onClick={()=>dispatch({type:'replace'})}>Replace</button>

	  {state.output.length>1 &&
	   <button onClick={()=>dispatch({type:'save', sessionID:sessionStorage.length+1})}>Save</button>}

	  {state.buffers.length>0 &&
	   <>
	     <button onClick={()=>dispatch({type:'load'})}>Load Buffer</button>
	     <select id="bufferSelect" onChange={e=>setData('buffer',e.target.value)}>
	       {state.buffers.map(x => <option key={x} value={x}>{x}</option>)}
	     </select>
	     <button onClick={()=>dispatch({type:'clear'})}>Clear Buffers</button>
	   </>
	  }
	  <button popovertarget="helpPopover" popovertargetaction="show">?</button>
	  <div popover="manual" id="helpPopover">
	    <button popovertarget="helpPopover" popovertargetaction="hide">X</button>
	    <p>Enter or load text in the left panel.</p>
	    <p>Enter a regular expression in the box labelled <i>Match</i>. Matching text will be highlighted. </p>
	    <p>You can <i>extract</i> or <i>replace</i> the pattern with the regular expression in the box labelled <i>Replace with</i>.</p>
	    <p>After extracting or replacing, you can choose either <i>Use extractions</i> or <i>Use replacements</i> to the contents of the right panel into the left.</p>
	    <p>You can also use the <i>Copy</i> button to copy the contents of the right panel to your clipboard.</p>
	    <p><a href="https://sean.brunnock.com/Javascript/RegEx/syntax.html">Regular Expression Syntax</a></p>
	  </div>
	</div>	
	  
	<div>
	  <label>Replace with
	    <input type="text" value={state.replacement}
		   onChange={e=>setData('replacement', e.target.value)} />
	  </label>

	  {(state.outputType==='replace' && state.output.length>1) &&
	   <>
	     <button onClick={()=>dispatch({type:'useReplacements'})}>Use replacements</button>
	     <button onClick={()=>navigator.clipboard.writeText(state.output)}>Copy</button>
	   </>}
	     
	  {(state.outputType==='extract' && state?.extractions?.length>1) &&
	   <>
	     <button onClick={()=>dispatch({type:'useExtractions'})}>Use extractions</button>
	     <button onClick={()=>navigator.clipboard.writeText(state.extractions)}>Copy</button>
	   </>}

	</div>

      </div>
    </>
  )
}

export default App;
