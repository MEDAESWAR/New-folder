const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
const content = `DATABASE_URL="mongodb+srv://MedaEswar:d5uXraTTqXkKQzX0@cluster0.id683es.mongodb.net/resumebuilder?appName=Cluster0"
JWT_SECRET="dev_secret_key_change_in_prod"
PORT=5000
HF_API_URL="https://raghu0934-qwen2-5-1-5b-model.hf.space/api/chat"
HF_MODEL_NAME="qwen2.5:1.5b"
`;

fs.writeFileSync(envPath, content);
console.log('------------------------------------------------');
console.log('SUCCESS: .env file has been completely rewritten.');
console.log('Included variables:');
console.log(' - DATABASE_URL (MongoDB)');
console.log(' - JWT_SECRET');
console.log(' - PORT');
console.log(' - HF_API_URL (AI)');
console.log(' - HF_MODEL_NAME (AI)');
console.log('------------------------------------------------');
