import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prismaclient";
import webhookQueue from "./queue";
import "./worker";
dotenv.config();
import socket from "./socket";
const {io , httpServer , app , express} = socket;
import verifyGithubSignature from "./middleware/githubsig";
import jwt from "jsonwebtoken";
import requireAuth, { AuthRequest } from "./middleware/auth";
import cookieParser from "cookie-parser";
import { encrypt, decrypt } from "./utils/crypto";
import createGithubWebhook from "./githubWebhook";
import deleteGithubWebhook from "./deletewebhook";

app.use(cookieParser());
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));
const PORT = process.env.PORT || 5000;
app.use(cors({ origin: "http://localhost:5173" ,
  credentials : true
}));

function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...v] = c.trim().split('=');
      return [key, decodeURIComponent(v.join('='))];
    })
  );
}

io.use((socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie || '');
    const token = cookies.token;

    if (!token) {
      return next(new Error('Unauthorized'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    socket.data.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
});




io.on("connection" , (socket)=>{
  console.log("A user is connected" , socket.id);

  socket.on("disconnect" , ()=>{
    console.log("User is disconnected" , socket.id);
  })

  socket.on('join-workflow', async (workflowId) => {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
  });

  if (!workflow || workflow.userId !== socket.data.userId) {
    return socket.emit('error', 'Unauthorized');
  }

  socket.join(`workflow:${workflowId}`);
});
  
});



const clearUnwatchedWebhooks = async (repositoryName:string , userId:string)=>{
const watchcount = await prisma.workflow.count({
  where:{repository : repositoryName
  }
});
if(watchcount === 1)
{
  const [owner, repoName] = repositoryName.split("/");
  const user = await prisma.user.findUnique({
    where :{id : userId}
  });
  if(!user?.githubAccessToken)
  {
    return ;
  }
  const token = decrypt(user?.githubAccessToken);
  const reporow = await prisma.repowebhook.findUnique({
    where:{repository: repositoryName}
  });
  const hookId = reporow?.githubHookId;

  await deleteGithubWebhook(owner , repoName , hookId as number, token);

   await prisma.repowebhook.delete({
    where:{repository: repositoryName}
  });
}

}


app.get("/user/repos" ,requireAuth, async (req:AuthRequest , res)=>{

  try{
const user = await prisma.user.findUnique({
  where :{
    id: req.userId
  }
});
if(!user)
  return res.status(404).send("User does not exist");
const  token  = user?.githubAccessToken;
if(!token)
  return res.status(400).send("User token doesnt exist");
const decryptedToken = decrypt(token)
const reposResponse = await fetch("https://api.github.com/user/repos", {
  headers: { Authorization: `Bearer ${decryptedToken}` }
});
if(!reposResponse.ok)
  return res.status(401).send("Your token has expired");
const repodata = await reposResponse.json();
const reponames = repodata.map((repo:any)=> repo.full_name);
res.json(reponames);
}
catch(err)
{
  console.log(err)
  res.status(500).send("Something went wrong");
}

});




app.post("/workflow/create" ,requireAuth, async (req:AuthRequest , res)=>{
try{
const newflow = await prisma.workflow.create(
  {
    data:{
canvasData : req.body.canvasData,
    name : req.body.name,
    repository: req.body.repository,
     userId : req.userId! as string
    },
    include:{
      user:true
    }
    
  }
); 
const webhook = await prisma.repowebhook.findUnique({
  where :{repository : req.body.repository
  }
});
if(!webhook)
{
  if(!newflow.repository)
    return res.json(newflow);
  const [owner, repoName] = newflow.repository.split("/");
  const decryptedtoken = decrypt(newflow.user.githubAccessToken)
 const hookId = await createGithubWebhook(owner, repoName , decryptedtoken )
  await prisma.repowebhook.create(
    {
      data:{
        repository : newflow.repository,
        githubHookId: hookId,
        userId: newflow.userId
      }
    } );
}
res.json(newflow);
}
catch(err){
  console.error(err)
  res.status(500).json({error:"Something went wrong"});
}

});


app.get("/workflows" , requireAuth , async (req : AuthRequest , res)=>{
 try{
  const workflows = await prisma.workflow.findMany({
    where :{userId : req.userId}
  });
 res.json(workflows) ;
 }
 catch(err)
 {
res.status(500).json({error : "Something went wrong"})
 }
  
});


app.get("/workflow/:id" ,requireAuth, async (req:AuthRequest , res)=>{
const id =  req.params.id as string;
try{
const newflow = await prisma.workflow.findUnique(
  {
    where : { id : id   }
  }
);
if(newflow)
{
if(req.userId === newflow.userId)
  res.json(newflow);
else
   res.status(403).json({error:"You are forbidden to access this workflow"});
}

else
{
   res.status(404).json({error:"Row doesn't exist"});
}
}
catch(err){
  console.error(err)
  res.status(500).json({error:"Something went wrong"});
}
});

app.put("/workflow/:id" ,requireAuth, async (req:AuthRequest , res)=>{
const id =  req.params.id as string;
try{
const flow = await prisma.workflow.findUnique(
  {
    where : { id : id as string  ,
      userId : req.userId
     },
   
    }
);
if(!flow)
{
  return res.status(404).json({error : "Workflow not found or not authorised"})
}
if(flow.repository && flow.repository!= req.body.repository)
{
 await clearUnwatchedWebhooks(flow?.repository , req.userId as string);
}

const newflow = await prisma.workflow.updateMany(
  {
    where : { id : id  ,
      userId : req.userId
     },
    data:{canvasData : req.body.canvasData,
      repository : req.body.repository,
      name: req.body.name
  }}
);
if(newflow.count === 0)
{
  return res.status(404).json({error : "Workflow not found or not authorised"})
}

const fetchflow = await prisma.workflow.findUnique({
  where : { id : id  ,
      userId : req.userId
     },
     include:{user:true}
});

if(!fetchflow)
return res.json(newflow)
const webhook = await prisma.repowebhook.findUnique({
  where :{repository : req.body.repository
  },
  
});

if(!webhook)
{
  if(!fetchflow.repository)
    return res.json(newflow);
  const [owner, repoName] = fetchflow.repository.split("/");
  const decryptedtoken = decrypt(fetchflow.user.githubAccessToken)
 const hookId = await createGithubWebhook(owner, repoName , decryptedtoken )
  await prisma.repowebhook.create(
    {
      data:{
        repository : fetchflow.repository,
        githubHookId: hookId,
        userId: fetchflow.userId
      }
    } );
}

res.json(newflow);
}
catch(err){
  console.error(err)
  res.status(500).json({error:"Something went wrong"});
}
});



app.delete("/workflow/:id" ,requireAuth, async (req:AuthRequest,res)=>{
  try{
  if(!req.params.id)
    return res.json("Invalid workflow id");
  
  const workflowid = req.params.id 

  const flow = await prisma.workflow.findUnique(
  {
    where : { id : workflowid as string  ,
      userId : req.userId
     },
   
    }
);
if(!flow)
{
  return res.status(404).json({error : "Workflow not found or not authorised"})
}
if(flow.repository )
{
await clearUnwatchedWebhooks(flow?.repository , req.userId as string);
}
 const deletedflow = await prisma.workflow.deleteMany({
    where:{id:req.params.id as string,
      userId: req.userId 
    }
  });
  if(deletedflow.count === 0)
    return res.status(404).json("Workflow not found or not authorised");

  

  res.status(204).end();
  }
  catch(err)
  {
    console.log(err)
    res.status(500).json({error : "Something went wrong"})
  }
})


app.get("/workflow/:workflowId/runs" ,   requireAuth , async (req: AuthRequest , res)=>
{
  try{
    const flow = await prisma.workflow.findFirst(
      {where : {id :  req.params.workflowId as string,
        userId : req.userId
       }}
    )
    if(!flow)
      return res.status(404).send("Workflow not found or not authorised")
    const workflowruns = await prisma.workflowRun.findMany(
  {
    where : {workflowId : req.params.workflowId as string},
  orderBy: { startedAt: "desc" }
  }
)

res.json(workflowruns);
  }
catch(err){
  console.error(err)
  res.status(500).json({error:"Something went wrong"});
}
});

app.get("/runs/:workflowRunId" ,requireAuth, async (req:  AuthRequest , res)=>
{
  try{
    const workflowrun = await prisma.workflowRun.findUnique(
  {
    where : {id : req.params.workflowRunId as string},
    include :{workflow : true
      ,noderuns:true}
  }
)
if (!workflowrun) {
  return res.status(404).json({ error: "Run not found" });
}
if(workflowrun.workflow.userId != req.userId)
{
  return res.status(403).json({ error: "Not authorised" });
}
res.json(workflowrun);
  }
catch(err){
  console.error(err)
  res.status(500).json({error:"Something went wrong"});
}
});




app.get("/", (req, res) => {
  res.send("Flow Forge server is alive");
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// Step 1: Redirect user to GitHub's login/authorize page
app.get("/auth/github", (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=user:email,public_repo`;
  res.redirect(githubAuthUrl);
});

// Step 2: GitHub redirects here with a `code` after user approves
app.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).send("Missing code from GitHub");
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json(tokenData);
    }

    const accessToken = tokenData.access_token;

    // Use access token to fetch the user's GitHub profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = await userResponse.json();

    const user = await prisma.user.upsert(
      {
        where :{ githubId: githubUser.id},
        update:{
    username  : githubUser.login,
    email     : githubUser.email,
    avatarUrl : githubUser.avatar_url,
    githubAccessToken : encrypt(accessToken)
        },
        create:{
          githubId: githubUser.id,
    username  : githubUser.login,
    email     : githubUser.email,
    avatarUrl : githubUser.avatar_url,
    githubAccessToken : encrypt(accessToken)
        }
      }
    );
    
        const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("http://localhost:5173");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:"OAuth callback failed"});
  }
});

app.post("/webhook/github" , verifyGithubSignature , async (req , res)=>{
  
  try{
   const reponame = req.body?.repository?.full_name;
   if(!reponame)
    return res.status(400).json({ error: "Missing repository info in payload" });
  const workflows = await prisma.workflow.findMany(
    {
      where : {repository : reponame}
    }
  );
  
  for(const wflow of workflows)
  {
     await  webhookQueue.add("pr-event" , {workflowId : wflow.id , repo : reponame , payload: req.body });
    }
  res.status(200).send("ok");
}
catch(err){
  res.status(500).json({ error: "Webhook processing failed" });
  console.log(err)
}
})

