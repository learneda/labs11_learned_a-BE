require('dotenv').config();
const server = require('express')();
require('./config/passport');
require('./middleware/index')(server);
require('./components')(server);
const db = require('./dbConfig');

const port = process.env.PORT || 8000;


const myServer = server.listen(port, () => {
  console.log(`\n ==== API RUNNING === ${port}\n`);
});

server.get('/', (req, res) => {
  res.send('localhost up & alive');
});

const io = require('socket.io')(myServer)

io.on('connection', (socket) => {
  socket.on('comments', (msg) => {
    console.log('response',msg);
    // emit them right back to all the users listening to this connection
    if (msg.action === 'create') {
      db('comments')
        .insert({
          content:msg.content,
          user_id: msg.user_id,
          post_id: msg.post_id
        }).returning('*')
        .then((res) =>{
          res[0]['username'] = msg.username;
          socket.broadcast.emit('comments', res[0]);  
          socket.emit('comments', res[0]);        
        });
    }
  });
  socket.on('like', (data) => {
    if (data.action === 'unlike') {
      db('posts_likes').del().where({user_id: data.user_id, post_id: data.post_id}).then((res) => {
        socket.broadcast.emit('like', data)
        socket.emit('like', data)
      })
    } else {
      db('posts_likes').insert({user_id: data.user_id, post_id: data.post_id}).then((res) => {
        // 
        socket.broadcast.emit('like', data)
        socket.emit('like', data)
      })
    }
  })
});
