# VedaAI — AI Assessment & Exam Paper Creator

VedaAI is an automated assessment platform designed for educators to easily create structured exam question papers. The application uses AI (Anthropic Claude API) to generate curriculum-aligned questions that fit specific subjects, grade levels, and difficulty distributions.

## Architecture & Data Flow

```
+------------------+                   +--------------------+
|                  |  POST /assignments |                    |
| Next.js Frontend | ----------------> |  Express API Host  |
|                  |                   |                    |
+------------------+                   +--------------------+
         ^                                       |
         |                                       | Enqueue Job
         | WebSocket Update                      v
+------------------+                   +--------------------+
|  Socket Manager  |                   |    BullMQ Queue    |
+------------------+                   +--------------------+
         ^                                       |
         | Broadcast                             | Process
         |                                       v
+------------------+   Save Paper      +--------------------+
|   MongoDB (DB)   | <---------------- |  Background Worker |
+------------------+                   +--------------------+
                                                 |
                                                 | Call API
                                                 v
                                       +--------------------+
                                       | Claude Sonnet AI   |
                                       +--------------------+
```

1. **Frontend**: The teacher fills out the assignment layout configuration form (grade, subject, question categories, difficulty distribution) and uploads an optional reference file (PDF/TXT).
2. **API Endpoint**: The Express endpoint validates parameters, extracts text using `pdf-parse`, records the assignment structure in MongoDB, and enqueues a generation job into BullMQ.
3. **Queue**: BullMQ holds the task queue backed by Redis cache.
4. **Worker**: A background worker grabs the job, sets assignment state to `processing`, and calls the Claude AI integration.
5. **AI Service**: Prepares a formatted prompt for Claude, sends the request, strips markdown borders, validates JSON, and parses the structured sections.
6. **Persistence**: The worker writes the structured questions into MongoDB under the `QuestionPaper` schema and marks the assignment status as `done`.
7. **WebSocket**: The socket manager broadcasts a `paper_ready` notification. The React frontend receives it and routes the user to the formatted exam sheet page.

---

## Prerequisites

- **Node.js**: Version 18.0 or higher.
- **Docker**: For running MongoDB and Redis.
- **Anthropic Claude API Key**: A valid `ANTHROPIC_API_KEY` for paper generation. (If unavailable, VedaAI automatically runs in offline mock generation mode for testing.)

---

## Local Setup

### 1. Start MongoDB and Redis Services
If you have Docker installed, spin up local MongoDB and Redis instances using Docker Compose:
```bash
docker-compose up -d
```

### 2. Configure and Start Backend
```bash
cd backend
# Create and edit your env configuration
cp .env.example .env

# Install dependencies and launch the dev server
npm install
npm run dev
```

### 3. Configure and Start Frontend
```bash
cd ../frontend
# Install packages and launch the Next.js development server
npm install
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example / Default |
|---|---|---|
| `PORT` | Local server port | `4000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/vedaai` |
| `REDIS_URL` | Redis server URL | `redis://127.0.0.1:6379` |
| `ANTHROPIC_API_KEY` | Anthropic Claude developer API key | `sk-ant-xxx...` |
| `FRONTEND_URL` | Frontend address for CORS | `http://127.0.0.1:3000` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Target API gateway URL | `http://127.0.0.1:4000/api` |
| `NEXT_PUBLIC_WS_URL` | Target WebSocket gateway URL | `ws://127.0.0.1:4000` |

---

## Deployment Steps

### Backend (Railway / Render)
1. Link your backend code folder or repository to Railway or Render.
2. Spin up **MongoDB** and **Redis** add-ons.
3. Configure the env variables matching the database settings.
4. Set Build Command: `npm install && npm run build`
5. Set Start Command: `npm run start`

### Frontend (Vercel / Netlify)
1. Add the Next.js frontend code project to Vercel.
2. Specify the root folder configuration path: `frontend/`
3. Configure the environment variables pointing to your backend:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-railway-url.com/api`
   - `NEXT_PUBLIC_WS_URL` = `wss://your-backend-railway-url.com`
4. Deploy the application.

---

## API Documentation

### `POST /api/assignments`
Creates a configuration and queues a generation task.

- **Request Body (Multipart Form)**:
  - `data`: JSON string matching the configuration layout.
  - `file`: (Optional) PDF/TXT reference file upload.
- **Response (`201 Created`)**:
  ```json
  { "assignmentId": "603d2e1b12b542001c801e01" }
  ```

### `GET /api/assignments/:id`
Retrieves the creation status of the paper.

- **Response (`200 OK`)**:
  ```json
  {
    "_id": "603d2e1b12b542001c801e01",
    "subject": "Chemistry",
    "grade": "Grade 10",
    "status": "processing" // pending | processing | done | error
  }
  ```

### `GET /api/assignments/:id/paper`
Retrieves the generated sections and questions.

- **Response (`200 OK`)**:
  ```json
  {
    "_id": "603d3f9b12b542001c801e05",
    "assignmentId": "603d2e1b12b542001c801e01",
    "sections": [
      {
        "title": "Section A",
        "type": "MCQ",
        "instruction": "Attempt all questions.",
        "questions": [
          {
            "text": "What is the molecular formula of water?",
            "difficulty": "Easy",
            "marks": 1,
            "options": ["A) H2O", "B) CO2", "C) NaCl", "D) O2"]
          }
        ]
      }
    ]
  }
  ```

### `POST /api/assignments/:id/regenerate`
Deletes the old paper and enqueues a new generation task.

- **Response (`200 OK`)**:
  ```json
  { "message": "Regeneration queued" }
  ```
