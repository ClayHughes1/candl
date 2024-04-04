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
