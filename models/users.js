 const mongoose= require("mongoose"),
  passportLocalMongoose=require("passport-local-mongoose"),
  Site = require("../models/sites"),
  Comment = require("../models/comments"),
  Link = require("../models/links");
 
 const UserSchema= new mongoose.Schema({
     username:{type:String, required:true},
     password:String,
     email:{type: String, unique: false, required: true},
     showName:String,
     role:{type:Number, default:0}, //defualt to basic user, moderator is 1 and admin is 2, mods can delete comments and modify sites, admins can delete sites
     avatar:{type:String, default:'/assets/img/member-icon.png'},
     disabled:{type:Boolean, default:false},
     socialMedia:Array,
     resetPasswordToken: String,
     resetPasswordExpires: Date,
     sitesSubmitted: [{type: mongoose.Schema.Types.ObjectId, ref: "Site"}],
     linksSubmitted: [{type: mongoose.Schema.Types.ObjectId, ref: "Link"}],
     commentsMade:[{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}]
 });
 
  // Create the index
  UserSchema.index(
     {
     username: "text",
     showName: "text",
     email:"text"}, 
     {name: 'user_index'}
    );
 
 UserSchema.plugin(passportLocalMongoose);
 
 UserSchema.methods.changePassword = function(newPassword, cb) {
    if (!newPassword) {
      return cb('Missing Password!');
    }

    let self = this;

    self.setPassword(newPassword, function(setPasswordErr, user) {
    if (setPasswordErr) { return cb(setPasswordErr); }

        self.save(function(saveErr) {
          if (saveErr) { return cb(saveErr); }

          cb(null, user);
        });
      });
  };
  
 module.exports=mongoose.model("User",UserSchema);
 
 