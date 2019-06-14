const db = require('../../dbConfig')

module.exports = {
  async updateReadStatus(userId) {
    try {
      const read = await db('notifications')
        .update('read', true)
        .where({ user_id: userId })
      if (read) {
        return { msg: 'success' }
      }
    } catch (err) {
      console.log(err)
      return { msg: 'error', err }
    }
  },
  async deleteNotifications(userId) {
    try {
      const clear = await db('notifications')
        .del()
        .where('user_id', userId)
      if (clear) {
        return { msg: 'success' }
      }
    } catch (err) {
      console.log(err)
      return { msg: 'error', err }
    }
  },
}
