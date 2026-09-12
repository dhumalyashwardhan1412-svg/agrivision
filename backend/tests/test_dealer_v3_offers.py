import sys
import os
from datetime import datetime, timezone, timedelta
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.database.database import SessionLocal
from app.models.user import User, UserRole

client = TestClient(app)

def test_dealer_v3_complete_suite():
    db = SessionLocal()
    try:
        dealer = db.query(User).filter(User.email == 'shopkeeper@agrivision.com').first()
        assert dealer is not None, 'Dealer user must exist'
        token = create_access_token(dealer.id, dealer.role.value)
        headers = {'Authorization': f'Bearer {token}'}

        farmer = db.query(User).filter(User.email == 'farmer@agrivision.com').first()
        farmer_token = create_access_token(farmer.id, farmer.role.value)
        farmer_headers = {'Authorization': f'Bearer {farmer_token}'}

        # 1. Test unauthenticated request
        res = client.get('/api/v1/dealer/discounts')
        assert res.status_code == 401, f'Expected 401, got {res.status_code}'

        # 2. Test forbidden role (Farmer accessing dealer endpoints)
        res = client.get('/api/v1/dealer/discounts', headers=farmer_headers)
        assert res.status_code == 403, f'Expected 403, got {res.status_code}'

        # 3. Test GET /dealer/products
        res = client.get('/api/v1/dealer/products', headers=headers)
        assert res.status_code == 200, f'Expected 200, got {res.status_code}'
        products = res.json()
        assert isinstance(products, list), 'Expected list of products'
        assert len(products) > 0, 'Expected dealer to have products'
        p = products[0]
        assert 'id' in p and 'name' in p and 'price' in p and 'stock_quantity' in p

        # 4. Test GET /dealer/discounts
        res = client.get('/api/v1/dealer/discounts', headers=headers)
        assert res.status_code == 200, f'Expected 200, got {res.status_code}'
        assert isinstance(res.json(), list)

        # 5. Test POST /dealer/discounts validation
        # 5a. Invalid product id
        res = client.post('/api/v1/dealer/discounts', json={
            'product_id': 999999,
            'title': 'Test Offer',
            'discount_type': 'PERCENTAGE',
            'discount_value': 10,
            'min_quantity': 1,
            'start_date': datetime.now(timezone.utc).isoformat(),
            'end_date': (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
        }, headers=headers)
        assert res.status_code == 404, f'Expected 404, got {res.status_code}'

        # 5b. Percentage > 90
        res = client.post('/api/v1/dealer/discounts', json={
            'product_id': p['id'],
            'title': 'Test Offer',
            'discount_type': 'PERCENTAGE',
            'discount_value': 95,
            'min_quantity': 1,
            'start_date': datetime.now(timezone.utc).isoformat(),
            'end_date': (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
        }, headers=headers)
        assert res.status_code == 400, f'Expected 400, got {res.status_code}'

        # 5c. End date before start date
        res = client.post('/api/v1/dealer/discounts', json={
            'product_id': p['id'],
            'title': 'Test Offer',
            'discount_type': 'PERCENTAGE',
            'discount_value': 10,
            'min_quantity': 1,
            'start_date': (datetime.now(timezone.utc) + timedelta(days=10)).isoformat(),
            'end_date': datetime.now(timezone.utc).isoformat()
        }, headers=headers)
        assert res.status_code == 400, f'Expected 400, got {res.status_code}'

        # 5d. Valid creation with max_discount_cap
        res = client.post('/api/v1/dealer/discounts', json={
            'product_id': p['id'],
            'title': 'Automated Test Discount',
            'discount_type': 'PERCENTAGE',
            'discount_value': 12.5,
            'min_quantity': 2,
            'max_discount_cap': 150.0,
            'start_date': datetime.now(timezone.utc).isoformat(),
            'end_date': (datetime.now(timezone.utc) + timedelta(days=15)).isoformat(),
            'description': 'Valid on test items'
        }, headers=headers)
        assert res.status_code == 201, f'Expected 201, got {res.status_code}: {res.text}'
        created_disc = res.json()
        assert created_disc['product_name'] == p['name']
        assert created_disc['max_discount_cap'] == 150.0
        assert created_disc['discount_value'] == 12.5
        disc_id = created_disc['id']

        # 6. Test PUT /dealer/discounts/{id}/toggle
        res = client.put(f'/api/v1/dealer/discounts/{disc_id}/toggle', headers=headers)
        assert res.status_code == 200
        assert res.json()['is_active'] is False

        # 7. Test DELETE /dealer/discounts/{id}
        res = client.delete(f'/api/v1/dealer/discounts/{disc_id}', headers=headers)
        assert res.status_code == 200
        assert res.json()['deleted'] is True

        # 8. Test GET /dealer/low-stock
        res = client.get('/api/v1/dealer/low-stock', headers=headers)
        assert res.status_code == 200
        assert isinstance(res.json(), list)

        # 9. Test GET /dealer/demand-insights
        res = client.get('/api/v1/dealer/demand-insights', headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert 'shop_name' in data
        assert 'forecasts' in data
        assert isinstance(data['forecasts'], list)
        assert 'overall_trend' in data

        # 10. Test newly registered dealer (kashi12@gmail.com)
        kashi = db.query(User).filter(User.email == 'kashi12@gmail.com').first()
        assert kashi is not None
        kashi_token = create_access_token(kashi.id, kashi.role.value)
        kashi_headers = {'Authorization': f'Bearer {kashi_token}'}

        res = client.get('/api/v1/dealer/products', headers=kashi_headers)
        assert res.status_code == 200
        res = client.get('/api/v1/dealer/discounts', headers=kashi_headers)
        assert res.status_code == 200
        res = client.get('/api/v1/dealer/low-stock', headers=kashi_headers)
        assert res.status_code == 200
        res = client.get('/api/v1/dealer/demand-insights', headers=kashi_headers)
        assert res.status_code == 200
        assert res.json()['shop_name'] is not None

        print('ALL DEALER V3 TESTS PASSED!')
    finally:
        db.close()

if __name__ == '__main__':
    test_dealer_v3_complete_suite()
