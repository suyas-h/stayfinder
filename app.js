if(process.env.NODE_ENV != "production"){
require('dotenv').config()
// you can access env files variables after require
}
console.log(process.env.SECRET) 
// Jab tum .env file me kuch secrets ya settings store karte ho 
// (jaise database URL, API keys, passwords),
// To ye  "require('dotenv').config()" line un values ko process.env object me load kar deti hai,
// Taaki tum apne code me process.env.VARIABLE_NAME se access kar sako.


const express =  require("express");
const app = express();
const mongoose  = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
const ExpressError = require("./utils/ExpressError.js");
const Review  = require("./models/review.js");
const Listing  = require("./models/listing.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const flash = require("connect-flash");
//auth ---
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js")




const dbUrl = process.env.ATLASDB_URL; 

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto:{
        secret : process.env.SECRET
    },
    touchAfter:24*3600
})


 store.on("error",(err)=>{
  console.log("ERROR IN MONGO SESSION STORE",err);
 })

const sessionOption = {
    store,
    secret : process.env.SECRET,
    resave :false,
    saveUninitialized :true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly:true
    },
}





async function Main(){
  await  mongoose.connect(dbUrl,{
    tls:true
  });
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));

Main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log("err")
})


//  some imp - middleware 
app.use(session(sessionOption));
app.use(flash());

// authentication ( using passport)
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate()))
 passport.serializeUser(User.serializeUser()); // serialize user's info into session
//  “Passport, use the function from my User model to 
// store the user’s ID in the session when they log in.”
passport.deserializeUser(User.deserializeUser()); //
//  Yes — the userId is stored inside a server-side session 
// object (a key–value data structure managed by express-session), not in cookies.

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // console.log(res.locals.success);
    // inside server file we cant access writing only success becoz "success" is 
    // property of res.locals when page render express automatically send it to that page.
    next()
})

// app.get("/",(req,res)=>{
//     res.send("hii i am root");
// });

// demo user

// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username:"delta-student", // automatic add in schema by passport

//     });
//    let registeredUser = await User.register(fakeUser,"helloworld"); //save user instance in DB
//     // it also check automatic username uniqe or not
//     res.send(registeredUser);
// })



// for all listing route  --- 
// “For every request that starts with /listings, use the routes defined in listings router.”
app.use("/listings" ,listingRouter)

// for all review route --- 
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter)




// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title:"my new villa",
//         description: "By the beach",
//         price :1200,
//         location:"calanguite , goa",
//         country : "india"

//     });
//     await sampleListing.save();
//     console.log("sampllsiting save");
//     res.send("successfull");
    

// })
// error-handling middleware(asynchronous) server-side validation
app.all(/.*/, (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});




app.use((err,req,res,next)=>{
    
    let {statusCode = 500 , message = "something went wrong"} = err;
    res.status(statusCode).render("error.ejs" , {message});
    // res.status(statusCode).send(message);
    // status() is a method that sets the HTTP status code of the response.

//   res.send("something went wrong");
});


app.listen(8080,()=>{
 console.log("server is listening to port");
});

//our first model(collection) is listing (list of element on airbnb )
//each list contain some info as -  title,description,image ,price,location,country
