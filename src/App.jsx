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
      reader.onload = (e) => setData('input', e.target.result);
    }
  }

  React.useEffect( ()=>dispatch({type:'updateMatches'}), [state.regex, state.flags] );
  React.useEffect( ()=>dispatch({type:'updateFlags'}), [state.global, state.insensitive, state.dotall] );

  return (
    <>
      <div id='IO'>
	{state.showMatches ?
	 <pre id='matchesPRE' dangerouslySetInnerHTML={{ __html: state.matches }} />
	 :
	 <textarea value={state.input} 
		   placeholder='Enter text here or load a file.'
                   onChange={e=>setData('input', e.target.value)} />
	}

	{state.showHTML ?
	 <iframe srcDoc={state.output} />
	 :
	 <pre id='outputPRE' dangerouslySetInnerHTML={{ __html: state.output }} />
	 
	}
      </div>
      
      <div id='regexDIV'>

	<label>Match
	  <input type="text" onChange={e=>setData('regex', e.target.value)} />
	  {state.regexError && <abbr title={state.regexError}>error</abbr>}
	</label>

	<label>Replace with
	  <input type="text" value={state.replacement}
		 onChange={e=>setData('replacement', e.target.value)} />
	</label>

      </div>
      
      <div className='buttonsDIV'>

	<input type="file" id="file-input" onChange={handleFile} />

	{state.showMatches ?
	 <button onClick={()=>dispatch({type:'edit'})}>Edit</button>
	 :
	 <button onClick={()=>dispatch({type:'match'})}>Match</button>
	}

	<button onClick={()=>dispatch({type:'extract'})}>Extract</button>
	<button onClick={()=>dispatch({type:'replace'})}>Replace</button>

	{state.output.length>1 &&
	 <button onClick={()=>dispatch({type:'save'})}>Save</button>}

	{state.buffers.length>0 &&
	 <>
	   <button onClick={()=>dispatch({type:'load'})}>Load Buffer</button>
	   <select id="bufferSelect" onChange={e=>setData('buffer',e.target.value)}>
	     {state.buffers.map(x => <option key={x} value={x}>{x}</option>)}
	   </select>
	   <button onClick={()=>dispatch({type:'clear'})}>Clear Buffers</button>
	 </>
	}
	

	{state.output.length>1 &&
	 <button onClick={()=>dispatch({type:'useReplacements'})}>Use replacements</button>}
	
      </div>
      
      <div className='buttonsDIV'>
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

      
      </>
  )
}

export default App;
