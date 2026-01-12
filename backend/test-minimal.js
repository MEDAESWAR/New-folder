
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

console.log('URL:', env.HF_API_URL);
console.log('Model:', env.HF_MODEL_NAME);

async function validJson(txt) {
    try {
        JSON.parse(txt);
        return true;
    } catch {
        return false;
    }
}

async function run() {
    try {
        if (!global.fetch) {
            console.log('Fetch is not available globally. Using generic http.');
            // Fallback or just fail? Node 20 should have it.
            // If this fails, we know env is old.
        }

        const res = await fetch(env.HF_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: env.HF_MODEL_NAME,
                messages: [{ role: 'user', content: 'Say "Connection Successful"' }],
                stream: false
            })
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Response:', text);
    } catch (err) {
        console.error('Error:', err);
    }
}

run();
