require('dotenv').config()
const express=require("express");
const cors=require("cors");
const app=express();
const mongoose=require("mongoose");
const PORT=process.env.PORT || 3000;
const bodyParser=require("body-parser");
const jwt=require("jsonwebtoken");
const bcrypt = require('bcrypt');
mongoose.connect(process.env.DATABASE).then(()=>{
    console.log("Connected");
});

//middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
const bookSchema=new mongoose.Schema({
    title:String,
    authorName:String,
    imageUrl:String,
    category:String,
    bookDescription:String,
    bookPdfUrl:String
});

const Book=mongoose.model("Book",bookSchema);



app.get("/",(req,res)=>{
    res.send("Hello");
});


app.post("/upload-book",(req,res)=>{

const book=new Book({
    title:req.body.title,
    authorName:req.body.authorName,
    imageUrl:req.body.imageUrl,
    category:req.body.category,
    bookDescription:req.body.bookDescription,
    bookPdfUrl:req.body.bookPdfUrl
    
});

book.save().then(savedBook => {

  savedBook._id = savedBook._id.toString();
  res.json(savedBook);
}).catch(()=>{
    res.send("Not saved");
});
});


app.post('/insertMany', async (req, res) => {
  try {
    const items = req.body.items;

    // Insert the array of items into the MongoDB collection
    const insertedItems = await Book.insertMany(items);

    res.json({ success: true, items: insertedItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



app.get("/books", async (req, res) => {
  try {
    if (req.query?.category) {
      const category = req.query.category;
      const books = await Book.find({ category: category });
      res.json(books);
    } else {
      const books = await Book.find();
      res.json(books);
    }
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get("/books/:id", async (req, res) => {
  const id=req.params.id;
  const result=await Book.findById(id);
  res.send(result);
});



 app.patch("/books/:id", async (req, res) => {
   await Book.findByIdAndUpdate(
     { _id: req.params.id },
     { $set: req.body },
     { new: true }
   ).then((book) => {
     res.send("Updated book");
   });
 });
 
 app.delete("/books/:id", async (req, res) => {
   await Book.findByIdAndDelete(req.params.id).then((book) => {
     
   });
 });



 
 const UserSchema=new mongoose.Schema({
  name:String,
  email:String,
  password:String,
  role:String,
});

const User=mongoose.model("User",UserSchema);


  app.post('/register', async (req, res) => {
    const { email, password,name } = req.body;
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role:'user'
      });
  
     
      await newUser.save();
  
     
      const jwtToken = jwt.sign(
        {
          id: newUser._id,
          email: newUser.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.json({ message: 'Signup successful', token: jwtToken,isCreated:true });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error',isCreated:false });
    }
  });

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
   
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: 'Email or password does not match' });
      }
  
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Email or password does not match' });
      }
  
      
      const jwtToken = jwt.sign(
        {
          id: user._id,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      
      );
  
      res.json({ message: 'Login successful', token: jwtToken,name:user.name, role:user.role });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

 app.get("/getuser",async (req,res)=>{
    const users=await User.find();
    res.send(users);
  })
  
  app.delete("/getuser/:id", async (req, res) => {
    await User.findByIdAndDelete(req.params.id).then((user) => {
      
    });
  });

  app.get("/getuser/:id", async (req, res) => {
    const id=req.params.id;
    const result=await User.findById(id);
    res.send(result);
  });

  app.patch("/getuser/:id", async (req, res) => {
    await User.findByIdAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    ).then((book) => {
      res.send("Updated Role");
    });
  });


app.listen(PORT,()=>{
    console.log("Running...");
})