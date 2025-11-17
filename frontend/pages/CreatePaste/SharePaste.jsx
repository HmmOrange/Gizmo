import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function SharePaste() {
    const API_BASE = "http://localhost:3000/paste";
    const { id } = useParams();

    const [paste, setPaste] = useState(null);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [needsPassword, setNeedsPassword] = useState(false);
    const [error, setError] = useState("");

    const fetchPaste = async (pw = "") => {
        setLoading(true);
        let url = `${API_BASE}/${encodeURIComponent(id)}`;
        if (pw) url += `?password=${encodeURIComponent(pw)}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.error === "Password required or incorrect") {
            setNeedsPassword(true);
            setPaste(null);
        } else if (json.error) {
            setError(json.error);
            setPaste(null);
            setNeedsPassword(false);
        } else {
            setPaste(json);
            setNeedsPassword(false);
            setError("");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPaste();
    }, [id]);

    const onSubmitPassword = (e) => {
        e.preventDefault();
        fetchPaste(password);
    };

    return (
        <div style={{
            maxWidth: 700, margin: "2em auto", fontFamily: "Menlo, Monaco, monospace",
            background: "#222", color: "#fff", padding: "2em", borderRadius: "8px"
        }}>
            {loading && <div>Loading...</div>}
            {!loading && needsPassword && (
                <form onSubmit={onSubmitPassword}>
                    <div style={{ marginBottom: "1em", color: "#d66" }}>
                        This paste is PRIVATE and requires a password.
                    </div>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ padding: "0.5em", marginBottom: "1em" }}
                    />
                    <button type="submit">View Paste</button>
                    {error && <div style={{ color: "#d66" }}>{error}</div>}
                </form>
            )}
            {!loading && paste && (
                <>
                    <h2 style={{ color: "#97c5f7" }}>
                        {paste.title || "Untitled Paste"}
                        {paste.private && " (PRIVATE)"}
                    </h2>
                    <pre style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        background: "#151515",
                        padding: "1em",
                        borderRadius: "4px"
                    }}>{paste.content}</pre>
                    <div style={{ marginTop: "1em", fontSize: "0.9em", color: "#aaa" }}>
                        ID: {paste.id} &nbsp;|&nbsp; {paste.views} views
                    </div>
                    {paste.date_of_expiry && (
                        <div style={{ fontSize: "0.8em", color: "#d66" }}>
                            Expires: {new Date(paste.date_of_expiry).toLocaleString()}
                        </div>
                    )}
                </>
            )}
            {error && !needsPassword && (
                <div style={{ color: "#d66", fontWeight: "bold" }}>ERROR: {error}</div>
            )}
        </div>
    );
}