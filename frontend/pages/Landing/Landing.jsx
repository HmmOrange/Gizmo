import { useNavigate } from "react-router-dom";

import './Landing.css'

export default function Landing() {
  const navigate = useNavigate();
  return (
    
      <div>
        <button onClick={() => navigate("/create/paste")} >
          Create paste
        </button>
        <button onClick={() => navigate("/create/image")} >
          Create image
        </button>
      </div>

  )
}