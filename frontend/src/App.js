import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/login';
import Register from './components/Auth/register';
import Main from './components/Main/Main';
import PostList from './components/Post/Postlist';
import PostDetail from './components/Post/Postdetail';
import UserProfile from './components/User/UserProfile';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts" element={<PostList />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/user/profile" element={<UserProfile />} />
        </Routes>
      </Router>
  );
}

export default App;
