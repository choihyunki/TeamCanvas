// src/data/mockDb.ts

// 🔹 유저 타입
export interface User {
    id: number;
    username: string;
    password: string;
    name: string;
}

// 🔹 프로젝트 레코드
export interface ProjectRecord {
    id: number;
    name: string;
    description?: string;
    members: string[]; 
    ownerUsername: string;
}

// --- Local Storage 관리 함수 (핵심) ---

const STORAGE_KEY = 'teamcanvasProjects';

const initialDemoProjects: ProjectRecord[] = [
    { id: 101, name: "TeamCanvas 개발", description: "실시간 협업 및 역할 관리 기능 구현", members: ["관리자", "현기", "건일"], ownerUsername: "admin" },
    { id: 201, name: "자세ON 리팩토링", description: "스쿼트/푸시업 분석 모듈 구조 개선", members: ["현기"], ownerUsername: "hyeonki" },
    { id: 301, name: "Drop In 리팩토링", description: "협업 프로그램 개발", members: ["건일"], ownerUsername: "gunil" },
];

function loadProjects(): ProjectRecord[] {
    const storedProjects = localStorage.getItem(STORAGE_KEY);
    if (storedProjects) {
        return JSON.parse(storedProjects);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialDemoProjects));
    return initialDemoProjects;
}

function saveProjects(currentProjects: ProjectRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProjects));
}


// --- 유저 데이터 (메모리 유지) ---

export const users: User[] = [
    { id: 1, username: "admin", password: "1234", name: "관리자" },
    { id: 2, username: "hyeonki", password: "1234", name: "현기" },
    { id: 3, username: "gunil", password: "1234", name: "건일" },
];

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

export function loginUser(username: string, password: string): User | null {
    return users.find((u) => u.username === username && u.password === password) ?? null;
}


// --- 프로젝트 CRUD (Local Storage 반영) ---

export function getProjectsForUser(username: string): ProjectRecord[] {
    const currentProjects = loadProjects(); 
    const user = users.find((u) => u.username === username);
    if (!user) return [];

    return currentProjects.filter(
        (p) =>
            p.ownerUsername === username || 
            p.members.includes(user.name) 
    );
}

export function getProjectById(projectId: number): ProjectRecord | undefined {
    const currentProjects = loadProjects();
    return currentProjects.find((p) => p.id === projectId);
}

export function createProjectForUser(
    username: string,
    name: string,
    description?: string
): ProjectRecord {
    const currentProjects = loadProjects(); 
    
    const owner = users.find((u) => u.username === username);
    const displayName = owner ? owner.name : username;

    const newProject: ProjectRecord = {
        id: Date.now(),
        name,
        description: description ?? "",
        members: [displayName], 
        ownerUsername: username,
    };

    const updatedProjects = [...currentProjects, newProject];
    saveProjects(updatedProjects); 
    
    return newProject;
}

// ✅ 프로젝트에 멤버 이름 추가 (SlideoutSidebar에서 호출)
export function addMemberToProject(
    projectId: number,
    memberName: string
): void {
    const currentProjects = loadProjects(); 

    const updatedProjects = currentProjects.map((p) => {
        if (p.id === projectId && !p.members.includes(memberName)) {
            return { ...p, members: [...p.members, memberName] };
        }
        return p;
    });

    saveProjects(updatedProjects); 
}

export function removeMemberFromProject(
    projectId: number,
    memberName: string
): void {
    const currentProjects = loadProjects(); 

    const updatedProjects = currentProjects.map((p) => {
        if (p.id === projectId) {
            return { ...p, members: p.members.filter((name) => name !== memberName) };
        }
        return p;
    });
    
    saveProjects(updatedProjects); 
}

export const deleteProject = (id: number): void => {
    const currentProjects = loadProjects(); 
    
    const updatedProjects = currentProjects.filter((p) => p.id !== id);
    saveProjects(updatedProjects);
};

// 🔹 더미 태스크 타입 정의
interface DummyTask {
    id: number;
    status: string; // "DONE", "TODO", "IN_PROGRESS"
    projectId: number;
}

// 🔹 더미 태스크 데이터
const dummyTasks: DummyTask[] = [
    { id: 1, status: "DONE", projectId: 101 },
    { id: 2, status: "IN_PROGRESS", projectId: 101 },
    { id: 3, status: "TODO", projectId: 101 },
    { id: 4, status: "DONE", projectId: 201 },
    { id: 5, status: "TODO", projectId: 201 },
    { id: 6, status: "IN_PROGRESS", projectId: 301 },
    { id: 7, status: "TODO", projectId: 301 },
    { id: 8, status: "DONE", projectId: 101 },
    { id: 9, status: "DONE", projectId: 101 },
];

export function getProjectTasks(projectId: number): DummyTask[] {
    return dummyTasks.filter(t => t.projectId === projectId);
}