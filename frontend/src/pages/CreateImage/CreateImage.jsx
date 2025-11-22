import React, { useRef, useEffect, useState, useCallback } from "react";

const CreateImage = ({ onClose }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);

  // Global states
  const [images, setImages] = useState([]); // mỗi ảnh có: file, preview, name, slug, canvasState, historyStep, tool, color, size
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [shareLink, setShareLink] = useState("");

  // Album options
  const [addToAlbum, setAddToAlbum] = useState(true);
  const [createNewAlbum, setCreateNewAlbum] = useState(true);
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");

  const mockAlbums = [
    { _id: "1", title: "Vacation 2025" },
    { _id: "2", title: "Food & Drinks" },
    { _id: "3", title: "Memes Collection" },
  ];

  const MAX_WIDTH = 900;
  const MAX_HEIGHT = 700;

  // === CANVAS INIT – chỉ khi có canvas và ảnh được chọn ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || selectedIdx === null) return;

    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    const imgData = images[selectedIdx];
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height, 1);
      const w = img.width * ratio;
      const h = img.height * ratio;

      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      // Restore drawing
      if (imgData.canvasState.length > 0) {
        const last = imgData.canvasState[imgData.historyStep];
        if (last) {
          const overlay = new Image();
          overlay.onload = () => ctx.drawImage(overlay, 0, 0, w, h);
          overlay.src = last;
        }
      }

      // Restore tool settings
      ctx.strokeStyle = imgData.tool === "eraser" ? "#ffffff" : (imgData.color || "#000000");
      ctx.lineWidth = imgData.size || 5;
    };
    img.src = imgData.preview;
  }, [selectedIdx]);

  // Update stroke khi tool/color/size thay đổi
  useEffect(() => {
    if (ctxRef.current && selectedIdx !== null) {
      const imgData = images[selectedIdx];
      ctxRef.current.strokeStyle = imgData.tool === "eraser" ? "#ffffff" : imgData.color;
      ctxRef.current.lineWidth = imgData.size;
    }
  }, [images, selectedIdx]);

  // Save state
  const saveState = useCallback(() => {
    if (selectedIdx === null || !canvasRef.current) return;
    const dataURL = canvasRef.current.toDataURL();

    setImages(prev => {
      const updated = [...prev];
      const img = updated[selectedIdx];
      const newHistory = img.canvasState.slice(0, img.historyStep + 1);
      newHistory.push(dataURL);
      if (newHistory.length > 50) newHistory.shift();

      img.canvasState = newHistory;
      img.historyStep = newHistory.length - 1;
      img.tool = img.tool;
      img.color = img.color;
      img.size = img.size;
      return updated;
    });
  }, [selectedIdx]);

  // Undo / Redo
  const undo = () => {
    if (selectedIdx === null) return;
    const img = images[selectedIdx];
    if (img.historyStep <= 0) return;
    const newStep = img.historyStep - 1;
    setImages(prev => {
      const updated = [...prev];
      updated[selectedIdx].historyStep = newStep;
      return updated;
    });
    loadCurrentImage();
  };

  const redo = () => {
    if (selectedIdx === null) return;
    const img = images[selectedIdx];
    if (img.historyStep >= img.canvasState.length - 1) return;
    const newStep = img.historyStep + 1;
    setImages(prev => {
      const updated = [...prev];
      updated[selectedIdx].historyStep = newStep;
      return updated;
    });
    loadCurrentImage();
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveState();
  };

  // Load lại ảnh hiện tại (dùng cho undo/redo/switch)
  const loadCurrentImage = () => {
    if (selectedIdx === null) return;
    const imgData = images[selectedIdx];
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const ratio = Math.min(MAX_WIDTH / img.width, MAX_HEIGHT / img.height, 1);
      const w = img.width * ratio;
      const h = img.height * ratio;

      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      if (imgData.canvasState.length > 0) {
        const state = imgData.canvasState[imgData.historyStep];
        if (state) {
          const overlay = new Image();
          overlay.onload = () => ctx.drawImage(overlay, 0, 0, w, h);
          overlay.src = state;
        }
      }
    };
    img.src = imgData.preview;
  };

  // Upload multiple
  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      slug: "", // mỗi ảnh có slug riêng
      canvasState: [],
      historyStep: -1,
      tool: "pen",
      color: "#000000",
      size: 5
    }));

    setImages(prev => [...prev, ...newImages]);

    // Auto select first image (or the first of new batch)
    const newIdx = images.length;
    setSelectedIdx(newIdx);
  };

  const selectImage = (idx) => {
    if (selectedIdx !== null) saveState();
    setSelectedIdx(idx);
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    if (selectedIdx === idx) {
      setSelectedIdx(images.length <= 1 ? null : 0);
    } else if (selectedIdx > idx) {
      setSelectedIdx(selectedIdx - 1);
    }
  };

  const updateCurrentSlug = (value) => {
    if (selectedIdx === null) return;
    setImages(prev => {
      const updated = [...prev];
      updated[selectedIdx].slug = value;
      return updated;
    });
  };

  const updateTool = (newTool) => {
    if (selectedIdx === null) return;
    setImages(prev => {
      const updated = [...prev];
      updated[selectedIdx].tool = newTool;
      return updated;
    });
  };

  const updateColor = (newColor) => {
    if (selectedIdx === null) return;
    setImages(prev => {
      const updated = [...prev];
      updated[selectedIdx].color = newColor;
      return updated;
    });
  };

  const updateSize = (newSize) => {
    if (selectedIdx === null) return;
    setImages(prev => {
      const updated = [...prev];
      updated[selectedIdx].size = newSize;
      return updated;
    });
  };

  // Drawing
  const start = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x * scaleX, y * scaleY);
    isDrawing.current = true;
    saveState();
  };

  const draw = (e) => {
    if (!isDrawing.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x * scaleX, y * scaleY);
    ctx.stroke();
  };

  const stop = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
    }
  };

  const handleSaveAlbum = () => {
    if (images.length === 0) return alert("Please upload at least one image!");
    if (selectedIdx !== null) saveState();
    setIsUploading(true);
    setTimeout(() => {
      const link = `https://gizmo.app/album/${newAlbumTitle || "my-album-" + Date.now()}`;
      setShareLink(link);
      alert("Album created successfully!\n" + link);
      setIsUploading(false);
    }, 1800);
  };

  const currentImage = selectedIdx !== null ? images[selectedIdx] : null;

  return (
    <div style={{ display: "flex", gap: 24, padding: 20, background: "#f5f7fa", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* LEFT: Upload + Album */}
      <div style={{ width: 380, flexShrink: 0, background: "white", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: 20 }}>
        <h2 style={{ margin: "0 0 20px", fontSize: 22 }}>Create New Album</h2>

        <label style={{ display: "block", background: "#3498db", color: "white", padding: 14, borderRadius: 8, textAlign: "center", cursor: "pointer", fontWeight: "bold" }}>
          Upload Images
          <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: "none" }} />
        </label>

        {/* Album settings */}
        <div style={{ marginTop: 20, padding: 16, background: "#f0f8ff", borderRadius: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: "bold" }}>
            <input type="checkbox" checked={addToAlbum} onChange={e => setAddToAlbum(e.target.checked)} />
            Add to Album
          </label>
          {addToAlbum && createNewAlbum && (
            <>
              <input type="text" placeholder="Album title" value={newAlbumTitle} onChange={e => setNewAlbumTitle(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 12, borderRadius: 6 }} />
              <textarea placeholder="Description (optional)" value={newAlbumDesc} onChange={e => setNewAlbumDesc(e.target.value)} rows={2} style={{ width: "100%", padding: 10, marginTop: 8, borderRadius: 6 }} />
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h4>Images ({images.length})</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => selectImage(i)} style={{ position: "relative", border: selectedIdx === i ? "3px solid #3498db" : "2px solid #eee", borderRadius: 8, overflow: "hidden", cursor: "pointer" }}>
                  <img src={img.preview} alt="" style={{ width: "100%", height: 100, objectFit: "cover" }} />
                  <button onClick={e => { e.stopPropagation(); removeImage(i); }} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.7)", color: "white", border: "none", borderRadius: "50%", width: 24, height: 24 }}>×</button>
                  {selectedIdx === i && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(52,152,219,0.9)", color: "white", textAlign: "center", fontSize: 12, padding: 4 }}>EDITING</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleSaveAlbum} disabled={isUploading || images.length === 0} style={{ marginTop: 24, width: "100%", padding: 16, background: (isUploading || images.length === 0) ? "#95a5a6" : "#27ae60", color: "white", border: "none", borderRadius: 10, fontSize: 18, fontWeight: "bold" }}>
          {isUploading ? "Saving..." : "Create Album & Share"}
        </button>

        {shareLink && (
          <div style={{ marginTop: 16, padding: 16, background: "#d4edda", borderRadius: 10, textAlign: "center" }}>
            <strong>Album ready!</strong><br />
            <a href={shareLink} target="_blank" rel="noopener noreferrer" style={{ color: "#27ae60" }}>{shareLink}</a>
          </div>
        )}
      </div>

      {/* RIGHT: Editor + Custom URL per image */}
      <div style={{ flex: 1, background: "white", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", padding: 20 }}>
        <h2 style={{ margin: "0 0 16px" }}>Edit Image</h2>

        {/* Custom URL cho ảnh hiện tại */}
        {currentImage && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 6 }}>Custom URL for this image (optional)</label>
            <input
              type="text"
              placeholder="my-cool-drawing"
              value={currentImage.slug}
              onChange={e => updateCurrentSlug(e.target.value)}
              style={{ width: "100%", padding: 12, border: "1px solid #ddd", borderRadius: 8, fontSize: 16 }}
            />
            <small style={{ color: "#777" }}>Final link: gizmo.app/i/{currentImage.slug || "auto-generated"}</small>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20, alignItems: "center" }}>
          <button onClick={() => updateTool("pen")} style={{ fontWeight: currentImage?.tool === "pen" ? "bold" : "normal", padding: "8px 16px" }}>Pen</button>
          <button onClick={() => updateTool("eraser")} style={{ fontWeight: currentImage?.tool === "eraser" ? "bold" : "normal", padding: "8px 16px" }}>Eraser</button>
          <input type="color" value={currentImage?.color || "#000000"} onChange={e => updateColor(e.target.value)} disabled={currentImage?.tool === "eraser"} />
          <input type="range" min="1" max="50" value={currentImage?.size || 5} onChange={e => updateSize(+e.target.value)} style={{ width: 140 }} />
          <span>{currentImage?.size || 5}px</span>
          <button onClick={undo} disabled={!currentImage || currentImage.historyStep <= 0}>Undo</button>
          <button onClick={redo} disabled={!currentImage || currentImage.historyStep >= currentImage.canvasState.length - 1}>Redo</button>
          <button onClick={clearCanvas} style={{ background: "#e74c3c", color: "white" }}>Clear</button>
        </div>

        <div style={{ textAlign: "center", background: "#fafafa", borderRadius: 12, padding: 40, minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {selectedIdx === null ? (
            <p style={{ color: "#888", fontSize: 20 }}>Upload and select an image to start editing</p>
          ) : (
            <canvas
              ref={canvasRef}
              style={{ border: "2px solid #ddd", borderRadius: 8, maxWidth: "100%", height: "auto", cursor: "crosshair", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
              onMouseDown={start}
              onMouseMove={draw}
              onMouseUp={stop}
              onMouseLeave={stop}
              onTouchStart={start}
              onTouchMove={draw}
              onTouchEnd={stop}
            />
          )}
        </div>
      </div>

      {onClose && <button onClick={onClose} style={{ position: "fixed", top: 20, right: 20, padding: "12px 24px", background: "#34495e", color: "white", border: "none", borderRadius: 8, fontWeight: "bold" }}>Close</button>}
    </div>
  );
};

export default CreateImage;