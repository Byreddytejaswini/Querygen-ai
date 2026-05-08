# QueryGen AI – Natural Language to SQL Generator

QueryGen AI is an AI-powered Text-to-SQL system that converts natural language queries into SQL queries using Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG). The platform enables users to interact with databases using plain English without requiring SQL knowledge.

--------------------------------------------------

FEATURES

• Natural Language to SQL conversion
• Context-aware query generation using RAG
• SQL query execution on SQLite database
• Tabular result display
• Data visualization using charts
• Query history management
• User authentication
• CSV export functionality
• Admin dashboard with analytics
• Error handling and retry mechanism

--------------------------------------------------

TECH STACK

Frontend:
• React.js

Backend:
• Node.js
• Express.js

AI Service:
• FastAPI
• LLaMA 3.3 via Groq API
• Retrieval-Augmented Generation (RAG)

Databases:
• SQLite
• MongoDB

--------------------------------------------------

PROJECT STRUCTURE

QueryGenAI/
│
├── frontend/
├── backend/
├── ai-service/
├── database/
├── screenshots/
└── README.md

--------------------------------------------------

INSTALLATION & SETUP

1. Clone the Repository

git clone https://github.com/your-username/QueryGenAI.git

cd QueryGenAI

--------------------------------------------------

2. Install Frontend Dependencies

cd frontend

npm install

--------------------------------------------------

3. Install Backend Dependencies

cd ../backend

npm install

--------------------------------------------------

4. Install AI Service Dependencies

cd ../ai-service

pip install -r requirements.txt

--------------------------------------------------

RUNNING THE PROJECT

Start Frontend

cd frontend

npm start

--------------------------------------------------

Start Backend

cd backend

npm run dev

--------------------------------------------------

Start AI Service

cd ai-service

uvicorn main:app --reload

--------------------------------------------------

HOW IT WORKS

1. User enters a natural language query.
2. RAG retrieves schema and contextual information.
3. LLM generates SQL query.
4. Query is validated and executed on SQLite database.
5. Results are displayed in table and chart formats.

--------------------------------------------------

EXAMPLE

Natural Language Query:
Show all users from Delhi aged above 25

Generated SQL:
SELECT * FROM users WHERE city = 'Delhi' AND age > 25;

--------------------------------------------------

FUTURE ENHANCEMENTS

• Support for MySQL and PostgreSQL

• Voice-based query input

• Advanced analytics dashboard

• Improved query optimization

• Cloud deployment support

--------------------------------------------------

TEAM MEMBERS

• P. Nikhitha

• S. Sahithi

• B. Tejaswini

--------------------------------------------------

REFERENCES

• React Documentation – https://react.dev

• Node.js Documentation – https://nodejs.org

• FastAPI Documentation – https://fastapi.tiangolo.com

• SQLite Documentation – https://www.sqlite.org/docs.html

• Groq API Documentation – https://console.groq.com/docs
