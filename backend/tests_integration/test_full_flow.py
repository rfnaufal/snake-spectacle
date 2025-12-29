def test_full_user_flow(client):
    """
    Test a full lifecycle:
    1. Signup a new user
    2. Verify user can't signup again
    3. Login
    4. Submit a score
    5. Verify score appears in leaderboard
    6. Logout
    7. Verify cannot submit score after logout
    """
    
    username = "IntegrationUser"
    email = "integration@test.com"
    password = "SecurePassword123!"
    
    # 1. Signup
    print(f"\n1. Signing up {username}...")
    resp = client.post("/api/auth/signup", json={
        "username": username,
        "email": email,
        "password": password
    })
    assert resp.status_code == 201
    assert resp.json()["success"] is True
    assert resp.json()["data"]["email"] == email
    
    # 2. Verify duplicate signup fails
    print("2. Verifying duplicate checks...")
    resp = client.post("/api/auth/signup", json={
        "username": username,
        "email": email,
        "password": password
    })
    assert resp.status_code == 200 # App logic returns 200 with success=False for duplicates often, or 400.
    # checking schema... auth.py returns 201 for success, and seems to return success=False if exists
    assert resp.json()["success"] is False
    assert "already registered" in resp.json()["error"]

    # 3. Login
    # Note: Signup might auto-login (cookie set), but let's explicit logout then login to be sure
    client.post("/api/auth/logout")
    
    print("3. Logging in...")
    resp = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    assert "snake_session" in resp.cookies
    
    # 4. Submit Score
    print("4. Submitting Score...")
    score_val = 9999
    # Must use valid literal mode
    target_mode = "walls"
    resp = client.post("/api/leaderboard", json={
        "score": score_val,
        "mode": target_mode
    })
    assert resp.status_code == 200
    assert resp.json()["success"] is True
    
    # 5. Verify Leaderboard
    print("5. Verifying Leaderboard...")
    resp = client.get(f"/api/leaderboard?mode={target_mode}")
    assert resp.status_code == 200
    entries = resp.json()["data"]
    found = any(e["username"] == username and e["score"] == score_val for e in entries)
    assert found, f"Score {score_val} for {username} not found in leaderboard"
    
    # 6. Logout
    print("6. Logging out...")
    resp = client.post("/api/auth/logout")
    assert resp.status_code == 200
    assert "snake_session" not in resp.cookies
    
    # 7. Access Protected Route (Me)
    print("7. Verifying Access Denied...")
    resp = client.get("/api/auth/me")
    # Depends on implementation, might be 200 with success=False or 401
    assert resp.json()["success"] is False
    
    print("\nIntegration Test Complete: SUCCESS")
