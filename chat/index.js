const express = require('express');
const app = express();
const path = require('path')
const http = require('http').createServer(app);
const mongoose = require('mongoose');
const io = require('socket.io')(http);
const Posts = require('../chat/Posts.js');
const res = require('express/lib/response');

app.use(express.static(path.join(__dirname,'public')));
app.set('views',path.join(__dirname,'public'));
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');

app.use('/',(req,res) =>{
    res.render('index.html')
})


var usuarios = [];

var socketIds = [];

mongoose.connect('mongodb+srv://root:root123@cluster0.oy4ty.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology:true}).then(function(){
    console.log('Conectado com sucesso ao mongodb')
}).catch(function(err){
    console.log(err.message);
})
function buscar(){
    const query = Posts.find({})
    const pro = query.lean().exec();
    return pro;
}



io.on('connection',(socket)=>{

    socket.on('users', async function(data){
        async function ver(){
            var usuario = await buscar();
            //console.log(usuario);  
            usuario = usuario.map(function(val){
                return {
                    socketIdss: val.socketIdss,
                    usuarioss: val.usuarioss,
                }
            })        
            io.emit('users',usuario); 
        }    
        ver();
        //io.emit('users',data); 
    })
    socket.on('new user',function(data){
           
        if(usuarios.indexOf(data) != -1){

            socket.emit('new user',{success: false});
        }else{
            
            const user = Posts({usuarioss: data});
          //  const sockets = Posts({socketIdss: socket.id});
            user.save()
            .then(() => console.log('usuario criado'))
            .catch(() => console.log('usuario nao criado'))

            usuarios.push(data);
            socketIds.push(socket.id);
            //console.log(usuarios)
           // console.log(socketIds)
            

            socket.emit('new user',{success: true});

            //Emit para os outros usuários dizendo que tem um novo usuário ativo.

            //socket.broadcast.emit("hello", "world");

        }
        //console.log(usuarios);
    })


    socket.on('chat message',(obj)=>{

            io.emit('chat message',obj);


    })

    socket.on('disconnect', () => {

            let id = socketIds.indexOf(socket.id);

            socket.broadcast.emit("usersDelete", usuarios[id]);

            Posts.deleteOne({usuarioss: usuarios[id] })
            .then(response => { console.log(response) })
            .catch(error => { console.log('Delete Error', error); })
    
            console.log(usuarios[id])

             socketIds.splice(id,1);
     
             usuarios.splice(id,1);
              
             //console.log(socketIds);
     

       // console.log(usuarios);

        console.log('user disconnected');

    });



})



http.listen(3000, () => {

  console.log('listening on :3000');

});
