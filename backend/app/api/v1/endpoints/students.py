from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Student, Activity, Attendance, ActivityType, ActivityStatus, StudentStatus
from app.schemas.schemas import StudentOut, StudentCreate, StudentUpdate, StudentProfileOut, ActivityOut

router = APIRouter()

def compute_real_student_metrics(student_id: int, db: Session):
    activities = db.query(Activity).filter(Activity.student_id == student_id).all()
    attendance = db.query(Attendance).filter(Attendance.student_id == student_id).all()

    total_acts = len(activities)
    comp_acts = sum(1 for a in activities if a.status in [ActivityStatus.COMPLETED, ActivityStatus.SUBMITTED])
    
    if total_acts > 0:
        act_rate = (comp_acts / total_acts) * 100.0
    else:
        act_rate = 85.0  # Default baseline when starting

    total_att = len(attendance)
    present_att = sum(1 for a in attendance if a.status in ["PRESENT", "LATE", "EXCUSED"])
    
    if total_att > 0:
        att_rate = (present_att / total_att) * 100.0
    else:
        att_rate = 90.0  # Default baseline when starting

    overall = round(0.70 * act_rate + 0.30 * att_rate)
    overall = max(0, min(100, overall))

    return overall, round(att_rate), total_acts - comp_acts

@router.get("", response_model=List[StudentOut])
def get_students(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    course: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if search:
        s_term = f"%{search}%"
        query = query.filter((Student.name.ilike(s_term)) | (Student.roll_number.ilike(s_term)))
    if status:
        query = query.filter(Student.status == status)
    else:
        query = query.filter(Student.status != StudentStatus.ARCHIVED)
    if course:
        query = query.filter(Student.course.ilike(f"%{course}%"))

    students = query.order_by(Student.roll_number.asc()).all()

    output = []
    for s in students:
        s_out = StudentOut.model_validate(s)
        prog, att_pct, pending_cnt = compute_real_student_metrics(s.id, db)
        s_out.overall_progress = prog
        s_out.attendance_percentage = att_pct
        s_out.pending_activities_count = pending_cnt
        output.append(s_out)

    return output

@router.post("", response_model=StudentOut)
def create_student(student_in: StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(Student).filter(Student.roll_number == student_in.roll_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student with this Roll Number already exists.")
    
    db_student = Student(**student_in.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    s_out = StudentOut.model_validate(db_student)
    s_out.overall_progress = 85
    s_out.attendance_percentage = 90
    return s_out

@router.get("/{student_id}", response_model=StudentProfileOut)
def get_student_profile(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    activities = db.query(Activity).filter(Activity.student_id == student_id).order_by(Activity.created_at.desc()).all()

    sem_acts = [a for a in activities if a.type == ActivityType.SEMINAR]
    sem_comp = [a for a in sem_acts if a.status == ActivityStatus.COMPLETED]

    ass_acts = [a for a in activities if a.type == ActivityType.ASSIGNMENT]
    ass_comp = [a for a in ass_acts if a.status in [ActivityStatus.COMPLETED, ActivityStatus.SUBMITTED]]

    pbl_acts = [a for a in activities if a.type == ActivityType.PBL]
    pbl_comp = [a for a in pbl_acts if a.status in [ActivityStatus.COMPLETED, ActivityStatus.IN_PROGRESS]]

    pgl_acts = [a for a in activities if a.type == ActivityType.PGL]
    pgl_comp = [a for a in pgl_acts if a.status == ActivityStatus.COMPLETED]

    oth_acts = [a for a in activities if a.type == ActivityType.OTHER]
    oth_comp = [a for a in oth_acts if a.status in [ActivityStatus.COMPLETED, ActivityStatus.IN_PROGRESS]]

    overall_prog, att_pct, pending_cnt = compute_real_student_metrics(student_id, db)

    profile = StudentProfileOut.model_validate(student)
    profile.overall_progress = overall_prog
    profile.attendance_percentage = att_pct
    profile.pending_activities_count = pending_cnt

    profile.seminars_count = f"{len(sem_comp)} / {len(sem_acts)}" if sem_acts else "0 / 0"
    profile.seminars_status = "Completed" if sem_acts and len(sem_comp) >= len(sem_acts) else ("In Progress" if sem_acts else "Pending")

    profile.assignments_count = f"{len(ass_comp)} / {len(ass_acts)}" if ass_acts else "0 / 0"
    profile.assignments_status = "Completed" if ass_acts and len(ass_comp) >= len(ass_acts) else ("In Progress" if ass_acts else "Pending")

    profile.pbl_count = f"{len(pbl_comp)} / {len(pbl_acts)}" if pbl_acts else "0 / 0"
    profile.pbl_status = "Completed" if pbl_acts and len(pbl_comp) >= len(pbl_acts) else ("In Progress" if pbl_acts else "Pending")

    profile.pgl_count = f"{len(pgl_comp)} / {len(pgl_acts)}" if pgl_acts else "0 / 0"
    profile.pgl_status = "Completed" if pgl_acts and len(pgl_comp) >= len(pgl_acts) else ("In Progress" if pgl_acts else "Pending")

    profile.other_count = f"{len(oth_comp)} / {len(oth_acts)}" if oth_acts else "0 / 0"
    profile.other_status = "Completed" if oth_acts and len(oth_comp) >= len(oth_acts) else ("In Progress" if oth_acts else "Pending")

    profile.activities = [ActivityOut.model_validate(a) for a in activities]

    return profile


@router.put("/{student_id}", response_model=StudentOut)
def update_student(student_id: int, student_in: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = student_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)

    s_out = StudentOut.model_validate(student)
    s_out.overall_progress = get_student_overall_progress(student)
    return s_out

@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.query(Activity).filter(Activity.student_id == student_id).delete()
    db.query(Attendance).filter(Attendance.student_id == student_id).delete()

    db.delete(student)
    db.commit()
    return {"message": "Student deleted successfully", "id": student_id}

