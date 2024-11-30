import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "../Shared/Navbar";

const defaultprofile = "https://backendnewbie.s3.us-east-2.amazonaws.com/default/defaultimage.png";
const BASE_URL = 'http://localhost:3000'; // API 기본 URL

const PostDetail = () => {
    const { id } = useParams(); // URL에서 Post ID 가져오기
    const [post, setPost] = useState(null); // 게시물 데이터
    const [comments, setComments] = useState([]); // 평탄화된 댓글 목록
    const [newComment, setNewComment] = useState(''); // 새 댓글 내용
    const [replyTo, setReplyTo] = useState(null); // 대댓글 대상 댓글 ID
    const [replyContent, setReplyContent] = useState(''); // 대댓글 입력 내용
    const [user, setUser] = useState(null); // 로그인된 유저 정보
    const [quantity, setQuantity] = useState(1); // 기본값 1
    const [loading, setLoading] = useState(true); // 로딩 상태 추가


    // 게시물 데이터 및 댓글 가져오기
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

        const fetchPostcount = async (postId) => {
            try {
                const response = await fetch(`${BASE_URL}/participation-counter/${postId}`);
                if (!response.ok) throw new Error('Failed to fetch post author data');
                const postData = await response.json();
                return postData.count; // count반환
            } catch (error) {
                console.error(`Error fetching author data for postId ${postId}:`, error);
                return null; // 에러 발생 시 기본값 반환
            }
        };

        const fetchPostUnitquantity = async (postId) => {
            try {
                const response = await fetch(`${BASE_URL}/posts/id/${postId}`);
                if (!response.ok) throw new Error('Failed to fetch post author data');
                const postData = await response.json();
                return postData.unitQuantity; // count반환
            } catch (error) {
                console.error(`Error fetching author data for postId ${postId}:`, error);
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
                const parcount = await fetchPostcount(postData.id);
                const unitquan = await fetchPostUnitquantity(postData.id);
                setPost({ ...postData, authornickname: authorNickname, count: parcount, unitquantity: unitquan }); // nickname 추가
            } catch (error) {
                console.error('Error fetching post or author data:', error);
            }
        };

        const fetchUserProfile = async (authorId) => {
            try {
                const response = await fetch(`${BASE_URL}/users/${authorId}`);
                if (!response.ok) throw new Error('Failed to fetch user profile');
                const userData = await response.json();
                return userData.profileImageUrl; // 사용자 프로필 URL 반환
            } catch (error) {
                console.error(`Error fetching user profile for authorId ${authorId}:`, error);
                return null; // 에러 발생 시 기본값 반환
            }
        };

        const fetchUsernickname = async (authorId) => {
            try {
                const response = await fetch(`${BASE_URL}/users/${authorId}`);
                if (!response.ok) throw new Error('Failed to fetch user profile');
                const userData = await response.json();
                return userData.nickname; // 사용자 프로필 URL 반환
            } catch (error) {
                console.error(`Error fetching user profile for authorId ${authorId}:`, error);
                return null; // 에러 발생 시 기본값 반환
            }
        };

        const fetchAllData = async () => {
            try {
                // 댓글 데이터 가져오기
                const response = await fetch(`${BASE_URL}/comments/${id}`);
                if (!response.ok) throw new Error('Failed to fetch comments');
                const commentsData = await response.json();
                const sortedComments = buildAndSortCommentTree(commentsData);

                // 각 댓글의 authorId로 프로필 이미지 가져오기
                const commentsWithProfiles = await Promise.all(
                    sortedComments.map(async (comment) => {
                        const userProfileUrl = await fetchUserProfile(comment.commentAuthorId);
                        const usernickname = await fetchUsernickname(comment.commentAuthorId);
                        return { ...comment, authorProfileImage: userProfileUrl, authornickname: usernickname }; // 프로필 이미지 추가
                    })
                );

                setComments(commentsWithProfiles); // 댓글 데이터 업데이트
            } catch (error) {
                console.error('Error fetching comments or user profiles:', error);
            }
        };

        const fetchPost = async () => {
            try {
                const response = await fetch(`${BASE_URL}/posts/id/${id}`);
                if (!response.ok) throw new Error('Failed to fetch post data');
                const postData = await response.json();
                setPost(postData);
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await fetch(`${BASE_URL}/comments/${id}`);
                if (!response.ok) throw new Error('Failed to fetch comments');
                const commentsData = await response.json();
                const sortedComments = buildAndSortCommentTree(commentsData);
                setComments(sortedComments);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

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
                setUser(userData); // userData에 userId가 포함되어 있어야 함
            } catch (error) {
                console.error('Error fetching user data:', error);
                setUser(null);
            }
            setLoading(false);
        };

        fetchPost();
        fetchComments();
        fetchUserData();
        fetchAllData();
        fetchPostAndAuthor();
    }, [id]);

    const participateInPost = async (postId, quantity) => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${BASE_URL}/participation`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    postId: postId,
                    quantity: quantity,
                }),
            });

            if (!response.ok) throw new Error('Failed to participate in post');
            return true;
        } catch (error) {
            console.error('Error participating in post:', error);
            return false;
        }
    };

    const cancelParticipationInPost = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/participation`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(postId),
            });

            if (!response.ok) throw new Error('Failed to cancel participation');
            return true;
        } catch (error) {
            console.error('Error canceling participation:', error);
            return false;
        }
    };


    // 댓글 트리 생성 및 평탄화
    const buildAndSortCommentTree = (comments) => {
        const commentMap = {};
        const roots = [];

        // 모든 댓글을 맵에 저장 (id를 키로 사용)
        comments.forEach((comment) => {
            commentMap[comment.id] = { ...comment, children: [] }; // children 필드를 추가
        });

        // 각 댓글을 부모 댓글의 children에 추가하거나 roots에 추가
        comments.forEach((comment) => {
            if (comment.class > 0) {
                // 대댓글인 경우, 부모 댓글 찾기
                const parent = commentMap[comment.groupNum];
                if (parent) {
                    parent.children.push(commentMap[comment.id]);
                }
            } else {
                // 원댓글인 경우
                roots.push(commentMap[comment.id]);
            }
        });

        // 각 그룹별 children을 `order` 기준으로 정렬
        const sortComments = (nodes) => {
            nodes.sort((a, b) => a.order - b.order); // order 기준 정렬
            nodes.forEach((node) => {
                if (node.children.length > 0) {
                    sortComments(node.children); // 자식들도 정렬
                }
            });
        };

        // 모든 roots를 정렬
        sortComments(roots);

        // 트리를 평탄화하여 순서를 유지
        const flattenTree = (nodes) => {
            const result = [];
            nodes.forEach((node) => {
                result.push(node);
                if (node.children.length > 0) {
                    result.push(...flattenTree(node.children)); // 자식들을 부모 아래에 추가
                }
            });
            return result;
        };

        return flattenTree(roots); // 평탄화된 리스트 반환
    };


    // 댓글 수정.
    const handleEditComment = async (commentId, newContent) => {
        const payload = {
            content: newContent,
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to edit comment');

            const updatedComment = await response.json();

            // Replace the updated comment in the comment list
            const updatedComments = comments.map((comment) =>
                comment.id === commentId ? { ...comment, content: updatedComment.content } : comment
            );

            setComments(updatedComments);
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    };

    //댓글 삭제
    // const handleDeleteComment = async (commentId) => {
    //     try {
    //         const token = localStorage.getItem('token');
    //         const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
    //             method: 'DELETE',
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //         });
    //
    //         if (!response.ok) throw new Error('Failed to delete comment');
    //
    //         // Remove the deleted comment from the comment list
    //         const updatedComments = comments.filter((comment) => comment.id !== commentId);
    //
    //         setComments(updatedComments);
    //     } catch (error) {
    //         console.error('Error deleting comment:', error);
    //     }
    // };
    // 댓글 삭제
    const handleDeleteComment = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to delete comment');

            // 댓글 삭제 후 트리 업데이트
            const updatedComments = removeCommentFromTree(comments, commentId);

            setComments(updatedComments);
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    // 댓글 트리에서 삭제된 댓글 제거
    const removeCommentFromTree = (comments, commentId) => {
        const filteredComments = [];

        for (const comment of comments) {
            if (comment.id === commentId) {
                // 삭제할 댓글을 건너뛴다.
                continue;
            }

            if (comment.children && comment.children.length > 0) {
                // 자식 댓글을 재귀적으로 탐색하여 삭제
                comment.children = removeCommentFromTree(comment.children, commentId);
            }

            filteredComments.push(comment);
        }

        return filteredComments;
    };




    // 댓글 작성
    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            content: newComment,
            postId: post.id,
        };

        console.log(payload);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to post comment');
            const newCommentData = await response.json();
            const updatedComments = buildAndSortCommentTree([...comments, newCommentData]);
            setComments(updatedComments);
            setNewComment('');
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    // 대댓글 작성
    const handleReplySubmit = async (e, parentId) => {
        e.preventDefault();

        const payload = {
            content: replyContent,
            parentCommentId: parentId,
            postId: post.id,
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/comments/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to post reply');
            const newReplyData = await response.json();
            const updatedComments = buildAndSortCommentTree([...comments, newReplyData]);
            setComments(updatedComments);
            setReplyContent('');
            setReplyTo(null); // 대댓글 입력창 초기화
        } catch (error) {
            console.error('Error submitting reply:', error);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    // 댓글 및 대댓글 렌더링
    const renderComments = (comments) => {
        return comments.map((comment) => (
            <div
                key={comment.id}
                style={{
                    marginLeft: `${comment.class * 20}px`, // class 기반으로 들여쓰기
                    marginBottom: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '10px',
                    backgroundColor: comment.class === 0 ? '#f9f9f9' : '#fff', // 대댓글과 원댓글 배경 색상 구분
                }}
            >
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <img
                        src={comment.authorProfileImage || defaultprofile}
                        alt={comment.authorId}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            marginRight: '10px',
                            border: '1px solid #ccc',
                        }}
                    />
                </div>

                {comment.commentAuthorId === user.userId && ( // 현재 유저와 작성자 ID 비교
                    <div>
                        <button
                            onClick={() => handleEditComment(comment.id, prompt('Edit your comment:', comment.content))}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#007bff',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '12px',
                                marginRight: '5px',
                            }}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{
                                backgroundColor: 'transparent',
                                color: '#dc3545',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '12px',
                            }}
                        >
                            Delete
                        </button>
                    </div>
                )}
                <p style={{margin: '10px 0'}}>작성자 : {comment.authornickname}</p>
                <p style={{margin: '10px 0'}}>내용 : {comment.content}</p>
                <button
                    onClick={() => setReplyTo(comment.id)}
                    style={{
                        backgroundColor: 'transparent',
                        color: '#007bff',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                    }}
                >
                    Reply
                </button>

                {/* 대댓글 입력창 */}
                {replyTo === comment.id && (
                    <form
                        onSubmit={(e) => handleReplySubmit(e, comment.id)}
                        style={{marginTop: '10px', marginLeft: '20px'}}
                    >
                        <textarea
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            style={{
                                width: '100%',
                                height: '80px',
                                marginBottom: '10px',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                backgroundColor: '#007bff',
                                color: '#fff',
                                padding: '8px 12px',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                            }}
                        >
                            Submit Reply
                        </button>
                    </form>
                )}
            </div>
        ));
    };

    return (
        <div>
            <Navbar user={user} />
            <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
                {post && (
                    <div>
                        <h1>{post.title}</h1>
                        {post.imageUrl && (
                            <img
                                src={`${post.imageUrl}`}
                                alt={post.title}
                                style={{
                                    width: '100%',
                                    maxHeight: '400px',
                                    objectFit: 'cover',
                                    marginBottom: '20px',
                                }}
                            />
                        )}
                        <p>{post.content}</p>
                        <p style={{fontWeight: 'bold'}}>작성자: {post.authornickname}, 주문 단위: {post.unitquantity}</p>
                        <div style={{marginTop: '20px'}}>
                            {/* 참여자 수 */}
                            <p style={{fontWeight: 'bold'}}>참여자 수: {post.count}</p>

                            {/* 수량 입력 */}
                            <div style={{ marginBottom: '10px' }}>
                                <label htmlFor="quantity" style={{ marginRight: '10px', fontWeight: 'bold' }}>
                                    수량:
                                </label>
                                <input
                                    id="quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    style={{
                                        width: '60px',
                                        padding: '5px',
                                        borderRadius: '5px',
                                        border: '1px solid #ccc',
                                    }}
                                    min="1" // 최소값 설정
                                />
                            </div>

                            {/* 참여 버튼 */}
                            <button
                                onClick={async () => {
                                    const success = await participateInPost(post.id, quantity);
                                    if (success) {
                                        window.location.reload(); // 참여 성공 시 페이지 새로고침
                                    }
                                }}
                                style={{
                                    backgroundColor: '#007bff',
                                    color: '#fff',
                                    padding: '10px 15px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    marginRight: '10px',
                                }}
                            >
                                참여
                            </button>

                            {/* 참여 취소 버튼 */}
                            <button
                                onClick={async () => {
                                    const success = await cancelParticipationInPost(post.id);
                                    if (success) {
                                        window.location.reload(); // 참여 취소 성공 시 페이지 새로고침
                                    }
                                }}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: '#fff',
                                    padding: '10px 15px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                }}
                            >
                                참여 취소
                            </button>
                        </div>
                    </div>
                )}

                <div style={{marginTop: '40px'}}>
                    <h2>Comments</h2>
                    <form onSubmit={handleCommentSubmit} style={{marginBottom: '20px'}}>
                        <textarea
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            style={{
                                width: '100%',
                                height: '100px',
                                marginBottom: '10px',
                                padding: '10px',
                                border: '1px solid #ccc',
                                borderRadius: '5px',
                            }}
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
                            Comment
                        </button>
                    </form>

                    <div>{renderComments(comments)}</div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
