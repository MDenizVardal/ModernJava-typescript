import { useState } from "react";
import { validateQuestions } from "../utils/validateQuestions";

// ─── async helpers ────────────────────────────────────────────────────────────

/** Parses JSON text on a microtask so the function is genuinely async. */
async function parseJsonAsync(text) {
  if (!text.trim())
    throw new Error("The text area is empty — paste your JSON questions first.");
  return new Promise((resolve, reject) =>
    queueMicrotask(() => {
      try { resolve(JSON.parse(text)); }
      catch (e) { reject(new Error(`Invalid JSON — ${e.message}`)); }
    })
  );
}

/** Fetches JSON from a URL with async/await and surfaces HTTP errors clearly. */
async function fetchJson(url) {
  if (!url.trim()) throw new Error("Please enter a URL.");
  let res;
  try {
    res = await fetch(url.trim());
  } catch {
    throw new Error("Network error — check the URL and that the server supports CORS.");
  }
  if (!res.ok)
    throw new Error(`Server returned HTTP ${res.status} (${res.statusText}).`);
  return res.json();
}

// ─── Template shown in the placeholder ───────────────────────────────────────

const TEMPLATE = `[
  {
    "text": "Which language runs natively in the browser?",
    "answers": [
      { "id": "a", "text": "Python"     },
      { "id": "b", "text": "Java"       },
      { "id": "c", "text": "JavaScript" },
      { "id": "d", "text": "C++"        }
    ],
    "correctId": "c",
    "category": "Technology",
    "difficulty": "easy",
    "explanation": "JavaScript is the only language browsers execute natively."
  }
]`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function QuestionLoader({ onLoad }) {
  const [mode,     setMode]     = useState("paste"); // "paste" | "url"
  const [jsonText, setJsonText] = useState("");
  const [url,      setUrl]      = useState("");
  const [status,   setStatus]   = useState(null);
  // status shape: { kind: "loading"|"error"|"success", message?: string, count?: number }

  function switchMode(next) {
    setMode(next);
    setStatus(null);
  }

  async function handleLoad() {
    setStatus({ kind: "loading" });
    try {
      const raw        = mode === "paste" ? await parseJsonAsync(jsonText) : await fetchJson(url);
      const questions  = validateQuestions(raw);
      setStatus({ kind: "success", count: questions.length });
      // Brief success flash so the user sees confirmation before the panel closes.
      await new Promise(r => setTimeout(r, 700));
      onLoad(questions);
    } catch (err) {
      setStatus({ kind: "error", message: err.message });
    }
  }

  const canSubmit = mode === "paste" ? jsonText.trim().length > 0 : url.trim().length > 0;
  const isLoading = status?.kind === "loading";

  return (
    <div className="question-loader">

      {/* ── Mode tabs ── */}
      <div className="loader-tabs">
        <button
          className={`loader-tab ${mode === "paste" ? "active" : ""}`}
          onClick={() => switchMode("paste")}
        >
          📋 Paste JSON
        </button>
        <button
          className={`loader-tab ${mode === "url" ? "active" : ""}`}
          onClick={() => switchMode("url")}
        >
          🌐 Fetch URL
        </button>
      </div>

      {/* ── Paste mode ── */}
      {mode === "paste" && (
        <div className="loader-body">
          <div className="loader-row-header">
            <span className="loader-label">Paste a JSON array of questions:</span>
            <button
              className="btn-use-template"
              onClick={() => { setJsonText(TEMPLATE); setStatus(null); }}
            >
              Use template
            </button>
          </div>
          <textarea
            className="loader-textarea"
            placeholder={TEMPLATE}
            value={jsonText}
            onChange={e => { setJsonText(e.target.value); setStatus(null); }}
            spellCheck={false}
            rows={9}
          />
          <p className="loader-hint">
            Required: <code>text</code>, <code>answers</code>, <code>correctId</code>.
            &nbsp;Optional: <code>category</code>, <code>difficulty</code>, <code>explanation</code>.
          </p>
        </div>
      )}

      {/* ── URL mode ── */}
      {mode === "url" && (
        <div className="loader-body">
          <label className="loader-label" htmlFor="loader-url-input">
            JSON endpoint URL:
          </label>
          <input
            id="loader-url-input"
            className="loader-url-input"
            type="url"
            placeholder="https://api.example.com/questions.json"
            value={url}
            onChange={e => { setUrl(e.target.value); setStatus(null); }}
            onKeyDown={e => e.key === "Enter" && canSubmit && !isLoading && handleLoad()}
          />
          <p className="loader-hint">
            The endpoint must return a JSON array and allow
            CORS from this origin.
          </p>
        </div>
      )}

      {/* ── Status ── */}
      {status && (
        <div className={`loader-status ${status.kind}`} role="status">
          {status.kind === "loading" && (
            <><span className="loader-spinner" aria-hidden="true" />Fetching questions…</>
          )}
          {status.kind === "error" && <>⚠ {status.message}</>}
          {status.kind === "success" && (
            <>✓ {status.count} question{status.count !== 1 ? "s" : ""} loaded!</>
          )}
        </div>
      )}

      {/* ── Action ── */}
      <button
        className="btn-load"
        onClick={handleLoad}
        disabled={!canSubmit || isLoading}
      >
        {isLoading ? "Loading…" : mode === "url" ? "Fetch & Load" : "Load Questions"}
      </button>

    </div>
  );
}
