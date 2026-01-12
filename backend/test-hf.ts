
import { improveResumeBullet } from './services/ai.service';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing Hugging Face Integration...');
console.log('API URL:', process.env.HF_API_URL);
console.log('Model:', process.env.HF_MODEL_NAME);

async function test() {
    try {
        console.log('\n--- Testing improveResumeBullet ---');
        const result = await improveResumeBullet(
            'Managed a team of 5 people',
            'Software Engineering Manager role'
        );
        console.log('Result:', result);

        if (result && result.length > 10) {
            console.log('SUCCESS: API returned a response.');
        } else {
            console.log('FAILURE: API returned empty or invalid response.');
        }
    } catch (error) {
        console.error('ERROR:', error);
    }
}

test();
