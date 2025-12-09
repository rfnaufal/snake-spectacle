from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)

def test_signup_login_flow():
    # Signup
    email = "test@example.com"
    resp = client.post("/api/auth/signup", json={
        "email": email,
        "password": "pass",
        "username": "tester"
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["email"] == email

    # Logout
    client.post("/api/auth/logout")

    # Login
    resp = client.post("/api/auth/login", json={
        "email": email,
        "password": "pass"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "snake_session" in resp.cookies

def test_auth_me():
    # Setup user
    client.post("/api/auth/signup", json={
        "email": "me@example.com",
        "password": "pass",
        "username": "me"
    })
    
    # Get me
    resp = client.get("/api/auth/me")
    assert resp.status_code == 200
    assert resp.json()["data"]["username"] == "me"

    # Logout and check me
    client.post("/api/auth/logout")
    resp = client.get("/api/auth/me")
    assert resp.json()["success"] is False

def test_leaderboard():
    # Submit score requires auth
    resp = client.post("/api/leaderboard", json={"score": 100, "mode": "walls"})
    assert resp.json()["success"] is False

    # Login
    client.post("/api/auth/signup", json={
        "email": "gamer@example.com",
        "password": "pass",
        "username": "gamer"
    })

    # Submit score
    resp = client.post("/api/leaderboard", json={"score": 9000, "mode": "walls"})
    assert resp.json()["success"] is True
    
    # Get leaderboard
    resp = client.get("/api/leaderboard")
    entries = resp.json()["data"]
    # Check if our score is there
    found = any(e["score"] == 9000 for e in entries)
    assert found

def test_live_players():
    resp = client.get("/api/live-players")
    assert resp.json()["success"] is True
    players = resp.json()["data"]
    assert len(players) > 0
    
    pid = players[0]["id"]
    resp = client.get(f"/api/live-players/{pid}")
    assert resp.json()["success"] is True
    assert resp.json()["data"]["id"] == pid
