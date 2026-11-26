import urllib.request
import json
import sys

base = 'http://localhost:8000/api'

# 1. Categories
req = urllib.request.urlopen(f'{base}/categories')
cats = json.loads(req.read())
print(f'Categories count: {len(cats)}')
assert len(cats) == 4, f'Expected 4 categories, got {len(cats)}'

# 2. Products
req = urllib.request.urlopen(f'{base}/products')
prods = json.loads(req.read())
print(f'Products count: {len(prods)}')
assert len(prods) >= 15, f'Expected at least 15 products, got {len(prods)}'

# Verify WhatsApp products & prices
expected = {
    'p_garam_masala': (45.0, None),
    'p_sabji_masala': (45.0, None),
    'p_kafur': (35.0, 12),
    'p_rai': (35.0, 12),
    'p_jira': (40.0, None),
    'p_methi': (35.0, 12),
    'p_saunf': (35.0, 12),
    'p_ajwain': (35.0, 12),
    'p_panchforan': (35.0, 12),
    'p_tej_patta': (35.0, 12),
    'p_kali_mirch': (35.0, 12),
    'p_laung': (35.0, 12),
    'p_elaichi': (50.0, 12),
    'p_khas_khas': (50.0, 12),
    'p_badi_elaichi': (50.0, 12)
}

for pid, (exp_price, exp_pieces) in expected.items():
    p = next((x for x in prods if x['id'] == pid), None)
    assert p is not None, f'Missing product {pid}'
    price_val = float(p['packetPrice'])
    assert price_val == exp_price, f'Price mismatch for {pid}: expected {exp_price}, got {price_val}'
    assert p['piecesPerPacket'] == exp_pieces, f'Pieces mismatch for {pid}: expected {exp_pieces}, got {p["piecesPerPacket"]}'
    print(f'✓ Verified {p["name"]}: ₹{price_val}/pkt, Pieces: {p["piecesPerPacket"]}')

# 3. Order Placement & Atomic Stock Deduction
rai_before = next(x for x in prods if x['id'] == 'p_rai')['stock']
order_data = {
    'customerId': 'cust_test_1',
    'customerName': 'Suresh Patil',
    'shopName': 'Suresh Kirana Store',
    'contactNumber': '9876543210',
    'deliveryAddress': 'ulhasnager-05, Thane, Mumbai, pin code 421005',
    'paymentMethod': 'Cash on Delivery',
    'items': [
        {
            'productId': 'p_rai',
            'name': 'Rai',
            'packetPrice': 35.0,
            'price': 35.0,
            'quantity': 5,
            'piecesPerPacket': 12,
            'image': '/assets/products/whole-spices/rai.png'
        }
    ]
}

data_bytes = json.dumps(order_data).encode('utf-8')
post_req = urllib.request.Request(f'{base}/orders', data=data_bytes, headers={'Content-Type': 'application/json'}, method='POST')
resp = urllib.request.urlopen(post_req)
order_res = json.loads(resp.read())
print(f'✓ Order placed successfully: {order_res}')
assert order_res['success'] is True
order_id = order_res['orderId']

# Verify stock deducted
req2 = urllib.request.urlopen(f'{base}/products')
prods2 = json.loads(req2.read())
rai_after = next(x for x in prods2 if x['id'] == 'p_rai')['stock']
print(f'✓ Rai Stock: Before={rai_before}, After={rai_after} (Deducted 5 packets)')
assert rai_after == rai_before - 5, f'Stock was not decremented correctly! Before: {rai_before}, After: {rai_after}'

# 4. Record Duplicate Invoice
inv_req = urllib.request.Request(f'{base}/invoices/record-print', data=json.dumps({'orderId': order_id}).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
inv_resp = json.loads(urllib.request.urlopen(inv_req).read())
print(f'✓ Invoice print tracker: {inv_resp}')
assert inv_resp['isDuplicate'] is True

# 5. Admin Product Edit via PATCH
edit_data = {
    'id': 'p_jira',
    'packetPrice': 42.0,
    'piecesPerPacket': 10,
    'stock': 120
}
patch_req = urllib.request.Request(f'{base}/products', data=json.dumps(edit_data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PATCH')
patch_resp = json.loads(urllib.request.urlopen(patch_req).read())
print(f'✓ Admin edit response: {patch_resp}')
assert patch_resp['success'] is True

# Verify edited product
req3 = urllib.request.urlopen(f'{base}/products')
prods3 = json.loads(req3.read())
jira = next(x for x in prods3 if x['id'] == 'p_jira')
assert float(jira['packetPrice']) == 42.0
assert jira['piecesPerPacket'] == 10
assert jira['stock'] == 120
print('✓ Jira updated price and 10 pieces packet configuration verified!')

# Revert Jira back to prompt standard
revert_data = {'id': 'p_jira', 'packetPrice': 40.0, 'piecesPerPacket': None, 'stock': 100}
urllib.request.urlopen(urllib.request.Request(f'{base}/products', data=json.dumps(revert_data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PATCH'))

print('\n🎉 ALL 15 PRODUCT CATALOGUE, DATABASE & WHOLESALE ORDERING TESTS PASSED PERFECTLY!')
