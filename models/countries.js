var mongoose=require("mongoose");

var countrySchema = new mongoose.Schema({
       name: String,
       disabled:{type:Boolean,default:false}
});
// Create the index
  countrySchema.index(
     {
     name: "text"}, 
     {name: 'cnt_index'}
    );

module.exports=mongoose.model("Country", countrySchema);