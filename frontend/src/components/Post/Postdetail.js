import React, { useState, useEffect } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
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
    const [userParticipation, setUserParticipation] = useState(false);
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false); // 수정 모드 (추가된 상태)
    const [editContent, setEditContent] = useState(''); // 수정된 글 내용 (추가된 상태)
    // console.log(id);
    // 게시물 데이터 및 댓글 가져오기
    useEffect(() => {

        const fetchPostAndParticipation = async () => {
            try {
                const token = localStorage.getItem('token');

                // 게시글 데이터 가져오기
                const postResponse = await fetch(`${BASE_URL}/posts/id/${id}`);
                if (!postResponse.ok) throw new Error('Failed to fetch post data');
                const postData = await postResponse.json();
                setPost(postData);

                // 사용자 참여 여부 확인
                const participationResponse = await fetch(
                    `${BASE_URL}/participation/check?postId=${id}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (participationResponse.ok) {
                    const isParticipating = await participationResponse.json();
                    setUserParticipation(isParticipating);
                }
            } catch (error) {
                console.error('Error fetching post or participation:', error);
            } finally {
                setLoading(false);
            }
        };

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

                // 응답 상태 확인
                if (!response.ok) {
                    throw new Error(`Failed to fetch post count, Status: ${response.status}`);
                }

                // 응답 본문 확인
                const text = await response.text();

                // 응답이 비어 있거나 빈 객체인 경우 count를 0으로 반환
                if (!text || text.trim() === "") {
                    console.warn(`Empty response for postId ${postId}, setting count to 0`);
                    return 0;
                }

                // JSON 파싱 및 count 값 반환
                const postData = JSON.parse(text);
                return postData.count || 0; // count 값이 없으면 기본값 0
            } catch (error) {
                console.error(`Error fetching post count for postId ${postId}:`, error);
                return 0; // 에러 발생 시 기본값 0 반환
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
                // console.log(postData);
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
            const token = localStorage.getItem('token');

            if (!token) {
                // 토큰이 없으면 유저 정보를 null로 설정하고 종료
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${BASE_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch user data');

                const userData = await response.json();
                setUser({ ...userData, profileImageUrl: await fetchUserProfile(userData.userId) }); // userData에 userId가 포함되어 있어야 함
            } catch (error) {
                console.error('Error fetching user data:', error);
                setUser(null); // 에러 발생 시 유저 정보 초기화
            } finally {
                setLoading(false);
            }
        };

        fetchPostAndParticipation()
        fetchPost();
        fetchComments();
        fetchUserData();
        fetchAllData();
        fetchPostAndAuthor();
    }, [id]);

    const handleEditPost = async () => {
        try {
            const token = localStorage.getItem('token'); // 토큰 가져오기

            // API 요청 보내기
            const response = await fetch(`${BASE_URL}/posts/${id}`, {
                method: 'PATCH', // PATCH 메서드 사용
                headers: {
                    'Content-Type': 'application/json', // JSON 형식
                    Authorization: `Bearer ${token}`, // 토큰 헤더
                },
                body: JSON.stringify({ content: editContent }), // 수정된 내용 전달
            });

            if (!response.ok) throw new Error('Failed to edit post'); // 오류 처리

            const updatedPost = await response.json(); // 수정된 게시글 정보 받기
            setPost(updatedPost); // 상태 업데이트
            setEditMode(false); // 수정 모드 종료
            alert('글이 수정되었습니다.'); // 성공 메시지
        } catch (error) {
            console.error('Error editing post:', error);
            alert('글 수정에 실패했습니다.'); // 오류 메시지
        }
    };

// 게시글 삭제 함수
    const handleDeletePost = async () => {
        try {
            const token = localStorage.getItem('token'); // 토큰 가져오기

            // API 요청 보내기
            const response = await fetch(`${BASE_URL}/posts/${id}`, {
                method: 'DELETE', // DELETE 메서드 사용
                headers: {
                    Authorization: `Bearer ${token}`, // 토큰 헤더
                },
            });

            if (!response.ok) throw new Error('Failed to delete post'); // 오류 처리

            alert('글이 삭제되었습니다.'); // 성공 메시지
            navigate('/'); // 메인 페이지로 이동
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('글 삭제에 실패했습니다.'); // 오류 메시지
        }
    };

    const handleDeadlineCheck = () => {

        if (loading) return;

        if (post && new Date(post.deadline) < new Date()) {
            if (userParticipation) {
                navigate(`/trustscore/${id}`); // trustscore 페이지로 이동
            } else {
                navigate('/'); // 메인 페이지로 이동
            }
        }
    };

    const participateInPost = async (postId, quantity) => {
        try {
            const token = localStorage.getItem('token');

            console.log('Participate Payload:', {
                postId: postId,
                quantity: quantity,
            });

            const response = await fetch(`${BASE_URL}/participation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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

            // 참여 취소 API 호출
            const response = await fetch(`${BASE_URL}/participation`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ postId }), // body에 postId 전달
            });

            if (!response.ok) {
                throw new Error(`Failed to cancel participation: ${response.statusText}`);
            }

            alert('참여가 취소되었습니다.');
            window.location.reload(); // 페이지를 새로고침하여 상태 반영

            return true; // 성공 시 true 반환
        } catch (error) {
            console.error('Error canceling participation:', error);
            alert('참여 취소에 실패했습니다.');
            return false; // 실패 시 false 반환
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

        if (!user) {
            alert('You need to log in to submit a comment.');
            return;
        }

        const payload = {
            content: newComment,
            postId: post.id,
        };

        // console.log(payload);

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

    useEffect(() => {
        handleDeadlineCheck();
    }, [post, userParticipation]);

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

                {comment.commentAuthorId === user?.userId && ( // 현재 유저와 작성자 ID 비교
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

                            {/* === 수정 모드 구현 === */}
                            {!editMode ? (
                                <p>{post.content}</p>
                            ) : (
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '150px',
                                        marginBottom: '10px',
                                        padding: '10px',
                                        border: '1px solid #ccc',
                                        borderRadius: '5px',
                                    }}
                                />
                            )}
                            {/* === 수정 모드 끝 === */}

                            {/* === 작성자만 버튼 표시 === */}
                            {user && user.userId === post.authorId && (
                                <div style={{ marginTop: '20px' }}>
                                    {!editMode ? (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditMode(true); // 수정 모드 활성화
                                                    setEditContent(post.content); // 기존 글 내용을 수정 입력란에 세팅
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
                                                글 수정
                                            </button>
                                            <button
                                                onClick={handleDeletePost}
                                                style={{
                                                    backgroundColor: '#dc3545',
                                                    color: '#fff',
                                                    padding: '10px 15px',
                                                    border: 'none',
                                                    borderRadius: '5px',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                글 삭제
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleEditPost}
                                            style={{
                                                backgroundColor: '#28a745',
                                                color: '#fff',
                                                padding: '10px 15px',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            수정 완료
                                        </button>
                                    )}
                                </div>
                            )}
                            {/* === 작성자만 버튼 표시 끝 === */}

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
                                    console.log("postid: ",post.id);
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
