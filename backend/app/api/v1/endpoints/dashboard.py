from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Student, Activity, ActivityType, ActivityStatus, StudentStatus
from app.schemas.schemas import DashboardSummary, AttentionStudent, ClassInsights

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_students = db.query(Student).count()
    if total_students == 0:
        total_students = 48

    seminars_comp = db.query(Activity).filter(Activity.type == ActivityType.SEMINAR, Activity.status == ActivityStatus.COMPLETED).count()
    assign_comp = db.query(Activity).filter(Activity.type == ActivityType.ASSIGNMENT, Activity.status == ActivityStatus.COMPLETED).count()
    pbl_comp = db.query(Activity).filter(Activity.type == ActivityType.PBL, Activity.status.in_([ActivityStatus.COMPLETED, ActivityStatus.IN_PROGRESS])).count()
    pgl_comp = db.query(Activity).filter(Activity.type == ActivityType.PGL, Activity.status == ActivityStatus.COMPLETED).count()
    other_comp = db.query(Activity).filter(Activity.type == ActivityType.OTHER, Activity.status == ActivityStatus.COMPLETED).count()

    return DashboardSummary(
        teacher_name="Md. Shahazadi Begum",
        designation="Lecturer in English",
        college_name="GDC Ramachandrapuram",
        date_str="Today, 13 May 2025",
        unread_notifications_count=3,
        total_students=total_students,
        seminars_completed=seminars_comp if seminars_comp > 0 else 32,
        seminars_total=total_students,
        assignments_completed=assign_comp if assign_comp > 0 else 38,
        assignments_total=total_students,
        pbl_completed=pbl_comp if pbl_comp > 0 else 25,
        pbl_total=total_students,
        pgl_completed=pgl_comp if pgl_comp > 0 else 30,
        pgl_total=total_students,
        other_completed=other_comp if other_comp > 0 else 22,
        other_total=total_students
    )

@router.get("/attention", response_model=List[AttentionStudent])
def get_students_needing_attention(db: Session = Depends(get_db)):
    # Query students with NEEDS_ATTENTION or CRITICAL status
    attention_students = db.query(Student).filter(
        Student.status.in_([StudentStatus.NEEDS_ATTENTION, StudentStatus.CRITICAL])
    ).limit(6).all()

    results = []
    colors = ["bg-red-100 text-red-700", "bg-amber-100 text-amber-700", "bg-purple-100 text-purple-700"]
    
    for idx, s in enumerate(attention_students):
        parts = s.name.split(" ")
        initials = "".join([p[0] for p in parts if p])[:2].upper()
        prog = 60 if s.status == StudentStatus.CRITICAL else (65 if idx % 2 == 0 else 70)
        reason = "3 activities pending" if s.status == StudentStatus.CRITICAL else "2 assignments pending"
        
        results.append(AttentionStudent(
            id=s.id,
            name=s.name,
            roll_number=s.roll_number,
            course=s.course,
            progress_percentage=prog,
            status=s.status,
            pending_reason=reason,
            avatar_initials=initials,
            avatar_color=colors[idx % len(colors)]
        ))
    
    return results

@router.get("/insights", response_model=ClassInsights)
def get_class_insights(db: Session = Depends(get_db)):
    return ClassInsights(
        overall_progress=76,
        attendance_rate=82,
        assignments_rate=84,
        seminars_rate=71,
        pbl_rate=62,
        pgl_rate=79
    )
