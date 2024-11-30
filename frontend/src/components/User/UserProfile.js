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
                setUser(userData);

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
            const response = await fetch(`${BASE_URL}/users/update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedUser),
            });

            if (!response.ok) throw new Error('Failed to update user');
            const updatedUserData = await response.json();
            setUser(updatedUserData); // 최신화된 유저 정보로 업데이트
            alert('User information updated successfully!');
        } catch (error) {
            console.error('Error updating user:', error);
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
            const response = await fetch(`${BASE_URL}/users/delete`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to delete user');
            alert('User deleted successfully!');
            navigate('/'); // 메인 페이지로 이동
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h1>User Profile</h1>
            {user && (
                <div>
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
