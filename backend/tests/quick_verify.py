import urllib.request
import json
import urllib.error

creds = [
    ('farmer@agrivision.com', 'Farmer@123', 'FARMER'),
    ('customer@agrivision.com', 'Customer@123', 'CUSTOMER'),
    ('shopkeeper@agrivision.com', 'Shop@123', 'SHOPKEEPER'),
    ('admin@agrivision.com', 'Admin@123', 'ADMIN'),
]

for email, pw, expected_role in creds:
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/auth/login',
        data=json.dumps({'email': email, 'password': pw}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode('utf-8'))
    print(f"Login {email}: status={res.status}, role={data.get('role')}, token_len={len(data.get('access_token', ''))}")
    assert data.get('role') == expected_role

# Test invalid password
try:
    req_bad = urllib.request.Request(
        'http://127.0.0.1:8000/api/v1/auth/login',
        data=json.dumps({'email': 'farmer@agrivision.com', 'password': 'WrongPassword999'}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    urllib.request.urlopen(req_bad)
except urllib.error.HTTPError as err:
    print('Invalid credentials response:', err.code, err.read().decode('utf-8'))
    assert err.code == 401

print("ALL LIVE LOGIN CHECKS PASSED PERFECTLY!")
