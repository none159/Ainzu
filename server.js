const express = require('express');
const server = express()
server.all('/',(req,res)=>{
    res.send("bot is running")
})
function keepalive(){
    server.listen(3000,()=>{
        console.log("server is running")
    })
}
module.exports = keepalive