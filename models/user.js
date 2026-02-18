// user model
const mongoose = require("mongoose");
const Schema =  mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

// define user schema' 
const userSchema =  new Schema ({
    email : {
        type : String,
        required :true
    }
    // you can add more here

})
userSchema.plugin(passportLocalMongoose); // plugin
module.exports = mongoose.model('User', userSchema);
