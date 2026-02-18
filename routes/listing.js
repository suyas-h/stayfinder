const express =  require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing  = require("../models/listing.js");
const {listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js")
//require return an object if u export using module.export.index = ..{}
// if u directly export as module.export = ..{} then it return function.

const multer  = require('multer')
const {storage}= require("../cloudConfig.js")
const upload = multer({storage}) // multer store inside storage of cloudinary
// const upload = multer({ dest: 'uploads/'}) 
//  example of using multer store file in uploads folder





// router.route() uses here ------>
router
    .route("/")
    .get( wrapAsync(listingController.index))
    .post(isLoggedIn,upload.single('listing[image]'), validateListing,  wrapAsync(listingController.createListing)
     );
   

     // Always define specific routes first, then parameterized routes after them:
     //new route
    router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewform));

     router
        .route("/:id")
        .get(wrapAsync(listingController.showListing))
        .put(  isLoggedIn ,isOwner,upload.single('listing[image]'),validateListing , wrapAsync(listingController.updateListing))
        .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));




// index route
// jb bhi server restart hoga hm logged out hote rhenge
// router.get("/", wrapAsync(listingController.index));


  

//show route-

// router.get("/:id",wrapAsync(listingController.showListing));

//create route

// router.post("/",   validateListing,  isLoggedIn, wrapAsync(listingController.createListing));


//edit route
router.get("/:id/edit",  isLoggedIn ,isOwner, wrapAsync(listingController.renderEditform));

// update route
//  router.put("/:id" , validateListing ,  isLoggedIn ,isOwner, wrapAsync(listingController.updateListing));

 //delete route
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

 module.exports = router;
