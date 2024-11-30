import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Shared/Navbar";
import { getCurrentUser } from "../../services/authService";
import { fetchRecentPosts, fetchMyPosts } from "../../services/postService";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hour}:${minute}`;
};

const Main = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [recentPosts, setRecentPosts] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // 검색어
    const [searchType, setSearchType] = useState("title"); // 검색 기준
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getCurrentUser();
                setUser(userData);
                const myPostsData = await fetchMyPosts(userData.id);
                setMyPosts(myPostsData);
            } catch {
                setUser(null);
                setMyPosts([]);
            }

            const recentPostsData = await fetchRecentPosts();
            setRecentPosts(recentPostsData);
            setLoading(false);
        };

        fetchData();
    }, []);

    const handlePostClick = (postId) => {
        navigate(`/posts/${postId}`);
    };

    const handleSearch = () => {
        navigate(`/posts?query=${searchQuery}&type=${searchType}`);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Navbar user={user} />

            {/* 검색창 */}
            <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        width: "60%",
                        padding: "10px",
                        marginRight: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                    }}
                />
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    style={{
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        marginRight: "10px",
                    }}
                >
                    <option value="title">Title/Content</option>
                    <option value="type">Type</option>
                </select>
                <button
                    onClick={handleSearch}
                    style={{
                        backgroundColor: "#007bff",
                        color: "#fff",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Search
                </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", margin: "20px" }}>
                {/* 최신 글 박스 */}
                <div style={{ width: "45%", border: "1px solid #ccc", padding: "10px" }}>
                    <h2>Recent Posts</h2>
                    {recentPosts.length === 0 ? (
                        <p>No recent posts available</p>
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
                    <button
                        style={{
                            backgroundColor: "#000bff",
                            color: "#fff",
                            border: "none",
                            padding: "10px 15px",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                        onClick={() => navigate("/posts/create")}
                    >
                        Create Posts
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
