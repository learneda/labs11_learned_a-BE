exports.up = function(knex, Promise) {
  return knex.schema.createTable('posts_likes', tbl => {
    tbl.increments('id')

    tbl
      .integer('post_id')
      .references('id')
      .inTable('newsfeed_posts')
      .onDelete('cascade')
      .onUpdate('cascade')
      .unsigned()
      .notNullable()

    tbl
      .integer('user_id')
      .references('id')
      .inTable('users')
      .onDelete('cascade')
      .onUpdate('cascade')
      .unsigned()
      .notNullable()

    tbl.timestamp('created_at').defaultTo(knex.fn.now())
    tbl.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('posts_likes')
}
