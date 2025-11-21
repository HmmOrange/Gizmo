// CreateImage.jsx - FINAL: Giữ nguyên Undo/Redo + Custom slug + Upload button
import React, { useRef, useEffect, useState, useCallback } from "react";
import axios from "axios";

const CreateImage = ({ onClose }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);

  // States
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [customSlug, setCustomSlug] = useState("");     // ← Người dùng nhập slug
  const [isUploading, setIsUploading] = useState(false);
  const [shareLink, setShareLink] = useState("");

  // Undo/Redo history
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const MAX_WIDTH = 900;
  const MAX_HEIGHT = 700;

  // Save current canvas state
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL();

    setHistory(prev => {
      const newHist = prev.slice(0, historyStep + 1);
      newHist.push(dataURL);
      if (newHist.length > 50) newHist.shift();
      setHistoryStep(newHist.length - 1);
      return newHist;
    });
  }, [historyStep]);

  // Restore canvas from history
  const restoreState = (step) => {
    if (history[step] === undefined) return;
    const img = new Image();
    img.onload = () => {
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[step];
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      restoreState(historyStep - 1);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      restoreState(historyStep + 1);
    }
  };

  // Init canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    canvas.width = MAX_WIDTH;
    canvas.height = MAX_HEIGHT;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    saveState(); // lưu trạng thái ban đầu
  }, []);

  // Update pen/eraser style
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctxRef.current.lineWidth = size;
    }
  }, [tool, color, size]);

  // Resize canvas + draw uploaded image
  const loadImageToCanvas = (img) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    let w = img.width;
    let h = img.height;
    if (w > MAX_WIDTH || h > MAX_HEIGHT) {
      const ratio = Math.min(MAX_WIDTH / w, MAX_HEIGHT / h);
      w *= ratio;
      h *= ratio;
    }

    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);

    setHistory([]);
    setHistoryStep(-1);
    saveState();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => loadImageToCanvas(img);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Drawing handlers
  const start = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x * scaleX, y * scaleY);
    isDrawing.current = true;

    saveState(); // lưu trước mỗi nét mới
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    ctxRef.current.lineTo(x * scaleX, y * scaleY);
    ctxRef.current.stroke();
  };

  const stop = () => {
    if (isDrawing.current) {
      ctxRef.current.closePath();
      isDrawing.current = false;
    }
  };

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveState();
  };

  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  // NƠI ĐÂY SẼ GẮN LOGIC UPLOAD LÊN S3 + MONGODB
  // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
  const handleSaveAndShare = async () => {
    setIsUploading(true);

    try {
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        const finalSlug = customSlug.trim() || `drawing-${Date.now()}`;

        const formData = new FormData();
        formData.append("image", blob, `${finalSlug}.png`);
        formData.append("slug", finalSlug);

        // TODO: Gửi lên backend ở đây
        // ... trong handleSaveAndShare, thay phần try { ... }
        try {
          const canvas = canvasRef.current;
          const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));

          const finalSlug = customSlug.trim() || `draw-${Date.now()}`;

          const formData = new FormData();
          formData.append("image", blob, `${finalSlug}.png`);
          formData.append("slug", finalSlug);

          const res = await axios.post("http://localhost:3000/api/images", formData);
          
          setShareLink(res.data.shareLink);
          alert(`Thành công!\nLink chia sẻ:\n${res.data.shareLink}`);
        } catch (err) {
          console.error(err);
          alert("Upload thất bại: " + (err.response?.data?.message || err.message));
        }
      }, "image/png");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: 20, background: "#f8f9fa", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <h2 style={{ margin: "0 0 16px", color: "#222" }}>Draw & Share</h2>

      <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <button onClick={() => setTool("pen")} style={{ fontWeight: tool === "pen" ? "bold" : "normal" }}>Pen</button>
        <button onClick={() => setTool("eraser")} style={{ fontWeight: tool === "eraser" ? "bold" : "normal" }}>Eraser</button>

        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} disabled={tool === "eraser"} />
        <input type="range" min="1" max="50" value={size} onChange={(e) => setSize(+e.target.value)} style={{ width: 120 }} />
        <span>{size}px</span>

        <button onClick={undo} disabled={historyStep <= 0}>Undo</button>
        <button onClick={redo} disabled={historyStep >= history.length - 1}>Redo</button>
        <button onClick={clearCanvas} style={{ background: "#e74c3c", color: "white" }}>Clear</button>

        <label style={{ background: "#3498db", color: "white", padding: "8px 12px", cursor: "pointer" }}>
          Upload Image
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
        </label>

        {/* CUSTOM SLUG INPUT */}
        <input
          type="text"
          placeholder="Custom URL (optional)"
          value={customSlug}
          onChange={(e) => setCustomSlug(e.target.value)}
          style={{ padding: "8px 10px", width: 200, border: "1px solid #ccc", borderRadius: 4 }}
        />

        {/* UPLOAD BUTTON */}
        <button
          onClick={handleSaveAndShare}
          disabled={isUploading}
          style={{
            background: isUploading ? "#95a5a6" : "#27ae60",
            color: "white",
            padding: "10px 20px",
            fontWeight: "bold",
            borderRadius: 4,
          }}
        >
          {isUploading ? "Uploading..." : "Save & Share"}
        </button>

        {onClose && <button onClick={onClose} style={{ background: "#7f8c8d", color: "white" }}>Close</button>}
      </div>

      {/* Share link */}
      {shareLink && (
        <div style={{ margin: "12px 0", padding: 12, background: "#d4edda", borderRadius: 6, fontWeight: "bold" }}>
          Share link: <a href={shareLink} target="_blank" rel="noopener noreferrer">{shareLink}</a>
        </div>
      )}

      {/* Canvas */}
      <div style={{ background: "white", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          style={{ border: "2px solid #ddd", cursor: "crosshair", maxWidth: "100%", height: "auto" }}
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={draw}
          onTouchEnd={stop}
        />
      </div>

    
    </div>
  );
};

export default CreateImage;