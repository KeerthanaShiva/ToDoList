require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const PORT=process.env.PORT || 4000;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

mongoose.set('strictQuery', false);
const un=process.env.ADMIN_NAME;
const pw=process.env.PASSWORD;
const connectDB=mongoose.connect("mongodb+srv://"+un+":"+pw+"@cluster0.hjo1hqr.mongodb.net/?retryWrites=true&w=majority");

let day = date();
const itemSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "hello"
})
const item2 = new Item({
  name: "namaskara"
})
const item3 = new Item({
  name: "hii"
})



const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if(err){
      console.log(err);
   }else{
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successful");
        }
      });
      res.redirect("/");
    }
     else {
      console.log("hii");
      res.render("lists", { listTitle: day, newListItems: foundItems });
    }
   }

    
  })
})

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (err) {
      console.log(err);
    }else{
          if (!foundList) {
            //create a new list (as there is no list inside customListName list
            const list = new List({
              name: customListName,
              items: defaultItems
            })
            list.save();
            res.redirect("/" + customListName);
          } else {
            //show an existing list(if there exist a list already)
            res.render("lists", { listTitle: foundList.name, newListItems: foundList.items });
          }
         }
     })
  })


app.post("/", function (req, res) {
console.log("hoo");
  const newItem = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: newItem
  })

  if (listName == day) {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name:listName }, function (err, foundList) {
      if (err) {
        console.log(err);
      } else {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }

    })
  }


app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName == day) {
    Item.findByIdAndRemove(checkedItemId,function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("successhii");
        res.redirect("/");
      }
    })
  }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    })

  }

})

  connectDB.then(() =>{
  app.listen(PORT, function () {
    console.log("server started on port 4000");
    // console.log(process.env.MONGO_URI);
  })
 })
