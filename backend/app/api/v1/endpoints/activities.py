from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.models.models import (
    Activity, SeminarDetail, AssignmentDetail, PblDetail, PglDetail, EvidenceFile,
    ActivityType, ActivityStatus, PresentationMode, ParticipationLevel, Student
)
from app.schemas.schemas import (
    ActivityOut, SeminarCreate, AssignmentCreate, PblCreate, PglCreate, GenericActivityCreate
)

router = APIRouter()

@router.get("", response_model=List[ActivityOut])
def get_activities(
    student_id: Optional[int] = None,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Activity)
    if student_id:
        query = query.filter(Activity.student_id == student_id)
    if type:
        query = query.filter(Activity.type == type)

    activities = query.order_by(Activity.created_at.desc()).all()
    return [ActivityOut.model_validate(a) for a in activities]

@router.post("/seminar", response_model=ActivityOut)
def create_seminar(seminar: SeminarCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == seminar.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    act = Activity(
        student_id=seminar.student_id,
        type=ActivityType.SEMINAR,
        title=f"Seminar: {seminar.topic}",
        description=f"Presentation on {seminar.topic}",
        status=ActivityStatus.COMPLETED if seminar.marks_obtained and seminar.marks_obtained > 0 else ActivityStatus.PENDING,
        marks_obtained=seminar.marks_obtained,
        max_marks=seminar.max_marks,
        remarks=seminar.remarks,
        due_date=seminar.seminar_date,
        created_by="Md. Shahazadi Begum"
    )
    db.add(act)
    db.commit()
    db.refresh(act)

    sem_det = SeminarDetail(
        activity_id=act.id,
        topic=seminar.topic,
        seminar_date=seminar.seminar_date,
        presentation_mode=seminar.presentation_mode
    )
    db.add(sem_det)
    db.commit()
    db.refresh(act)

    return ActivityOut.model_validate(act)

@router.post("/assignment", response_model=ActivityOut)
def create_assignment(assignment: AssignmentCreate, db: Session = Depends(get_db)):
    act = Activity(
        student_id=assignment.student_id,
        type=ActivityType.ASSIGNMENT,
        title=assignment.title,
        status=ActivityStatus.SUBMITTED,
        max_marks=assignment.max_marks,
        remarks=assignment.remarks,
        due_date=assignment.due_date,
        created_by="Md. Shahazadi Begum"
    )
    db.add(act)
    db.commit()
    db.refresh(act)

    ass_det = AssignmentDetail(
        activity_id=act.id,
        unit=assignment.unit,
        submission_status="Submitted",
        submitted_at=datetime.utcnow().strftime("%d/%m/%Y"),
        feedback=assignment.remarks
    )
    db.add(ass_det)
    db.commit()
    db.refresh(act)

    return ActivityOut.model_validate(act)

@router.post("/pbl", response_model=ActivityOut)
def create_pbl(pbl: PblCreate, db: Session = Depends(get_db)):
    act = Activity(
        student_id=pbl.student_id,
        type=ActivityType.PBL,
        title=f"PBL Project: {pbl.project_title}",
        description=pbl.description,
        status=ActivityStatus.IN_PROGRESS if pbl.progress_percentage < 100 else ActivityStatus.COMPLETED,
        due_date=pbl.deadline,
        remarks=pbl.remarks,
        created_by="Md. Shahazadi Begum"
    )
    db.add(act)
    db.commit()
    db.refresh(act)

    pbl_det = PblDetail(
        activity_id=act.id,
        guide_name=pbl.guide_name,
        progress_percentage=pbl.progress_percentage,
        start_date=pbl.start_date or datetime.utcnow().strftime("%d/%m/%Y"),
        deadline=pbl.deadline
    )
    db.add(pbl_det)
    db.commit()
    db.refresh(act)

    return ActivityOut.model_validate(act)

@router.post("/pgl", response_model=ActivityOut)
def create_pgl(pgl: PglCreate, db: Session = Depends(get_db)):
    act = Activity(
        student_id=pgl.student_id,
        type=ActivityType.PGL,
        title=pgl.activity_title,
        status=ActivityStatus.COMPLETED,
        marks_obtained=pgl.marks_obtained,
        due_date=pgl.activity_date,
        remarks=pgl.remarks,
        created_by="Md. Shahazadi Begum"
    )
    db.add(act)
    db.commit()
    db.refresh(act)

    pgl_det = PglDetail(
        activity_id=act.id,
        activity_date=pgl.activity_date,
        participation_level=pgl.participation_level
    )
    db.add(pgl_det)
    db.commit()
    db.refresh(act)

    return ActivityOut.model_validate(act)

@router.post("/generic", response_model=ActivityOut)
def create_generic_activity(activity: GenericActivityCreate, db: Session = Depends(get_db)):
    act = Activity(
        student_id=activity.student_id,
        type=ActivityType.OTHER,
        title=activity.title,
        status=ActivityStatus.COMPLETED,
        due_date=activity.date or datetime.utcnow().strftime("%d/%m/%Y"),
        remarks=activity.remarks,
        created_by="Md. Shahazadi Begum"
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return ActivityOut.model_validate(act)
