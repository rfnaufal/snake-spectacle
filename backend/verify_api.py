import httpx
import sys

BASE_URL = "http://localhost:8000"

def run_verification():
    print(f"Starting API Verification against {BASE_URL}...\n")
    
    try:
        with httpx.Client(base_url=BASE_URL, timeout=5.0, follow_redirects=True) as client:
            # 1. Signup / Login
            email = "verify_script@example.com"
            password = "secure_password"
            username = "MrVerifier"

            print(f"1. Attempting Signup for {email}...")
            signup_resp = client.post("/api/auth/signup", json={
                "email": email, "password": password, "username": username
            })

            if signup_resp.status_code == 201:
                print("   ✅ Signup Successful")
            elif signup_resp.status_code == 200 and not signup_resp.json()['success']:
                print("   ℹ️  User likely already exists (API returned success=False)")
            else:
                print(f"   ❌ Signup Failed: {signup_resp.status_code} {signup_resp.text}")

            print("2. Attempting Login...")
            login_resp = client.post("/api/auth/login", json={
                "email": email, "password": password
            })
            
            if login_resp.status_code == 200 and login_resp.json()['success']:
                print("   ✅ Login Successful")
            else:
                print(f"   ❌ Login Failed: {login_resp.status_code} {login_resp.text}")
                print("   ⛔ Aborting remaining tests due to login failure.")
                return

            # 3. Get Profile (Protected)
            print("3. Fetching User Profile (/api/auth/me)...")
            me_resp = client.get("/api/auth/me")
            if me_resp.status_code == 200 and me_resp.json()['success']:
                user_data = me_resp.json()['data']
                print(f"   ✅ Profile Verified: {user_data['username']} ({user_data['email']})")
            else:
                print(f"   ❌ Fetch Profile Failed: {me_resp.status_code} {me_resp.text}")

            # 4. Submit Score (Protected)
            print("4. Submitting Score to Leaderboard...")
            score_resp = client.post("/api/leaderboard", json={
                "score": 5555, "mode": "walls"
            })
            if score_resp.status_code == 200 and score_resp.json()['success']:
                 print("   ✅ Score Submitted")
            else:
                 print(f"   ❌ Submit Score Failed: {score_resp.text}")

            # 5. Get Leaderboard
            print("5. Fetching Leaderboard...")
            lb_resp = client.get("/api/leaderboard?mode=walls")
            if lb_resp.status_code == 200:
                data = lb_resp.json()['data']
                found = any(e['username'] == username and e['score'] == 5555 for e in data)
                if found:
                    print(f"   ✅ Leaderboard Verified (Found entry with score 5555)")
                else:
                    print("   ⚠️  Leaderboard fetched but our entry was not found immediately (might be okay if logic differs)")
            else:
                print(f"   ❌ Fetch Leaderboard Failed: {lb_resp.text}")

            # 6. Live Players
            print("6. Fetching Live Players...")
            live_resp = client.get("/api/live-players")
            if live_resp.status_code == 200:
                count = len(live_resp.json()['data'])
                print(f"   ✅ Live Players Verified (Count: {count})")
            else:
                print(f"   ❌ Live Players Failed: {live_resp.text}")

            print("\n✨ Verification Complete!")

    except httpx.ConnectError:
        print(f"\n❌ Error: Could not connect to server at {BASE_URL}")
        print("   Make sure the backend server is running!")
        print("   Run: cd backend && uv run uvicorn main:app --reload")

if __name__ == "__main__":
    run_verification()
