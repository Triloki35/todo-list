// ***setting ups *****
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.set("view engine", "ejs");
mongoose.connect("mongodb+srv://triloki35:"+process.env.PASS+"@cluster0.1fz6j.mongodb.net/todolistDB"); 

// creating Collection in db
const itemSchema = mongoose.Schema({
    name: String
})

const item = mongoose.model("item", itemSchema);

const item1 = new item({
    name: "Welcome to todo List"
});
const item2 = new item({
    name: "Hit the + button to add new item."
});
const item3 = new item({
    name: "<< Hit this to delete an item."
});

const defaultItem = [item1, item2, item3];


// creating another Collection in db

const listSchema = mongoose.Schema({
    name : String,
    item : [itemSchema]
})

const list = mongoose.model("list" , listSchema);

//******* home route ****

var today;

app.get("/", function (req, res) {

    // getting date js
    var date = new Date();
    var day = date.getDay();
    var nameOFday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var todayDate = date.getDate();
    var month = date.getMonth();
    var nameOFmonth = ["January", "February", "March",
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December"];
    var currYear = date.getFullYear();

    today = nameOFday[day] + " , " + todayDate +" "+ nameOFmonth[month] + " " + currYear ; 

    // finding all doc in db
    item.find({},function(err,foundItem)
    {
        if(err)
            console.log(err);
        else
        {
            if(foundItem.length === 0)
            {
                // iserting defaultItem in db 
                item.insertMany(defaultItem, function (err) 
                {
                    if (err) 
                    {
                        console.log(err);
                    } 
                    else 
                    {
                        console.log("successfully inserted default item")
                    }
                });
            }
            // console.log(foundItem);
            res.render("list", { list_name :today , newtask: foundItem });
        }
    })
})

//*****  creating custom route*****
app.get("/:customName",function(req,res){
    // console.log(req.params.customName);
    const custom_List_Name =   _.trim(_.capitalize(req.params.customName));

    list.findOne({name : custom_List_Name},function(err,result){

        if(err)
            console.log(err);
        else
        {
            if(!result)
            {
                // creating new list 
                const newList = new list({
                    name :  custom_List_Name ,
                    item : defaultItem
                })
                newList.save();
                res.redirect("/"+custom_List_Name);
            }
            else
            {
                res.render("list", { list_name :  result.name ,newtask : result.item});
            }
           
        }
            
    })
})



// ********new entry in Collection*******
app.post("/", function (req, res) {
    var taskName = req.body.task;
    var taskheading = req.body.list;

    const newEntry = new item({
        name: taskName
    })

   
    if(taskheading==today)
    {
        newEntry.save();
        res.redirect("/");
    }
    else 
    {
        list.findOne({name : taskheading},function(err,foundItem){
                if(err){
                    console.log(err);
                }else{
                    // console.log(foundItem.item);
                    let x = foundItem.item;
                    x.push(newEntry);
                    foundItem.save();
                    res.redirect("/"+taskheading);
                }
               
        })
    }
  
})


//******* deleting from item Collection ******
app.post("/delete",function(req,res){
    
    const checkedItem = req.body.checkBox ;
    const listName = req.body.listName;


    if(listName==today)
    {
        item.deleteOne({ name: checkedItem },function(err){
            if(err)
            console.log("deleting failed !!");
            else
            console.log("item deleted sucessfully !!");
        });
        res.redirect("/");
    }
    else
    {
        list.findOneAndUpdate({name:listName},{ $pull: {item:{name:checkedItem}} },function(err,result){
            if(err)
            console.log(err);
            else
            res.redirect("/"+listName);
        })
    }

    
})


// port 
app.listen(process.env.PORT||3000, function () {
    console.log("server is running at 3000 port")
})