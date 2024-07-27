//Due to the usage of express as a middleware framework this script is not used, 
//but is rather an example of how a routing file would look if not using express 

const express = require('express');
const adminRouter = express.Router();
const debug = require('debug')('app:adminRouter');

adminRouter.route('/').get((req, res) => {
   res.render('admin'); 
});

adminRouter.get('api/getchartdata?',function(req,res){
   const chartname = req.query.charname;
   console.log(charname);

});

module.exports = adminRouter;
