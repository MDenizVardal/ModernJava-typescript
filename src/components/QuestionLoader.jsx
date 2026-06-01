// QuestionLoader.jsx – lets users supply their own questions via two async paths:
//   1. Paste JSON directly into a textarea
//   2. Provide a URL and fetch JSON from a remote endpoint
import { useState } from "react";
import { validateQuestions } from "../utils/validateQuestions";

// ─── Async helpers ────────────────────────────────────────────────────────────

// Wraps JSON.parse in a Promise so the whole load flow stays async/await.
// queueMicrotask schedules the work after the current call stack clears,
// keeping the UI responsive and preventing a brief freeze on large inputs.
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

// Fetches JSON from a URL.
// Separates network errors (e.g. CORS, no internet) from HTTP status errors
// so the user sees a useful message in both cases.
async function fetchJson(url) {
  if (!url.trim()) throw new Error("Please enter a URL.");
  let res;
  try {
    res = await fetch(url.trim());
  } catch {
    // fetch() itself throws only on network-level failures (no response at all).
    throw new Error("Network error — check the URL and that the server supports CORS.");
  }
  // fetch() does NOT throw on 4xx/5xx – we check ok manually.
  if (!res.ok)
    throw new Error(`Server returned HTTP ${res.status} (${res.statusText}).`);
  return res.json(); // parse the response body as JSON
}

// ─── Template ─────────────────────────────────────────────────────────────────

// Pre-filled example shown in the textarea placeholder and injected by "Use template".
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
  const [mode,     setMode]     = useState("paste"); // which tab is active
  const [jsonText, setJsonText] = useState("");       // textarea content
  const [url,      setUrl]      = useState("");       // URL input content
  const [status,   setStatus]   = useState(null);
  // status shape: { kind: "loading" | "error" | "success", message?, count? }

  // Reset status when the user switches tabs so stale errors don't linger.
  function switchMode(next) {
    setMode(next);
    setStatus(null);
  }

  // Main load handler – shared by both modes.
  async function handleLoad() {
    setStatus({ kind: "loading" });
    try {
      // Choose the right async parser depending on the active tab.
      const raw       = mode === "paste" ? await parseJsonAsync(jsonText) : await fetchJson(url);
      const questions = validateQuestions(raw); // throws on any schema problem

      setStatus({ kind: "success", count: questions.length });

      // Small delay so the user can read the "✓ N questions loaded!" message
      // before the panel closes automatically.
      await new Promise(r => setTimeout(r, 700));

      onLoad(questions); // hand validated questions up to WelcomeScreen → App
    } catch (err) {
      // Any error from parseJsonAsync, fetchJson, or validateQuestions
      // lands here and is shown directly to the user.
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
            {/* Clicking injects the template so users can see the exact expected format. */}
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
            // Allow pressing Enter to submit instead of clicking the button.
            onKeyDown={e => e.key === "Enter" && canSubmit && !isLoading && handleLoad()}
          />
          <p className="loader-hint">
            The endpoint must return a JSON array and allow CORS from this origin.
          </p>
        </div>
      )}

      {/* ── Status feedback ── */}
      {status && (
        <div className={`loader-status ${status.kind}`} role="status">
          {status.kind === "loading" && (
            <><span className="loader-spinner" aria-hidden="true" />Fetching questions…</>
          )}
          {status.kind === "error"   && <>⚠ {status.message}</>}
          {status.kind === "success" && (
            <>✓ {status.count} question{status.count !== 1 ? "s" : ""} loaded!</>
          )}
        </div>
      )}

      {/* ── Submit button ── */}
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
