import axios from "axios";
import { useState , useEffect } from "react";

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
    <p>Loading...</p>
)

if(checkauth === "guest")
{
    return (
        <div>
            <p>Login to continue</p>
            <a href="http://localhost:5000/auth/github">Login with Github</a>
        </div>

    )
}


    return <>{children}</>
}
export default AuthGate