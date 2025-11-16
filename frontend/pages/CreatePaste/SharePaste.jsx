import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // via react-router-dom

export default function SharePaste() {
    const API_BASE = "http://localhost:3000/paste";
    const { id } = useParams();

    const [paste, setPaste] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPaste() {
            setLoading(true);
            const res = await fetch(`${API_BASE}/${encodeURIComponent(id)}`);
            const json = await res.json();
            setPaste(json);
            setLoading(false);
        }
        fetchPaste();
    }, [id]);

    // paste.error means not found or expired
    return (
        <div style={{
            maxWidth: 700, margin: "2em auto", fontFamily: "Menlo, Monaco, monospace",
            background: "#222", color: "#fff", padding: "2em", borderRadius: "8px"
        }}>
            {loading ? (
                <div>Loading...</div>
            ) : (
                paste && !paste.error ? (
                    <>
                        <h2 style={{ color: "#97c5f7" }}>{paste.title || "Untitled Paste"}</h2>
                        <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#151515", padding: "1em", borderRadius: "4px" }}>
                            {paste.content}
                        </pre>
                        <div style={{ marginTop: "1em", fontSize: "0.9em", color: "#aaa" }}>
                            ID: {paste.id} &nbsp;
                        </div>
                        {paste.date_of_expiry && (
                            <div style={{ fontSize: "0.8em", color: "#d66" }}>
                                Expires: {new Date(paste.date_of_expiry).toLocaleString()}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ color: "#d66", fontWeight: "bold" }}>
                        ERROR: Paste not found or expired
                    </div>
                )
            )}
        </div>
    );
}