import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // 회원가입 핸들러
    const handleRegister = async (e) => {
        e.preventDefault();

        // 필드 값 검증 추가 (수정된 부분)
        if (!username || !email || !password || !nickname) {
            setError('All fields are required!'); // 필드 누락 시 에러 메시지 설정
            return;
        }

        try {
            // 수정된 부분: register 호출 시 객체로 데이터 전달
            await register({ username, email, password, nickname });
            navigate('/login'); // 회원가입 성공 시 로그인 페이지로 이동
        } catch (err) {
            // 수정된 부분: 서버로부터 에러 메시지 처리
            setError(err.response?.data?.message || 'Failed to register, please try again.');
        }
    };

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
                <button type="submit">Register</button>
            </form>
            {/* 수정된 부분: 에러 메시지 UI 개선 */}
            {error && <p style={{color: 'red'}}>{error}</p>}
        </div>
    );
};

export default Register;
