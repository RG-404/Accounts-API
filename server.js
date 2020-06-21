const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const passportSetup = require('./services/passport-setup')

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//DB Config
const uri = process.env.ATLAS_URI;

//Connect to Mongo
mongoose.connect(uri, {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true})
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection extablished successfully");
})

//Bodyparser
app.use(express.urlencoded({extended: false}));

//Routes

//Auth
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

//Google Auth
const googleAuthRouter = require('./routes/googleAuth')
app.use('/googleauth', googleAuthRouter)

//Register
const registerRouter = require('./routes/register');
app.use('/register', registerRouter);

//Secure route
const secureRouter = require('./routes/secured');
app.use('/secured', secureRouter);

//Confirm route
const confirmRouter = require('./routes/confirm');
app.use('/confirm', confirmRouter);

//Forgot route
const forgotRouter = require('./routes/forgot');
app.use('/forgot', forgotRouter);

//Delete route
const deleteRouter = require('./routes/delete');
app.use('/delete', deleteRouter);

//Update route
const updateRoute = require('./routes/update');
app.use('/update', updateRoute);

//Report route
const reportRouter = require('./routes/report');
app.use('/report', reportRouter);

//Suspicion route
const suspicionRouter = require('./routes/suspicion');
app.use('/suspicion', suspicionRouter);

//User route
const userRouter = require('./routes/user');
app.use('/user', userRouter);

app.get("/", (req, res)=>{
    // res.send("Working")
    // res.redirect('https://google.com');
    res.send(
        `<img src="https://i.pinimg.com/474x/33/23/94/33239488ede380d4f02386460ed3adf3.jpg">`
    )
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})

