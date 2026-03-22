const axios = require('axios');

const runCode = async (req, res) => {
    const { code, language } = req.body;
    
    if (!code || !language) {
        return res.status(400).json({ success: false, message: 'Code and language are required' });
    }

    try {
        const languageMap = {
            cpp: 54,
            python: 71,
            java: 62,
            javascript: 63
        };

        const langKey = language?.toLowerCase() || 'javascript';
        const language_id = languageMap[langKey] || languageMap.javascript;

        const url = 'https://ce.judge0.com/submissions?base64_encoded=true&wait=true';
        
        const encodedCode = Buffer.from(code).toString('base64');
        
        const response = await axios.post(url, {
            source_code: encodedCode,
            language_id: language_id,
        });

        const result = response.data;

        let decodedOutput = '';
        if (result.stdout) {
            decodedOutput = Buffer.from(result.stdout, 'base64').toString('utf8');
        } else if (result.stderr) {
            decodedOutput = Buffer.from(result.stderr, 'base64').toString('utf8');
        } else if (result.compile_output) {
            decodedOutput = Buffer.from(result.compile_output, 'base64').toString('utf8');
        }

        res.status(200).json({
            success: true,
            status: result.status?.description || 'Executed',
            output: decodedOutput
        });

    } catch (error) {
        console.error('[Judge0 Error]', error.message);
        
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to communicate with Judge0 server';
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage 
        });
    }
}

module.exports = { runCode };
