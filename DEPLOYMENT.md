# Deployment Guide

## Production Environment Setup

### Backend Deployment

1. **Environment Variables**
   Create a `.env` file in the backend directory with production values:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/career_mentor?schema=public"
   JWT_SECRET="strong-random-secret-key"
   JWT_EXPIRES_IN="7d"
   OPENAI_API_KEY="your-openai-api-key"
   PORT=5000
   NODE_ENV=production
   ```

2. **Build Backend**
   ```bash
   cd backend
   npm install --production
   npm run build
   ```

3. **Database Setup**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Run Backend**
   ```bash
   npm start
   ```

   Or use PM2 for process management:
   ```bash
   pm2 start dist/server.js --name career-mentor-api
   ```

### Frontend Deployment

1. **Build Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy Options**

   **Option A: Static Hosting (Vercel, Netlify, etc.)**
   - Upload the `dist` folder
   - Configure API proxy to backend URL
   - Set environment variables if needed

   **Option B: Serve from Backend**
   - Copy `frontend/dist` to `backend/public`
   - Add static file serving in Express:
   ```typescript
   app.use(express.static('public'));
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, 'public', 'index.html'));
   });
   ```

### Docker Deployment (Optional)

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: career_mentor
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://user:password@postgres:5432/career_mentor
      JWT_SECRET: your-secret
      OPENAI_API_KEY: your-key
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Security Considerations

1. **JWT Secret**: Use a strong, random secret key
2. **Database**: Use connection pooling and SSL in production
3. **CORS**: Configure CORS to allow only your frontend domain
4. **Rate Limiting**: Implement rate limiting for API endpoints
5. **HTTPS**: Use HTTPS in production
6. **Environment Variables**: Never commit `.env` files
7. **API Keys**: Store OpenAI API key securely

### Monitoring

1. **Logging**: Set up proper logging (Winston, Pino)
2. **Error Tracking**: Use services like Sentry
3. **Performance**: Monitor API response times
4. **Database**: Monitor query performance

### Scaling

1. **Load Balancing**: Use load balancer for multiple backend instances
2. **Database**: Consider read replicas for PostgreSQL
3. **Caching**: Implement Redis for session storage
4. **CDN**: Use CDN for frontend assets
