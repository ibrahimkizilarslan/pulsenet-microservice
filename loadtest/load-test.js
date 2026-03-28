import http from 'k6/http';
import { check, group, sleep } from 'k6';

// 50, 100, 200, 500 eş zamanlı istek senaryoları
export const options = {
    stages: [
        { duration: '30s', target: 50 },  // 50 VU'ya çık
        { duration: '1m', target: 50 },   // 1 dakika boyunca 50 VU ile devam et
        { duration: '30s', target: 100 }, // 100 VU'ya çık
        { duration: '1m', target: 100 },
        { duration: '30s', target: 200 }, // 200 VU'ya çık
        { duration: '1m', target: 200 },
        { duration: '30s', target: 500 }, // 500 VU'ya çık (Stres testi eşiği)
        { duration: '1m', target: 500 },
        { duration: '30s', target: 0 },   // Kapat
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // %95'i 500ms altında olmalı
        http_req_failed: ['rate<0.01'],   // Hata oranı %1'den az olmalı
    },
};

const BASE_URL = 'http://localhost:8080';

// Test verileri
const TEST_USER = {
    username: `testuser_${Math.floor(Math.random() * 10000)}`,
    email: `test_${Math.floor(Math.random() * 10000)}@example.com`,
    password: 'Password123!'
};

export function setup() {
    // 1. Kayıt ol
    http.post(`${BASE_URL}/api/auth/register`, JSON.stringify(TEST_USER), {
        headers: { 'Content-Type': 'application/json' },
    });

    // 2. Giriş yap ve token al
    const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
        username: TEST_USER.username,
        password: TEST_USER.password
    }), {
        headers: { 'Content-Type': 'application/json' },
    });

    return { token: loginRes.json().token };
}

export default function (data) {
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`,
        },
    };

    group('Auth API', function () {
        const res = http.get(`${BASE_URL}/health`);
        check(res, { 'gateway is up': (r) => r.status === 200 });
    });

    group('Posts API', function () {
        // Post listeleme (GET)
        const getPosts = http.get(`${BASE_URL}/api/posts/recent`, params);
        check(getPosts, { 'get posts successful': (r) => r.status === 200 });

        // Post oluşturma (POST)
        const payload = JSON.stringify({
            authorId: 'user_123',
            content: `Load test post content ${__VU}:${__ITER}`,
            tags: ['test', 'k6']
        });
        const createPost = http.post(`${BASE_URL}/api/posts`, payload, params);
        check(createPost, { 'create post returns 201': (r) => r.status === 201 });
    });

    group('Users API', function () {
        const getProfile = http.get(`${BASE_URL}/api/users/user_123`, params);
        check(getProfile, { 'get profile successful': (r) => r.status === 200 || r.status === 404 });
    });

    sleep(1);
}