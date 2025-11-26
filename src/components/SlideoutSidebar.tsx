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

  const handleAddFriend = async () => {
    if (!friendIdInput.trim()) return;
    if (!token) return;
    try {
      await UserService.addFriend(token, friendIdInput.trim());
      alert(`${friendIdInput}님이 친구로 추가되었습니다!`);
      setFriendIdInput("");
      if (onRefreshFriends) onRefreshFriends();
    } catch (error: any) {
      const msg = error.response?.data?.message || "친구 추가 실패";
      alert(msg);
    }
  };

  // 🔥 [추가] 친구 드래그 시작 핸들러
  const handleFriendDragStart = (e: React.DragEvent, friend: FriendItem) => {
    // "FRIEND" 타입과 친구 정보를 담아서 보냄
    e.dataTransfer.setData("type", "FRIEND");
    e.dataTransfer.setData("friendId", friend.username); // 혹은 id가 있다면 id
    e.dataTransfer.setData("friendName", friend.name);
    e.dataTransfer.effectAllowed = "copy"; // 복사되는 느낌
  };

  return (
    <>
      {/* 오버레이는 CSS에서 display:none 처리함 */}
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <div className={`slideout-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>내비게이션</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* ... (프로젝트 목록 부분 생략 - 기존과 동일) ... */}
        <div className="sidebar-section">
          <h3>📂 내 프로젝트</h3>
          <ul className="sidebar-list">
            {projects.map((p) => (
              <li key={p.id}>
                <Link to={`/project/${p.id}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <hr className="sidebar-divider" />

        <div className="sidebar-section">
          <h3>👥 친구 목록 (드래그하여 초대)</h3>

          <div
            className="add-friend-box"
            style={{ display: "flex", gap: "5px", marginBottom: "10px" }}
          >
            <input
              type="text"
              placeholder="친구 ID 검색"
              value={friendIdInput}
              onChange={(e) => setFriendIdInput(e.target.value)}
              style={{ flex: 1, padding: "5px" }}
            />
            <button onClick={handleAddFriend} style={{ cursor: "pointer" }}>
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
                  // 🔥 드래그 가능 설정
                  draggable
                  onDragStart={(e) => handleFriendDragStart(e, f)}
                >
                  <div className="friend-avatar">
                    {f.avatarInitial || f.name[0]}
                  </div>
                  <div className="friend-info">
                    <span className="friend-name">{f.name}</span>
                    <span className="friend-id">@{f.username}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* ... (푸터 생략) ... */}
        <div className="sidebar-footer">
          <Link to="/help">도움말</Link>
          <Link to="/contact">문의하기</Link>
        </div>
      </div>
    </>
  );
};

export default SlideoutSidebar;
