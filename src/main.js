import { json } from 'stream/consumers';
import './style.css';


// runtbn = runBtn,
// reset = clearOutputBtn,
// editor = stdinInput,
// outputtext = output


 const editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
      mode: 'python',
      theme: 'monokai',
      lineNumbers: true,
      matchBrackets: true,
      indentUnit: 4,
      tabSize: 4
    });
    
let runbtn = document.getElementById('runBtn');
let reset = document.getElementById('clearOutputBtn');
let inputtext = document.getElementById('stdinInput');
let outputtext = document.getElementById('output');

runbtn.onclick(async()=>{
    const code = editor.getValue();
    outputtext.innerText = "Running..."
    try{
        fetch('http://localhost:3000/python/run',{
            method:'POST',
            headers:{"Content Type":"application/json"},
            body:JSON.stringify({code})
        }).then( res=>res.json()).then(data=>outputtext.innerText=data.output);

    }catch{
        console.log(error)
    }


    

})