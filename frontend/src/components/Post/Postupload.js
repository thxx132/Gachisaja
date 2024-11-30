import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostUpload.css'; // CSS 파일 추가

const PostUpload = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState('');
    const [unitQuantity, setUnitQuantity] = useState('');
    const [deadline, setDeadline] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !content || !type || !unitQuantity || !deadline) {
            setError('All fields except image are required.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('type', type);
            formData.append('unitQuantity', Number(unitQuantity));
            const isoDeadline = new Date(deadline).toISOString();
            formData.append('deadline', isoDeadline);
            if (image) {
                formData.append('image', image);
            }

            console.log('Sending data:', Object.fromEntries(formData.entries()));

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token is missing. Please log in.');
            }

            const response = await fetch('http://localhost:3000/posts', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create post');
            }

            const responseData = await response.json();
            setSuccess('Post created successfully!');
            setError('');
            navigate(`/posts/${responseData.id}`);
        } catch (err) {
            setError(err.message);
            setSuccess('');
        }
    };

    return (
        <div className="post-upload-container">
            <h1>Create Post</h1>
            {error && <p className="message error">{error}</p>}
            {success && <p className="message success">{success}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Unit Quantity"
                    value={unitQuantity}
                    onChange={(e) => setUnitQuantity(e.target.value)}
                />
                <input
                    type="datetime-local"
                    placeholder="Deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Create Post</button>
            </form>
        </div>
    );
};

export default PostUpload;
