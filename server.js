// server.js - Backend for AI Resume Parser using Gemini API
const http = require('http');
const url = require('url');
const querystring = require('querystring');

// Configuration
const PORT = process.env.PORT || 3000; // Can be changed via environment variable
const GEMINI_API_KEY = 'AIzaSyDghtFrfHAg39p6P0yuwJLEbKVYzqlFXhU'; // Replace with your actual Gemini API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Enhanced text extraction from base64 content
function extractTextFromBase64(base64Content, filetype) {
    try {
        if (filetype === 'text/plain') {
            return base64Content;
        }
        
        // Handle data URL format
        let base64Data = base64Content;
        if (base64Content.includes(',')) {
            base64Data = base64Content.split(',')[1];
        }
        
        if (filetype === 'application/pdf') {
            return extractTextFromPDF(base64Data);
        } else if (filetype === 'application/msword' || 
                   filetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            return extractTextFromDoc(base64Data);
        } else {
            // Fallback for unknown types
            const buffer = Buffer.from(base64Data, 'base64');
            const text = buffer.toString('utf8');
            return cleanText(text);
        }
    } catch (error) {
        console.error('Error extracting text:', error);
        return 'Error extracting text from file. Please try uploading a TXT file or ensure the file is not corrupted.';
    }
}

// Basic PDF text extraction (simplified approach)
function extractTextFromPDF(base64Data) {
    try {
        const buffer = Buffer.from(base64Data, 'base64');
        const pdfString = buffer.toString('binary');
        
        // Simple regex to extract text between parentheses and brackets in PDF
        const textMatches = pdfString.match(/\((.*?)\)/g) || [];
        const streamMatches = pdfString.match(/stream\s*(.*?)\s*endstream/gs) || [];
        
        let extractedText = '';
        
        // Extract text from parentheses (common in PDFs)
        textMatches.forEach(match => {
            const text = match.replace(/[()]/g, '');
            if (text.length > 2 && /[a-zA-Z]/.test(text)) {
                extractedText += text + ' ';
            }
        });
        
        // Extract readable text from streams
        streamMatches.forEach(match => {
            const streamContent = match.replace(/stream\s*|\s*endstream/g, '');
            const readableText = streamContent.replace(/[^\x20-\x7E\n\r]/g, ' ');
            if (readableText.trim().length > 10) {
                extractedText += readableText + '\n';
            }
        });
        
        // If no text extracted, try alternative approach
        if (extractedText.trim().length < 50) {
            const alternativeText = buffer.toString('utf8')
                .replace(/[^\x20-\x7E\n\r]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            
            if (alternativeText.length > extractedText.length) {
                extractedText = alternativeText;
            }
        }
        
        const cleaned = cleanText(extractedText);
        
        if (cleaned.length < 50) {
            return `PDF text extraction was limited. Detected PDF content but unable to extract readable text reliably. 
            
For better results, please:
1. Try converting the PDF to a TXT file
2. Copy and paste the resume content into a TXT file
3. Use a different PDF file

Raw content preview (first 500 chars):
${pdfString.substring(0, 500)}...`;
        }
        
        return cleaned;
        
    } catch (error) {
        console.error('PDF extraction error:', error);
        return 'Error extracting text from PDF. Please try converting to TXT format for better results.';
    }
}

// Basic DOC text extraction
function extractTextFromDoc(base64Data) {
    try {
        const buffer = Buffer.from(base64Data, 'base64');
        let docString = buffer.toString('binary');
        
        // Try to extract readable text from DOC format
        let extractedText = '';
        
        // Look for readable text patterns
        const textPattern = /[a-zA-Z]{3,}[^\\x00-\\x1F\\x7F-\\xFF]*/g;
        const matches = docString.match(textPattern) || [];
        
        matches.forEach(match => {
            if (match.length > 3 && /[a-zA-Z]/.test(match)) {
                extractedText += match + ' ';
            }
        });
        
        const cleaned = cleanText(extractedText);
        
        if (cleaned.length < 50) {
            return `DOC text extraction was limited. 
            
For better results, please:
1. Save the document as a TXT file
2. Copy and paste the content into a TXT file
3. Try using a DOCX file instead

Partial content detected: ${cleaned.substring(0, 200)}...`;
        }
        
        return cleaned;
        
    } catch (error) {
        console.error('DOC extraction error:', error);
        return 'Error extracting text from DOC file. Please convert to TXT format for better results.';
    }
}

// Clean and format extracted text
function cleanText(text) {
    return text
        .replace(/[^\x20-\x7E\n\r]/g, ' ') // Remove non-printable characters
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n') // Remove empty lines
        .trim();
}

// Generate AI suggestions using Gemini API
async function generateSuggestions(resumeContent) {
    const prompt = `
    Analyze the following resume content and provide detailed suggestions for improvement:

    Resume Content:
    ${resumeContent}

    Please provide suggestions in the following categories:
    1. **Content & Structure**: Analyze the overall structure, sections, and content organization
    2. **Skills & Keywords**: Suggest relevant skills and keywords to add based on the content
    3. **Experience Description**: How to better describe work experience and achievements
    4. **Formatting & Presentation**: Visual and formatting improvements
    5. **Missing Sections**: What important sections might be missing
    6. **Industry-Specific Advice**: Tailored advice based on the field/industry

    Format your response in a clear, actionable manner with specific recommendations.
    Try to complete in the consized format but it mus mention bullet points and inside that suggestion in 1-2 lines. If you cannot find any suggestions, please state "No suggestions available". Also, Provide some suggestions which can be helpful in improving the ATS Score of the resume. 
    `;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Unexpected response format from Gemini API');
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return `Error generating suggestions: ${error.message}. Please check your API key and try again.`;
    }
}

// Parse resume content and extract structured information
function parseResumeContent(content) {
    // Basic resume parsing - extract common sections
    const sections = {
        personalInfo: '',
        summary: '',
        experience: '',
        education: '',
        skills: '',
        contact: ''
    };

    const lines = content.split('\n').filter(line => line.trim());
    
    // Simple keyword-based section detection
    let currentSection = 'unknown';
    let parsedContent = '';
    
    for (const line of lines) {
        const lowerLine = line.toLowerCase();
        
        // Detect sections based on common keywords
        if (lowerLine.includes('experience') || lowerLine.includes('employment') || lowerLine.includes('work history')) {
            currentSection = 'experience';
            parsedContent += `\n[EXPERIENCE SECTION]\n`;
        } else if (lowerLine.includes('education') || lowerLine.includes('academic') || lowerLine.includes('qualification')) {
            currentSection = 'education';
            parsedContent += `\n[EDUCATION SECTION]\n`;
        } else if (lowerLine.includes('skills') || lowerLine.includes('technical') || lowerLine.includes('competencies')) {
            currentSection = 'skills';
            parsedContent += `\n[SKILLS SECTION]\n`;
        } else if (lowerLine.includes('summary') || lowerLine.includes('objective') || lowerLine.includes('profile')) {
            currentSection = 'summary';
            parsedContent += `\n[SUMMARY SECTION]\n`;
        } else if (lowerLine.includes('contact') || lowerLine.includes('email') || lowerLine.includes('phone')) {
            currentSection = 'contact';
            parsedContent += `\n[CONTACT SECTION]\n`;
        }
        
        parsedContent += line + '\n';
    }
    
    return parsedContent.trim() || content;
}

// Main request handler
async function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url);
    const method = req.method;
    
    // Set CORS headers
    Object.keys(corsHeaders).forEach(key => {
        res.setHeader(key, corsHeaders[key]);
    });

    // Handle preflight requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Route: POST /api/parse-resume
    if (parsedUrl.pathname === '/api/parse-resume' && method === 'POST') {
        let body = '';
        
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { content, filename, filetype } = data;
                
                if (!content) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No content provided' }));
                    return;
                }

                console.log(`Processing file: ${filename} (${filetype})`);
                
                // Extract text content
                const textContent = extractTextFromBase64(content, filetype);
                
                // Parse resume structure
                const parsedContent = parseResumeContent(textContent);
                
                // Generate AI suggestions
                const suggestions = await generateSuggestions(parsedContent);
                
                const response = {
                    success: true,
                    filename: filename,
                    parsedContent: parsedContent,
                    suggestions: suggestions,
                    timestamp: new Date().toISOString()
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response));
                
            } catch (error) {
                console.error('Error processing request:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 'Internal server error', 
                    message: error.message 
                }));
            }
        });
        
        return;
    }

    // Route: GET /api/health
    if (parsedUrl.pathname === '/api/health' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'healthy', 
            timestamp: new Date().toISOString(),
            geminiConfigured: GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE'
        }));
        return;
    }

    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
}

// Create and start server
const server = http.createServer(handleRequest);

// Enhanced server startup with error handling
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is already in use`);
        console.log('💡 Solutions:');
        console.log(`   1. Kill the process: lsof -ti:${PORT} | xargs kill (Mac/Linux) or netstat -ano | findstr :${PORT} (Windows)`);
        console.log(`   2. Use different port: PORT=3001 node server.js`);
        console.log('   3. Wait a moment and try again');
        process.exit(1);
    } else if (error.code === 'EACCES') {
        console.log(`❌ Permission denied for port ${PORT}`);
        console.log('💡 Try using a port above 1024 or run with sudo (not recommended)');
        process.exit(1);
    } else {
        console.log('❌ Server error:', error.message);
        process.exit(1);
    }
});

server.listen(PORT, () => {
    console.log(`🚀 Resume Parser Server running on http://localhost:${PORT}`);
    console.log(`📋 API Endpoints:`);
    console.log(`   POST /api/parse-resume - Parse resume and generate suggestions`);
    console.log(`   GET  /api/health      - Check server health`);
    console.log(`\n⚠️  Important: Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual Gemini API key`);
    console.log(`🌐 Frontend should be served separately and can connect to this backend`);
    console.log(`\n✅ Test server: curl http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nReceived SIGINT, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });

});
