from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from app.core.database import get_db
from app.core.config import settings
from app.models.models import Material, MaterialType
from app.schemas.schemas import MaterialOut, MaterialCreate

router = APIRouter()

@router.get("", response_model=List[MaterialOut])
def get_materials(
    category: Optional[str] = Query(None), # Notes, PPT, Videos, Question Banks, Others
    course: Optional[str] = Query(None),
    unit: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Material)
    
    if category and category.lower() != "all":
        cat_upper = category.upper().replace(" ", "_")
        if cat_upper in MaterialType.__members__:
            query = query.filter(Material.type == cat_upper)
        elif category.lower() == "notes":
            query = query.filter(Material.type == MaterialType.NOTES)
        elif category.lower() == "ppt":
            query = query.filter(Material.type == MaterialType.PPT)
        elif category.lower() == "videos":
            query = query.filter(Material.type == MaterialType.VIDEO)
        elif category.lower() == "others":
            query = query.filter(Material.type.in_([MaterialType.QUESTION_BANK, MaterialType.LINK, MaterialType.OTHER]))

    if course and course != "All Courses":
        query = query.filter(Material.course.ilike(f"%{course}%"))
    if unit and unit != "All Units":
        query = query.filter(Material.unit.ilike(f"%{unit}%"))
    if search:
        query = query.filter(Material.title.ilike(f"%{search}%"))

    materials = query.order_by(Material.created_at.desc()).all()
    return [MaterialOut.model_validate(m) for m in materials]

@router.post("", response_model=MaterialOut)
def create_material(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    course: str = Form("B.A. (HEP) II Sem"),
    semester: str = Form("II Sem"),
    unit: str = Form("Unit II"),
    type: str = Form("NOTES"),
    file: Optional[UploadFile] = File(None),
    url: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    file_path = None
    file_size_str = "1.2 MB"

    if file:
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        size_bytes = os.path.getsize(file_path)
        file_size_str = f"{round(size_bytes / (1024 * 1024), 1)} MB" if size_bytes > 1024 * 1024 else f"{round(size_bytes / 1024, 1)} KB"

    mat = Material(
        title=title,
        description=description or f"{unit} — {title}",
        course=course,
        semester=semester,
        unit=unit,
        type=type.upper(),
        file_path=file_path,
        file_url=url,
        file_size=file_size_str if not url else "Link",
        uploaded_by="Md. Shahazadi Begum",
        created_at=datetime.utcnow()
    )
    db.add(mat)
    db.commit()
    db.refresh(mat)

    return MaterialOut.model_validate(mat)
