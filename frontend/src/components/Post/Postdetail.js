import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000'; // API 기본 URL

const PostDetail = () => {
    const { id } = useParams(); // URL에서 Post ID 가져오기
    const [post, setPost] = useState(null); // 게시물 데이터
    const [comments, setComments] = useState([]); // 댓글 목록
    const [newComment, setNewComment] = useState(''); // 새 댓글 내용
    const [replyTo, setReplyTo] = useState(null); // 대댓글 대상 댓글 ID

    // 게시물 데이터 가져오기
    useEffect(() => {
        const fetchPost = async () => {
            const response = await fetch(`${BASE_URL}/posts/id/${id}`);
            const postData = await response.json();
            setPost(postData);
        };

        const fetchComments = async () => {
            const response = await fetch(`${BASE_URL}/comments/${id}`);
            const commentsData = await response.json();
            const sortedComments = commentsData.sort((a, b) => a.groupNum - b.groupNum); // groupnum을 기준으로 오름차순 정렬
            setComments(sortedComments); // 정렬된 댓글 상태 저장
        };

        fetchPost();
        fetchComments();
    }, [id]);

    // 댓글 작성
    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            content: newComment, // 대댓글일 경우 parentId 설정
            postId: post.id,
        };

        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/comments/${post.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const newComment = await response.json();
            setComments([...comments, newComment]); // 댓글 목록 업데이트
            setNewComment('');
            setReplyTo(null); // 대댓글 대상 초기화
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();

        const payload = {
            content: newComment,
            parentCommentId: replyTo, // 대댓글일 경우 parentId 설정
            postId: post.id,
        };

        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/comments/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const newComment = await response.json();
            setComments([...comments, newComment]); // 댓글 목록 업데이트
            setNewComment('');
            setReplyTo(null); // 대댓글 대상 초기화
        }
    };

    console.log(comments)

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            {/* 게시물 섹션 */}
            {post && (
                <div>
                    <h1>{post.title}</h1>
                    {post.imageUrl && (
                        <img
                            src={`${post.imageUrl}`}
                            alt={post.title}
                            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', marginBottom: '20px' }}
                        />
                    )}
                    <p>{post.content}</p>
                    <p style={{ fontWeight: 'bold' }}>Author: {post.authorId}</p>
                </div>
            )}

            {/* 댓글 섹션 */}
            <div style={{ marginTop: '40px' }}>
                <h2>Comments</h2>
                <form onSubmit={replyTo ? handleReplySubmit : handleCommentSubmit} style={{ marginBottom: '20px' }}>
          <textarea
              placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ width: '100%', height: '100px', marginBottom: '10px', padding: '10px' }}
          />
                    <button
                        type="submit"
                        style={{
                            backgroundColor: '#007bff',
                            color: '#fff',
                            padding: '10px 15px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        {replyTo ? 'Reply' : 'Comment'}
                    </button>
                </form>

                {/* 댓글 목록 */}
                <div>
                    {comments.map((comment) => (
                        <div
                            key={comment.id}
                            style={{
                                marginLeft: `${comment.class * 20}px`, // 깊이에 따라 들여쓰기
                                marginBottom: '20px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                padding: '10px',
                                backgroundColor: '#f9f9f9',
                            }}
                        >
                            <p>
                                <strong>User : {comment.commentAuthorId}</strong>
                            </p>
                            <p>{comment.content}</p>
                            <button
                                onClick={() => setReplyTo(comment.id)} // 대댓글 대상 설정
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#007bff',
                                    border: 'none',
                                    cursor: 'pointer',
                                    marginTop: '10px',
                                }}
                            >
                                Reply
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
