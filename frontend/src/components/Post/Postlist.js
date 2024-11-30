import React, { useEffect, useState } from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";

const BASE_URL = "http://localhost:3000"; // API 기본 URL

const PostList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams(); // URL에서 Post ID 가져오기
    const [post, setPost] = useState(null); // 게시물 데이터
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    // URL에서 쿼리 파라미터 가져오기
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get("query");
    const searchType = queryParams.get("type");

    const [searchResults, setSearchResults] = useState([]); // 검색 결과
    const [allPosts, setAllPosts] = useState([]); // 전체 게시글


    useEffect(() => {

        const fetchPostAuthorNickname = async (authorId) => {
            try {
                const response = await fetch(`${BASE_URL}/users/${authorId}`);
                if (!response.ok) throw new Error('Failed to fetch post author data');
                const userData = await response.json();
                return userData.nickname; // nickname 반환
            } catch (error) {
                console.error(`Error fetching author data for authorId ${authorId}:`, error);
                return null; // 에러 발생 시 기본값 반환
            }
        };

        const fetchPostAndAuthor = async () => {
            try {
                // 게시물 데이터 가져오기
                const response = await fetch(`${BASE_URL}/posts/id/${id}`);
                if (!response.ok) throw new Error('Failed to fetch post data');
                const postData = await response.json();

                // 작성자의 nickname 가져오기
                const authorNickname = await fetchPostAuthorNickname(postData.authorId);
                setPost({ ...postData, authornickname: authorNickname }); // nickname 추가
            } catch (error) {
                console.error('Error fetching post or author data:', error);
            }
        };

        const fetchPosts = async () => {
            try {
                setLoading(true);

                // 검색 결과 가져오기
                if (searchQuery && searchType) {
                    let searchUrl =
                        searchType === "type"
                            ? `${BASE_URL}/posts/search/type?type=${searchQuery}`
                            : `${BASE_URL}/posts/search?keyword=${searchQuery}`;

                    const searchResponse = await fetch(searchUrl);
                    if (!searchResponse.ok) throw new Error("Failed to fetch search results");
                    const searchData = await searchResponse.json();
                    setSearchResults(searchData);
                }

                // 전체 게시글 가져오기
                const allPostsResponse = await fetch(`${BASE_URL}/posts`);
                if (!allPostsResponse.ok) throw new Error("Failed to fetch all posts");
                const allPostsData = await allPostsResponse.json();
                setAllPosts(allPostsData);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
        fetchPostAndAuthor();
    }, [searchQuery, searchType]);

    const handlePostClick = (postId) => {
        navigate(`/posts/${postId}`);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
            <h1>Post List</h1>

            {/* 검색 결과 박스 */}
            <div style={{ border: "1px solid #ccc", padding: "20px", marginBottom: "20px" }}>
                <h2>Search Results</h2>
                {searchResults.length === 0 ? (
                    <p>No posts match your search criteria.</p>
                ) : (
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        {searchResults.map((post) => (
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
                                    src={post.imageUrl || "https://via.placeholder.com/50"}
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
                                        {post.authornickname || "Anonymous"} - {new Date(post.deadline).toLocaleString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* 전체 게시글 박스 */}
            <div style={{ border: "1px solid #ccc", padding: "20px" }}>
                <h2>All Posts</h2>
                {allPosts.length === 0 ? (
                    <p>No posts available.</p>
                ) : (
                    <ul style={{ listStyleType: "none", padding: 0 }}>
                        {allPosts.map((post) => (
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
                                    src={post.imageUrl || "https://via.placeholder.com/50"}
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
                                        {post.authornickname || "Anonymous"} - {new Date(post.deadline).toLocaleString()}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PostList;
