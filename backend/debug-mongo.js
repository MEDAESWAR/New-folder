require('dotenv').config();
const mongoose = require('mongoose');

const url = process.env.DATABASE_URL;

console.log("---------------------------------------------------");
console.log("DEBUGGER: Testing MongoDB Connection");
console.log("---------------------------------------------------");

if (!url) {
    console.error("ERROR: DATABASE_URL is not defined in .env");
    process.exit(1);
}

// Mask password for safety in logs
const maskedUrl = url.replace(/(:[^:@]+@)/, ':****@');
console.log("URL being used:", maskedUrl);

mongoose.connect(url)
    .then(() => {
        console.log("SUCCESS: Mongoose connected successfully!");
        console.log("Connection State:", mongoose.connection.readyState);
        process.exit(0);
    })
    .catch((err) => {
        console.error("FAILURE: Connection Failed");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        if (err.codeName) console.error("Code Name:", err.codeName);
        if (err.code) console.error("Error Code:", err.code);
        process.exit(1);
    });
