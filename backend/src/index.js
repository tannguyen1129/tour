import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';

import { connectDB } from './config/db.js';
import { typeDefs, resolvers } from './graphql/schema.js';
import { authContext } from './middlewares/auth.js';
import uploadRouter from './routes/upload.js';
import vnpayRoutes from './routes/vnpay.js';
import './config/google.js'; // cấu hình strategy
import googleAuthRoutes from './routes/googleAuth.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();

// 1️⃣ Kết nối MongoDB
await connectDB();
console.log('✅ MongoDB connected');

// 2️⃣ Middleware cơ bản
app.use(cors());
app.use(express.json()); // Cho phép xử lý body JSON

// 3️⃣ Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// 4️⃣ Đăng ký các API route
app.use('/api/upload', uploadRouter);
app.use('/api/payment', vnpayRoutes);

app.use('/api/auth', googleAuthRoutes);
app.use('/api/auth', authRoutes);

// 5️⃣ Tạo ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // ✅ Context chứa req + user (lấy từ token)
  context: async ({ req }) => {
    if (!req) return {}; // Trường hợp introspection hoặc khi không có req
    const { user } = await authContext({ req });
    return { req, user };
  }
});

// 6️⃣ Khởi động Apollo server
await server.start();
server.applyMiddleware({ app });

// 7️⃣ Khởi động Express server
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 GraphQL ready at http://localhost:${PORT}${server.graphqlPath}`);
  console.log(`📂 Static files served at: http://localhost:${PORT}/uploads/`);
  console.log(`📤 Upload API: POST http://localhost:${PORT}/api/upload`);
});
