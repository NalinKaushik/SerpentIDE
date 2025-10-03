import express from "express";
import https from "https";
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

app.use(express.json());
app.use(express.static('public'));

// HTTPS configuration
const options = {
    key: fs.readFileSync('../config/key.pem'),
    cert: fs.readFileSync('../config/cert.pem')
};

const httpsServer = https.createServer(options, app);

// Root endpoint
app.get('/', (req, res) => {
    
    const indexPath = path.join(__dirname, 'public', 'index.html');
    
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Error loading page');
        }
    });
    console.log("Someone interacted with the endpoint '/'");
});

// Python code execution endpoint
app.post('/python/run', (req, res) => {
    console.log("Interacted with '/python/run' endpoint");
    
    // Input validation
    if (!req.body.code || typeof req.body.code !== 'string') {
        return res.status(400).json({
            output: null,
            time: "null",
            err: "Invalid or missing code parameter"
        });
    }
    
    const filename = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.py`;
    const tempDir = path.join(__dirname, 'temp');
    const filePath = path.join(tempDir, filename);
    
    try {
        // Ensure temp directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        const code = req.body.code;
        const stdin = req.body.stdin || '';
        
        // Write code to temporary file
        fs.writeFileSync(filePath, code, 'utf8');
        
        // Execute Python code with timeout
        const child = execFile('python', [filePath], { 
            timeout: 3000,
            cwd: tempDir,
            maxBuffer: 1024 * 1024 // 1MB buffer limit
        }, (error, stdout, stderr) => {
            // Clean up temporary file
            fs.unlink(filePath, (unlinkError) => {
                if (unlinkError) {
                    console.error('Error deleting temporary file:', unlinkError);
                }
            });
            
            if (error) {
                console.error('Execution error:', error);
                return res.json({
                    output: null,
                    time: "null",
                    err: stderr || error.message
                });
            } else {
                res.json({
                    output: stdout,
                    time: '', // You can implement timing here if needed
                    err: stderr
                });
            }
        });
        
        // Handle stdin if provided
        if (stdin && child.stdin) {
            child.stdin.write(stdin);
            child.stdin.end();
        }
        
    } catch (catchError) {
        console.error('Unexpected error:', catchError);
        
        // Clean up file if it was created
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (unlinkError) => {
                if (unlinkError) {
                    console.error('Error deleting temporary file in catch block:', unlinkError);
                }
            });
        }
        
        res.status(500).json({
            output: null,
            time: "null",
            err: "An unexpected error occurred"
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        output: null,
        time: "null",
        err: "Internal server error"
    });
});

const PORT = process.env.PORT || 3000;

httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpsServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    httpsServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});