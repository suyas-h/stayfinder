const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema } = require("./schema.js");
const {reviewSchema} = require("./schema.js");
const Review  = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next)=>{
    // console.log(req.path , ".." ,req.originalUrl)
  if(!req.isAuthenticated()){
    req.session.redirectUrl = req.originalUrl;
       req.flash("error" , " you must be logged in to create listing")
     return res.redirect("/login")
  }
    next();
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if(req.session.redirectUrl){
   
        res.locals.redirectUrl = req.session.redirectUrl;
        // console.log(res.locals.redirectUrl);
    }
    next();
}

module.exports.isOwner = async(req,res,next)=>{
       let {id} = req.params;
      let listing = await Listing.findById(id);
  if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error" ,"you are not the owner of this listing!")
       return res.redirect(`/listings/${id}`);

    }
    next();
}

// schema-validation as middleware
module.exports. validateListing  = (req,res,next)=>{
  let {error} = listingSchema.validate(req.body); // save to ho jayega per error detected
    if (error){
        // console.log(error);
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400 , errMsg);
    }else{
        next()
    }
}


// validate review
module.exports. validateReview  = (req,res,next)=>{
  let {error} = reviewSchema.validate(req.body); // save to ho jayega per error detected
    if (error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400 , errMsg);
    }else{
        next()
    }
}


module.exports.isreviewAuthor = async(req,res,next)=>{
       let {id,reviewId} = req.params;
      let review = await Review.findById(reviewId);
  if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error" ,"you are not the author of this review!")
       return res.redirect(`/listings/${id}`);

    }
    next();
}