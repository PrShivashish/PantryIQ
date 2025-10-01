# 🍳 PantryIQ | The Intelligent Culinary Engine

<p align="center">
  <img src="https://raw.githubusercontent.com/user-attachments/assets/1a6f8b9e-b9b1-4d3b-8d76-e17f4150820f" alt="PantryIQ Banner" width="800"/>
</p>

<p align="center">
  <strong>Transforming leftover ingredients into culinary masterpieces through a synergistic algorithmic pipeline.</strong>
</p>

<p align="center">
  <a href="#-key-features"><strong>Features</strong></a> ·
  <a href="#-algorithmic-core"><strong>Algorithms</strong></a> ·
  <a href="#-tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#-getting-started"><strong>Local Setup</strong></a> ·
  <a href="#-deployment"><strong>Deployment</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/Backend-FastAPI-green?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/Algorithms-Graph_Theory-blue" alt="Graph Theory">
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License: MIT">
</p>

---

## 🚀 The Vision: Computational Gastronomy

PantryIQ is not just another recipe finder. It's an intelligent culinary assistant engineered to solve the "what can I make?" problem with computational precision. By leveraging a sophisticated blend of graph theory, backtracking, and greedy algorithms, PantryIQ models the complex relationships between ingredients to deliver optimal, context-aware recipe suggestions from what you already have in your kitchen.

Our vision is to minimize food waste and maximize culinary creativity, transforming the home cooking experience from a daily chore into a delightful exploration of flavors.

## ✨ Key Features

-   **Intelligent Recipe Suggestions**: Dynamically generates recipes based on available ingredients, dietary needs, and cuisine preferences.
-   **Ingredient Gap Analysis**: Identifies missing ingredients for a target recipe and provides the best available substitutions from your pantry.
-   **Graph-Powered Substitutions**: Utilizes a complex ingredient relationship graph to find smart, context-aware ingredient alternatives.
-   **Optimal Meal Planning**: Employs backtracking to find the best *combination* of recipes, maximizing ingredient usage and minimizing waste.
-   **Real-time Algorithm Metrics**: A unique `/api/algorithms/demo` endpoint showcases the performance and complexity of the underlying algorithms for academic and demonstration purposes.

---

## 🧠 Algorithmic Core: The Trifecta Pipeline

PantryIQ's intelligence is powered by a three-stage pipeline that ensures both speed and optimality.

| Algorithm           | Role                                                                  | Time Complexity                                          |
| ------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| **1. Greedy Algorithm** | **The Fast Filter**: Rapidly scores and selects a pool of high-potential candidate recipes based on ingredient match ratios. | `O(n log n)`                                             |
| **2. Graph Theory** | **The Relationship Expert**: Analyzes the candidate pool using a NetworkX ingredient graph to find substitutions and complementary flavors. | `O(V + E)`                                               |
| **3. Backtracking** | **The Optimizer**: Performs an exhaustive, pruned search on the enhanced candidates to find the optimal recipe combination that satisfies all constraints. | `O(2^n)` worst-case (heavily optimized via pruning)      |

This synergistic approach allows PantryIQ to navigate a vast combinatorial space efficiently, delivering human-like intuition at machine speed.

---

## 🛠️ Tech Stack

PantryIQ is built with a modern, high-performance technology stack designed for scalability and maintainability.

| Category              | Technologies                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) |
| **Backend** | [Python](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), [Gunicorn](https://gunicorn.org/), [Uvicorn](https://www.uvicorn.org/)       |
| **Algorithms & Data** | [NetworkX](https://networkx.org/) (Graph Theory), [Pydantic](https://pydantic-docs.help.cn/) (Data Validation)                                           |
| **Auth & Database** | [Supabase](https://supabase.com/) (PostgreSQL, Auth)                                                                    |
| **Deployment** | [Render](https://render.com/), [GitHub](https://github.com)                                                                                                                     |

---

## 🚀 Getting Started: Local Development

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18+) & [pnpm](https://pnpm.io/)
-   [Python](https://www.python.org/) (v3.8+)
-   A [Supabase](https://supabase.com/) account for authentication.

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python -m venv venv
source venv/bin/activate # For macOS/Linux
# venv\Scripts\activate # For Windows

# Install dependencies
pip install -r requirements.txt

# Run the development server
uvicorn main:app --reload

### 1. Backend Setup

```

### 1. Frontend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python -m venv venv
source venv/bin/activate # For macOS/Linux
# venv\Scripts\activate # For Windows

# Install dependencies
pip install -r requirements.txt

# Run the development server
uvicorn main:app --reload
