# api_gateway/app.py
from flask import Flask, request, jsonify
import requests
import jwt
import os
from functools import wraps

app = Flask(__name__)

# Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTc0MDM4MjU1OSwiaWF0IjoxNzQwMzgyNTU5fQ.frkhICP5pWYeeDrIrfcalzbsn7P_IR80xy5QdQa9UhE')
PORT = int(os.getenv('PORT', 5005))

# Service URLs (update these with your EC2 instance IPs)
SERVICES = {
    'auth': 'http://localhost:5001',
    'transaction': 'http://localhost:5002',
    'category': 'http://localhost:5003'
}

def verify_jwt(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({'error': 'Missing or invalid token'}), 401

        try:
            token = token.split(' ')[1]
            payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            request.user = payload
            return f(*args, **kwargs)
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    return decorated

@app.route('/health')
def health():
    return jsonify({'status': 'API Gateway running', 'port': PORT})

# Auth routes (no JWT required)
@app.route('/auth/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def auth_proxy(path):
    url = f"{SERVICES['auth']}/{path}"
    try:
        response = requests.request(
            method=request.method,
            url=url,
            headers={k: v for k, v in request.headers if k != 'Host'},
            data=request.get_data(),
            params=request.args,
            allow_redirects=False
        )
        return response.content, response.status_code, response.headers.items()
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Service unavailable'}), 503

# Transaction routes (JWT required)
@app.route('/transaction/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
@verify_jwt
def transaction_proxy(path):
    url = f"{SERVICES['transaction']}/{path}"
    headers = {k: v for k, v in request.headers if k != 'Host'}
    headers['X-User'] = str(request.user.get('Username', ''))
    headers['X-Role'] = str(request.user.get('Role', ''))

    try:
        response = requests.request(
            method=request.method,
            url=url,
            headers=headers,
            data=request.get_data(),
            params=request.args,
            allow_redirects=False
        )
        return response.content, response.status_code, response.headers.items()
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Service unavailable'}), 503

# Category routes (JWT required)
@app.route('/category/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
@verify_jwt
def category_proxy(path):
    url = f"{SERVICES['category']}/{path}"
    headers = {k: v for k, v in request.headers if k != 'Host'}
    headers['X-User'] = str(request.user.get('Username', ''))
    headers['X-Role'] = str(request.user.get('Role', ''))

    try:
        response = requests.request(
            method=request.method,
            url=url,
            headers=headers,
            data=request.get_data(),
            params=request.args,
            allow_redirects=False
        )
        return response.content, response.status_code, response.headers.items()
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Service unavailable'}), 503

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=True)