const router = require('express').Router()
const controllers = require('./servicesControllers')
const routeCache = require('route-cache')

router.get('/courses', controllers.getCourses)

router.get('/articles', routeCache.cacheSeconds(60), controllers.getArticles)

router.get('/articles/all', controllers.getAllArticles)

router.post('/articles/all', controllers.postAllArticles)
router.get('/cheerio', controllers.launchCheerio)

module.exports = router
