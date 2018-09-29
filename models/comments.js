var mongoose=require("mongoose");
 //var Site = require("../models/sites");
//var User = require("../models/users");

//var Link = require("../models/links");

var commentSchema = new mongoose.Schema({
       text: String,
       userRating:Number,
       createdDate:{type:Date,default:Date.now},
       author: {
              type:mongoose.Schema.Types.ObjectId,
              ref:"User"
              }
       });

module.exports=mongoose.model("Comment", commentSchema);