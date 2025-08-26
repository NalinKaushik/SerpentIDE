import express from "express";
import https from "https";
import fs from 'fs'; 
import {execFile} from 'child_process';
const app = express()

app.use(express.json());
app.use(express.static('public'))
const options = {
    key:fs.readFileSync('./config/key.pem'),
    cert:fs.readFileSync('./config/cert.pem')
}

const httpsserver = https.createServer(options,app);

app.get('/',(req,res)=>{
    res.sendFile('C:/Users/ACER/Desktop/online_compiler/public/index.html',(err)=>{
        console.error(err);
    });
    console.log("someone interact with the endpoint '/'");

})

app.post('/python/run',(req,res)=>{
    console.log("interacted with '/python/run' endpoint")
    const filename = String(Date.now())+".py";

    
    try{
        const code = req.body.code;
        const stdin = req.body.stdin;
        fs.writeFileSync(filename,code)
        
        const child = execFile(`python`,[filename] ,{timeout:3000},(error,stdout,stderr)=>{
            fs.unlink(`${filename}`,(unlinkerror)=>{
                console.error('an error occucred',unlinkerror);
                
            })


            if (error){
                
                return res.json({
                        output:null,
                        time:"null",
                        err:stderr  
                })
            }
            else{res.json({
                output:stdout,
                time:'',
                err:stderr
            });
        }   

        })
    if(stdin){
        child.stdin.write(stdin);
        child.stdin.end();
    }
   
    
    }catch{
         fs.unlink(`${filename}`,(unlinkerror)=>{
                console.error('an error occucred',unlinkerror);
                
            })
        res.json({
            output:null,
            time:"null",
            err:"an error occoured"
        })
    }
})




const PORT = 3000;
httpsserver.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
})