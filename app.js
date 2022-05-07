const express=require("express");
const bodyParser=require("body-parser");
const urlencoded = require("body-parser/lib/types/urlencoded");
const mongoose=require("mongoose");
const _=require("lodash");

const app=express();

app.set("view engine","ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb+srv://madan:madan@cluster0.yqbyk.mongodb.net/todolistDB" ,{useNewUrlParser:true});


const itemsSchema={
    name:String
};

const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
    name:"Welcome to your todolist !"
});
const item2=new Item({
    name:"hit + to add"
});
const item3=new Item({
    name:"hit * to delete"
});

const defalutItems=[item1,item2,item3];

const listSchema={
    name:String,
    items:[itemsSchema]
};

const List=mongoose.model("List",listSchema);


app.get("/",function(req,res){
    
    Item.find({},function(err,foundItems){

        if(foundItems.length===0){

            Item.insertMany(defalutItems,function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("success");
            }
        });
        res.redirect("/");
        }
        else{
        res.render("list",{kindOfDay:"Today",newListItem:foundItems});

        }
    });
    

});

app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list=new List({
                    name:customListName,
                    items:defalutItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                res.render("list",{kindOfDay:foundList.name,newListItem:foundList.items});
            }

        }
    });
  

});

app.post("/",function(req,res){
   const itemName=req.body.newItem;
   const listName=req.body.list; 

    const item=new Item({
        name:itemName
    });

    if(listName==="Today"){
        item.save();
   
        res.redirect("/");
    }

    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});

app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;

    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("success");
            }
        });
        res.redirect("/");
    }
  else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId }}},function(err,foundList){
          if(!err){
              res.redirect("/"+listName);
          }
      });
  }
});

app.listen(3000,function(){
    console.log("Server at port 3000 started");
});