// src/data/mockDb.ts

// 🔹 유저 타입
export interface User {
  id: number;
  username: string; // 로그인 아이디
  password: string; // 데모라 평문, 나중에 해시로 교체 가능
  name: string; // 화면에 보여줄 이름
}

export function createUser(
  username: string,
  password: string,
  name: string
): User {
  const exists = users.find((u) => u.username === username);
  if (exists) throw new Error("이미 존재하는 아이디입니다.");

  const newUser: User = {
    id: Date.now(),
    username,
    password,
    name,
  };

  users.push(newUser);
  return newUser;
}

// 🔹 프로젝트 레코드 (ownerUsername 기준으로 소유자 구분)
export interface ProjectRecord {
  id: number;
  name: string;
  description?: string;
  members: string[]; // 참여자 이름 목록
  ownerUsername: string; // 소유자 (로그인 아이디)
}

// 🔹 데모용 유저 데이터
const users: User[] = [
  { id: 1, username: "admin", password: "1234", name: "관리자" },
  { id: 2, username: "hyeonki", password: "1234", name: "현기" },
  { id: 3, username: "gunil", password: "1234", name: "건일" },
];

// 🔹 데모용 프로젝트 데이터 (유저별로 분리)
let projects: ProjectRecord[] = [
  {
    id: 101,
    name: "TeamCanvas 개발",
    description: "실시간 협업 및 역할 관리 기능 구현",
    members: ["관리자", "현기", "건일"],
    ownerUsername: "admin",
  },
  {
    id: 201,
    name: "자세ON 리팩토링",
    description: "스쿼트/푸시업 분석 모듈 구조 개선",
    members: ["현기"],
    ownerUsername: "hyeonki",
  },
  {
    id: 301,
    name: "Drop In 리팩토링",
    description: "협업 프로그램 개발",
    members: ["건일"],
    ownerUsername: "gunil",
  },
];

// ✅ 로그인: 아이디/비번 확인
export function loginUser(username: string, password: string): User | null {
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  return user ?? null;
}

// ✅ 특정 유저의 프로젝트 목록
export function getProjectsForUser(username: string): ProjectRecord[] {
  // 1) username으로 유저 정보 찾기
  const user = users.find((u) => u.username === username);
  if (!user) return [];

  // 2) 내가 만든 프로젝트 + 내가 멤버로 들어가 있는 프로젝트
  return projects.filter(
    (p) =>
      p.ownerUsername === username || // 내가 만든 프로젝트
      p.members.includes(user.name) // 내가 멤버로 참여중인 프로젝트
  );
}

// ✅ ID로 프로젝트 하나 찾기 (필요하면 사용)
export function getProjectById(projectId: number): ProjectRecord | undefined {
  return projects.find((p) => p.id === projectId);
}

// ✅ 특정 유저에게 새 프로젝트 생성
export function createProjectForUser(
  username: string,
  name: string,
  description?: string
): ProjectRecord {
  const owner = users.find((u) => u.username === username);
  const displayName = owner ? owner.name : username;

  const newProject: ProjectRecord = {
    id: Date.now(),
    name,
    description: description ?? "",
    members: [displayName], // 생성자 한 명 기본 멤버
    ownerUsername: username,
  };

  projects = [...projects, newProject];
  return newProject;
}

// ✅ 프로젝트에 멤버 이름 추가 (이미 있으면 무시)
export function addMemberToProject(
  projectId: number,
  memberName: string
): void {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  if (!project.members.includes(memberName)) {
    project.members.push(memberName);
  }
}

// ✅ 프로젝트에서 멤버 이름 제거
export function removeMemberFromProject(
  projectId: number,
  memberName: string
): void {
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;

  project.members = project.members.filter((name) => name !== memberName);
}
