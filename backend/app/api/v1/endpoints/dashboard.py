from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Student, Activity, Attendance, Teacher, ActivityType, ActivityStatus, StudentStatus
from app.schemas.schemas import DashboardSummary, AttentionStudent, ClassInsights
from app.api.v1.endpoints.students import compute_real_student_metrics

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    active_students = db.query(Student).filter(Student.status != StudentStatus.ARCHIVED).all()
    total_students = len(active_students)

    teacher = db.query(Teacher).first()
    teacher_name = teacher.user.full_name if teacher and teacher.user else "Md. Shahazadi Begum"
    designation = teacher.designation if teacher else "Lecturer in English"
    college_name = teacher.college_name if teacher else "GDC Ramachandrapuram"

    seminars_comp = db.query(Activity).filter(Activity.type == ActivityType.SEMINAR, Activity.status == ActivityStatus.COMPLETED).count()
    seminars_tot = db.query(Activity).filter(Activity.type == ActivityType.SEMINAR).count()

    assign_comp = db.query(Activity).filter(Activity.type == ActivityType.ASSIGNMENT, Activity.status.in_([ActivityStatus.COMPLETED, ActivityStatus.SUBMITTED])).count()
    assign_tot = db.query(Activity).filter(Activity.type == ActivityType.ASSIGNMENT).count()

    pbl_comp = db.query(Activity).filter(Activity.type == ActivityType.PBL, Activity.status.in_([ActivityStatus.COMPLETED, ActivityStatus.IN_PROGRESS])).count()
    pbl_tot = db.query(Activity).filter(Activity.type == ActivityType.PBL).count()

    pgl_comp = db.query(Activity).filter(Activity.type == ActivityType.PGL, Activity.status == ActivityStatus.COMPLETED).count()
    pgl_tot = db.query(Activity).filter(Activity.type == ActivityType.PGL).count()

    other_comp = db.query(Activity).filter(Activity.type == ActivityType.OTHER, Activity.status.in_([ActivityStatus.COMPLETED, ActivityStatus.IN_PROGRESS])).count()
    other_tot = db.query(Activity).filter(Activity.type == ActivityType.OTHER).count()

    return DashboardSummary(
        teacher_name=teacher_name,
        designation=designation,
        college_name=college_name,
        date_str=f"Today, {datetime.utcnow().strftime('%d %b %Y')}",
        unread_notifications_count=0,
        total_students=total_students,
        seminars_completed=seminars_comp,
        seminars_total=max(seminars_tot, total_students),
        assignments_completed=assign_comp,
        assignments_total=max(assign_tot, total_students),
        pbl_completed=pbl_comp,
        pbl_total=max(pbl_tot, total_students),
        pgl_completed=pgl_comp,
        pgl_total=max(pgl_tot, total_students),
        other_completed=other_comp,
        other_total=max(other_tot, total_students)
    )

@router.get("/attention", response_model=List[AttentionStudent])
def get_students_needing_attention(db: Session = Depends(get_db)):
    attention_students = db.query(Student).filter(
        Student.status.in_([StudentStatus.NEEDS_ATTENTION, StudentStatus.CRITICAL])
    ).limit(6).all()

    if not attention_students:
        active = db.query(Student).filter(Student.status != StudentStatus.ARCHIVED).all()
        scored = []
        for s in active:
            prog, att, pending = compute_real_student_metrics(s.id, db)
            scored.append((prog, s, pending))
        scored.sort(key=lambda x: x[0])
        attention_students = [x[1] for x in scored[:5]]

    results = []
    colors = ["bg-red-100 text-red-700", "bg-amber-100 text-amber-700", "bg-purple-100 text-purple-700"]
    
    for idx, s in enumerate(attention_students):
        parts = s.name.split(" ")
        initials = "".join([p[0] for p in parts if p])[:2].upper()
        prog, att_pct, pending_cnt = compute_real_student_metrics(s.id, db)
        reason = f"{pending_cnt} activities pending" if pending_cnt > 0 else "Needs progress review"
        
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
    students = db.query(Student).filter(Student.status != StudentStatus.ARCHIVED).all()
    if not students:
        return ClassInsights(overall_progress=80, attendance_rate=90, assignments_rate=85, seminars_rate=80, pbl_rate=75, pgl_rate=80)

    total_progs = []
    total_atts = []
    for s in students:
        prog, att, _ = compute_real_student_metrics(s.id, db)
        total_progs.append(prog)
        total_atts.append(att)

    avg_prog = round(sum(total_progs) / len(total_progs)) if total_progs else 80
    avg_att = round(sum(total_atts) / len(total_atts)) if total_atts else 90

    def get_rate(act_type):
        tot = db.query(Activity).filter(Activity.type == act_type).count()
        comp = db.query(Activity).filter(Activity.type == act_type, Activity.status.in_([ActivityStatus.COMPLETED, ActivityStatus.SUBMITTED])).count()
        return round((comp / tot) * 100) if tot > 0 else 85

    return ClassInsights(
        overall_progress=avg_prog,
        attendance_rate=avg_att,
        assignments_rate=get_rate(ActivityType.ASSIGNMENT),
        seminars_rate=get_rate(ActivityType.SEMINAR),
        pbl_rate=get_rate(ActivityType.PBL),
        pgl_rate=get_rate(ActivityType.PGL)
    )

