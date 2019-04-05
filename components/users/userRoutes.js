const router = require('express').Router();
const controllers = require('./userControllers');

// ==============================================
// this JS file includes helpers that access our
// database accordingly (for example, getUsers
// requests all the users in the users database)
// ==============================================

router.post('/details', controllers.postUserDetails);

router.get('/:username', controllers.getUserDetailsByUserName);


module.exports = router;