"""
Authentication API routes for Canopy Copilot
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext

from db.database import get_mongo_db
from db.models import User
from utils.config import settings

router = APIRouter()
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    db = get_mongo_db()
    user = await db.users.find_one({"_id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


@router.post("/register")
async def register(user_data: Dict[str, Any]):
    """Register a new user"""
    try:
        email = user_data.get("email")
        username = user_data.get("username")
        password = user_data.get("password")
        full_name = user_data.get("full_name")
        
        if not email or not username or not password:
            raise HTTPException(status_code=400, detail="Email, username, and password required")
        
        db = get_mongo_db()
        
        # Check if user already exists
        existing_user = await db.users.find_one({
            "$or": [{"email": email}, {"username": username}]
        })
        
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create new user
        hashed_password = get_password_hash(password)
        user = User(
            email=email,
            username=username,
            full_name=full_name,
            hashed_password=hashed_password
        )
        
        result = await db.users.insert_one(user.dict(by_alias=True))
        
        # Create access token
        access_token = create_access_token(data={"sub": str(result.inserted_id)})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": str(result.inserted_id),
            "username": username,
            "email": email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/login")
async def login(credentials: Dict[str, Any]):
    """Login user"""
    try:
        email = credentials.get("email")
        password = credentials.get("password")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required")
        
        db = get_mongo_db()
        
        # Find user by email
        user = await db.users.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify password
        if not verify_password(password, user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(status_code=401, detail="Account is disabled")
        
        # Create access token
        access_token = create_access_token(data={"sub": str(user["_id"])})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "full_name": user.get("full_name")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.get("/me")
async def get_current_user_info(current_user: Dict = Depends(get_current_user)):
    """Get current user information"""
    return {
        "user_id": str(current_user["_id"]),
        "username": current_user["username"],
        "email": current_user["email"],
        "full_name": current_user.get("full_name"),
        "is_verified": current_user.get("is_verified", False),
        "plan": current_user.get("plan", "free"),
        "created_at": current_user["created_at"]
    }


@router.put("/me")
async def update_user_info(
    updates: Dict[str, Any],
    current_user: Dict = Depends(get_current_user)
):
    """Update current user information"""
    try:
        db = get_mongo_db()
        
        # Remove sensitive fields from updates
        safe_updates = {k: v for k, v in updates.items() 
                       if k in ["full_name", "preferences"]}
        
        if safe_updates:
            safe_updates["updated_at"] = datetime.utcnow()
            
            await db.users.update_one(
                {"_id": current_user["_id"]},
                {"$set": safe_updates}
            )
        
        return {"message": "User updated successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")


@router.post("/change-password")
async def change_password(
    password_data: Dict[str, Any],
    current_user: Dict = Depends(get_current_user)
):
    """Change user password"""
    try:
        current_password = password_data.get("current_password")
        new_password = password_data.get("new_password")
        
        if not current_password or not new_password:
            raise HTTPException(status_code=400, detail="Current and new password required")
        
        # Verify current password
        if not verify_password(current_password, current_user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Current password is incorrect")
        
        # Update password
        db = get_mongo_db()
        hashed_new_password = get_password_hash(new_password)
        
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {
                "$set": {
                    "hashed_password": hashed_new_password,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {"message": "Password changed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Password change failed: {str(e)}")