from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
import os
import shutil

from app.core.database import get_db
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.models import User, Teacher
from app.schemas.schemas import LoginRequest, SignUpRequest, Token, UserOut, TeacherOut, TeacherProfileUpdate

router = APIRouter()

@router.post("/signup", response_model=Token)
def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered. Please sign in instead."
        )
    
    new_user = User(
        email=request.email,
        hashed_password=get_password_hash(request.password),
        full_name=request.full_name,
        role="TEACHER"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    teacher = Teacher(
        user_id=new_user.id,
        employee_code=request.employee_code or f"EMP-{new_user.id:04d}",
        department=request.department or "English",
        designation=request.designation or "Lecturer in English",
        college_name=request.college_name or "GDC Ramachandrapuram"
    )
    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    access_token = create_access_token(subject=new_user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=TeacherOut)
def get_current_teacher_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        teacher = db.query(Teacher).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher profile not found")
    return teacher

@router.put("/profile", response_model=TeacherOut)
def update_teacher_profile(
    profile_in: TeacherProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        teacher = db.query(Teacher).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher profile not found")

    user = teacher.user

    if profile_in.full_name:
        user.full_name = profile_in.full_name
    if profile_in.email:
        user.email = profile_in.email
    if profile_in.avatar_url:
        user.avatar_url = profile_in.avatar_url

    if profile_in.designation:
        teacher.designation = profile_in.designation
    if profile_in.department:
        teacher.department = profile_in.department
    if profile_in.college_name:
        teacher.college_name = profile_in.college_name
    if profile_in.employee_code:
        teacher.employee_code = profile_in.employee_code

    db.commit()
    db.refresh(teacher)
    db.refresh(user)

    return teacher

@router.post("/avatar", response_model=TeacherOut)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        teacher = db.query(Teacher).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher profile not found")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"avatar_{teacher.id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    avatar_url = f"/uploads/avatar_{teacher.id}_{file.filename}"
    teacher.user.avatar_url = avatar_url

    db.commit()
    db.refresh(teacher)
    return teacher

