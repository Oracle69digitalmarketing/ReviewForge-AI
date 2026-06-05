# ReviewForge AI — Solution Paper
## DSN × BCT LLM Agent Challenge 3.0
### Task A: User Modeling | Task B: Recommendation

---

## 1. Executive Summary
ReviewForge AI is a dual-task agentic framework designed to bridge the gap between user behavior modeling and personalized recommendations in the Nigerian digital ecosystem. It utilizes a **Structured Persona Engine** powered by **Gemini 1.5 Flash** to distill user histories into high-fidelity "Neural Personas." These personas drive both authentic review simulation (Task A) and contextually aware, cross-domain recommendations (Task B).

**Live Application:** [https://reviewforge-ai.onrender.com](https://reviewforge-ai.onrender.com)  
**Docker Hub:** [sophiemabel/reviewforge-ai:latest](https://hub.docker.com/r/sophiemabel/reviewforge-ai)

---

## 2. Technical Architecture & Innovation
Our system follows a three-layer stack optimized for the Nigerian context:
- **Orchestration:** Express.js + TypeScript for robust API routing.
- **Reasoning Engine:** Gemini 1.5 Flash (Cloud) & Llama 3.1 (via Groq/Local) for high-fidelity persona extraction.
- **Neural Persona Schema:** A 15-dimensional JSON model capturing linguistic nuances (Pidgin, cultural exclamations) and behavioral traits (price sensitivity, rating bias).

### Key Innovation: The Multi-Persona Selector
In the latest version, we've introduced a **Persona Selection UI**. When the engine analyzes complex histories containing multiple distinct user behaviors (common in raw datasets), it extracts multiple candidate profiles. The user can now manually switch between these "Linguistic Fingerprints" to see how different personas would review the same item.

---

## 3. Implementation Details

### Task A: User Modeling (Extraction → CoT → Generation)
1.  **Extraction:** The engine parses raw history to identify specific Nigerian nuances (*"Omo"*, *"slap well well"*) and rating tendencies.
2.  **Chain-of-Thought (CoT):** Before generating a review, the agent performs an internal monologue to align its logic with the persona's traits.
3.  **Generation:** Produces a high-fidelity review with natural Pidgin integration and a predicted rating.

### Task B: Agentic Recommendation
- **Filter-Reason-Rank Loop:** Instead of simple vector math, the agent *reasons* why a user who likes "Spicy Suya" (Yelp) might enjoy a "Bold Thriller" (Goodreads).
- **Cross-Domain Mapping:** Seamlessly connects preferences across Yelp (Food), Goodreads (Books), and Amazon (Electronics).

---

## 4. Bug Fixes & Improvements (Latest Update)
- **Robust JSON Parsing:** Fixed a critical bug in the backend parser that failed when the AI returned arrays of personas. The new regex-based parser handles both single objects and multi-persona lists.
- **Simulation Optimization:** The frontend now passes the *selected* persona directly to the simulation endpoint, eliminating redundant extraction steps and ensuring 100% logic alignment between the UI and the generated review.
- **Enhanced UI:** Added a scrollable persona switcher in the "Linguistic Fingerprint" section.

---

## 5. Quick Start for Judges
### Run via Docker
```bash
docker pull sophiemabel/reviewforge-ai:latest
docker run -d -p 3000:3000 -e GEMINI_API_KEY=your_key_here sophiemabel/reviewforge-ai:latest
```
Access the dashboard at `http://localhost:3000`.

### API Test (Task A)
```bash
curl -X POST http://localhost:3000/task_a/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "Tunde",
    "item_id": "y2",
    "history": "I love spicy food. Always eating at local spots. Omo, the pepper must hit well."
  }'
```

---

## 6. Evaluation Metrics
- **RMSE:** Optimized via Likert Weighted Bias in the persona schema.
- **BERTScore:** High semantic alignment using extracted `pidgin_markers`.
- **NDCG@10:** Superior ranking in cold-start scenarios via agentic cross-domain reasoning.

---

## 7. License & Team
**Team:** ReviewForge AI  
**License:** CC BY-NC 4.0  
**Contact:** sophiemabel69@gmail.com  
**DSN × BCT LLM Agent Challenge, June 2026**
