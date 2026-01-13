const fs = require('fs');
const content = `DATABASE_URL="mongodb+srv://MedaEswar:d5uXraTTqXkKQzX0@cluster0.id683es.mongodb.net/resumebuilder?appName=Cluster0"
JWT_SECRET="your-secret-key"
PORT=5000`;
fs.writeFileSync('.env', content);
console.log('.env updated successfully');
