var mongoose=require("mongoose");

var categorySchema = new mongoose.Schema({
       name: String,
       usedFor:String,
       disabled:{type:Boolean,default:false}
});

 // Create the index
  categorySchema.index(
     {
     name: "text"}, 
     {name: 'cat_index'}
    );
 

module.exports=mongoose.model("Category", categorySchema);