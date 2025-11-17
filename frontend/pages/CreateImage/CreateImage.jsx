import React, { useState, useRef, useEffect } from 'react';
import './CreateImage.css';

const CreateImage = () => {
    const [imageSrc, setImageSrc] = useState('');
    const [originalSrc, setOriginalSrc] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [brightness, setBrightness] = useState(100);
    const [opacity, setOpacity] = useState(100);
    const [blur, setBlur] = useState(0);
    const [contrast, setContrast] = useState(100);
    const [theme, setTheme] = useState('theme-light');
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    const canvasRef = useRef(document.createElement('canvas'));
    const currentImageRef = useRef(null);

    

    // Áp dụng bộ lọc
    const applyFilters = (forceValues = {}) => {
        if (!currentImageRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = currentImageRef.current;

        const b = forceValues.brightness ?? brightness;
        const o = forceValues.opacity ?? opacity;
        const bl = forceValues.blur ?? blur;
        const c = forceValues.contrast ?? contrast;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.filter = `brightness(${b}%) opacity(${o}%) blur(${bl}px) contrast(${c}%)`.trim();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        setImageSrc(canvas.toDataURL());
    };

    // Cập nhật khi thay đổi bộ lọc
    useEffect(() => {
        if (currentImageRef.current) applyFilters();
    }, [brightness, opacity, blur, contrast]);

    // Tải ảnh
    const loadImage = (src) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            currentImageRef.current = img;
            setOriginalSrc(src);
            // Reset sliders + apply ngay
            setBrightness(100);
            setOpacity(100);
            setBlur(0);
            setContrast(100);
            // Gọi applyFilters với giá trị mặc định
            applyFilters({ brightness: 100, opacity: 100, blur: 0, contrast: 100 });
        };

        img.onerror = () => alert('Không thể tải ảnh. Vui lòng kiểm tra URL hoặc file.');
        img.src = src;
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => loadImage(ev.target.result);
        reader.onerror = () => alert('Lỗi đọc file!');
        reader.readAsDataURL(file);
    };

    const loadFromUrl = () => {
        const url = urlInput.trim();
        if (url) {
            loadImage(url);
            setUrlInput(''); // Xóa input sau khi tải
        }
    };

    // RESET: Bấm 1 lần → ảnh + slider về gốc NGAY
    const resetImage = () => {
        if (!originalSrc || !currentImageRef.current) return;

        // Reset sliders
        setBrightness(100);
        setOpacity(100);
        setBlur(0);
        setContrast(100);

        // Tải lại ảnh gốc và áp dụng filter mặc định NGAY
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            currentImageRef.current = img;
            applyFilters({ brightness: 100, opacity: 100, blur: 0, contrast: 100 });
        };
        img.src = originalSrc;
    };

    // Invert
    const invertColors = () => {
        if (!currentImageRef.current) return;
        const img = currentImageRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.filter = 'invert(100%)';
        ctx.drawImage(img, 0, 0);

        const newImg = new Image();
        newImg.onload = () => {
            currentImageRef.current = newImg;
            applyFilters();
        };
        newImg.src = canvas.toDataURL();
    };

    // Rotate
    const rotateImage = () => {
        if (!currentImageRef.current) return;
        const img = currentImageRef.current;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.height;
        canvas.height = img.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const newImg = new Image();
        newImg.onload = () => {
            currentImageRef.current = newImg;
            applyFilters();
        };
        newImg.src = canvas.toDataURL();
    };

    // Download
    const downloadImage = () => {
        if (!imageSrc) return;
        const a = document.createElement('a');
        a.href = canvasRef.current.toDataURL('image/png');
        a.download = 'edited_image.png';
        a.click();
    };

    // Share
    // const shareImage = () => {
    //     if (!imageSrc) return;
    //     if (navigator.share) {
    //         navigator.share({ title: 'Edited Image', url: imageSrc });
    //     } else {
    //         alert('Share URL: ' + imageSrc);
    //     }
    // };

    const createPaste = () => {
        if (!imageSrc) {
            console.log("Chưa có ảnh");
            return;
        }
        console.log(imageSrc);
    }

    return (
        <div className={`create-image-container ${theme}`}>
            <div className="header">
                <h1>Create Image</h1>
                <select value={theme} onChange={(e) => setTheme(e.target.value)} className="theme-selector">
                    <option value="theme-light">Light Theme</option>
                    <option value="theme-dark">Dark Theme</option>
                </select>
            </div>

            <div className="editor-grid">
                <div className="left-panel">
                    <div className="upload-group">
                        <label className="upload-btn file-upload">
                            <i className="icon-upload"></i>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </label>

                        <div className="url-upload">
                            <input
                                type="text"
                                placeholder="Paste URL"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && loadFromUrl()}
                                className="url-input"
                            />
                            <button onClick={loadFromUrl} className="btn-url-go" disabled={!urlInput.trim()}>
                                <i className="icon-go"></i>
                            </button>
                        </div>
                    </div>

                    <div className="image-preview">
                        {imageSrc ? (
                            <img src={imageSrc} alt="Edited" className="edited-image" />
                        ) : (
                            <div className="placeholder">
                                No image uploaded.
                            </div>
                        )}
                    </div>

                    <div className="action-buttons">
                        <button onClick={resetImage} className="btn btn-warning" disabled={!originalSrc}>
                            Reset to Original
                        </button>
                        <button onClick={downloadImage} className="btn btn-success" disabled={!imageSrc}>
                            Download
                        </button>
                        <button onClick={createPaste} className="btn btn-info" disabled={!imageSrc}>
                            Create Paste
                        </button>
                    </div>
                    <div className="pastes-config">
                        <label for="image-name">Image name:</label>
                        <input type='text' id="image-name" name="Image Name"></input>
                    </div>
                </div>

                <div className="right-panel">
                    <div className="control-group">
                        <label>Brightness: {brightness}%</label>
                        <input type="range" min="0" max="200" value={brightness} onChange={(e) => setBrightness(e.target.value)} />
                    </div>
                    <div className="control-group">
                        <label>Opacity: {opacity}%</label>
                        <input type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(e.target.value)} />
                    </div>
                    <div className="control-group">
                        <label>Blur: {blur}px</label>
                        <input type="range" min="0" max="10" value={blur} onChange={(e) => setBlur(e.target.value)} />
                    </div>
                    <div className="control-group">
                        <label>Contrast: {contrast}%</label>
                        <input type="range" min="0" max="200" value={contrast} onChange={(e) => setContrast(e.target.value)} />
                    </div>

                    <div className="button-group">
                        <button onClick={invertColors} className="btn btn-secondary" disabled={!imageSrc}>
                            Invert
                        </button>
                        <button onClick={rotateImage} className="btn btn-secondary" disabled={!imageSrc}>
                            Rotate 90°
                        </button>
                    </div>
                </div>
            </div>

            <footer className="footer">
                
            </footer>
        </div>
    );
};

export default CreateImage;