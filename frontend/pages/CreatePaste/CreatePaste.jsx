import { useState } from "react";

export default function CreatePaste() {
  const API_BASE = "http://localhost:3000/paste";

  const [form, setForm] = useState({
    title: "",
    content: "",
    exposure: "PUBLIC",
    date_of_expiry: "",
  });

  const [createResult, setCreateResult] = useState(null);
  const [allPastes, setAllPastes] = useState([]);
  const [fetchId, setFetchId] = useState("");
  const [fetchResult, setFetchResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      content: form.content,
      exposure: form.exposure,
    };
    if (form.date_of_expiry) payload.date_of_expiry = form.date_of_expiry;

    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    setCreateResult(json);
  };

  const loadAll = async () => {
    const res = await fetch(API_BASE);
    const json = await res.json();
    // setAllPastes(json.pastes || []);
    setAllPastes(Array.isArray(json) ? json : json.pastes || []);
  };

  const fetchPaste = async () => {
    if (!fetchId.trim()) {
      setFetchResult({ error: "Paste ID required." });
      return;
    }

    const res = await fetch(`${API_BASE}/${encodeURIComponent(fetchId)}`);
    const json = await res.json();
    setFetchResult(json);
  };

  return (
    <div style={{ fontFamily: "Arial", margin: "2em" }}>
      <h2>Create a Paste</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
        />

        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={form.content}
          onChange={handleChange}
          required
          style={{ minHeight: "80px" }}
        />

        <label htmlFor="exposure">Exposure</label>
        <select
          id="exposure"
          name="exposure"
          value={form.exposure}
          onChange={handleChange}
        >
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </select>

        <label htmlFor="date_of_expiry">Expiry Date (optional)</label>
        <input
          type="datetime-local"
          id="date_of_expiry"
          name="date_of_expiry"
          value={form.date_of_expiry}
          onChange={handleChange}
        />

        <button type="submit">Create Paste</button>
      </form>

      <div id="createResult">
        {createResult && (
          <div
            style={{
              background: "#f7f7f7",
              padding: "1em",
              border: "1px solid #ccc",
              marginTop: "1em",
            }}
          >
            <pre>{JSON.stringify(createResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <hr />
      <h2>All Public Pastes</h2>
      <button onClick={loadAll}>Load All</button>
      <div id="allPastes" style={{ marginTop: "1em" }}>
        {allPastes.length ? (
          allPastes.map((p) => (
            <div
              key={p.id}
              style={{
                background: "#f7f7f7",
                padding: "1em",
                border: "1px solid #ccc",
                marginBottom: "1em",
              }}
            >
              <b>{p.title || "No Title"}</b>
              <br />
              {p.content}
              <br />
              <small>ID: {p.id}</small>
            </div>
          ))
        ) : (
          <div>No pastes found.</div>
        )}
      </div>

      <hr />
      <h2>Fetch Paste by ID</h2>
      <input
        type="text"
        value={fetchId}
        onChange={(e) => setFetchId(e.target.value)}
        placeholder="Paste ID"
      />
      <button onClick={fetchPaste}>Fetch</button>

      <div id="fetchResult" style={{ marginTop: "1em" }}>
        {fetchResult && (
          <div
            style={{
              background: "#f7f7f7",
              padding: "1em",
              border: "1px solid #ccc",
            }}
          >
            {fetchResult.error ? (
              <>ERROR: {fetchResult.error}</>
            ) : (
              <pre>{JSON.stringify(fetchResult, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
