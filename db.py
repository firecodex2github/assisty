from sqlalchemy import create_engine   
from sqlalchemy.orm import sessionmaker,declarative_base

DATABASE_URL = "mysql+pymysql://dbusername:dbpassword@localhost:3306/cust_support"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine      #session use engine to talk database
)

Base = declarative_base()  #parent class for tables

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()     #close the connection
