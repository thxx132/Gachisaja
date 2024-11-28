import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import { getCurrentUser } from "../../services/authService";
import { fetchRecentPosts, fetchMyPosts } from "../../services/postService";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1 필요
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hour}:${minute}`;
};

const Main = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // 로그인된 유저 정보
    const [recentPosts, setRecentPosts] = useState([]); // 최신 글
    const [myPosts, setMyPosts] = useState([]); // 내가 참여한 글
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 토큰이 있는 경우 유저 데이터 가져오기
                const userData = await getCurrentUser();
                setUser(userData);

                // 로그인된 사용자 정보를 기반으로 참여 글 가져오기
                const myPostsData = await fetchMyPosts(userData.userId);
                setMyPosts(myPostsData);
            } catch {
                // 토큰이 없거나 유효하지 않은 경우
                setUser(null);
                setMyPosts([]);
            }

            // 최신 글 가져오기
            const recentPostsData = await fetchRecentPosts();
            setRecentPosts(recentPostsData);

            setLoading(false); // 데이터 로드 완료
        };

        fetchData();
    }, [navigate]);

    const handlePostClick = (postId) => {
        navigate(`/post/${postId}`); // 특정 Post 페이지로 이동
    };

    // 로딩 상태일 때 로딩 메시지 표시
    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Navbar user={user} />
            <div style={{ display: "flex", justifyContent: "space-between", margin: "20px" }}>
                {/* 최신 글 박스 */}
                <div style={{ width: "45%", border: "1px solid #ccc", padding: "10px" }}>
                    <h2>Recent Posts</h2>
                    {recentPosts.length === 0 ? (
                        <p>No recent posts available</p> // 데이터가 없는 경우 메시지 표시
                    ) : (
                        <ul style={{ listStyleType: "none", padding: 0 }}>
                            {recentPosts.map((post) => (
                                <li
                                    key={post.id}
                                    style={{
                                        cursor: "pointer",
                                        marginBottom: "20px",
                                        display: "flex",
                                        alignItems: "center",
                                        border: "1px solid #ddd",
                                        padding: "10px",
                                        borderRadius: "5px",
                                    }}
                                    onClick={() => handlePostClick(post.id)}
                                >
                                    {/* 이미지 표시 */}
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            borderRadius: "5px",
                                            marginRight: "15px",
                                        }}
                                    />
                                    <div>
                                        {/* 제목과 추가 정보 */}
                                        <h3 style={{ margin: 0 }}>{post.title}</h3>
                                        <p style={{ margin: "5px 0" }}>
                                            {post.author.nickname} - {formatDate(post.deadline)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button
                        style={{
                            backgroundColor: "#007bff",
                            color: "#fff",
                            border: "none",
                            padding: "10px 15px",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                        onClick={() => navigate("/posts")}
                    >
                        View All Posts
                    </button>
                </div>

                {/* 내가 참여한 글 박스 */}
                <div style={{ width: "45%", border: "1px solid #ccc", padding: "10px" }}>
                    <h2>My Participations</h2>
                    {myPosts.length === 0 ? (
                        <p>You have not participated in any posts.</p>
                    ) : (
                        <ul style={{ listStyleType: "none", padding: 0 }}>
                            {myPosts.map((participation) => (
                                <li
                                    key={participation.id}
                                    style={{
                                        cursor: "pointer",
                                        marginBottom: "20px",
                                        display: "flex",
                                        alignItems: "center",
                                        border: "1px solid #ddd",
                                        padding: "10px",
                                        borderRadius: "5px",
                                    }}
                                    onClick={() => handlePostClick(participation.post.id)}
                                >
                                    {/* 이미지 표시 */}
                                    <img
                                        src={participation.post.imageUrl}
                                        alt={participation.post.title}
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            borderRadius: "5px",
                                            marginRight: "15px",
                                        }}
                                    />
                                    <div>
                                        {/* 제목과 추가 정보 */}
                                        <h3 style={{ margin: 0 }}>{participation.post.title}</h3>
                                        <p style={{ margin: "5px 0" }}>
                                            {participation.post.author.nickname} -{" "}
                                            {formatDate(participation.post.deadline)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Main;
