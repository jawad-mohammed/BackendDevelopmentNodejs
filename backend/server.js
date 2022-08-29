const express= require('express')
const app = express()
const cookieParser = require('cookie-parser')
app.use(cookieParser())


app.get('/',async(req,res)=>{
    res.send('hello')
})
//setting cookie manually
app.get('/set-cookie',async(req,res)=>{
  res.setHeader('set-cookie','token=imnewtoken')
  res.send('cookie is set')
})

//using cookie parser
app.get('/cokie-parser',async(req,res)=>{
//setting single cookie
//     res.cookie('name','jawad')
// res.send('cookie is set via cookie parser')
//setting multiple cookie
res.cookie('test','123',{
    maxAge:5000,
    httpOnly:true,
    secure:true,
    domain:'test1'
})
res.send('cookie set multiple times')


})



app.get('/get-cookie',async(req,res)=>{
    console.log(req.cookies);
res.send(req.cookies)    

})

app.get('/del-cookie',async(req,res)=>{
  // console.log(req.cookies);
    res.clearCookie('name') 
})




app.listen(8015,()=>console.log(`server is listening on 8015`))