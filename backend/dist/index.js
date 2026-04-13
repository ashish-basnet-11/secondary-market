import express, {} from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import prisma from './prisma.js';
import authRoutes from './routes/auth.js';
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Secondary Market API' });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
//# sourceMappingURL=index.js.map