import { useEffect, useState } from "react";
import { fetchWorkflows } from "../../services/api";
import "../../styles/components.css";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "guest" | "authed">("loading");
  useEffect(() => { fetchWorkflows().then(() => setStatus("authed")).catch((error) => { console.log(error); setStatus("guest"); }); }, []);
  if (status === "loading") return <div className="authgate"><span className="authgate__mark">flow-forge · loading…</span></div>;
  if (status === "guest") return <div className="authgate"><span className="authgate__mark">flow-forge</span><p className="authgate__text">Sign in to continue</p><a className="btn btn--primary" href={`${import.meta.env.VITE_SERVER_URL}/auth/github`}>Continue with GitHub</a></div>;
  return <>{children}</>;
}
