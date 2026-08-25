import axios from "axios";
import { useState , useEffect } from "react";
import "./components.css";

function AuthGate({children} : {children : React.ReactNode})
{

const [checkauth , setcheckauth] = useState<"loading" | "guest" | "authed">("loading")

useEffect(()=>{
    const checkauthfunction = async ()=>{

        try{
         await axios.get("http://localhost:5000/workflows");
         setcheckauth("authed");
        }
        catch(err)
        {
            console.log(err);
            setcheckauth("guest")
        }
    }
    checkauthfunction();
} , [])

if(checkauth === "loading")
    return ( 
    <div className="authgate">
      <span className="authgate__mark">flow-forge · loading…</span>
    </div>
)

if(checkauth === "guest")
{
    return (
        <div className="authgate">
            <span className="authgate__mark">flow-forge</span>
            <p className="authgate__text">Sign in to continue</p>
            <a className="btn btn--primary" href="http://localhost:5000/auth/github">Continue with GitHub</a>
        </div>

    )
}


    return <>{children}</>
}
export default AuthGate
