import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PostList = () => {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('http://localhost:3000/posts');
                setPosts(response.data);
            } catch (err) {
                setError('Failed to fetch posts');
            }
        };

        fetchPosts();
    }, []);

    return (
        <div>
            <h1>Post List</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {posts.map((post) => (
                    <li key={post.id}>
                        <Link to={`/posts/${post.id}`}>{post.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PostList;
