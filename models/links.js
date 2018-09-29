var mongoose=require("mongoose");

var linkSchema = new mongoose.Schema({
       link: String,
       name:{type:String},
       image:String,
       description:{type:String},
       category: {
              type:mongoose.Schema.Types.ObjectId,
              ref:"Category"
       },
       country: {
              type:mongoose.Schema.Types.ObjectId,
              ref:"Country"
       },
       createdby: {
              type:mongoose.Schema.Types.ObjectId,
              ref:"User"
       },
       createdDate:{type:Date,default:Date.now}
});

linkSchema.index ({
       description: "text", 
       name: "text",
       link:"text"}, 
       {name: 'link_index'}
);

module.exports=mongoose.model("Link", linkSchema);