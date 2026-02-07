from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="QueryGen AI - Text-to-SQL Service",
    description="Converts natural language to SQL queries using Groq LLM",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Request model
class QueryRequest(BaseModel):
    query: str
    database_schema: str = "users(id, name, email, city, age)"

# Response model
class QueryResponse(BaseModel):
    success: bool
    natural_language_query: str
    generated_sql: str
    model_used: str

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "QueryGen AI - Text-to-SQL Service",
        "status": "running",
        "endpoints": {
            "generate_sql": "/api/text-to-sql (POST)",
            "health": "/health (GET)"
        }
    }

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-service"}

# Main Text-to-SQL endpoint
@app.post("/api/text-to-sql", response_model=QueryResponse)
async def generate_sql(request: QueryRequest):
    try:
        print(f"📥 Received query: {request.query}")
        
        # Create prompt for LLM
        prompt = f"""You are a SQL expert. Convert the following natural language query to a SQL statement.

Database Schema: {request.database_schema}

Natural Language Query: {request.query}

Instructions:
1. Generate ONLY the SQL query, nothing else
2. Use proper SQL syntax
3. Make it efficient and optimized
4. Do not include explanations or markdown
5. Return only the raw SQL query

SQL Query:"""

        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a SQL expert. Generate only SQL queries without any explanations or markdown formatting."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",  # Fast and accurate model
            temperature=0.1,  # Low temperature for consistent results
            max_tokens=500
        )
        
        # Extract SQL from response
        generated_sql = chat_completion.choices[0].message.content.strip()
        
        # Clean up response (remove markdown if present)
        if generated_sql.startswith("```sql"):
            generated_sql = generated_sql.replace("```sql", "").replace("```", "").strip()
        elif generated_sql.startswith("```"):
            generated_sql = generated_sql.replace("```", "").strip()
        
        print(f"✅ Generated SQL: {generated_sql}")
        
        return QueryResponse(
            success=True,
            natural_language_query=request.query,
            generated_sql=generated_sql,
            model_used="llama-3.3-70b-versatile"
        )
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating SQL: {str(e)}")

# Run with: uvicorn main:app --reload --port 8000