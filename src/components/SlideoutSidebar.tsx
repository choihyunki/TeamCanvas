import React from "react";
import { Link } from "react-router-dom"; // Link 컴포넌트 사용

// 임시 데이터 타입
interface Project {
  id: number;
  name: string;
}
interface Friend {
  id: number;
  name: string;
  avatarInitial: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  friends: Friend[];
}

const SlideoutSidebar: React.FC<Props> = ({ isOpen, onClose, projects, friends }) => {
  return (
    <>
      {/* 사이드바가 열렸을 때 배경을 어둡게 처리하는 오버레이 */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? "visible" : "hidden",
          transition: "opacity 0.3s ease",
          zIndex: 100,
        }}
      />
      {/* 실제 슬라이드 바 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "280px",
          height: "100%",
          backgroundColor: "#fff",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease-in-out",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '15px' }}>내 워크스페이스</h2>

        {/* 내 프로젝트 목록 */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', color: '#555' }}>내 프로젝트</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {projects.map(proj => (
              <Link to={`/project/${proj.id}`} key={proj.id} style={{ textDecoration: 'none', color: '#333', padding: '8px 12px', borderRadius: '6px', background: '#f4f4f5', transition: 'background 0.2s' }}
                onClick={onClose}
              >
                {proj.name}
              </Link>
            ))}
          </div>
        </div>

        {/* 내 친구 목록 (드래그 가능) */}
        <div>
          <h3 style={{ fontSize: '16px', color: '#555' }}>친구 목록</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {friends.map(friend => (
              <div
                key={friend.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", friend.id.toString());
                  e.dataTransfer.setData("friendId", friend.id.toString());
                  e.dataTransfer.setData("friendName", friend.name);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'grab', padding: '8px', borderRadius: '8px', background: '#eef2ff' }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#c7d2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {friend.avatarInitial}
                </div>
                <span>{friend.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SlideoutSidebar;