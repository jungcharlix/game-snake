// snake-profiles.jsx — Multi-profile / save-slot system for Snake.
// Exports useProfiles hook + ProfileScreen + ProfileChip.

const PROFILES_KEY = 'snake_profiles_v2';
const LEGACY_KEYS = {
  high: 'snake_high',
  wallet: 'snake_wallet',
  ownedSkins: 'snake_owned_skins',
  equippedSkin: 'snake_equipped_skin',
};

const AVATAR_PALETTE = [
  '#D8593B', '#2E7D4F', '#3DB1F2', '#B69CF0',
  '#FACC15', '#E879C8', '#5CF2B0', '#FF8A4C',
];

function newId() {
  return 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function emptyProfile(name) {
  return {
    id: newId(),
    name: name || '玩家',
    color: AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)],
    createdAt: Date.now(),
    lastPlayedAt: Date.now(),
    high: 0,
    wallet: 0,
    ownedSkins: ['classic'],
    equippedSkin: 'classic',
  };
}

function isGarbageName(name) {
  if (!name) return false;
  // Special chars that come from random key smashes (e.g. brackets, semicolons)
  if (/[[\];{}|\\<>~`]/.test(name)) return true;
  // 5+ consecutive uppercase letters in a row (e.g. "AIHDUW")
  if (/[A-Z]{5,}/.test(name)) return true;
  return false;
}

function loadProfilesFromStorage() {
  // Try v2 store first.
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.profiles) && parsed.profiles.length) {
        // One-shot cleanup: if the active profile has a garbage name (left over
        // from a misfired keyboard test), switch active to the first clean
        // profile. We don't auto-delete — let the user prune manually.
        const active = parsed.profiles.find(p => p.id === parsed.activeId);
        if (active && isGarbageName(active.name)) {
          const clean = parsed.profiles.find(p => !isGarbageName(p.name));
          if (clean) parsed.activeId = clean.id;
        }
        return parsed;
      }
    }
  } catch {}

  // Migrate from legacy single-profile keys if present.
  const legacy = readLegacy();
  const p = emptyProfile('玩家 1');
  p.color = AVATAR_PALETTE[0];
  if (legacy) {
    p.high = legacy.high;
    p.wallet = legacy.wallet;
    p.ownedSkins = legacy.ownedSkins;
    p.equippedSkin = legacy.equippedSkin;
    p.migrated = true;
  }
  return { version: 2, profiles: [p], activeId: p.id };
}

function readLegacy() {
  try {
    const high = parseInt(localStorage.getItem(LEGACY_KEYS.high) || '', 10);
    const wallet = parseInt(localStorage.getItem(LEGACY_KEYS.wallet) || '', 10);
    const rawSkins = localStorage.getItem(LEGACY_KEYS.ownedSkins);
    const equipped = localStorage.getItem(LEGACY_KEYS.equippedSkin);
    const hasAny = !isNaN(high) || !isNaN(wallet) || rawSkins || equipped;
    if (!hasAny) return null;
    return {
      high: isNaN(high) ? 0 : high,
      wallet: isNaN(wallet) ? 0 : wallet,
      ownedSkins: rawSkins ? JSON.parse(rawSkins) : ['classic'],
      equippedSkin: equipped || 'classic',
    };
  } catch { return null; }
}

function saveProfilesToStorage(state) {
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(state)); } catch {}
}

// ── useProfiles hook ─────────────────────────────────────────────────
function useProfiles() {
  const [state, setState] = React.useState(() => loadProfilesFromStorage());

  // Auto-persist
  React.useEffect(() => { saveProfilesToStorage(state); }, [state]);

  const active = state.profiles.find(p => p.id === state.activeId) || state.profiles[0];

  // Mutators for the ACTIVE profile only.
  const updateActive = React.useCallback((patch) => {
    setState(s => {
      const next = { ...s, profiles: s.profiles.map(p => {
        if (p.id !== s.activeId) return p;
        const merged = typeof patch === 'function' ? patch(p) : { ...p, ...patch };
        return { ...merged, lastPlayedAt: Date.now() };
      }) };
      return next;
    });
  }, []);

  const switchTo = React.useCallback((id) => {
    setState(s => s.profiles.find(p => p.id === id) ? { ...s, activeId: id } : s);
  }, []);

  const addProfile = React.useCallback((name) => {
    const p = emptyProfile(name);
    // Pick an unused color if possible
    setState(s => {
      const used = new Set(s.profiles.map(x => x.color));
      const free = AVATAR_PALETTE.find(c => !used.has(c));
      if (free) p.color = free;
      return { ...s, profiles: [...s.profiles, p], activeId: p.id };
    });
    return p.id;
  }, []);

  const deleteProfile = React.useCallback((id) => {
    setState(s => {
      if (s.profiles.length <= 1) return s; // never delete last
      const remaining = s.profiles.filter(p => p.id !== id);
      const newActive = s.activeId === id ? remaining[0].id : s.activeId;
      return { ...s, profiles: remaining, activeId: newActive };
    });
  }, []);

  const renameProfile = React.useCallback((id, name) => {
    setState(s => ({ ...s, profiles: s.profiles.map(p => p.id === id ? { ...p, name: name.slice(0, 16) || p.name } : p) }));
  }, []);

  const setColor = React.useCallback((id, color) => {
    setState(s => ({ ...s, profiles: s.profiles.map(p => p.id === id ? { ...p, color } : p) }));
  }, []);

  // Import: accept JSON string of a profile OR an export bundle (array)
  const importProfile = React.useCallback((text) => {
    let parsed;
    try {
      const trimmed = String(text).trim();
      // Try base64-decode first (export wraps in base64)
      if (/^[A-Za-z0-9+/=\n\r]+$/.test(trimmed) && trimmed.length > 20) {
        try {
          const decoded = atob(trimmed.replace(/\s/g, ''));
          parsed = JSON.parse(decoded);
        } catch {
          parsed = JSON.parse(trimmed);
        }
      } else {
        parsed = JSON.parse(trimmed);
      }
    } catch (e) { throw new Error('無效的存檔資料（無法解析）'); }

    const incoming = Array.isArray(parsed) ? parsed
                   : parsed && parsed.profiles ? parsed.profiles
                   : [parsed];

    const cleaned = incoming.map(p => {
      if (!p || typeof p !== 'object') throw new Error('無效的存檔格式');
      return {
        id: newId(),
        name: String(p.name || '匯入').slice(0, 16),
        color: typeof p.color === 'string' ? p.color : AVATAR_PALETTE[0],
        createdAt: Number(p.createdAt) || Date.now(),
        lastPlayedAt: Date.now(),
        high: Math.max(0, Number(p.high) || 0),
        wallet: Math.max(0, Number(p.wallet) || 0),
        ownedSkins: Array.isArray(p.ownedSkins) && p.ownedSkins.length
          ? p.ownedSkins.filter(k => typeof k === 'string')
          : ['classic'],
        equippedSkin: typeof p.equippedSkin === 'string' ? p.equippedSkin : 'classic',
        imported: true,
      };
    });

    setState(s => ({
      ...s,
      profiles: [...s.profiles, ...cleaned],
      activeId: cleaned[0].id,
    }));
    return cleaned.length;
  }, []);

  // Import legacy single-profile keys as a new profile (if present)
  const importLegacy = React.useCallback(() => {
    const legacy = readLegacy();
    if (!legacy) throw new Error('找不到舊版存檔');
    const p = emptyProfile('舊存檔');
    p.high = legacy.high;
    p.wallet = legacy.wallet;
    p.ownedSkins = legacy.ownedSkins;
    p.equippedSkin = legacy.equippedSkin;
    setState(s => ({ ...s, profiles: [...s.profiles, p], activeId: p.id }));
    return p.id;
  }, []);

  // Export the active (or a specific) profile as a base64 string
  const exportProfile = React.useCallback((id) => {
    const target = state.profiles.find(p => p.id === (id || state.activeId));
    if (!target) return '';
    const payload = {
      name: target.name,
      color: target.color,
      createdAt: target.createdAt,
      high: target.high,
      wallet: target.wallet,
      ownedSkins: target.ownedSkins,
      equippedSkin: target.equippedSkin,
    };
    try {
      return btoa(JSON.stringify(payload));
    } catch {
      return JSON.stringify(payload);
    }
  }, [state]);

  const hasLegacy = React.useMemo(() => !!readLegacy(), []);

  return {
    profiles: state.profiles,
    activeId: state.activeId,
    active,
    updateActive,
    switchTo,
    addProfile,
    deleteProfile,
    renameProfile,
    setColor,
    importProfile,
    importLegacy,
    exportProfile,
    hasLegacy,
  };
}

// ── ProfileChip — small avatar shown in home header ───────────────────
function ProfileChip({ profile, theme, onClick }) {
  const initial = (profile.name || '?').trim().charAt(0).toUpperCase();
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'transparent', border: `1.5px solid ${theme.mute}`,
      borderRadius: 999, padding: '4px 10px 4px 4px',
      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: profile.color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Space Grotesk", system-ui',
        fontWeight: 800, fontSize: 13,
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}>{initial}</div>
      <div style={{
        fontFamily: '"Space Grotesk", system-ui',
        fontSize: 12, fontWeight: 600, color: theme.ink,
        maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{profile.name}</div>
    </button>
  );
}

// ── ProfileScreen — manage profiles ────────────────────────────────────
function ProfileScreen({ theme, profilesApi, onBack }) {
  const { profiles, activeId, switchTo, addProfile, deleteProfile, renameProfile,
          setColor, importProfile, importLegacy, exportProfile, hasLegacy } = profilesApi;

  const [mode, setMode] = React.useState('list'); // list | new | import | export | rename
  const [newName, setNewName] = React.useState('');
  const [importText, setImportText] = React.useState('');
  const [exportText, setExportText] = React.useState('');
  const [exportCopied, setExportCopied] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState(null); // profile or null
  const [renameValue, setRenameValue] = React.useState('');
  const [confirmDelete, setConfirmDelete] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  function showToast(msg, kind) {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 1800);
  }

  function handleAddSubmit() {
    const trimmed = newName.trim();
    if (!trimmed) { showToast('請輸入名稱', 'err'); return; }
    addProfile(trimmed);
    setNewName('');
    setMode('list');
    showToast('已建立新檔案', 'ok');
  }

  function handleImport() {
    try {
      const n = importProfile(importText);
      setImportText('');
      setMode('list');
      showToast(`已匯入 ${n} 個存檔`, 'ok');
    } catch (e) {
      showToast(e.message || '匯入失敗', 'err');
    }
  }

  function handleImportLegacy() {
    try {
      importLegacy();
      showToast('已從舊版存檔匯入', 'ok');
    } catch (e) {
      showToast(e.message || '匯入失敗', 'err');
    }
  }

  function handleExport(p) {
    const text = exportProfile(p.id);
    setExportText(text);
    setExportCopied(false);
    setMode('export');
  }

  function handleCopyExport() {
    try {
      navigator.clipboard.writeText(exportText);
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 1600);
    } catch {
      showToast('剪貼簿無法使用', 'err');
    }
  }

  return (
    <div style={{
      flex: 1, padding: '14px 18px 22px',
      display: 'flex', flexDirection: 'column', color: theme.ink,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: theme.ink,
          fontFamily: '"Space Grotesk", system-ui', fontSize: 14, fontWeight: 500,
          cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 2L4 7l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          返回
        </button>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10, letterSpacing: 1.5, color: theme.mute,
        }}>{profiles.length} 個存檔</div>
      </div>

      <div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10, letterSpacing: 2, fontWeight: 600,
          color: theme.mute, marginBottom: 2,
        }}>PROFILES · 玩家檔案</div>
        <div style={{
          fontFamily: '"Space Grotesk", system-ui',
          fontSize: 24, fontWeight: 700, lineHeight: 1, letterSpacing: -0.5,
          marginBottom: 10,
        }}>切換 / 管理</div>
      </div>

      {/* Action toolbar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <ToolbarBtn theme={theme} icon="+" label="新增" onClick={() => setMode('new')} primary />
        <ToolbarBtn theme={theme} icon="↓" label="匯入" onClick={() => setMode('import')} />
        {hasLegacy && (
          <ToolbarBtn theme={theme} icon="⤴" label="舊檔" onClick={handleImportLegacy} />
        )}
      </div>

      {/* Profile list */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 8,
        paddingBottom: 4,
      }}>
        {profiles.map(p => (
          <ProfileRow
            key={p.id} profile={p} theme={theme}
            active={p.id === activeId}
            canDelete={profiles.length > 1}
            onSwitch={() => { switchTo(p.id); showToast(`已切換到 ${p.name}`, 'ok'); }}
            onRename={() => { setRenameTarget(p); setRenameValue(p.name); setMode('rename'); }}
            onDelete={() => setConfirmDelete(p)}
            onExport={() => handleExport(p)}
            onColor={(c) => setColor(p.id, c)}
          />
        ))}
      </div>

      {/* Modal: new */}
      {mode === 'new' && (
        <Modal theme={theme} title="新增玩家檔案" onClose={() => { setMode('list'); setNewName(''); }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus
            placeholder="名稱（最多 16 字）"
            style={inputStyle(theme)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSubmit()} />
          <button onClick={handleAddSubmit} style={primaryBtn(theme)}>建立</button>
        </Modal>
      )}

      {/* Modal: import */}
      {mode === 'import' && (
        <Modal theme={theme} title="匯入存檔" onClose={() => { setMode('list'); setImportText(''); }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: theme.mute,
            marginBottom: 6, lineHeight: 1.5,
          }}>貼上匯出的字串（base64 或 JSON）</div>
          <textarea value={importText} onChange={(e) => setImportText(e.target.value)} autoFocus
            placeholder="貼上於此..." rows={5}
            style={{ ...inputStyle(theme), height: 110, resize: 'none', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }} />
          <button onClick={handleImport} style={primaryBtn(theme)}>匯入</button>
        </Modal>
      )}

      {/* Modal: export */}
      {mode === 'export' && (
        <Modal theme={theme} title="匯出存檔" onClose={() => { setMode('list'); setExportText(''); }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: theme.mute,
            marginBottom: 6, lineHeight: 1.5,
          }}>複製以下字串，保存到雲端筆記或其他裝置</div>
          <textarea value={exportText} readOnly rows={5}
            onFocus={(e) => e.target.select()}
            style={{ ...inputStyle(theme), height: 110, resize: 'none', fontFamily: '"JetBrains Mono", monospace', fontSize: 10, wordBreak: 'break-all' }} />
          <button onClick={handleCopyExport} style={primaryBtn(theme)}>
            {exportCopied ? '✓ 已複製' : '複製到剪貼簿'}
          </button>
        </Modal>
      )}

      {/* Modal: rename */}
      {mode === 'rename' && renameTarget && (
        <Modal theme={theme} title={`重新命名 · ${renameTarget.name}`} onClose={() => { setMode('list'); setRenameTarget(null); }}>
          <input value={renameValue} onChange={(e) => setRenameValue(e.target.value)} autoFocus
            placeholder="新名稱"
            style={inputStyle(theme)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                renameProfile(renameTarget.id, renameValue.trim());
                setMode('list'); setRenameTarget(null);
                showToast('已重新命名', 'ok');
              }
            }} />
          <button onClick={() => {
            renameProfile(renameTarget.id, renameValue.trim());
            setMode('list'); setRenameTarget(null);
            showToast('已重新命名', 'ok');
          }} style={primaryBtn(theme)}>儲存</button>
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <Modal theme={theme} title="刪除存檔" onClose={() => setConfirmDelete(null)}>
          <div style={{
            fontFamily: '"Space Grotesk", system-ui', fontSize: 13, lineHeight: 1.5,
            color: theme.ink, marginBottom: 12,
          }}>
            確定要刪除 <strong>{confirmDelete.name}</strong>？此操作無法復原。
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmDelete(null)} style={{ ...secondaryBtn(theme), flex: 1 }}>取消</button>
            <button onClick={() => {
              deleteProfile(confirmDelete.id);
              showToast('已刪除', 'ok');
              setConfirmDelete(null);
            }} style={{ ...dangerBtn(theme), flex: 1 }}>刪除</button>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: toast.kind === 'err' ? '#C8362A' : theme.ink,
          color: theme.appBg,
          padding: '8px 14px', borderRadius: 999,
          fontFamily: '"Space Grotesk", system-ui', fontSize: 12, fontWeight: 600,
          boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          animation: 'fadeUp 0.25s ease-out',
          zIndex: 30,
        }}>{toast.msg}</div>
      )}
    </div>
  );
}

function ProfileRow({ profile, theme, active, canDelete, onSwitch, onRename, onDelete, onExport, onColor }) {
  const initial = (profile.name || '?').trim().charAt(0).toUpperCase();
  return (
    <div style={{
      background: active ? theme.boardBg : theme.chipBg,
      border: active ? `2px solid ${theme.ink}` : `1.5px solid transparent`,
      borderRadius: 14, padding: 10,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => {
          const next = AVATAR_PALETTE[(AVATAR_PALETTE.indexOf(profile.color) + 1) % AVATAR_PALETTE.length];
          onColor(next);
        }} style={{
          width: 38, height: 38, borderRadius: '50%',
          background: profile.color, color: '#fff',
          border: `2px solid ${theme.boardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Space Grotesk", system-ui',
          fontWeight: 800, fontSize: 16, cursor: 'pointer',
          textShadow: '0 1px 2px rgba(0,0,0,0.25)',
          flex: '0 0 auto',
        }}>{initial}</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              fontFamily: '"Space Grotesk", system-ui', fontSize: 14, fontWeight: 700,
              color: theme.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{profile.name}</div>
            {active && <span style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 8, fontWeight: 700, letterSpacing: 1,
              color: theme.appBg, background: theme.ink,
              padding: '2px 5px', borderRadius: 4,
            }}>使用中</span>}
            {profile.imported && <span style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 8, fontWeight: 700, letterSpacing: 1,
              color: theme.mute, border: `1px solid ${theme.mute}`,
              padding: '1px 4px', borderRadius: 4,
            }}>匯入</span>}
            {profile.migrated && <span style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 8, fontWeight: 700, letterSpacing: 1,
              color: theme.mute, border: `1px solid ${theme.mute}`,
              padding: '1px 4px', borderRadius: 4,
            }}>舊檔</span>}
          </div>
          <div style={{
            display: 'flex', gap: 10, marginTop: 2,
            fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: theme.mute,
          }}>
            <span>BEST {String(profile.high).padStart(4, '0')}</span>
            <span style={{ color: theme.coinDark }}>${profile.wallet}</span>
            <span>{profile.ownedSkins?.length || 1} skins</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {!active && (
          <button onClick={onSwitch} style={miniBtn(theme, true)}>切換到</button>
        )}
        <button onClick={onRename} style={miniBtn(theme)}>命名</button>
        <button onClick={onExport} style={miniBtn(theme)}>匯出</button>
        {canDelete && (
          <button onClick={onDelete} style={{ ...miniBtn(theme), color: '#C8362A', borderColor: '#C8362A' }}>刪除</button>
        )}
      </div>
    </div>
  );
}

function ToolbarBtn({ theme, icon, label, onClick, primary }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '8px 6px',
      background: primary ? theme.ink : 'transparent',
      color: primary ? theme.appBg : theme.ink,
      border: primary ? 'none' : `1.5px solid ${theme.ink}`,
      borderRadius: 12,
      fontFamily: '"Space Grotesk", system-ui',
      fontSize: 12, fontWeight: 600,
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      WebkitTapHighlightColor: 'transparent',
    }}>
      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 800 }}>{icon}</span>
      {label}
    </button>
  );
}

function Modal({ theme, title, children, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 18, zIndex: 20,
      animation: 'fadeUp 0.2s ease-out',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: theme.appBg,
        borderRadius: 18, padding: 16,
        width: '100%', maxWidth: 320,
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        border: `1.5px solid ${theme.boardBorder}`,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 12,
        }}>
          <div style={{
            fontFamily: '"Space Grotesk", system-ui',
            fontSize: 15, fontWeight: 700, color: theme.ink,
          }}>{title}</div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: theme.mute,
            cursor: 'pointer', fontSize: 16, padding: 4, lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function inputStyle(theme) {
  return {
    width: '100%', boxSizing: 'border-box',
    background: theme.chipBg, color: theme.ink,
    border: `1.5px solid ${theme.boardBorder}`,
    borderRadius: 10, padding: '10px 12px',
    fontFamily: '"Space Grotesk", system-ui', fontSize: 14,
    outline: 'none', marginBottom: 10,
  };
}
function primaryBtn(theme) {
  return {
    width: '100%', padding: '12px 0',
    background: theme.ink, color: theme.appBg,
    border: 'none', borderRadius: 12,
    fontFamily: '"Space Grotesk", system-ui', fontSize: 14, fontWeight: 600,
    cursor: 'pointer',
  };
}
function secondaryBtn(theme) {
  return {
    padding: '10px 0',
    background: 'transparent', color: theme.ink,
    border: `1.5px solid ${theme.ink}`, borderRadius: 12,
    fontFamily: '"Space Grotesk", system-ui', fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
  };
}
function dangerBtn(theme) {
  return {
    padding: '10px 0',
    background: '#C8362A', color: '#fff',
    border: 'none', borderRadius: 12,
    fontFamily: '"Space Grotesk", system-ui', fontSize: 13, fontWeight: 600,
    cursor: 'pointer',
  };
}
function miniBtn(theme, primary) {
  return {
    background: primary ? theme.ink : 'transparent',
    color: primary ? theme.appBg : theme.ink,
    border: primary ? 'none' : `1.2px solid ${theme.ink}`,
    borderRadius: 8, padding: '5px 10px',
    fontFamily: '"Space Grotesk", system-ui', fontSize: 11, fontWeight: 600,
    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
  };
}

Object.assign(window, { useProfiles, ProfileScreen, ProfileChip });
