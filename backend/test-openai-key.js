// Quick test script to verify OpenAI API key
require('dotenv').config();
const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;

console.log('\n=== OpenAI API Key Test ===\n');

if (!apiKey) {
  console.log('❌ ERROR: OPENAI_API_KEY not found in .env file');
  process.exit(1);
}

// Mask the key for display
const maskedKey = apiKey.length > 11 
  ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 10)}`
  : '***';

console.log(`API Key found: ${maskedKey}`);
console.log(`Key length: ${apiKey.length} characters`);
console.log(`Key starts with: ${apiKey.substring(0, 7)}`);

// Validate key format
if (!apiKey.startsWith('sk-')) {
  console.log('\n⚠️  WARNING: API key should start with "sk-"');
  console.log('   This might be a placeholder or invalid key format');
}

console.log('\nTesting API connection...\n');

const openai = new OpenAI({
  apiKey: apiKey,
});

// Make a simple test call
openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    {
      role: 'user',
      content: 'Say "API key is working!" if you can read this.',
    },
  ],
  max_tokens: 20,
})
  .then((response) => {
    console.log('✅ SUCCESS: API key is valid and working!');
    console.log(`\nResponse: ${response.choices[0].message.content}`);
    console.log('\n✅ Your OpenAI API key is configured correctly!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ ERROR: API key test failed\n');
    
    if (error.status === 401) {
      console.log('   Status: 401 Unauthorized');
      console.log('   Issue: Invalid API key');
      console.log('\n   Solutions:');
      console.log('   1. Check if the key is correct in .env file');
      console.log('   2. Make sure there are no extra spaces or quotes');
      console.log('   3. Get a new key from: https://platform.openai.com/account/api-keys');
      console.log('   4. Restart the backend server after updating .env\n');
    } else if (error.status === 429) {
      console.log('   Status: 429 Rate Limit');
      console.log('   Issue: Too many requests or insufficient credits');
      console.log('\n   Solutions:');
      console.log('   1. Check your OpenAI account billing');
      console.log('   2. Wait a few minutes and try again');
      console.log('   3. Visit: https://platform.openai.com/account/billing\n');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log('   Issue: Network connection error');
      console.log('   Check your internet connection\n');
    } else {
      console.log(`   Error: ${error.message}`);
      console.log(`   Status: ${error.status || 'Unknown'}\n`);
    }
    
    process.exit(1);
  });
