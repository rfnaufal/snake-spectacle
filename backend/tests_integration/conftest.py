import pytest
import os
import sys

# Set environment variable for the test database BEFORE importing app modules
# This ensures that when app.database is imported, it picks up this URL.
TEST_DB_FILE = "./integration_test.db"
TEST_DB_URL = f"sqlite:///{TEST_DB_FILE}"
os.environ["DATABASE_URL"] = TEST_DB_URL

# Ensure app can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from app.database import Base, engine as app_engine

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    print(f"\nSetting up Integration Test DB: {TEST_DB_URL}")
    
    # Ensure clean slate
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)
    
    # Create tables using the app's engine (which should now be configured with TEST_DB_URL)
    # We verify if the engine URL matches what we expect
    current_url = str(app_engine.url)
    if "integration_test.db" not in current_url:
        print(f"WARNING: App engine is using {current_url} instead of {TEST_DB_URL}")
    
    # IMPORT MODELS TO REGISTER THEM WITH BASE
    from app import models
    models.Base.metadata.create_all(bind=app_engine)
    
    yield
    
    # Teardown
    app_engine.dispose()
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)
        print("\nCleaned up Integration Test DB.")

@pytest.fixture
def client():
    from app.main import app
    return TestClient(app)
