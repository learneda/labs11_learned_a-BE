const db = require('../../dbConfig')

module.exports = {
  async createFolder(req, res, next) {
    const { folder_name } = req.body
    const user_id = req.user.id || req.body.user_id
    if (folder_name) {
      try {
        const folderPromise = await db('folders').insert({
          folder_name,
          user_id,
        })
        if (folderPromise) {
          res.status(200).json({ success: 'folder was created' })
        } else {
          res.status(400).json({ err: 'something went wrong' })
        }
      } catch (err) {
        console.log(err)
        res.status(500).json({ err })
      }
    } else {
      res
        .status(404)
        .json({ err: 'must include folder_name in the request body.' })
    }
  },

  async addPost(req, res, next) {
    const { post_id, folder_id } = req.body
    console.log(req.body)
    console.log(req.user)
    const user_id = req.user === undefined ? req.body.user_id : req.user.id
    console.log('user IDDDDD', user_id)
    if (post_id && folder_id) {
      try {
        const insertPromise = await db('folder_posts').insert({
          folder_id,
          post_id,
          user_id: user_id,
        })
        if (insertPromise) {
          res.status(200).json({ success: 'insert successful' })
        } else {
          res.status(400).json({ err: 'something went wrong' })
        }
      } catch (err) {
        console.log(err)
        res.status(500).json({ err })
      }
    } else {
      res
        .status(404)
        .json({
          err: 'must include folder_id && post_id in the request body..',
        })
    }
  },
  async getUserFolders(req, res, next) {
    const user_id = req.user === undefined ? req.body.user_id : req.user.id
    try {
      const selectPromise = await db('folders').where({ user_id })
      if (selectPromise) {
        res.status(200).json({ folders: selectPromise })
      } else {
        res.status(404).json({ msg: 'user aint got no folders ..' })
      }
    } catch (err) {
      console.log(err)
      res.status(303).json({ err })
    }
  },
  async getPostByFolderId(req, res, next) {
    const { folder_id } = req.params.id
    if (folder_id) {
      try {
        const posts = await db('posts as p').where({ folder_id: folder_id })
        if (posts) {
          res.status(200).json({ posts })
        } else {
          res.status(400).json({ error: 'something went wrong' })
        }
      } catch (err) {
        res.status(500).json({ err })
      }
    } else {
      res.status(404).jons({ error: 'please provide ' })
    }
  },
}
