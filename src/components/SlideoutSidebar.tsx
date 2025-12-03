import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/SlideoutSidebar.css";
import UserService from "../services/UserService";
import { useAuth } from "../context/AuthContext";

interface ProjectItem {
  id: string;
  name: string;
}

interface FriendItem {
  username: string;
  name: string;
  avatarInitial?: string;
}

interface SlideoutSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectItem[];
  friends: FriendItem[];
  onRefreshFriends?: () => void;
}

const SlideoutSidebar: React.FC<SlideoutSidebarProps> = ({
  isOpen,
  onClose,
  projects,
  friends,
  onRefreshFriends,
}) => {
  const { token } = useAuth();
  const [friendIdInput, setFriendIdInput] = useState("");

  // 친구 추가 (양방향)
  const handleAddFriend = async () => {
    if (!friendIdInput.trim()) return;
    if (!token) return;
    try {
      // 서버에 친구 추가 요청 (서버가 양방향으로 처리함)
      await UserService.addFriend(token, friendIdInput.trim());
      alert(`${friendIdInput}님이 친구로 추가되었습니다!`);
      setFriendIdInput("");
      if (onRefreshFriends) onRefreshFriends(); // 목록 새로고침
    } catch (error: any) {
      const msg = error.response?.data?.message || "친구 추가 실패";
      alert(msg);
    }
  };

  // 드래그 시작 핸들러
  const handleFriendDragStart = (e: React.DragEvent, friend: FriendItem) => {
    e.dataTransfer.setData("type", "FRIEND");
    e.dataTransfer.setData("friendId", friend.username);
    e.dataTransfer.setData("friendName", friend.name);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />
      <div className={`slideout-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Drop In</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="sidebar-section">
          <h3>📂 내 프로젝트</h3>
          <ul className="sidebar-list">
            {projects.length === 0 ? (
              <li className="empty-item">프로젝트가 없습니다.</li>
            ) : (
              projects.map((p) => (
                <li key={p.id}>
                  <Link to={`/project/${p.id}`} onClick={onClose}>{p.name}</Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <hr className="sidebar-divider" />

        <div className="sidebar-section">
          <h3>👥 친구 목록</h3>
          <div className="add-friend-box" style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            <input 
              type="text" 
              placeholder="친구 ID 검색" 
              value={friendIdInput}
              onChange={(e) => setFriendIdInput(e.target.value)}
              style={{ flex: 1, padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button 
              onClick={handleAddFriend} 
              style={{ background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 10px' }}
            >
              +
            </button>
          </div>

          <ul className="sidebar-list friend-list">
            {friends.length === 0 ? (
              <li className="empty-item">등록된 친구가 없습니다.</li>
            ) : (
              friends.map((f, idx) => (
                <li 
                  key={idx} 
                  className="friend-item"
                  draggable 
                  onDragStart={(e) => handleFriendDragStart(e, f)}
                >
                  <div className="friend-avatar">{f.avatarInitial || f.name[0]}</div>
                  <div className="friend-info">
                    <span className="friend-name">{f.name}</span>
                    <span className="friend-id">@{f.username}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
        
        <div className="sidebar-footer">
          <Link to="/help" onClick={onClose}>도움말</Link>
          <Link to="/contact" onClick={onClose}>문의하기</Link>
        </div>
      </div>
    </>
  );
};

export default SlideoutSidebar;
