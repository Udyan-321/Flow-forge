import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
    }
    navigate("/", { replace: true });
  }, [searchParams, navigate]);

  return <div className="authgate"><span className="authgate__mark">flow-forge · signing in…</span></div>;
}