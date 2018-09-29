var mongoose = require("mongoose");

var siteSchema = new mongoose.Schema({
    name:{type:String},
    image: {type:String, default:'/assets/img/noimage.jpg'},
    moreImages: [{type: String}],
    description:{type: String},
    price:{type:String, default:'Unknown!'},
    location:{type:String},
    lat:Number,
    lng:Number,
    rating:Number,
    water:String,
    warm:String,
    charging:String,
    food:String,
    shelter:String,
    wash:String,
    dog:String,
    link:String,
    referalTel:String,
    referalEmail:String,
    createdDate:{type:Date,default:Date.now},
    imageThumbnail:{type:String,default:'/assets/img/thumbnail.png'},
    moreImagesThumbnails: [{type: String}],
    createdby: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: "Comment"}],
    category:{type: mongoose.Schema.Types.ObjectId, ref: "Category"},
    country:{type: mongoose.Schema.Types.ObjectId, ref: "Country"}
});

// Create the index
// siteSchema.index(
//  {
//  description: "text",
//  name: "text",
//  location:"text"},
//  {name: 'site_index'}
// );
var Site= module.exports = mongoose.model("Site", siteSchema);

var Comments = require("../models/comments");
// Remove Site
module.exports.removeSite = function(id, next) {

    Site.findById(id, function(err, doc) {
        if (err) {
            console.log(err);
        }
        doc.remove(next);
    });
};

//Remove comments related to site
siteSchema.pre('remove', function(next) {
    this.comments.forEach(function(id) {
        //console.log(id);
        Comments.findByIdAndRemove(id, function(err, doc) {
            if (err) {
                console.log(err);
            }
        });
    });
 
    next();
});

// this should only be run on cli in mongo if anything new has been added to the schema 
//db.sites.update({}, {$set : {"new_field":null}}, {upsert:false, multi:true})