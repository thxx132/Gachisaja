import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Shared/Navbar'; // Navbar 경로 확인

const BASE_URL = 'http://localhost:3000'; // API 기본 URL

const TrustScorePage = () => {
    const { postId } = useParams(); // URL에서 postId 가져오기
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null); // 현재 로그인된 유저 정보
    const [participants, setParticipants] = useState([]); // 참여자 목록
    const [feedback, setFeedback] = useState({}); // 점수 입력 상태 저장 (toUserId: score)
    const [loading, setLoading] = useState(true);

    // 현재 사용자 및 참여자 데이터 가져오기
    useEffect(() => {
        console.log(postId);

        const fetchUserProfile = async (userId) => {
            try {
                const response = await fetch(`${BASE_URL}/users/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch user profile');
                const userData = await response.json();
                return userData.profileImageUrl; // 사용자 프로필 이미지 URL 반환
            } catch (error) {
                console.error('Error fetching user profile:', error);
                return null; // 에러 발생 시 기본값 반환
            }
        };

        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${BASE_URL}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!response.ok) throw new Error('Failed to fetch current user');
                const userData = await response.json();

                // 프로필 사진 추가
                const profileImageUrl = await fetchUserProfile(userData.userId);
                setCurrentUser({ ...userData, profileImageUrl });
            } catch (error) {
                console.error('Error fetching current user:', error);
                setCurrentUser(null);
            }
        };

        const fetchParticipants = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${BASE_URL}/participation/participants?postId=${postId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) throw new Error('Failed to fetch participants');
                const participantsData = await response.json();
                setParticipants(participantsData);
            } catch (error) {
                console.error('Error fetching participants:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentUser();
        fetchParticipants();
    }, [postId]);

    // 점수 변경 핸들러
    const handleScoreChange = (toUserId, score) => {
        setFeedback((prev) => ({ ...prev, [toUserId]: score }));
    };

    // 점수 제출 핸들러
    const submitTrustScore = async (toUserId) => {
        try {
            const token = localStorage.getItem('token');
            const score = feedback[toUserId];

            const response = await fetch(`${BASE_URL}/trust-score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ toUserId, score }),
            });

            if (!response.ok) throw new Error('Failed to submit trust score');
            alert('Trust score submitted successfully');
        } catch (error) {
            console.error('Error submitting trust score:', error);
        }
    };

    // 로딩 중일 때
    if (loading) {
        return <p>Loading...</p>;
    }

    // 로딩 완료 후 렌더링
    return (
        <div>
            <Navbar user={currentUser} /> {/* Navbar에 currentUser 전달 */}
            <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
                <h1>Trust Score Feedback</h1>
                <p style={{ marginBottom: '20px' }}>
                    Please provide your feedback for other participants in this post. (You cannot rate yourself.)
                </p>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {participants
                        .filter((participant) => participant.userId !== currentUser?.userId) // 현재 사용자 제외
                        .map((participant) => (
                            <li
                                key={participant.userId}
                                style={{
                                    border: '1px solid #ddd',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    marginBottom: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <img
                                        src={participant.profileImageUrl || 'https://via.placeholder.com/40'}
                                        alt={participant.nickname}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            marginRight: '10px',
                                        }}
                                    />
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{participant.nickname}</p>
                                        <p style={{ margin: 0, fontSize: '12px' }}>Trust Score: {participant.trustScore}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        value={feedback[participant.userId] || ''}
                                        onChange={(e) =>
                                            handleScoreChange(
                                                participant.userId,
                                                Math.max(-5, Math.min(5, Number(e.target.value)))
                                            )
                                        }
                                        placeholder="Rate -5 to 5"
                                        style={{
                                            width: '60px',
                                            marginRight: '10px',
                                            padding: '5px',
                                            border: '1px solid #ccc',
                                            borderRadius: '5px',
                                        }}
                                    />
                                    <button
                                        onClick={() => submitTrustScore(participant.userId)}
                                        style={{
                                            backgroundColor: '#007bff',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '8px 12px',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </li>
                        ))}
                </ul>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 15px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginTop: '20px',
                    }}
                >
                    Back to Main Page
                </button>
            </div>
        </div>
    );
};

export default TrustScorePage;
