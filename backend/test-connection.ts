import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to MongoDB...');
    try {
        const start = Date.now();
        await prisma.$connect();
        console.log(`Connected in ${Date.now() - start}ms`);

        console.log('Counting users...');
        const count = await prisma.user.count();
        console.log(`User count: ${count}`);

        console.log('Connection successful!');
    } catch (error) {
        console.error('Connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
