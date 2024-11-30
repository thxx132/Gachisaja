const BASE_URL = 'http://localhost:3000'; // API 기본 URL

/**
 * num개의 최신 게시글을 가져오는 함수
 * @param {number} num - 가져올 게시글의 개수
 * @returns {Promise<Array>} - 최신 게시글 리스트
 */
export async function fetchRecentPosts() {
    try {
        const response = await fetch(`${BASE_URL}/posts/recent/5`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch recent posts");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching recent posts:", error.message);
        throw error;
    }
}

/**
 * 사용자가 참여한 게시글을 가져오는 함수
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} - 참여한 게시글 리스트
 */
export async function fetchMyPosts(userId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/posts/participations/${userId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`, // 수정된 부분: Authorization 헤더 추가
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch my posts");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching my posts:", error.message);
        throw error;
    }
}
