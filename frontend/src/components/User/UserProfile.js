import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000'; // API 기본 URL

const UserProfilePage = () => {
    const [user, setUser] = useState(null); // 유저 정보
    const [participatedPosts, setParticipatedPosts] = useState([]); // 참여한 게시글
    const [updatedUser, setUpdatedUser] = useState({}); // 수정할 유저 정보
    const [deleteUsername, setDeleteUsername] = useState(""); // 삭제 확인용 username
    const navigate = useNavigate(); // 페이지 이동용

    // 유저 정보 가져오기
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${BASE_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch user data');
                const userData = await response.json();

                // 추가 정보 가져오기
                const userDetailsResponse = await fetch(`${BASE_URL}/users/${userData.userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!userDetailsResponse.ok) throw new Error('Failed to fetch user details');
                const userDetails = await userDetailsResponse.json();

                // user 상태 업데이트
                setUser({
                    ...userData,
                    email: userDetails.email,
                    nickname: userDetails.nickname,
                    trustScore: userDetails.trustScore,
                    profileImageUrl: userDetails.profileImageUrl,
                });

                // 참여한 게시글 가져오기
                const postsResponse = await fetch(`${BASE_URL}/participations`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!postsResponse.ok) throw new Error('Failed to fetch posts');
                const postsData = await postsResponse.json();
                setParticipatedPosts(postsData);
            } catch (error) {
                console.error('Error fetching user or posts:', error);
            }
        };

        fetchUserData();
    }, []);

    // 유저 정보 수정
    const handleUserUpdate = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('로그인이 필요합니다.');
                return;
            }

            // FormData 생성
            const formData = new FormData();

            // updatedUser 객체의 키-값을 FormData에 추가
            Object.entries(updatedUser).forEach(([key, value]) => {
                if (value) {
                    formData.append(key, value); // 값이 존재하는 경우에만 추가
                    // console.log(`FormData - ${key}:`, value); // 추가된 항목 확인
                }
            });

            // API 호출
            const response = await fetch(`${BASE_URL}/users/${user.userId}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`, // 인증 헤더 추가
                },
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 409) {
                    alert('이미 사용 중인 이메일 또는 닉네임입니다.');
                } else {
                    alert('사용자 정보 수정에 실패했습니다.');
                }
                throw new Error(`Failed to update user: ${response.statusText}`);
            }

            // 성공적으로 업데이트된 데이터 처리
            const updatedUserData = await response.json();
            setUser({
                ...user,
                ...updatedUserData, // 기존 사용자 데이터와 병합
            });

            alert('수정 성공!');
            window.location.reload(); // 수정 성공 후 페이지 새로고침
        } catch (error) {
            console.error('Error updating user:', error);
            alert('수정 실패...');
        }
    };


    // 유저 삭제
    const handleUserDelete = async () => {
        if (deleteUsername !== user.username) {
            alert('Entered username does not match your current username.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/users/${user.userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to delete user');
            alert('삭제 성공!');
            navigate('/'); // 메인 페이지로 이동
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('삭제 실패...');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1>User Profile</h1>
            {user && (
                <div>
                    <img
                        src={user.profileImageUrl || 'https://via.placeholder.com/150'}
                        alt="User Profile"
                        style={{
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            marginBottom: '20px',
                        }}
                    />
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Nickname:</strong> {user.nickname}</p>
                    <p><strong>Trust Score:</strong> {user.trustScore}</p>
                </div>
            )}

            <h2>Participated Posts</h2>
            <ul>
                {participatedPosts.map((post) => (
                    <li key={post.id}>
                        <p><strong>{post.title}</strong></p>
                        <p>{post.content}</p>
                    </li>
                ))}
            </ul>

            <h2>Update Your Information</h2>
            <div>
                <input
                    type="text"
                    placeholder="New Username"
                    onChange={(e) => setUpdatedUser({ ...updatedUser, username: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="New Password"
                    onChange={(e) => setUpdatedUser({ ...updatedUser, password: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="New Email"
                    onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="New Nickname"
                    onChange={(e) => setUpdatedUser({ ...updatedUser, nickname: e.target.value })}
                />
                <input
                    type="file"
                    onChange={(e) => setUpdatedUser({ ...updatedUser, profileImage: e.target.files[0] })}
                />
                <button onClick={handleUserUpdate}>Update</button>
            </div>

            <h2>Delete Your Account</h2>
            <div>
                <input
                    type="text"
                    placeholder="Type your username to confirm"
                    value={deleteUsername}
                    onChange={(e) => setDeleteUsername(e.target.value)}
                />
                <button onClick={handleUserDelete} style={{ backgroundColor: 'red', color: 'white' }}>
                    Delete Account
                </button>
            </div>
        </div>
    );
};

export default UserProfilePage;
