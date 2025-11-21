from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ReferralBonusRequest(BaseModel):
    user_id: str
    referred_user_id: str

class ReferralBonusResponse(BaseModel):
    success: bool
    message: str
    bonus_amount: float = 0.0

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    referred_by: Optional[str] = None

class User(BaseModel):
    id: str
    username: str
    email: str
    password: str
    balance: float
    referred_by: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    balance: float
    referred_by: Optional[str] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

@api_router.post("/users", response_model=UserResponse)
async def create_user(user_data: UserCreate):
    """
    Create a new user and handle referral bonuses.
    """
    try:
        # Check if user with this email already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")
        
        # Create new user
        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,  # In production, hash the password
            balance=5000.0,  # Starting balance
            referred_by=user_data.referred_by
        )
        
        # Save user to database
        user_dict = user.model_dump()
        await db.users.insert_one(user_dict)
        
        # If user was referred, grant bonus to referrer
        if user_data.referred_by:
            await grant_referral_bonus_internal(user_data.referred_by, user_id)
        
        # Return user without password
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            balance=user.balance,
            referred_by=user.referred_by
        )
        
    except Exception as e:
        logging.error(f"Error creating user: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while creating the user")

async def grant_referral_bonus_internal(user_id: str, referred_user_id: str):
    """
    Internal function to grant referral bonus.
    """
    try:
        # Check if the referred user exists and was actually referred
        referred_user = await db.users.find_one({"id": referred_user_id, "referred_by": user_id})
        
        if not referred_user:
            return
        
        # Check if bonus was already granted for this referral
        existing_bonus = await db.referral_bonuses.find_one({
            "user_id": user_id,
            "referred_user_id": referred_user_id
        })
        
        if existing_bonus:
            return
        
        # Grant the bonus (Rs. 500 in this example)
        bonus_amount = 500.0
        
        # Update user's balance
        user = await db.users.find_one({"id": user_id})
        if user:
            new_balance = user.get("balance", 0) + bonus_amount
            await db.users.update_one(
                {"id": user_id},
                {"$set": {"balance": new_balance}}
            )
            
            # Record the bonus transaction
            bonus_record = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "referred_user_id": referred_user_id,
                "bonus_amount": bonus_amount,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            await db.referral_bonuses.insert_one(bonus_record)
            
            # Add transaction to history
            transaction = {
                "type": "referral_bonus",
                "amount": bonus_amount,
                "description": f"Referral bonus for user {referred_user_id}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "balance_after": new_balance
            }
            await db.transaction_history.insert_one(transaction)
            
    except Exception as e:
        logging.error(f"Error granting referral bonus: {str(e)}")

@api_router.post("/referral-bonus", response_model=ReferralBonusResponse)
async def grant_referral_bonus(request: ReferralBonusRequest):
    """
    Grant a referral bonus to a user for bringing in a new user.
    """
    try:
        # Check if the referred user exists and was actually referred
        referred_user = await db.users.find_one({"id": request.referred_user_id, "referred_by": request.user_id})
        
        if not referred_user:
            return ReferralBonusResponse(
                success=False,
                message="Invalid referral or user not found"
            )
        
        # Check if bonus was already granted for this referral
        existing_bonus = await db.referral_bonuses.find_one({
            "user_id": request.user_id,
            "referred_user_id": request.referred_user_id
        })
        
        if existing_bonus:
            return ReferralBonusResponse(
                success=False,
                message="Referral bonus already granted for this user"
            )
        
        # Grant the bonus (Rs. 500 in this example)
        bonus_amount = 500.0
        
        # Update user's balance
        user = await db.users.find_one({"id": request.user_id})
        if user:
            new_balance = user.get("balance", 0) + bonus_amount
            await db.users.update_one(
                {"id": request.user_id},
                {"$set": {"balance": new_balance}}
            )
            
            # Record the bonus transaction
            bonus_record = {
                "id": str(uuid.uuid4()),
                "user_id": request.user_id,
                "referred_user_id": request.referred_user_id,
                "bonus_amount": bonus_amount,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            await db.referral_bonuses.insert_one(bonus_record)
            
            # Add transaction to history
            transaction = {
                "type": "referral_bonus",
                "amount": bonus_amount,
                "description": f"Referral bonus for user {request.referred_user_id}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "balance_after": new_balance
            }
            await db.transaction_history.insert_one(transaction)
            
            return ReferralBonusResponse(
                success=True,
                message=f"Successfully granted Rs. {bonus_amount} referral bonus",
                bonus_amount=bonus_amount
            )
        else:
            return ReferralBonusResponse(
                success=False,
                message="User not found"
            )
            
    except Exception as e:
        logging.error(f"Error granting referral bonus: {str(e)}")
        return ReferralBonusResponse(
            success=False,
            message="An error occurred while processing the referral bonus"
        )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()