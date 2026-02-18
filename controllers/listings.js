const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
// CREATE BASE CLIENT
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res)=>{
   const allListings =  await Listing.find({});
   res.render("listings/index.ejs",{allListings});
 
}

module.exports.renderNewform = async(req,res)=>{
      
        res.render("listings/new.ejs")
 }

 module.exports.showListing =async (req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path : "reviews",
        populate :{
          path : "author"
        }   
    })
    .populate("owner");

    if(!listing){
        req.flash("error" , "Listing you requested for does not exist!")
        return res.redirect("/listings")
    }
    res.render("listings/show.ejs",{listing});

}
 
module.exports.createListing = async(req,res,next)=>{
    // let result = listingSchema.validate(req.body); // save to ho jayega per error detected
    // console.log(result);
    // if (result.error){
    //     throw new ExpressError(400 , result.error);
    // }
    // if(!req.body.listing){
    //    throw  new ExpressError(400 , "send valid data for listing" )
    //    // becoz of client error
    // }
   // let{title,description,image,location,country} = req.body;

   let response = await geocodingClient.forwardGeocode({
        query:req.body.listing.location,
        limit: 1 // by default it give 5 mathed location of query
     }) .send()
    
        
   let url = req.file.path;
   let filename = req.file.filename
   console.log(url , ".." , filename)
    const newlisting = new Listing(req.body.listing);
    // if listing individual item missing --
    //schema validation here 
    //  if(!newlisting.description){ // you can write for each individual item 
    //     throw  new ExpressError(400 , "discription is missing!" )
    //  }
    newlisting.owner = req.user._id;
    newlisting.image = {url,filename}
    if (response.body.features.length > 0) {
    newlisting.geometry = response.body.features[0].geometry;
  }
   let savedListing =  await newlisting.save();
   console.log(savedListing)
   req.flash("success" , "New Listing Created!")
    res.redirect("listings");
    
}

module.exports.renderEditform = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
     if(!listing){
        req.flash("error" , "Listing you requested for does not exist!")
        return res.redirect("/listings")
    }

   let originalImageUrl =  listing.image.url ;
   originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs",{listing , originalImageUrl})
}

module.exports.updateListing = async(req,res)=>{
    // if(!req.body.listing){
    //    throw  new ExpressError(400 , "send valid data for listing" )
    //    // becoz of client error
    // }
    let {id} = req.params;
    let listing = await Listing.findById(id);
    //authorization for update by user
   await Listing.findByIdAndUpdate(id,{...req.body.listing})
   if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename
    listing.image = {url,filename}
    await listing.save();
   }
    
    req.flash("success" , "New Listing Updated!")
   res.redirect(`/listings/${id}`);

 }

 module.exports.destroyListing = async(req,res)=>{
      let {id} = req.params;
      // reviws also deleted from db if listing delete
    let deletedListing =   await Listing.findByIdAndDelete(id); 
    console.log(deletedListing);
     req.flash("success" , " Listing Deleted!")
    res.redirect("/listings");
 
  }