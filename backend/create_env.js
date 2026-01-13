const fs = require('fs');
const content = `DATABASE_URL="mongodb+srv://meshwar220_db_user:PIK9sQcVmhNbl9TC@cluster0.id683es.mongodb.net/resumebuilder?retryWrites=true&w=majority"
JWT_SECRET="your-secret-key"
PORT=5000`;
fs.writeFileSync('.env', content);
console.log('.env created successfully');
