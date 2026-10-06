from fastapi import FastAPI
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

app = FastAPI(title="EduTrack Insights Service")

# --- Modelos de dados (Pydantic valida automaticamente o formato recebido) ---

class Task(BaseModel):
    id: int
    status: str
    due_date: Optional[date] = None

class Subject(BaseModel):
    id: int
    name: str
    workload_hours: Optional[int] = 0
    tasks: list[Task] = []

class SubjectsPayload(BaseModel):
    subjects: list[Subject]


# --- Endpoint 1: Progresso avançado (ponderado por carga horária) ---

@app.post("/progress/advanced")
def advanced_progress(payload: SubjectsPayload):
    results = []
    total_weighted_progress = 0
    total_weight = 0

    for subject in payload.subjects:
        total_tasks = len(subject.tasks)
        completed = len([t for t in subject.tasks if t.status == "completed"])

        # Progresso simples (igual ao que já existe no dashboard)
        simple_progress = (completed / total_tasks * 100) if total_tasks > 0 else 0

        # Peso da disciplina = carga horária (disciplinas mais "pesadas" importam mais no total geral)
        weight = subject.workload_hours or 1
        total_weighted_progress += simple_progress * weight
        total_weight += weight

        # Previsão de conclusão: baseada na "velocidade" de conclusão até agora.
        # Lógica simples: se já completou X% em Y dias desde a primeira tarefa,
        # projeta quantos dias faltam para completar o resto.
        # (Versão simplificada: assume ritmo constante de conclusão)
        pending = total_tasks - completed
        estimated_days_remaining = None
        if completed > 0 and pending > 0:
            # Estimativa simples: 3 dias por tarefa pendente, como ponto de partida
            # (poderia evoluir para usar datas reais de conclusão no futuro)
            estimated_days_remaining = pending * 3

        results.append({
            "subject_id": subject.id,
            "name": subject.name,
            "simple_progress_pct": round(simple_progress, 1),
            "weight_hours": weight,
            "estimated_days_remaining": estimated_days_remaining
        })

    weighted_overall = (total_weighted_progress / total_weight) if total_weight > 0 else 0

    return {
        "subjects": results,
        "weighted_overall_progress_pct": round(weighted_overall, 1)
    }


# --- Endpoint 2: Recomendações (priorização de disciplinas atrasadas) ---

@app.post("/insights/recommendations")
def recommendations(payload: SubjectsPayload):
    today = date.today()
    recs = []

    for subject in payload.subjects:
        overdue_tasks = [
            t for t in subject.tasks
            if t.status != "completed" and t.due_date and t.due_date < today
        ]
        pending_tasks = [t for t in subject.tasks if t.status != "completed"]

        if len(overdue_tasks) > 0:
            urgency_score = len(overdue_tasks) * 2 + len(pending_tasks)
            recs.append({
                "subject_id": subject.id,
                "name": subject.name,
                "overdue_count": len(overdue_tasks),
                "pending_count": len(pending_tasks),
                "urgency_score": urgency_score,
                "message": f"{subject.name} tem {len(overdue_tasks)} tarefa(s) atrasada(s). Priorize essa disciplina."
            })

    # Ordena pela urgência (maior primeiro)
    recs.sort(key=lambda r: r["urgency_score"], reverse=True)

    return {"recommendations": recs}


@app.get("/health")
def health():
    return {"status": "ok"}