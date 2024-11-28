const BASE_URL = 'http://localhost:3000'; // 백엔드 API 기본 URL

/**
 * 회원가입 API 호출 함수
 * @param {Object} userInfo - { username, email, password }
 */
export async function register(userInfo) {
    // 수정된 부분: 객체 데이터(JSON)로 전달받음
    const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo), // 수정된 부분: JSON 데이터로 변환
    });

    // 에러 처리 추가 (수정된 부분)
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register'); // 서버의 에러 메시지 전달
    }

    return response.json();
}

/**
 * 로그인 API 호출 함수
 * @param {Object} credentials - { username, password }
 */
export async function login(credentials) {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials), // 사용자 로그인 정보 전송
    });

    // 에러 처리
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login'); // 서버의 에러 메시지 전달
    }

    const data = await response.json();

    // 수정된 부분: 로컬 스토리지에 토큰 저장
    localStorage.removeItem('token');
    localStorage.setItem('token', data.access_token);

    return data;
}

/**
 * 현재 로그인된 사용자 정보 조회
 */
export async function getCurrentUser() {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No token found, please login');
    }

    const response = await fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`, // 수정된 부분: Authorization 헤더 추가
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user info');
    }

    return response.json();
}

/**
 * 로그아웃 함수 (로컬 스토리지에서 토큰 제거)
 */
export function logout() {
    localStorage.removeItem('token'); // 로컬 스토리지에서 토큰 제거
}
