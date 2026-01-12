
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const content = `HF_API_URL=https://raghu0934-qwen2-5-1-5b-model.hf.space/api/chat
HF_MODEL_NAME=qwen2.5:1.5b
`;

fs.writeFileSync(envPath, content);
console.log('.env file created successfully');
