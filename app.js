require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const bodyParser  = require("body-parser");
const ejs = require("ejs");
// const encrypt = require("mongoose-encryption");
// const md5 = require('md5');
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded( {extended:true}));
app.use(session({
    secret:"Our small Secret",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});


const userSchema = new mongoose.Schema({
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
})
app.get("/login",function(req,res){
    res.render("login");
})
app.get("/register",function(req,res){
    res.render("register");
})
app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.post("/register",function(req,res){
 User.register({username:req.body.username},req.body.password,function(err,user){
     if(err){
         console.log(err);
         res.redirect("/register");
     }else{
          passport.authenticate("local")(req,res,function(){
              res.render("secrets");
          })
     }
 })
    // bcrypt.hash(req.body.password,saltRounds,function(err,hash){
    //     const newUser = new User({
    //         email:req.body.username,
    //         password:hash
    //     })
    //     newUser.save(function(err){
    //         if(err){
    //             res.send(err);
    //         }else{
    //             res.render("secrets");
    //         }
    //     })
    // })
    
});

app.post("/login",function(req,res){

const user = new User({
    username:req.body.username,
    password : req.body.password
});
req.login(user,function(err){
    if(err){
        console.log(err);
    }
    else{
        passport.authenticate("local")(req,res,function(){
            res.render("secrets");
        })
    }
})

//    const username = req.body.username;
//    const password = (req.body.password);

//    User.findOne({email:username},function(err,foundUser){
//        if(err){
//            console.log(err);
//        }else{
//            if(foundUser){
//             //    if(foundUser.password===password){
//                 bcrypt.compare(password,foundUser.password,function(err,result){
//                        if(result===true)
//                        res.render("secrets");
//                 });
//                }
//            }
//    })
});






app.get("/logout",function(req,res){
    req.logout(function(err){
        if(err){
            res.send(err);
        }
        res.redirect("/");
    });
  
});

app.get("/submit",function(req,res){
    res.send("You have successfully send the message ");
})

app.listen(3000, function(){
    console.log("Server is running on port 3000");
})