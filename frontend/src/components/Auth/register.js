import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState(null); // 프로필 이미지 상태 추가
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // 회원가입 핸들러
    const handleRegister = async (e) => {
        e.preventDefault();

        // 필드 값 검증
        if (!username || !email || !password || !nickname) {
            setError('All fields are required!');
            return;
        }

        try {
            // FormData를 사용하여 데이터를 전송
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('nickname', nickname);
            formData.append('email', email);

            if (profileImage) {
                formData.append('profileImage', profileImage); // 이미지 파일 추가
            }

            // for (let [key, value] of formData.entries()) {
            //     console.log(`${key}:`, value);
            // }

            await register(formData); // API 호출
            navigate('/login'); // 회원가입 성공 시 로그인 페이지로 이동
        } catch (err) {
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
                {/* 프로필 이미지 업로드 필드 추가 */}
                <input
                    type="file"
                    onChange={(e) => setProfileImage(e.target.files[0])}
                />
                <button type="submit">Register</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Register;
