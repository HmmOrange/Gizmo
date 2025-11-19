// CreateImage.jsx
import React, { useRef, useEffect, useState, useCallback } from "react";

const CreateImage = ({ onSave, onClose }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);
  const backgroundImgRef = useRef(null);

  // State
  const [tool, setTool] = useState("pen");           // "pen" | "eraser"
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [history, setHistory] = useState([]);        // mảng dataURL
  const [historyStep, setHistoryStep] = useState(-1);

  // Lưu trạng thái canvas vào history
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL();

    setHistory((prev) => {
      const newHist = prev.slice(0, historyStep + 1);
      newHist.push(data);
      if (newHist.length > 50) newHist.shift();
      setHistoryStep(newHist.length - 1);
      return newHist;
    });
  }, [historyStep]);

  // Khôi phục từ history
  const restoreState = (step) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || history[step] === undefined) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  // Khởi tạo canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 900;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    // nền trắng + lưu bước đầu
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, []);

  // Cập nhật style khi thay đổi công cụ/màu/kích thước
  useEffect(() => {
    if (!ctxRef.current) return;
    ctxRef.current.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctxRef.current.lineWidth = size;
  }, [tool, color, size]);

  // Vẽ ảnh nền
  const drawBackgroundImage = (img) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.drawImage(img, x, y, w, h);
    backgroundImgRef.current = { img, x, y, w, h };
    saveState();
  };

  // Bắt đầu vẽ
  const start = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;

    ctxRef.current.beginPath();
    ctxRef.current.moveTo((x - rect.left) * (canvas.width / rect.width), (y - rect.top) * (canvas.height / rect.height));
    isDrawing.current = true;

    // lưu trạng thái trước khi vẽ nét mới
    saveState();
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;

    ctxRef.current.lineTo(
      (x - rect.left) * (canvas.width / rect.width),
      (y - rect.top) * (canvas.height / rect.height)
    );
    ctxRef.current.stroke();
  };

  const stop = () => {
    if (isDrawing.current) {
      ctxRef.current.closePath();
      isDrawing.current = false;
    }
  };

  // Xóa toàn bộ
  const clearCanvas = () => {
    const ctx = ctxRef.current;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    if (backgroundImgRef.current) {
      const { img, x, y, w, h } = backgroundImgRef.current;
      ctx.drawImage(img, x, y, w, h);
    }
    saveState();
  };

  // Upload image lên
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => drawBackgroundImage(img);
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Download Image
  const handleSave = () => {
    const dataURL = canvasRef.current.toDataURL("image/png");
    if (onSave) {
      onSave(dataURL);
    } else {
      const a = document.createElement("a");
      a.href = dataURL;
      a.download = "drawing.png";
      a.click();
    }
  };

  // Shortcut Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") { e.preventDefault(); undo(); }
        if (e.key === "y") { e.preventDefault(); redo(); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [historyStep, history]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", background: "#f0f0f0", minHeight: "100vh" }}>
      <h2 style={{ margin: "0 0 15px" }}>Share Image</h2>

      {/* Toolbar */}
      <div style={{ marginBottom: 15, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        {/* Công cụ */}
        <button onClick={() => setTool("pen")} style={{ fontWeight: tool === "pen" ? "bold" : "normal" }}>
          Brush
        </button>
        <button onClick={() => setTool("eraser")} style={{ fontWeight: tool === "eraser" ? "bold" : "normal" }}>
          Eraser
        </button>

        {/* Màu */}
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} disabled={tool === "eraser"} />

        {/* Kích thước */}
        <input
          type="range"
          min="1"
          max="50"
          value={size}
          onChange={(e) => setSize(+e.target.value)}
          style={{ width: 120 }}
        />
        <span>{size}px</span>

        {/* Undo / Redo */}
        <button onClick={undo} disabled={historyStep <= 0}>
          Undo
        </button>
        <button onClick={redo} disabled={historyStep >= history.length - 1}>
          Redo
        </button>

        {/* Erase all */}
        <button onClick={clearCanvas} style={{ background: "#ff5c5c", color: "white" }}>
          Erase all
        </button>

        {/* Upload image */}
        <label>
          Upload image
          <input type="file" accept="image/*" onChange={handleUpload} style={{ display: "none" }} />
        </label>

        {/* Lưu */}
        <button onClick={handleSave} style={{ background: "#4CAF50", color: "white" }}>
          Download Image
        </button>

        {onClose && (
          <button onClick={onClose} style={{ background: "#999", color: "white" }}>
            Đóng
          </button>
        )}
      </div>

      {/* Canvas */}
      <div style={{ background: "white", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", display: "inline-block" }}>
        <canvas
          ref={canvasRef}
          style={{ border: "2px solid #ddd", cursor: tool === "eraser" ? "crosshair" : "crosshair" }}
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={draw}
          onTouchEnd={stop}
        />
      </div>

      <div style={{ marginTop: 10, fontSize: "14px", color: "#555" }}>
        <p>
          <strong>Shortcut:</strong> Ctrl+Z (Undo) • Ctrl+Y (Redo)
        </p>
      </div>
    </div>
  );
};

export default CreateImage;