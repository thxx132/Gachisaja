// src/components/Navbar.js

import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";

const Navbar = ({ user }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // 로컬 스토리지에서 토큰 제거
        navigate("/login");
    };

    const handleProfileClick = () => {
        navigate("/user"); // 유저 페이지로 이동
    };

    return (
        <nav style={styles.nav}>
            <div style={styles.logo} onClick={() => navigate("/")}>
                Main page
            </div>

            <div style={styles.menu}>
                {user ? (
                    <>
                        <div style={styles.profile} onClick={handleProfileClick}>
                            <img
                                src={user.profileImageUrl || "/default-profile.png"} // 프로필 이미지 (기본값 설정)
                                alt="Profile"
                                style={styles.profileImage}
                            />
                            <span>{user.nickname}</span>
                        </div>
                        <button style={styles.logoutButton} onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <button style={styles.authButton} onClick={() => navigate("/login")}>
                            Login
                        </button>
                        <button
                            style={styles.authButton}
                            onClick={() => navigate("/register")}
                        >
                            Register
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

const styles = {
    nav: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #ccc",
    },
    logo: {
        fontSize: "24px",
        fontWeight: "bold",
        cursor: "pointer",
    },
    menu: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },
    profile: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
    },
    profileImage: {
        width: "30px",
        height: "30px",
        borderRadius: "50%",
    },
    logoutButton: {
        backgroundColor: "#ff4d4f",
        color: "#fff",
        border: "none",
        padding: "5px 10px",
        borderRadius: "5px",
        cursor: "pointer",
    },
    authButton: {
        backgroundColor: "#1890ff",
        color: "#fff",
        border: "none",
        padding: "5px 10px",
        borderRadius: "5px",
        cursor: "pointer",
    },
};
