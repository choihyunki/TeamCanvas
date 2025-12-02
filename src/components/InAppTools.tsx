import React, { useState, useEffect } from "react";
import "../styles/InApp.css";

// 1. 계산기 (기존 동일)
export const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [newNum, setNewNum] = useState(true);

  const handleNum = (num: string) => {
    if (newNum) {
      setDisplay(num);
      setNewNum(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOp = (op: string) => {
    if (op === "C") {
      setDisplay("0");
      setNewNum(true);
    } else if (op === "=") {
      try {
        // eslint-disable-next-line no-eval
        setDisplay(String(eval(display)));
        setNewNum(true);
      } catch {
        setDisplay("Error");
      }
    } else {
      setDisplay(display + op);
      setNewNum(false);
    }
  };

  return (
    <div className="calculator">
      <div className="calc-display">{display}</div>
      {["7", "8", "9", "/"].map((v) => (
        <button
          key={v}
          className={`calc-btn ${isNaN(Number(v)) ? "orange" : ""}`}
          onClick={() => (isNaN(Number(v)) ? handleOp(v) : handleNum(v))}
        >
          {v}
        </button>
      ))}
      {["4", "5", "6", "*"].map((v) => (
        <button
          key={v}
          className={`calc-btn ${isNaN(Number(v)) ? "orange" : ""}`}
          onClick={() => (isNaN(Number(v)) ? handleOp(v) : handleNum(v))}
        >
          {v}
        </button>
      ))}
      {["1", "2", "3", "-"].map((v) => (
        <button
          key={v}
          className={`calc-btn ${isNaN(Number(v)) ? "orange" : ""}`}
          onClick={() => (isNaN(Number(v)) ? handleOp(v) : handleNum(v))}
        >
          {v}
        </button>
      ))}
      <button className="calc-btn orange" onClick={() => handleOp("C")}>
        C
      </button>
      <button className="calc-btn" onClick={() => handleNum("0")}>
        0
      </button>
      <button className="calc-btn orange" onClick={() => handleOp("=")}>
        =
      </button>
      <button className="calc-btn orange" onClick={() => handleOp("+")}>
        +
      </button>
    </div>
  );
};

// 2. 메모장 (꽉 차게 수정)
export const MemoPad = () => {
  const [text, setText] = useState("");
  return (
    <textarea
      className="memo-pad"
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="메모를 입력하세요..."
    />
  );
};

// 3. 타이머 (기존 동일)
export const Timer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    let interval: any = null;
    if (isActive) interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    else if (!isActive && seconds !== 0) clearInterval(interval);
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="timer-tool">
      <div className="timer-display">{formatTime(seconds)}</div>
      <div className="timer-controls">
        <button className="timer-btn" onClick={() => setIsActive(!isActive)}>
          {isActive ? "일시정지" : "시작"}
        </button>
        <button
          className="timer-btn"
          onClick={() => {
            setIsActive(false);
            setSeconds(0);
          }}
        >
          초기화
        </button>
      </div>
    </div>
  );
};

// 4. 유튜브 (기존 동일)
export const YouTubePlayer = () => {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const loadVideo = () => {
    if (!url) return;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) setVideoId(match[2]);
    else {
      alert("올바른 유튜브 링크가 아닙니다.");
      setVideoId(null);
    }
  };
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "5px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="유튜브 링크"
          style={{
            flex: 1,
            padding: "6px",
            fontSize: "12px",
            border: "1px solid #ddd",
            borderRadius: 4,
          }}
          onKeyDown={(e) => e.key === "Enter" && loadVideo()}
        />
        <button
          onClick={loadVideo}
          style={{
            fontSize: "12px",
            padding: "6px 10px",
            background: "#ff0000",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          재생
        </button>
      </div>
      <div
        style={{
          flex: 1,
          background: "#000",
          borderRadius: "8px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {videoId ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube"
            frameBorder="0"
            allowFullScreen
          />
        ) : (
          <span style={{ color: "#666" }}>📺 영상 대기중</span>
        )}
      </div>
    </div>
  );
};

// 🔥 [수정됨] HTML 라이브 프리뷰 기능이 추가된 코드 리뷰어
// 🔥 [수정됨] Markdown & HTML 미리보기가 가능한 코드 리뷰어
export const CodeReviewer = () => {
  // 기본 예제 코드를 Markdown으로 변경
  const [code, setCode] = useState(`# Drop In Markdown Test

**이곳은 마크다운 미리보기 영역입니다.**

- 리스트도 가능하고
- *이탤릭*이나 **볼드**도 됩니다.

> "간단한 문서를 작성하기 딱 좋습니다."

\`\`\`javascript
console.log('Code Block Test');
\`\`\`
`);

  const [review, setReview] = useState("");
  const [lang, setLang] = useState("Markdown"); // 기본값 Markdown

  const handleCopy = () => {
    const content = `[${lang} Code]\n\n${code}\n\n------------------\n[Feedback]\n${review}`;
    navigator.clipboard.writeText(content);
    alert("내용이 복사되었습니다!");
  };

  // 🛠️ 간단한 마크다운 파서 (라이브러리 없이 구현)
  const parseMarkdown = (text: string) => {
    let html = text
      .replace(/^# (.*$)/gim, "<h1>$1</h1>") // H1
      .replace(/^## (.*$)/gim, "<h2>$1</h2>") // H2
      .replace(/^### (.*$)/gim, "<h3>$1</h3>") // H3
      .replace(/\*\*(.*)\*\*/gim, "<b>$1</b>") // Bold
      .replace(/\*(.*)\*/gim, "<i>$1</i>") // Italic
      .replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>") // Blockquote
      .replace(/```([^`]+)```/gim, "<pre><code>$1</code></pre>") // Code Block
      .replace(/^\- (.*$)/gim, "<li>$1</li>") // List Item
      .replace(/\n/gim, "<br />"); // Line Break

    // 스타일 적용을 위해 감싸기
    return `
      <style>
        body { font-family: sans-serif; padding: 10px; color: #333; line-height: 1.6; }
        h1, h2, h3 { border-bottom: 1px solid #eee; padding-bottom: 5px; color: #111; }
        blockquote { border-left: 4px solid #4f46e5; margin: 0; padding-left: 10px; color: #666; background: #f9fafb; }
        pre { background: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto; }
        code { font-family: monospace; color: #e11d48; }
        ul { padding-left: 20px; }
      </style>
      ${html}
    `;
  };

  // 미리보기 모드인지 확인 (HTML이나 Markdown이면 미리보기 지원)
  const isPreviewable = lang === "HTML" || lang === "Markdown";

  return (
    <div className="code-tool">
      {/* 1. 헤더 */}
      <div className="code-header">
        <div className="code-controls-left">
          <span style={{ fontSize: 12, fontWeight: "bold", color: "#555" }}>
            언어:
          </span>
          <select
            className="lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="Markdown">Markdown (미리보기)</option>
            <option value="HTML">HTML (미리보기)</option>
            <option value="JavaScript">JavaScript</option>
            <option value="TypeScript">TypeScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="React">React</option>
          </select>
        </div>
        <button className="copy-btn" onClick={handleCopy}>
          전체 복사
        </button>
      </div>

      {/* 2. 메인 영역 (좌우 분할) */}
      <div className="split-container">
        {/* 왼쪽: 에디터 */}
        <div className="editor-pane">
          <div className="pane-label">Input ({lang})</div>
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            placeholder="여기에 내용을 입력하세요..."
          />
        </div>

        {/* 오른쪽: 미리보기 */}
        <div className="preview-pane">
          <div
            className="pane-label"
            style={{
              background: "#333",
              color: "#eee",
              borderBottom: "1px solid #444",
            }}
          >
            {isPreviewable ? "Live Preview" : "Read-Only View"}
          </div>

          {/* 🔥 핵심 로직: Markdown/HTML이면 iframe 렌더링, 아니면 코드 텍스트 표시 */}
          {isPreviewable ? (
            <iframe
              title="Live Preview"
              srcDoc={lang === "Markdown" ? parseMarkdown(code) : code}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                background: "white",
              }}
              sandbox="allow-scripts"
            />
          ) : (
            <div className="preview-content">
              <div className="line-numbers">
                {code.split("\n").map((_, i) => (
                  <span key={i} className="line-num">
                    {i + 1}
                  </span>
                ))}
              </div>
              <div className="code-text">{code}</div>
            </div>
          )}
        </div>
      </div>

      {/* 3. 하단 피드백 */}
      <div className="feedback-section">
        <span style={{ fontSize: 12, fontWeight: "bold", color: "#666" }}>
          Review / Feedback
        </span>
        <textarea
          className="review-area"
          placeholder="피드백을 입력하세요..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
      </div>
    </div>
  );
};

export const GitHubExplorer = () => {
  const [repoInput, setRepoInput] = useState("facebook/react"); // 기본값
  const [repoData, setRepoData] = useState<any>(null);
  const [readme, setReadme] = useState("");
  const [loading, setLoading] = useState(false);

  // 마크다운 파서 (CodeReviewer에 있는 것과 동일하거나 간소화)
  const parseMarkdown = (text: string) => {
    // 간단한 변환 (제목, 리스트, 코드블럭 등)
    let html = text
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/\*\*(.*)\*\*/gim, "<b>$1</b>")
      .replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>") // 멀티라인 코드
      .replace(/\n/gim, "<br />");

    return `
      <style>
        body { font-family: system-ui; padding: 15px; line-height: 1.6; color: #333; }
        h1 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        pre { background: #f6f8fa; padding: 10px; border-radius: 6px; overflow-x: auto; }
        code { font-family: monospace; color: #0550ae; }
        img { max-width: 100%; }
      </style>
      ${html}
    `;
  };

  const fetchRepo = async () => {
    if (!repoInput) return;
    setLoading(true);
    try {
      // 1. 리포지토리 정보 가져오기
      const resInfo = await fetch(`https://api.github.com/repos/${repoInput}`);
      if (!resInfo.ok) throw new Error("Repo not found");
      const info = await resInfo.json();
      setRepoData(info);

      // 2. README 가져오기
      const resReadme = await fetch(
        `https://api.github.com/repos/${repoInput}/readme`
      );
      if (resReadme.ok) {
        const readmeData = await resReadme.json();
        // Base64 디코딩 (한글 깨짐 방지 처리)
        const content = decodeURIComponent(escape(atob(readmeData.content)));
        setReadme(content);
      } else {
        setReadme("# README가 없습니다.");
      }
    } catch (e) {
      alert("찾을 수 없는 리포지토리입니다. (예: facebook/react)");
      setRepoData(null);
      setReadme("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#fff",
      }}
    >
      {/* 검색창 */}
      <div
        style={{
          padding: "10px",
          borderBottom: "1px solid #eee",
          display: "flex",
          gap: "5px",
          background: "#f6f8fa",
        }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          github.com/
        </span>
        <input
          value={repoInput}
          onChange={(e) => setRepoInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchRepo()}
          placeholder="owner/repo"
          style={{
            flex: 1,
            padding: "5px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={fetchRepo}
          style={{
            padding: "5px 10px",
            background: "#2da44e",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Go
        </button>
      </div>

      {/* 로딩 표시 */}
      {loading && (
        <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
          불러오는 중... ⏳
        </div>
      )}

      {/* 결과 화면 */}
      {!loading && repoData && (
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 리포지토리 헤더 정보 */}
          <div
            style={{
              padding: "15px",
              borderBottom: "1px solid #eee",
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "5px",
              }}
            >
              <img
                src={repoData.owner.avatar_url}
                alt="avatar"
                style={{ width: "30px", borderRadius: "50%" }}
              />
              <h3 style={{ margin: 0, fontSize: "16px" }}>
                {repoData.full_name}
              </h3>
            </div>
            <p style={{ margin: "5px 0", fontSize: "13px", color: "#555" }}>
              {repoData.description}
            </p>
            <div
              style={{
                display: "flex",
                gap: "15px",
                fontSize: "12px",
                color: "#666",
              }}
            >
              <span>
                ⭐ Star: <b>{repoData.stargazers_count}</b>
              </span>
              <span>
                🍴 Fork: <b>{repoData.forks_count}</b>
              </span>
              <span>
                🐞 Issues: <b>{repoData.open_issues_count}</b>
              </span>
            </div>
          </div>

          {/* README 미리보기 (iframe) */}
          <iframe
            title="Readme Preview"
            srcDoc={parseMarkdown(readme)}
            style={{
              flex: 1,
              border: "none",
              width: "100%",
              background: "#fff",
            }}
            sandbox="allow-scripts"
          />
        </div>
      )}
    </div>
  );
};
