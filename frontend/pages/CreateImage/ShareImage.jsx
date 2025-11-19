import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function ShareImage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const imgRef = useRef(null);

    const imagePath = `/images/${id}`;

    const handleImageError = () => {
        if (imgRef.current) {
            navigate("/share/images", { replace:true });
            console.log("No image found");
        }
    }
    return (
        <img 
            ref={imgRef}
            id="img" 
            src={imagePath}
            alt={id}
            style={{maxWidth: "100%", height: "auto"}}
            onError={handleImageError}>
        </img>
    );
}