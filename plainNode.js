const jsonData = [{"id":"1","name":"Jonny Doey","description":"hello world"}]
 

//CREATING SERVER
const http = require('http')
const server = http.createServer((req,res)=>{
res.statusCode = 200
  res.setHeader('Content-Type','text/html')
  res.write('<h3>Hello this is plain nodejs !!!</h3>')
  res.end()
})
const PORT = 8000

//open browser,enter localhost:8000, F12, Network tab,Headers,Response Headers,Content-Type will be text/html

///
const server = http.createServer((req,res)=>{
if(req.url === '/api/v1/jsonData'){
res.setHeader(200, {'Content-Type':'application/json'})
  res.end(JSON.stringify(jsonData))
}else{
res.writeHead(404, {"Content-Type":"application/json"})
  res.end(JSON.stringify(jsonData))
}
})





server.listen(PORT,()=>console.log(`server is litening on ${PORT}`))
