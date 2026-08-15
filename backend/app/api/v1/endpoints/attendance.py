from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Attendance, Student, AttendanceStatus
from app.schemas.schemas import AttendanceOut, AttendanceBatchCreate

router = APIRouter()

@router.get("", response_model=List[AttendanceOut])
def get_attendance(
    student_id: Optional[int] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Attendance)
    if student_id:
        query = query.filter(Attendance.student_id == student_id)
    if date:
        query = query.filter(Attendance.date == date)
    return query.all()

@router.post("/batch", response_model=List[AttendanceOut])
def record_batch_attendance(batch: AttendanceBatchCreate, db: Session = Depends(get_db)):
    results = []
    for rec in batch.records:
        # Check if record already exists for date + student
        att = db.query(Attendance).filter(
            Attendance.student_id == rec.student_id,
            Attendance.date == batch.date
        ).first()

        if att:
            att.status = rec.status
            att.remarks = rec.remarks
            att.period = batch.period
        else:
            att = Attendance(
                student_id=rec.student_id,
                date=batch.date,
                period=batch.period,
                status=rec.status,
                remarks=rec.remarks
            )
            db.add(att)
        results.append(att)

    db.commit()
    for r in results:
        db.refresh(r)
    return results
