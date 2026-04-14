import { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";

// --- Mock Data ---
const INITIAL_USERS = [
  { id: "u1", name: "Priya Sharma", role: "super_admin", email: "priya@org.com", avatar: "PS", status: "online", color: "#6C5CE7" },
  { id: "u2", name: "Arjun Mehta", role: "member", email: "arjun@org.com", avatar: "AM", status: "online", color: "#00B894" },
  { id: "u3", name: "Sneha Gupta", role: "member", email: "sneha@org.com", avatar: "SG", status: "away", color: "#E17055" },
  { id: "u4", name: "Rahul Verma", role: "member", email: "rahul@org.com", avatar: "RV", status: "offline", color: "#0984E3" },
  { id: "u5", name: "Ananya Das", role: "member", email: "ananya@org.com", avatar: "AD", status: "online", color: "#FDCB6E" },
];

const INITIAL_CHANNELS = [
  { id: "ch1", name: "general", description: "Company-wide announcements", isPrivate: false, members: ["u1","u2","u3","u4","u5"] },
  { id: "ch2", name: "engineering", description: "Engineering discussions", isPrivate: false, members: ["u1","u2","u4"] },
  { id: "ch3", name: "design", description: "Design team", isPrivate: false, members: ["u1","u3","u5"] },
  { id: "ch4", name: "random", description: "Water cooler chat", isPrivate: false, members: ["u1","u2","u3","u4","u5"] },
];

const INITIAL_MESSAGES = {
  ch1: [
    { id: "m1", userId: "u1", text: "Welcome everyone to our new internal chat! 🎉", timestamp: Date.now() - 7200000, type: "text" },
    { id: "m2", userId: "u2", text: "This looks great, thanks for setting it up!", timestamp: Date.now() - 6000000, type: "text" },
    { id: "m3", userId: "u3", text: "Excited to use this for team communication.", timestamp: Date.now() - 3600000, type: "text" },
  ],
  ch2: [
    { id: "m4", userId: "u2", text: "Sprint planning at 3 PM today, please join.", timestamp: Date.now() - 5400000, type: "text" },
    { id: "m5", userId: "u4", text: "Got it. I'll prepare the backlog review.", timestamp: Date.now() - 4800000, type: "text" },
  ],
  ch3: [
    { id: "m6", userId: "u3", text: "New brand guidelines are ready for review.", timestamp: Date.now() - 9000000, type: "text" },
    { id: "m7", userId: "u5", text: "I'll take a look this afternoon!", timestamp: Date.now() - 7000000, type: "text" },
  ],
  ch4: [
    { id: "m8", userId: "u5", text: "Anyone tried the new cafe downstairs? ☕", timestamp: Date.now() - 1800000, type: "text" },
  ],
};

// --- Icons ---
const Icon = ({ type, size = 18 }) => {
  const icons = {
    hash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    message: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    attach: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
    file: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    smile: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
    chevDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.32 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  };
  return icons[type] || null;
};

// --- Styles ---
const CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  :root {
    --bg-primary: #0F0F12;
    --bg-secondary: #17171C;
    --bg-tertiary: #1E1E26;
    --bg-hover: #25252F;
    --bg-active: #2A2A36;
    --text-primary: #E8E6F0;
    --text-secondary: #9896A6;
    --text-muted: #6B697A;
    --accent: #7C6AEF;
    --accent-hover: #6B58DE;
    --accent-glow: rgba(124, 106, 239, 0.15);
    --green: #34D399;
    --yellow: #FBBF24;
    --red: #F87171;
    --orange: #FB923C;
    --border: #2A2A36;
    --border-light: #33333F;
    --radius: 10px;
    --radius-sm: 6px;
    --shadow: 0 4px 24px rgba(0,0,0,0.3);
    --font: 'DM Sans', -apple-system, sans-serif;
    --mono: 'JetBrains Mono', monospace;
  }

  .app-root {
    font-family: var(--font);
    background: var(--bg-primary);
    color: var(--text-primary);
    height: 100vh;
    display: flex;
    overflow: hidden;
    font-size: 14px;
    line-height: 1.5;
  }

  /* Org Sidebar */
  .org-sidebar {
    width: 62px;
    background: #0A0A0E;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0;
    gap: 6px;
    border-right: 1px solid var(--border);
    flex-shrink: 0;
  }
  .org-logo {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, #7C6AEF, #A78BFA);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 16px; color: #fff;
    margin-bottom: 12px;
    cursor: pointer;
    transition: transform 0.15s, border-radius 0.2s;
  }
  .org-logo:hover { border-radius: 16px; transform: scale(1.05); }
  .org-nav-btn {
    width: 40px; height: 40px;
    border-radius: 12px;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
    position: relative;
  }
  .org-nav-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
  .org-nav-btn.active { background: var(--accent-glow); color: var(--accent); }
  .org-nav-btn .badge {
    position: absolute; top: 4px; right: 4px;
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--red);
  }

  /* Channel Sidebar */
  .channel-sidebar {
    width: 250px;
    background: var(--bg-secondary);
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border);
    flex-shrink: 0;
  }
  .sidebar-header {
    padding: 16px 16px 12px;
    border-bottom: 1px solid var(--border);
  }
  .sidebar-header h2 {
    font-size: 15px; font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }
  .sidebar-header p {
    font-size: 11px; color: var(--text-muted);
    margin-top: 2px;
  }
  .sidebar-search {
    margin: 12px 12px 8px;
    position: relative;
  }
  .sidebar-search input {
    width: 100%;
    padding: 8px 12px 8px 32px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-family: var(--font);
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s;
  }
  .sidebar-search input:focus { border-color: var(--accent); }
  .sidebar-search input::placeholder { color: var(--text-muted); }
  .sidebar-search .search-icon {
    position: absolute; left: 9px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted);
  }

  .section-label {
    padding: 12px 16px 6px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    display: flex; align-items: center; justify-content: space-between;
  }
  .section-label button {
    background: none; border: none; color: var(--text-muted);
    cursor: pointer; padding: 2px;
    border-radius: 4px; transition: all 0.15s;
  }
  .section-label button:hover { color: var(--text-primary); background: var(--bg-hover); }

  .channel-item, .dm-item {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 16px;
    cursor: pointer;
    transition: background 0.1s;
    font-size: 13px;
    color: var(--text-secondary);
    border-radius: 0;
    position: relative;
  }
  .channel-item:hover, .dm-item:hover { background: var(--bg-hover); }
  .channel-item.active, .dm-item.active {
    background: var(--bg-active);
    color: var(--text-primary);
  }
  .channel-item.active::before {
    content: '';
    position: absolute; left: 0; top: 50%; transform: translateY(-50%);
    width: 3px; height: 20px;
    background: var(--accent);
    border-radius: 0 3px 3px 0;
  }
  .channel-icon { color: var(--text-muted); flex-shrink: 0; }
  .unread-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--accent); margin-left: auto; flex-shrink: 0;
  }

  /* Avatar */
  .avatar {
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 600; color: #fff;
    flex-shrink: 0;
    font-size: 11px;
    position: relative;
  }
  .avatar-sm { width: 28px; height: 28px; font-size: 10px; border-radius: 8px; }
  .avatar-md { width: 36px; height: 36px; font-size: 12px; }
  .avatar-lg { width: 44px; height: 44px; font-size: 14px; }
  .status-dot {
    position: absolute; bottom: -1px; right: -1px;
    width: 10px; height: 10px;
    border-radius: 50%;
    border: 2px solid var(--bg-secondary);
  }
  .status-online { background: var(--green); }
  .status-away { background: var(--yellow); }
  .status-offline { background: var(--text-muted); }

  /* Main Chat */
  .chat-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--bg-primary);
  }
  .chat-header {
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    background: var(--bg-primary);
    flex-shrink: 0;
  }
  .chat-header-left {
    display: flex; align-items: center; gap: 10px;
  }
  .chat-header-left h3 {
    font-size: 15px; font-weight: 600;
    display: flex; align-items: center; gap: 6px;
  }
  .chat-header-left p {
    font-size: 12px; color: var(--text-muted);
  }
  .chat-header-right {
    display: flex; align-items: center; gap: 4px;
  }
  .header-btn {
    background: none; border: none;
    color: var(--text-muted); cursor: pointer;
    padding: 6px; border-radius: var(--radius-sm);
    transition: all 0.15s;
  }
  .header-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

  /* Messages */
  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .messages-container::-webkit-scrollbar { width: 6px; }
  .messages-container::-webkit-scrollbar-track { background: transparent; }
  .messages-container::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 3px; }

  .msg-group { margin-bottom: 12px; }
  .msg-row {
    display: flex; gap: 10px;
    padding: 4px 0;
    position: relative;
  }
  .msg-row:hover { background: var(--bg-secondary); margin: 0 -20px; padding: 4px 20px; border-radius: 6px; }
  .msg-content { flex: 1; min-width: 0; }
  .msg-header {
    display: flex; align-items: baseline; gap: 8px;
  }
  .msg-author {
    font-weight: 600; font-size: 13px;
    color: var(--text-primary);
  }
  .msg-time {
    font-size: 11px; color: var(--text-muted);
    font-family: var(--mono);
  }
  .msg-text {
    font-size: 13.5px; color: var(--text-secondary);
    line-height: 1.55;
    word-break: break-word;
  }
  .msg-file {
    margin-top: 6px;
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    font-size: 12px; color: var(--text-secondary);
  }
  .msg-file-icon { color: var(--accent); }
  .msg-reactions {
    display: flex; gap: 4px; margin-top: 4px;
  }
  .reaction-chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 12px;
    font-size: 12px; cursor: pointer;
    transition: all 0.15s;
  }
  .reaction-chip:hover { border-color: var(--accent); background: var(--accent-glow); }

  /* Compose */
  .compose-area {
    padding: 12px 20px 16px;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }
  .compose-box {
    display: flex; align-items: flex-end; gap: 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 12px;
    transition: border-color 0.15s;
  }
  .compose-box:focus-within { border-color: var(--accent); }
  .compose-box textarea {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: var(--font);
    font-size: 13.5px;
    resize: none;
    outline: none;
    max-height: 120px;
    line-height: 1.5;
  }
  .compose-box textarea::placeholder { color: var(--text-muted); }
  .compose-actions {
    display: flex; gap: 2px; align-items: center;
  }
  .compose-btn {
    background: none; border: none;
    color: var(--text-muted);
    cursor: pointer; padding: 4px;
    border-radius: 4px;
    transition: all 0.15s;
  }
  .compose-btn:hover { color: var(--text-primary); background: var(--bg-hover); }
  .send-btn {
    background: var(--accent);
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: var(--radius-sm);
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .send-btn:hover { background: var(--accent-hover); }
  .send-btn:disabled { opacity: 0.3; cursor: default; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
    animation: fadeIn 0.15s;
  }
  .modal {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 14px;
    width: 420px;
    max-width: 90vw;
    box-shadow: var(--shadow);
    animation: slideUp 0.2s;
  }
  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
  }
  .modal-header h3 { font-size: 15px; font-weight: 600; }
  .modal-close {
    background: none; border: none;
    color: var(--text-muted); cursor: pointer;
    padding: 4px; border-radius: 4px;
    transition: all 0.15s;
  }
  .modal-close:hover { color: var(--text-primary); background: var(--bg-hover); }
  .modal-body { padding: 20px; }
  .modal-footer {
    padding: 12px 20px;
    border-top: 1px solid var(--border);
    display: flex; justify-content: flex-end; gap: 8px;
  }
  .form-group { margin-bottom: 14px; }
  .form-label {
    display: block;
    font-size: 12px; font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .form-input, .form-select {
    width: 100%;
    padding: 9px 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    font-family: var(--font);
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s;
  }
  .form-input:focus, .form-select:focus { border-color: var(--accent); }
  .form-input::placeholder { color: var(--text-muted); }
  .btn {
    padding: 8px 16px;
    border-radius: var(--radius-sm);
    font-family: var(--font);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.15s;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
  .btn-ghost:hover { background: var(--bg-hover); color: var(--text-primary); }
  .btn-danger { background: var(--red); color: #fff; }
  .btn-danger:hover { opacity: 0.9; }

  /* Admin Panel */
  .admin-panel {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
  }
  .admin-panel h2 {
    font-size: 20px; font-weight: 700;
    margin-bottom: 4px;
  }
  .admin-panel .subtitle {
    font-size: 13px; color: var(--text-muted);
    margin-bottom: 20px;
  }
  .admin-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 12px;
  }
  .admin-card h4 {
    font-size: 13px; font-weight: 600;
    margin-bottom: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .user-row {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .user-row:last-child { border-bottom: none; }
  .user-info { flex: 1; }
  .user-info .name { font-weight: 600; font-size: 13px; }
  .user-info .email { font-size: 12px; color: var(--text-muted); }
  .role-badge {
    font-size: 10px; font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .role-admin { background: rgba(124,106,239,0.15); color: var(--accent); }
  .role-member { background: rgba(52,211,153,0.15); color: var(--green); }
  .remove-btn {
    background: none; border: none;
    color: var(--text-muted); cursor: pointer;
    padding: 4px; border-radius: 4px;
    transition: all 0.15s;
  }
  .remove-btn:hover { color: var(--red); background: rgba(248,113,113,0.1); }

  /* Typing indicator */
  .typing-indicator {
    font-size: 12px; color: var(--text-muted);
    padding: 4px 0;
    font-style: italic;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  /* Scrollbar for sidebar */
  .sidebar-scroll {
    flex: 1;
    overflow-y: auto;
  }
  .sidebar-scroll::-webkit-scrollbar { width: 4px; }
  .sidebar-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .dm-avatar-wrap { position: relative; }

  .date-divider {
    display: flex; align-items: center; gap: 12px;
    padding: 16px 0 8px;
    font-size: 11px; font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .date-divider::before, .date-divider::after {
    content: ''; flex: 1; height: 1px;
    background: var(--border);
  }

  .empty-state {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: var(--text-muted); gap: 8px;
    padding: 40px;
  }
  .empty-state p { font-size: 14px; }

  .member-count {
    font-size: 12px; color: var(--text-muted);
    display: flex; align-items: center; gap: 4px;
  }

  @media (max-width: 768px) {
    .org-sidebar { width: 50px; }
    .channel-sidebar { width: 200px; }
  }
`;

// --- Helpers ---
const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (ts) => {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
};

const Avatar = ({ user, size = "md", showStatus = false }) => (
  <div className={`avatar avatar-${size}`} style={{ background: user.color }}>
    {user.avatar}
    {showStatus && <div className={`status-dot status-${user.status}`} />}
  </div>
);

// --- Main App ---
export default function OrgChatApp() {
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]); // Priya (super admin)
  const [users, setUsers] = useState(INITIAL_USERS);
  const [channels, setChannels] = useState(INITIAL_CHANNELS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [activeView, setActiveView] = useState("channels"); // channels | dms | admin
  const [activeChannel, setActiveChannel] = useState("ch1");
  const [activeDM, setActiveDM] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showLoginPicker, setShowLoginPicker] = useState(false);
  const [dmMessages, setDmMessages] = useState({});
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [activeChannel, activeDM, messages, dmMessages, scrollToBottom]);

  const currentChatId = activeView === "dms" && activeDM ? `dm_${[currentUser.id, activeDM].sort().join("_")}` : activeChannel;
  const currentMessages = activeView === "dms" && activeDM
    ? dmMessages[currentChatId] || []
    : messages[activeChannel] || [];

  const handleSend = () => {
    const text = messageText.trim();
    if (!text) return;
    const newMsg = {
      id: `m_${Date.now()}`,
      userId: currentUser.id,
      text,
      timestamp: Date.now(),
      type: "text",
    };
    if (activeView === "dms" && activeDM) {
      setDmMessages((prev) => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), newMsg],
      }));
    } else {
      setMessages((prev) => ({
        ...prev,
        [activeChannel]: [...(prev[activeChannel] || []), newMsg],
      }));
    }
    setMessageText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e) => {
    setMessageText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleFileAttach = () => {
    const fakeFile = {
      id: `m_${Date.now()}`,
      userId: currentUser.id,
      text: "",
      fileName: "quarterly-report.pdf",
      fileSize: "2.4 MB",
      timestamp: Date.now(),
      type: "file",
    };
    if (activeView === "dms" && activeDM) {
      setDmMessages((prev) => ({
        ...prev,
        [currentChatId]: [...(prev[currentChatId] || []), fakeFile],
      }));
    } else {
      setMessages((prev) => ({
        ...prev,
        [activeChannel]: [...(prev[activeChannel] || []), fakeFile],
      }));
    }
  };

  const addUser = (name, email, role) => {
    const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    const colors = ["#E17055","#00B894","#0984E3","#FDCB6E","#6C5CE7","#A29BFE","#55EFC4","#FAB1A0"];
    const newUser = {
      id: `u_${Date.now()}`,
      name,
      email,
      role,
      avatar: initials,
      status: "offline",
      color: colors[Math.floor(Math.random() * colors.length)],
    };
    setUsers((prev) => [...prev, newUser]);
    // Add to general channel
    setChannels((prev) =>
      prev.map((ch) =>
        ch.id === "ch1" ? { ...ch, members: [...ch.members, newUser.id] } : ch
      )
    );
  };

  const removeUser = (userId) => {
    if (userId === currentUser.id) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setChannels((prev) =>
      prev.map((ch) => ({ ...ch, members: ch.members.filter((m) => m !== userId) }))
    );
  };

  const addChannel = (name, description) => {
    const newCh = {
      id: `ch_${Date.now()}`,
      name: name.toLowerCase().replace(/\s+/g, "-"),
      description,
      isPrivate: false,
      members: [currentUser.id],
    };
    setChannels((prev) => [...prev, newCh]);
    setMessages((prev) => ({ ...prev, [newCh.id]: [] }));
    setActiveChannel(newCh.id);
    setActiveView("channels");
  };

  const getUserById = (id) => users.find((u) => u.id === id);
  const otherUsers = users.filter((u) => u.id !== currentUser.id);
  const filteredChannels = channels.filter((ch) =>
    ch.name.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredUsers = otherUsers.filter((u) =>
    u.name.toLowerCase().includes(searchText.toLowerCase())
  );
  const activeChannelObj = channels.find((ch) => ch.id === activeChannel);
  const activeDMUser = activeDM ? getUserById(activeDM) : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="app-root">
        {/* Org Sidebar */}
        <div className="org-sidebar">
          <div className="org-logo" title="Switch User (Demo)" onClick={() => setShowLoginPicker(true)}>
            {currentUser.avatar[0]}
          </div>
          <button
            className={`org-nav-btn ${activeView === "channels" ? "active" : ""}`}
            onClick={() => { setActiveView("channels"); setActiveDM(null); }}
            title="Channels"
          >
            <Icon type="hash" />
          </button>
          <button
            className={`org-nav-btn ${activeView === "dms" ? "active" : ""}`}
            onClick={() => setActiveView("dms")}
            title="Direct Messages"
          >
            <Icon type="message" />
          </button>
          {currentUser.role === "super_admin" && (
            <button
              className={`org-nav-btn ${activeView === "admin" ? "active" : ""}`}
              onClick={() => setActiveView("admin")}
              title="Admin Panel"
            >
              <Icon type="shield" />
            </button>
          )}
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative" }}>
            <Avatar user={currentUser} size="sm" showStatus />
          </div>
        </div>

        {/* Channel/DM Sidebar */}
        <div className="channel-sidebar">
          <div className="sidebar-header">
            <h2>{activeView === "admin" ? "Admin" : "Workspace"}</h2>
            <p>{users.length} members · {channels.length} channels</p>
          </div>
          <div className="sidebar-search">
            <span className="search-icon"><Icon type="search" size={14} /></span>
            <input
              placeholder="Search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="sidebar-scroll">
            {/* Channels */}
            <div className="section-label">
              Channels
              <button onClick={() => setShowNewChannelModal(true)} title="Create channel">
                <Icon type="plus" size={14} />
              </button>
            </div>
            {filteredChannels.map((ch) => (
              <div
                key={ch.id}
                className={`channel-item ${activeView === "channels" && activeChannel === ch.id ? "active" : ""}`}
                onClick={() => { setActiveView("channels"); setActiveChannel(ch.id); setActiveDM(null); }}
              >
                <span className="channel-icon"><Icon type={ch.isPrivate ? "lock" : "hash"} size={15} /></span>
                <span>{ch.name}</span>
              </div>
            ))}

            {/* Direct Messages */}
            <div className="section-label" style={{ marginTop: 8 }}>
              Direct Messages
            </div>
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className={`dm-item ${activeView === "dms" && activeDM === u.id ? "active" : ""}`}
                onClick={() => { setActiveView("dms"); setActiveDM(u.id); }}
              >
                <div className="dm-avatar-wrap">
                  <Avatar user={u} size="sm" showStatus />
                </div>
                <span>{u.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Area */}
        <div className="chat-main">
          {activeView === "admin" && currentUser.role === "super_admin" ? (
            <AdminPanel
              users={users}
              currentUser={currentUser}
              onAddUser={() => setShowNewUserModal(true)}
              onRemoveUser={removeUser}
            />
          ) : activeView === "dms" && !activeDM ? (
            <div className="empty-state">
              <Icon type="message" size={40} />
              <p>Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <div className="chat-header-left">
                  {activeView === "dms" && activeDMUser ? (
                    <>
                      <Avatar user={activeDMUser} size="md" showStatus />
                      <div>
                        <h3>{activeDMUser.name}</h3>
                        <p style={{ textTransform: "capitalize" }}>{activeDMUser.status}</p>
                      </div>
                    </>
                  ) : activeChannelObj ? (
                    <div>
                      <h3>
                        <Icon type="hash" size={16} />
                        {activeChannelObj.name}
                      </h3>
                      <p>
                        {activeChannelObj.description}
                        <span className="member-count" style={{ display: "inline-flex", marginLeft: 8 }}>
                          <Icon type="users" size={12} /> {activeChannelObj.members.length}
                        </span>
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="chat-header-right">
                  <button className="header-btn"><Icon type="search" /></button>
                  <button className="header-btn"><Icon type="users" /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {currentMessages.length === 0 ? (
                  <div className="empty-state">
                    <Icon type="message" size={36} />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  currentMessages.map((msg, i) => {
                    const user = getUserById(msg.userId);
                    if (!user) return null;
                    const prevMsg = currentMessages[i - 1];
                    const showDate = !prevMsg || formatDate(msg.timestamp) !== formatDate(prevMsg.timestamp);
                    const showAvatar = !prevMsg || prevMsg.userId !== msg.userId || (msg.timestamp - prevMsg.timestamp > 300000);
                    return (
                      <div key={msg.id}>
                        {showDate && <div className="date-divider">{formatDate(msg.timestamp)}</div>}
                        <div className="msg-row">
                          <div style={{ width: 36 }}>
                            {showAvatar && <Avatar user={user} size="md" />}
                          </div>
                          <div className="msg-content">
                            {showAvatar && (
                              <div className="msg-header">
                                <span className="msg-author">{user.name}</span>
                                <span className="msg-time">{formatTime(msg.timestamp)}</span>
                              </div>
                            )}
                            {msg.type === "file" ? (
                              <div className="msg-file">
                                <span className="msg-file-icon"><Icon type="file" size={16} /></span>
                                <div>
                                  <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{msg.fileName}</div>
                                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{msg.fileSize}</div>
                                </div>
                              </div>
                            ) : (
                              <div className="msg-text">{msg.text}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Compose */}
              <div className="compose-area">
                <div className="compose-box">
                  <button className="compose-btn" onClick={handleFileAttach} title="Attach file">
                    <Icon type="attach" />
                  </button>
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    placeholder={
                      activeView === "dms" && activeDMUser
                        ? `Message ${activeDMUser.name}`
                        : `Message #${activeChannelObj?.name || ""}`
                    }
                    value={messageText}
                    onChange={handleTextareaInput}
                    onKeyDown={handleKeyDown}
                  />
                  <div className="compose-actions">
                    <button className="compose-btn"><Icon type="smile" /></button>
                    <button
                      className="send-btn"
                      onClick={handleSend}
                      disabled={!messageText.trim()}
                    >
                      <Icon type="send" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modals */}
        {showNewUserModal && (
          <NewUserModal
            onClose={() => setShowNewUserModal(false)}
            onAdd={addUser}
          />
        )}
        {showNewChannelModal && (
          <NewChannelModal
            onClose={() => setShowNewChannelModal(false)}
            onAdd={addChannel}
          />
        )}
        {showLoginPicker && (
          <LoginPickerModal
            users={users}
            currentUser={currentUser}
            onSelect={(u) => { setCurrentUser(u); setShowLoginPicker(false); }}
            onClose={() => setShowLoginPicker(false)}
          />
        )}
      </div>
    </>
  );
}

// --- Admin Panel ---
function AdminPanel({ users, currentUser, onAddUser, onRemoveUser }) {
  return (
    <div className="admin-panel">
      <h2>Admin Console</h2>
      <p className="subtitle">Manage users and organization settings</p>

      <div className="admin-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h4 style={{ margin: 0 }}>Registered Users ({users.length})</h4>
          <button className="btn btn-primary" onClick={onAddUser} style={{ fontSize: 12, padding: "6px 12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Icon type="plus" size={14} /> Register User
            </span>
          </button>
        </div>
        {users.map((u) => (
          <div key={u.id} className="user-row">
            <Avatar user={u} size="md" showStatus />
            <div className="user-info">
              <div className="name">{u.name}</div>
              <div className="email">{u.email}</div>
            </div>
            <span className={`role-badge ${u.role === "super_admin" ? "role-admin" : "role-member"}`}>
              {u.role === "super_admin" ? "Admin" : "Member"}
            </span>
            {u.id !== currentUser.id && (
              <button className="remove-btn" onClick={() => onRemoveUser(u.id)} title="Remove user">
                <Icon type="trash" size={15} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h4>Quick Stats</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "Online", value: users.filter((u) => u.status === "online").length, color: "var(--green)" },
            { label: "Away", value: users.filter((u) => u.status === "away").length, color: "var(--yellow)" },
            { label: "Offline", value: users.filter((u) => u.status === "offline").length, color: "var(--text-muted)" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "var(--bg-tertiary)", borderRadius: "var(--radius-sm)",
              padding: 12, textAlign: "center"
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Modals ---
function NewUserModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const handleSubmit = () => {
    if (!name.trim() || !email.trim()) return;
    onAdd(name.trim(), email.trim(), role);
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Register New User</h3>
          <button className="modal-close" onClick={onClose}><Icon type="x" /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="e.g. Vikram Singh" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" placeholder="e.g. vikram@org.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Register</button>
        </div>
      </div>
    </div>
  );
}

function NewChannelModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), desc.trim());
    onClose();
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Channel</h3>
          <button className="modal-close" onClick={onClose}><Icon type="x" /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Channel Name</label>
            <input className="form-input" placeholder="e.g. marketing" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" placeholder="What's this channel about?" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>Create</button>
        </div>
      </div>
    </div>
  );
}

function LoginPickerModal({ users, currentUser, onSelect, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Switch User (Demo)</h3>
          <button className="modal-close" onClick={onClose}><Icon type="x" /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
            Select a user to test different roles and permissions.
          </p>
          {users.map((u) => (
            <div
              key={u.id}
              className="user-row"
              style={{
                cursor: "pointer",
                borderRadius: "var(--radius-sm)",
                padding: "10px 8px",
                background: u.id === currentUser.id ? "var(--accent-glow)" : "transparent",
              }}
              onClick={() => onSelect(u)}
            >
              <Avatar user={u} size="md" showStatus />
              <div className="user-info">
                <div className="name">{u.name}</div>
                <div className="email">{u.email}</div>
              </div>
              <span className={`role-badge ${u.role === "super_admin" ? "role-admin" : "role-member"}`}>
                {u.role === "super_admin" ? "Admin" : "Member"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
