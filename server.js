const express = require('express')
const app = express()
require('dotenv').config()
 //modle schema
 const goalModel = require('./models/goalModel')

const mongoose = require('mongoose')
const connectDB = require('./config/db')

app.use(express.json())

//this route is get req
app.get('/', async(req,res)=>{
const allGoals = await goalModel.find()
res.json(allGoals)
 })

 //this route is post req
 app.post('/', async(req,res)=>{
const newGoal = await goalModel.create({
    text:req.body.text
})
res.json(newGoal)
})


//update req
app.put('/:id',async(req,res)=>{
const goalId = await goalModel.findById(req.params.id)
if(!goalId){
res.json("error")
}
const updatedGoal = await goalModel.findByIdAndUpdate(req.params.id,
    req.body,  {
        new:true
    })
res.json(updatedGoal)
})



app.delete('/',(req,res)=>{

})


///Connect tp Mongo DB
connectDB()
 
app.listen(8052,()=>console.log(`server is listening on 8052`))
