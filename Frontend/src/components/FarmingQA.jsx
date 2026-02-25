import { useState } from "react";

const FARMING_QA = [
  {
    q: "My crops are yellowing — what could be wrong?",
    a: "Yellowing leaves (chlorosis) often indicate nitrogen deficiency. Organic manure is rich in nitrogen — apply well-composted manure around the root zone. Also check soil pH; values outside 6.0–7.0 lock out nutrients even when they're present.",
  },
  {
    q: "How do I know if my soil needs more organic matter?",
    a: "Signs include poor water retention, hard-crusted surface after rain, low earthworm activity, and weak plant growth. A simple squeeze test: moist healthy soil should clump loosely, not crack or crumble. Regular manure application improves all of these.",
  },
  {
    q: "How often should I apply manure to my fields?",
    a: "For most crops, apply composted manure once per growing season before planting. Avoid fresh manure near harvest time (90-day rule for food safety). Over-application can cause nutrient runoff, so more is not always better.",
  },
  {
    q: "What's the difference between fresh and composted manure?",
    a: "Fresh manure is high in nitrogen but can burn crops and harbor pathogens. Composted manure is safer, more stable, and releases nutrients slowly. Always prefer composted manure for direct field application.",
  },
  {
    q: "My plants are wilting even though I'm watering regularly.",
    a: "Overwatering causes root rot, which mimics drought stress. Check if soil is waterlogged. Organic matter from manure improves drainage and aeration. Also check for root pests like nematodes or fungal infections.",
  },
  {
    q: "How do I reduce my dependence on chemical fertilizers?",
    a: "Transition gradually by introducing composted manure, cover cropping (legumes fix nitrogen), and crop rotation. Pair with soil testing so you know exactly what's missing rather than applying chemicals broadly.",
  },
  {
    q: "What crops benefit most from manure application?",
    a: "Heavy feeders like maize, sorghum, cabbage, tomatoes, and leafy greens respond exceptionally well. Root crops like carrots prefer less — too much nitrogen causes forking. Legumes need very little since they fix their own.",
  },
  {
    q: "Is manure from all animals equally beneficial?",
    a: "No. Poultry manure is highest in nitrogen and phosphorus but can burn if not composted. Cattle manure is well-balanced and easier to handle. Goat and sheep manure is drier and easy to compost. Mix sources for a balanced nutrient profile.",
  },
  {
    q: "How do I prevent pests without chemical pesticides?",
    a: "Healthy soil = resilient plants. Regular manure keeps soil microbiomes active, which naturally suppresses some pests. Companion planting (marigolds repel nematodes), crop rotation, and physical barriers also help significantly.",
  },
  {
    q: "Why is my soil compacting and how do I fix it?",
    a: "Compaction comes from heavy machinery, tillage, or low organic matter. Adding composted manure regularly rebuilds soil structure. Earthworms thrive in organic-rich soil and naturally aerate it. Minimize tillage and avoid working wet soil.",
  },
];

const getSavedQuestions = () =>
  JSON.parse(localStorage.getItem("farmQuestions") || "[]");

const saveQuestion = (q) => {
  const qs = getSavedQuestions();
  qs.unshift({ text: q, date: new Date().toLocaleDateString() });
  localStorage.setItem("farmQuestions", JSON.stringify(qs.slice(0, 20)));
};

export default function FarmingQA() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(null);
  const [customQ, setCustomQ] = useState("");
  const [savedQs, setSavedQs] = useState(getSavedQuestions());

  const filtered = FARMING_QA.filter(
    (item) =>
      search === "" ||
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!customQ.trim()) return;
    saveQuestion(customQ.trim());
    setSavedQs(getSavedQuestions());
    setCustomQ("");
  };

  return (
    <div className="qa-page">
      <div className="offline-badge">
        <span className="offline-dot" />
        Available Offline
      </div>
      <div className="section-title">Farming Help Centre</div>
      <div className="section-sub">
        Common farming issues answered. This page works without internet.
      </div>
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search by topic — soil, manure, pests, watering…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="qa-list">
        {filtered.length === 0 && (
          <div className="no-results">No results for "{search}". Try a different keyword.</div>
        )}
        {filtered.map((item, i) => (
          <div
            key={i}
            className={`qa-item ${open === i ? "open" : ""}`}
          >
            <div className="qa-question" onClick={() => setOpen(open === i ? null : i)}>
              <div className="qa-q-text">{item.q}</div>
              <div className="qa-chevron">▾</div>
            </div>
            <div className="qa-answer">
              <div className="qa-answer-text">{item.a}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="custom-question-box">
        <div className="cq-title">Save a Question for Later</div>
        <div className="cq-sub">
          Type any farming question to save it locally — you'll see it here when you come back, even offline.
        </div>
        <div className="cq-row">
          <input
            className="cq-input"
            placeholder="e.g. Why are my tomato leaves curling?"
            value={customQ}
            onChange={(e) => setCustomQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button className="cq-btn" onClick={handleSave}>Save</button>
        </div>
        {savedQs.length > 0 && (
          <div className="saved-questions">
            {savedQs.slice(0, 5).map((q, i) => (
              <div className="saved-q-item" key={i}>
                <div className="saved-q-text">{q.text}</div>
                <div className="saved-q-tag">Saved {q.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
