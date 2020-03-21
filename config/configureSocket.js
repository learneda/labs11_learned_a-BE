const db = require('../dbConfig')

/**
 * @param socket {SocketIO.Server} socket-io instance
 * @description Helper function that configures socket-io instance
 */
exports.configureSocket = socket => {
  socket.on('connection', async socket => {
    await db('online_users')
      .del()
      .whereNotIn('socket_id', Object.keys(socket.sockets.sockets))

    socket.on('join', async function(data) {
      console.log(data, 'DATA', socket.id)
      const online_user = await db('online_users').insert({
        user_id: data.user_id,
        socket_id: socket.id,
      })

      if (online_user) {
        const notifications = await db('notifications').where({
          read: false,
          user_id: data.user_id,
        })
        if (notifications.length) {
          socket.to(socket.id).emit('join', notifications)
        } else {
          console.log(notifications, 'you aint got no notifications')
        }
      }
    })

    socket.on('disconnect', async reason => {
      console.log(reason, socket.id)
      const deleteInsert = await db('online_users')
        .del()
        .where({ socket_id: socket.id })
    })

    socket.on('comments', msg => {
      console.log('response', msg)
      if (msg.action === 'create') {
        db('comments')
          .insert({
            content: msg.content,
            user_id: msg.user_id,
            post_id: msg.post_id,
          })
          .returning('*')
          .then(res => {
            res[0]['username'] = msg.username
            res[0]['action'] = msg.action
            console.log(res[0], 'response after inserting')
            socket.broadcast.emit('comments', res[0])
            socket.emit('comments', res[0])

            if (msg.user_id != msg.postOwnerId) {
              db('notifications')
                .insert({
                  user_id: msg.postOwnerId,
                  post_id: msg.post_id,
                  type: 'comment',
                  invoker: msg.username,
                })
                .returning('*')
                .then(result => {
                  console.log('HERE', result)
                  return db('online_users').where({ user_id: msg.postOwnerId })
                })
                .then(online_data => {
                  console.log(online_data, 'is user online?')
                  if (online_data.length) {
                    db('notifications')
                      .where({ read: false, user_id: online_data[0].user_id })
                      .then(notificationRes => {
                        console.log('here', notificationRes)
                        if (notificationRes.length) {
                          socket
                            .to(online_data[0].socket_id)
                            .emit(
                              'join',
                              notificationRes[notificationRes.length - 1]
                            )
                        }
                      })
                  }
                })
            }
          })
      }
      if (msg.action === 'destroy') {
        console.log('inside destroy')
        db('comments')
          .where('id', msg.comment_id)
          .del()
          .returning('*')
          .then(res => {
            console.log(res, 'after del()')
            res[0]['action'] = msg.action
            console.log(res[0], 'response after inserting')
            socket.emit('comments', res[0])
            socket.broadcast.emit('comments', res[0])
          })
      }
    })

    socket.on('like', data => {
      if (data.action === 'unlike') {
        db('posts_likes')
          .del()
          .where({ user_id: data.user_id, post_id: data.id })
          .then(res => {
            socket.broadcast.emit('like', data)
            socket.emit('like', data)
          })
      } else {
        db('posts_likes')
          .insert({ user_id: data.user_id, post_id: data.id })
          .then(res => {
            socket.broadcast.emit('like', data)
            socket.emit('like', data)
          })
        if (data.user_id != data.postOwnerId) {
          db('notifications')
            .insert({
              user_id: data.postOwnerId,
              post_id: data.id,
              type: 'like',
              invoker: data.username,
            })
            .then(res => {
              return db('online_users').where({ user_id: data.postOwnerId })
            })
            .then(online_data => {
              if (online_data.length) {
                db('notifications')
                  .where({ read: false, user_id: online_data[0].user_id })
                  .then(notificationRes => {
                    console.log('here', notificationRes)
                    if (notificationRes.length) {
                      socket
                        .to(online_data[0].socket_id)
                        .emit('join', notificationRes)
                    }
                  })
              }
            })
        }
      }
    })
    socket.on('pony', data => {
      console.log(data)
      if (data.action === 'pony_down') {
        db('posts_ponies')
          .del()
          .where({ user_id: data.user_id, post_id: data.id })
          .then(res => {
            socket.broadcast.emit('pony', data)
            socket.emit('pony', data)
          })
      } else {
        db('posts_ponies')
          .insert({ user_id: data.user_id, post_id: data.id })
          .then(res => {
            socket.broadcast.emit('pony', data)
            socket.emit('pony', data)
          })
        if (data.user_id != data.postOwnerId) {
          db('notifications')
            .insert({
              user_id: data.postOwnerId,
              post_id: data.id,
              type: 'pony',
              invoker: data.username,
            })
            .then(res => {
              return db('online_users').where({ user_id: data.postOwnerId })
            })
            .then(online_data => {
              if (online_data.length) {
                db('notifications')
                  .where({ read: false, user_id: online_data[0].user_id })
                  .then(notificationRes => {
                    console.log('here', notificationRes)
                    if (notificationRes.length) {
                      socket
                        .to(online_data[0].socket_id)
                        .emit('join', notificationRes)
                    }
                  })
              }
            })
        }
      }
    })
  })
}