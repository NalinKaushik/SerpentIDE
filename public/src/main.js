
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

reset.onclick = () => {
    outputtext.innerText = "# Output will appear here";
}


runbtn.onclick = async () => {
    console.log("Running code...");
  const code = editor.getValue();
  outputtext.innerText = "Running...";
  try {
    const response = await fetch('https://localhost:3000/python/run', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code:code,stdin: inputtext.value }),
      
    });
    const data = await response.json();
    outputtext.innerText = data.output ?? 'No output received';
  } catch (error) {
    console.error(error);
    outputtext.innerText = 'Error running code';
  }
};
