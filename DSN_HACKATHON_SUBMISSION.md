# DSN X BCT Data & AI Summit 2026 Hackathon Submission
## ReviewForge AI — Solution Paper

**Team Name:** ReviewForge AI  
**Team Members:** Adewumi Adewale, Adewumi Oluwaseun  
**Submission Date:** 24 May 2026  
**Task(s) Entered:** Task A (User Modeling) & Task B (Recommendation)

---

### 1. Introduction & Architecture Overview
ReviewForge AI is a dual-task agent built around a single **Persona Engine**. We reject the notion that review generation and recommendation are separate problems. A review is a window into preference; a recommendation is a predicted review before it is written. The Persona Engine bridges them, capturing not only rating behaviour but also linguistic style, including Nigerian English and Pidgin—a requirement explicitly rewarded by the judges.

**Live Application URL:** [https://reviewforge-ai.onrender.com](https://reviewforge-ai.onrender.com)

#### Key Design Choices
- **Structured Persona Engine:** Uses Gemini 1.5 Flash to distill raw text into a multi-dimensional persona schema.
- **Agentic Workflow:** Employs explicit "Internal Reasoning" (Chain-of-Thought) before outputting results.
- **Unified Logic:** The same persona extracted in Task A informs the re-ranking and explanation in Task B.

---

### 2. Nigerian Contextualisation
We made cultural authenticity a first-class design objective.

#### 2.1 Persona Fields for Nigerian Expression
Our engine extracts and utilizes:
- **`uses_pidgin` / `pidgin_markers`:** Captures vocabulary like *"dey"*, *"no be"*, and *"e get"*.
- **`exclamations`:** Models culturally authentic reactions like *"Omo!"*, *"Chai!"*, and *"Abeg!"*.
- **`rating_tendency`:** Specifically models the "emotional extreme" behaviour common in Nigerian digital reviews.

#### 2.2 Results
Our simulations achieved a high "Nigerian-ness" fidelity score, preserving the tone and contextual nuances unique to the Lagos and Abuja service landscapes.

---

### 3. Task A: User Modeling
The system analyzes user history (even raw pasted text) to build a "Neural Persona."
- **Workflow:** Extraction → Chain-of-Thought Simulation → Textual Generation.
- **Metric Handling (RMSE & ROUGE):** To optimize for Rating Accuracy (RMSE), our simulation engine uses a "Likert Weighted Bias" during generation, ensuring star ratings aren't just random but derived from the historical bias of the persona. 
- **Linguistic Fidelity:** Gemini's reasoning engine allows us to match the user's vocabulary (Pidgin vs. Standard English) which maximizes BERTScore against ground-truth Nigerian reviews.

---

### 4. Task B: Recommendation
ReviewForge AI delivers personalised recommendations that go beyond simple filtering.
- **Agentic Workflow:** Our agent uses a *Filter-Reason-Rank* loop. It first filters candidates, reasons about the context (e.g., price vs. taste), and then ranks.
- **Contextual Relevance:** Evaluated through "Human Fidelity" gates where the agent must explain *why* the item is recommended in the context of the user's Nigerian identity markers.
- **Multi-turn Chat:** Integrated Voice-to-Text for a natural, conversational UX.

---

### 5. Reproducibility & Evaluation
The project is built for complete portability.
- **Evaluation Loop:** The system includes internal telemetry to log "Chain-of-Thought" paths, allowing judges to inspect the model's logic for every decision.
- **Local Sovereignty:** While currently optimized for Gemini 1.5 for high-fidelity reasoning, the architecture is designed to support local Llama-3-8B endpoints with the same persona schema.

**Docker Hub Image:** [sophiemabel/reviewforge-ai:latest](https://hub.docker.com/r/sophiemabel/reviewforge-ai)

**Repository Access:** [https://github.com/Oracle69digitalmarketing/ReviewForge-AI](https://github.com/Oracle69digitalmarketing/ReviewForge-AI)

---

### 6. Discussion & Future Work
We successfully built an agent that doesn't just recommend items, but explains *why* in the user's own voice. Future iterations will include full local Llama 3 deployment as outlined in the Docker specification for complete offline sovereignty.

**Team: ReviewForge AI**  
**Contact:** sophiemabel69@gmail.com  
**Submitted for:** DSN × BCT LLM Agent Challenge, May 2026
