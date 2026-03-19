"use client";

import { useEffect, useMemo, useState } from "react";

type StatusType = "PLAN" | "WATCHING" | "WATCHED";
type ViewMode = "gallery" | "list";
type TypeFilter = "ALL" | "Movie" | "Series";

type SearchItem = {
  id: number;
  title: string;
  year: string;
  overview: string;
  poster: string;
  type: string;
  rating: number;
  url: string;
  genre: string[];
};

type ArchivedItem = {
  notionPageId: string;
  tmdbId: string;
  title: string;
  type: string;
  sourceUrl: string;
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 24,
              lineHeight: 1,
              padding: 0,
              opacity: active ? 1 : 0.32,
              color: active ? "#ffd54f" : "#8a8a8a",
            }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

function StatusButtons({
  value,
  onChange,
}: {
  value: StatusType;
  onChange: (next: StatusType) => void;
}) {
  const options: StatusType[] = ["PLAN", "WATCHING", "WATCHED"];

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((status) => {
        const active = value === status;

        return (
          <button
            key={status}
            type="button"
            onClick={() => onChange(status)}
            style={{
              border: active ? "1px solid #f5f5f5" : "1px solid #3a3a3a",
              background: active ? "#f5f5f5" : "#161616",
              color: active ? "#111" : "#d8d8d8",
              borderRadius: 9999,
              padding: "8px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {status}
          </button>
        );
      })}
    </div>
  );
}

function ControlButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: active ? "1px solid #f5f5f5" : "1px solid #2b2b2b",
        background: active ? "#f5f5f5" : "#101010",
        color: active ? "#111" : "#d7d7d7",
        borderRadius: 9999,
        padding: "10px 14px",
        fontSize: 13,
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function ArchiveOverlay({
  phase,
  title,
  onClose,
}: {
  phase: "saving" | "success" | "";
  title: string;
  onClose: () => void;
}) {
  if (!phase) return null;

  const isSaving = phase === "saving";

  return (
    <div
      onClick={!isSaving ? onClose : undefined}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          border: "1px solid #2e2e2e",
          background: "#070707",
          borderRadius: 20,
          padding: "36px 28px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.18em",
            color: "#8f8f8f",
            marginBottom: 18,
          }}
        >
          ARCHIVE SYSTEM
        </div>

        <div
          style={{
            fontSize: 30,
            fontWeight: 800,
            marginBottom: 12,
            color: isSaving ? "#f5f5f5" : "#d7ffd9",
          }}
        >
          {isSaving ? "ACCESSING ARCHIVE..." : "ARCHIVE_SUCCESS"}
        </div>

        <div style={{ color: "#aaaaaa", fontSize: 15, lineHeight: 1.6 }}>
          {isSaving
            ? `${title} 기록을 전송하는 중입니다.`
            : `DATA TRANSFER COMPLETE [OK] · ${title}`}
        </div>

        {!isSaving && (
          <div
            style={{
              marginTop: 22,
              color: "#727272",
              fontSize: 12,
              letterSpacing: "0.12em",
            }}
          >
            CLICK ANYWHERE TO CLOSE
          </div>
        )}
      </div>
    </div>
  );
}

function DetailModal({
  item,
  status,
  setStatus,
  score,
  setScore,
  isSaving,
  isArchived,
  onClose,
  onArchive,
}: {
  item: SearchItem | null;
  status: StatusType;
  setStatus: (next: StatusType) => void;
  score: number;
  setScore: (next: number) => void;
  isSaving: boolean;
  isArchived: boolean;
  onClose: () => void;
  onArchive: () => void;
}) {
  if (!item) return null;

  const mobile = typeof window !== "undefined" && window.innerWidth < 840;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        zIndex: 1500,
        display: "flex",
        alignItems: mobile ? "stretch" : "center",
        justifyContent: "center",
        padding: mobile ? 0 : 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: mobile ? "100%" : 960,
          height: mobile ? "100%" : "auto",
          background: "#0a0a0a",
          border: mobile ? "none" : "1px solid #202020",
          borderRadius: mobile ? 0 : 28,
          overflow: "auto",
          boxShadow: mobile ? "none" : "0 30px 90px rgba(0,0,0,0.6)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "minmax(280px, 360px) 1fr",
          }}
        >
          <div style={{ background: "#111", minHeight: mobile ? 280 : 520 }}>
            {item.poster ? (
              <img
                src={item.poster}
                alt={item.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: mobile ? 280 : 520,
                  background:
                    "linear-gradient(135deg, #1c1c1c 0%, #090909 100%)",
                }}
              />
            )}
          </div>

          <div style={{ padding: mobile ? 20 : 28 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.16em",
                    color: "#8e8e8e",
                    marginBottom: 10,
                  }}
                >
                  ARCHIVE ENTRY
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: mobile ? 30 : 42,
                    lineHeight: 1.04,
                    fontWeight: 800,
                  }}
                >
                  {item.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  border: "1px solid #313131",
                  background: "#111",
                  color: "#d7d7d7",
                  borderRadius: 9999,
                  width: 40,
                  height: 40,
                  cursor: "pointer",
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 18,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  padding: "7px 11px",
                  borderRadius: 9999,
                  background: "#151515",
                  border: "1px solid #2b2b2b",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {item.type}
              </span>
              <span style={{ color: "#bdbdbd", fontSize: 14 }}>
                {item.year || "연도 미상"}
              </span>
              {isArchived && (
                <span
                  style={{
                    padding: "7px 11px",
                    borderRadius: 9999,
                    background: "#102315",
                    border: "1px solid #24442d",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#b9efc0",
                  }}
                >
                  ARCHIVED
                </span>
              )}
            </div>

            <p
              style={{
                color: "#b8b8b8",
                lineHeight: 1.7,
                fontSize: 15,
                marginBottom: 24,
              }}
            >
              {item.overview || "줄거리 정보가 아직 없어요."}
            </p>

            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "#8e8e8e",
                  marginBottom: 9,
                  fontWeight: 700,
                }}
              >
                STATUS
              </div>
              <StatusButtons value={status} onChange={setStatus} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontSize: 12,
                  color: "#8e8e8e",
                  marginBottom: 9,
                  fontWeight: 700,
                }}
              >
                MY RATING
              </div>
              <StarRating value={score} onChange={setScore} />
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={onArchive}
                disabled={isSaving || isArchived}
                style={{
                  flex: 1,
                  minWidth: 200,
                  border: "1px solid #343434",
                  background: isArchived ? "#1a251d" : isSaving ? "#1b1b1b" : "#f5f5f5",
                  color: isArchived ? "#8fd49a" : isSaving ? "#8f8f8f" : "#111",
                  borderRadius: 16,
                  padding: "15px 18px",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: isSaving || isArchived ? "default" : "pointer",
                }}
              >
                {isArchived ? "ALREADY ARCHIVED" : isSaving ? "ACCESSING ARCHIVE..." : "ARCHIVE REEL"}
              </button>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  border: "1px solid #343434",
                  color: "#d8d8d8",
                  textDecoration: "none",
                  borderRadius: 16,
                  padding: "15px 16px",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                SOURCE ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string>("");

  const [statusById, setStatusById] = useState<Record<string, StatusType>>({});
  const [scoreById, setScoreById] = useState<Record<string, number>>({});

  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null);
  const [overlayPhase, setOverlayPhase] = useState<"saving" | "success" | "">("");

  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("gallery");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [genreFilter, setGenreFilter] = useState<string>("ALL");

  const loadLibrary = async () => {
    try {
      const res = await fetch("/api/library");
      if (!res.ok) return;
      const data = await res.json();
      setArchivedItems(data);
    } catch (e) {
      console.error("library load error", e);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const archivedKeySet = useMemo(() => {
    return new Set(
      archivedItems.map((item) => `${item.type}-${item.tmdbId}`)
    );
  }, [archivedItems]);

  const search = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const data = await res.json();

      const enriched = data.map((item: SearchItem) => ({
        ...item,
        genre: Array.isArray(item.genre) ? item.genre : [],
      }));

      setResults(enriched);
    } catch (e) {
      console.error(e);
      setError("검색 중 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  };

  const archiveItem = async (item: SearchItem) => {
    const itemKey = `${item.type}-${item.id}`;
    const archivedCompareKey = `${item.type}-${item.id}`;

    if (archivedKeySet.has(archivedCompareKey)) {
      alert("이미 저장된 작품이에요.");
      return;
    }

    const selectedStatus = statusById[itemKey] || "WATCHED";
    const selectedScore = scoreById[itemKey] || 0;

    try {
      setSavingId(itemKey);
      setOverlayPhase("saving");
      setError("");

      const res = await fetch("/api/archive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          status: selectedStatus,
          rating: selectedScore,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "노션 저장 실패");
      }

      setOverlayPhase("success");
      await loadLibrary();
      setTimeout(() => {
        setSelectedItem(null);
      }, 300);
    } catch (e: any) {
      console.error(e);
      setOverlayPhase("");
      alert(`저장 실패: ${e.message || "오류"}`);
    } finally {
      setSavingId("");
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedItem(null);
        setOverlayPhase("");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const genreOptions = useMemo(() => {
    const set = new Set<string>();
    results.forEach((item) => {
      (item.genre || []).forEach((g) => set.add(g));
    });
    return ["ALL", ...Array.from(set)];
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const typeMatch = typeFilter === "ALL" || item.type === typeFilter;
      const genreMatch =
        genreFilter === "ALL" || (item.genre || []).includes(genreFilter);
      return typeMatch && genreMatch;
    });
  }, [results, typeFilter, genreFilter]);

  const hasResults = filteredResults.length > 0;
  const mobile = typeof window !== "undefined" && window.innerWidth < 840;

  const selectedKey = selectedItem ? `${selectedItem.type}-${selectedItem.id}` : "";
  const selectedStatus = selectedKey
    ? statusById[selectedKey] || "WATCHED"
    : "WATCHED";
  const selectedScore = selectedKey ? scoreById[selectedKey] || 0 : 0;
  const selectedSaving = savingId === selectedKey;
  const selectedArchived = selectedItem
    ? archivedKeySet.has(`${selectedItem.type}-${selectedItem.id}`)
    : false;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#f5f5f5",
        padding: mobile ? "24px 16px 56px" : "48px 32px 80px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 15,
              color: "#9b9b9b",
              marginBottom: 10,
              letterSpacing: "0.08em",
            }}
          >
            PERSONAL ARCHIVE
          </div>
          <h1
            style={{
              fontSize: mobile ? 40 : 56,
              lineHeight: 1,
              fontWeight: 800,
              margin: 0,
            }}
          >
            OTT 기록
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="작품명을 검색하세요"
            style={{
              width: mobile ? "100%" : 420,
              maxWidth: "100%",
              padding: "16px 18px",
              borderRadius: 16,
              border: "1px solid #2f2f2f",
              background: "#0b0b0b",
              color: "#f5f5f5",
              fontSize: 16,
              outline: "none",
            }}
          />
          <button
            onClick={search}
            style={{
              padding: "16px 22px",
              borderRadius: 16,
              border: "1px solid #2f2f2f",
              background: "#151515",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            검색
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 26,
          }}
        >
          <ControlButton
            active={viewMode === "gallery"}
            onClick={() => setViewMode("gallery")}
          >
            갤러리
          </ControlButton>
          <ControlButton
            active={viewMode === "list"}
            onClick={() => setViewMode("list")}
          >
            리스트
          </ControlButton>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            style={{
              borderRadius: 9999,
              padding: "10px 14px",
              background: "#101010",
              color: "#f5f5f5",
              border: "1px solid #2b2b2b",
            }}
          >
            <option value="ALL">전체 타입</option>
            <option value="Movie">Movie</option>
            <option value="Series">Series</option>
          </select>

          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            style={{
              borderRadius: 9999,
              padding: "10px 14px",
              background: "#101010",
              color: "#f5f5f5",
              border: "1px solid #2b2b2b",
            }}
          >
            {genreOptions.map((genre) => (
              <option key={genre} value={genre}>
                {genre === "ALL" ? "전체 장르" : genre}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p style={{ color: "#bdbdbd", marginBottom: 24 }}>
            ACCESSING ARCHIVE...
          </p>
        )}

        {error && (
          <p style={{ color: "#ff6b6b", marginBottom: 24 }}>{error}</p>
        )}

        {!loading && !hasResults && (
          <div
            style={{
              border: "1px solid #1e1e1e",
              background: "#090909",
              borderRadius: 24,
              padding: "40px 28px",
              color: "#8f8f8f",
            }}
          >
            검색해서 기록할 작품을 불러와보세요.
          </div>
        )}

        {viewMode === "gallery" ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: mobile
                ? "1fr"
                : "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {filteredResults.map((item) => {
              const itemKey = `${item.type}-${item.id}`;
              const isArchived = archivedKeySet.has(`${item.type}-${item.id}`);

              return (
                <article
                  key={itemKey}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    background: "#0b0b0b",
                    border: "1px solid #1f1f1f",
                    borderRadius: 28,
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "16 / 9",
                      background: "#111",
                      overflow: "hidden",
                    }}
                  >
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          filter: "brightness(0.88)",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          background:
                            "linear-gradient(135deg, #1b1b1b 0%, #0a0a0a 100%)",
                        }}
                      />
                    )}

                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.82) 8%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.12) 100%)",
                      }}
                    />

                    <div
                      style={{
                        position: "absolute",
                        left: 18,
                        right: 18,
                        bottom: 16,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 10px",
                            borderRadius: 9999,
                            background: "rgba(255,255,255,0.12)",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {item.type}
                        </span>
                        <span style={{ color: "#d1d1d1", fontSize: 12 }}>
                          {item.year || "연도 미상"}
                        </span>
                        {isArchived && (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 10px",
                              borderRadius: 9999,
                              background: "rgba(88, 160, 103, 0.22)",
                              border: "1px solid rgba(88, 160, 103, 0.35)",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#ccf1d1",
                            }}
                          >
                            ARCHIVED
                          </span>
                        )}
                      </div>

                      <h2
                        style={{
                          margin: 0,
                          fontSize: 28,
                          lineHeight: 1.1,
                          fontWeight: 800,
                        }}
                      >
                        {item.title}
                      </h2>
                    </div>
                  </div>

                  <div style={{ padding: 20 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: "#b7b7b7",
                        minHeight: 66,
                      }}
                    >
                      {item.overview
                        ? item.overview.slice(0, 120) +
                          (item.overview.length > 120 ? "..." : "")
                        : "줄거리 정보가 아직 없어요."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {filteredResults.map((item) => {
              const itemKey = `${item.type}-${item.id}`;
              const isArchived = archivedKeySet.has(`${item.type}-${item.id}`);

              return (
                <article
                  key={itemKey}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: mobile ? "92px 1fr" : "140px 1fr",
                    gap: 16,
                    background: "#0b0b0b",
                    border: "1px solid #1f1f1f",
                    borderRadius: 24,
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ background: "#111", minHeight: mobile ? 128 : 180 }}>
                    {item.poster ? (
                      <img
                        src={item.poster}
                        alt={item.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    ) : null}
                  </div>

                  <div style={{ padding: mobile ? 14 : 18 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        flexWrap: "wrap",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          padding: "6px 10px",
                          borderRadius: 9999,
                          background: "#151515",
                          border: "1px solid #2b2b2b",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {item.type}
                      </span>
                      <span style={{ color: "#bdbdbd", fontSize: 12 }}>
                        {item.year || "연도 미상"}
                      </span>
                      {isArchived && (
                        <span
                          style={{
                            padding: "6px 10px",
                            borderRadius: 9999,
                            background: "#102315",
                            border: "1px solid #24442d",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#b9efc0",
                          }}
                        >
                          ARCHIVED
                        </span>
                      )}
                    </div>

                    <h3
                      style={{
                        margin: "0 0 8px",
                        fontSize: mobile ? 20 : 24,
                        fontWeight: 800,
                      }}
                    >
                      {item.title}
                    </h3>

                    <p
                      style={{
                        margin: 0,
                        color: "#b7b7b7",
                        lineHeight: 1.6,
                        fontSize: 14,
                      }}
                    >
                      {item.overview
                        ? item.overview.slice(0, mobile ? 80 : 180) +
                          (item.overview.length > (mobile ? 80 : 180) ? "..." : "")
                        : "줄거리 정보가 아직 없어요."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <DetailModal
        item={selectedItem}
        status={selectedStatus}
        setStatus={(next) => {
          if (!selectedItem) return;
          const key = `${selectedItem.type}-${selectedItem.id}`;
          setStatusById((prev) => ({ ...prev, [key]: next }));
        }}
        score={selectedScore}
        setScore={(next) => {
          if (!selectedItem) return;
          const key = `${selectedItem.type}-${selectedItem.id}`;
          setScoreById((prev) => ({ ...prev, [key]: next }));
        }}
        isSaving={selectedSaving}
        isArchived={selectedArchived}
        onClose={() => setSelectedItem(null)}
        onArchive={() => {
          if (selectedItem) archiveItem(selectedItem);
        }}
      />

      <ArchiveOverlay
        phase={overlayPhase}
        title={selectedItem?.title || ""}
        onClose={() => {
          setOverlayPhase("");
          setSelectedItem(null);
        }}
      />
    </main>
  );
}
