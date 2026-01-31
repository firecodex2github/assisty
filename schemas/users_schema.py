from pydantic import BaseModel, EmailStr,model_validator


class UserCreate(BaseModel):
    fullname: str
    email: EmailStr
    password: str
    confirm_password: str

    @model_validator(mode="after")  #after model is created
    def validate_passwords(self):
        
        if len(self.password) < 8:
            raise ValueError("Password must be at least 8 characters long")

        if self.password != self.confirm_password:
            raise ValueError("Password and Confirm Password must match")
        
        if not any(c.isdigit() for c in self.password):
            raise ValueError("Password must contain at least one number")

        if not any(c.isupper() for c in self.password):
            raise ValueError("Password must contain one uppercase letter")

        return self
    

class LoginRequest(BaseModel):
    email: EmailStr
    password: str