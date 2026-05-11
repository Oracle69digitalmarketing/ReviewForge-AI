# ReviewForge AI
## DSN × BCT LLM Agent Challenge 3.0
### Task A: User Modeling | Task B: Recommendation

## Overview
ReviewForge AI is a dual-task LLM agent that simulates Nigerian reviewer behaviour (ratings + text) and delivers personalised, explainable recommendations. It utilizes the **Gemini 1.5 Flash** model to achieve high-reasoning fidelity with low latency, specifically optimized for Nigerian contextual nuances.
**Solution Paper:** [DSN_HACKATHON_SUBMISSION.md]

**Live Application URL:** [https://ais-pre-4kbvltwdtvkp6iqfzkw2de-94089556651.europe-west1.run.app](https://ais-pre-4kbvltwdtvkp6iqfzkw2de-94089556651.europe-west1.run.app)
**Docker Hub (Unified Image):** [sophiemabel69/reviewforge-ai:latest](https://hub.docker.com/r/sophiemabel69/reviewforge-ai)

## Quick Start (for Judges)
### 1. Pull the Image
```bash
docker pull sophiemabel69/reviewforge-ai:latest
```

### 2. Run the Container
```bash
docker run -d -p 3000:3000 -e GEMINI_API_KEY=your_key_here sophiemabel69/reviewforge-ai:latest
```
*The agent requires a Gemini API key for real-time persona extraction and reasoning. The app is accessible at http://localhost:3000.*

### 3. Test Task A: User Modeling (Review Simulation)
```bash
curl -X POST http://localhost:3000/task_a/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "Tunde",
    "item_id": "restaurant_01",
    "history": "I love spicy food. Always eating at local spots. Omo, the pepper must hit well."
  }'
```

**Expected Response**
```json
{
  "rating": 5,
  "review_text": "Omo! The pepper soup slap well well. Correct amala to match...",
  "internal_cot": "Reasoning about Tunde's preference for local spice...",
  "fidelity_score": 92
}
```

### 4. Test Task B: Recommendation (Agentic Retrieval)
```bash
curl -X POST http://localhost:3000/task_b/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I want something spicy under 3000 naira",
    "history": "User likes Nigerian street food, prefers Amala and Suya."
  }'
```

## Repository Structure
```text
reviewforge-ai/
├── src/
│   ├── App.tsx                  # React Frontend with Voice-to-Text
│   └── components/              # UI components (Bento cards, Chat)
├── server.ts                    # Express backend & Gemini integration
├── Dockerfile                   # Deployment configuration
├── package.json                 # Dependencies (React, Express, Gemini SDK)
├── DSN_HACKATHON_SUBMISSION.md  # Detailed Solution Paper
└── README.md                    # This file
```

## Reproducing Metrics
```bash
pip install -r requirements.txt

python evaluation/compute_metrics.py \
  --test_set evaluation/sample_test_set.json
```
The script will output RMSE, BERTScore, NDCG@10, and (if human annotations are provided) the human pass rate.

## Key Design Decisions
- **Gemini 1.5 Flash Engine** for high-fidelity reasoning and context extraction.
- **Agentic Workflow** with explicit Chain-of-Thought reasoning.
- **Nigerian context markers** (Pidgin, authentic exclamations) integrated into prompts.
- **Unified Persona Schema** shared across simulation and recommendation tasks.
- **Voice-to-Text Integration** for natural conversational input.

## License
CC BY-NC 4.0 – for non-commercial educational use within the hackathon context.

**Team: ReviewForge AI**
**Contact:** sophiemabel69@gmail.com
**Submitted for:** DSN × BCT LLM Agent Challenge, May 2026
