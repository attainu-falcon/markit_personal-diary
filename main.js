var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/27017');
var express = require('express');
var expressSession = require('express-session');
const bodyParser = require('body-parser');

var app = express();
//---------------------------------------------

const multipart=require("connect-multiparty")

var cloudinary = require('cloudinary');
import  {multerUploads, dataUri} from "./middlewares/multer";
import { resolve } from  'path';
import { uploader, cloudinaryConfig } from './config/cloudinaryConfig'

app.use('*', cloudinaryConfig);

//-------------------------------------------------



app.use(bodyParser.json());

app.use(express.static('./public'));

//var db = mongoose.connection;

app.get("/signup",function(req,res){
    res.end("Registration Succesfully Completed!");

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function (callback) {
        console.log("connected.")
    });

    var RegSchema = mongoose.Schema({
        Name: String,
        Email: String,
        Pass: String,
        Num: Number,
        reg_time : {
            type : Date, default: Date.now
        }
    }, { collection: 'AddressCol' });

    var UserReg = mongoose.model('UserReg', RegSchema);

    var UserAdd = new UserReg({
        Name: req.session.name,
        Email: req.body.email,
        Pass: req.body.pass,
        Num: req.body.num,
    });


    UserAdd.save(function (err, fluffy) {
        if (err) return console.error(err);
    });
});
app.get('/', function (req, res, next) {
    var user = {
       Name: req.session.name,
       Email: req.body.email,
       Pass: req.body.pass,
       Num: req.body.num
   };
   var UserReg = mongoose.model('UserReg', RegSchema);
   UserReg.create(user, function(err, newUser) {
      if(err) return next(err);
      req.session.user = email;
      return res.send('Logged In!');
   });
});
app.get('/',function(req,res){
    res.reindirect('index.html');
})

app.get('/login', function (req, res, next) {
   var email = req.body.email;
   var pass = req.body.pass;

   User.findOne({Email: email, Pass: pass}, function(err, user) {
      if(err) return next(err);
      if(!user) return res.send('Not logged in!');

      req.session.user = email;
      return res.send('Logged In!');
   });
});

app.get('/logout', function (req, res) {
   req.session.user = null;
});


//--------------UPLOAD route---------------------


app.post('/upload', multerUploads, (req, res) => {
	if(1)
	{
		if(req.file) {
			console.log("req.file"+req.file)
			const file = dataUri(req).content;
			return uploader.upload(file).then((result) => {
				const image = result.url;
				console.log(image)
				return res.status(200).json({
					messge: 'Your image has been uploded successfully to cloudinary',
					data: {
					image
					}
				})
			}).catch((err) => res.status(400).json({
				messge: 'someting went wrong while processing your request',
				data: {
					err
				}
			}))
			}
	}
	
	});


//-------------------------------------------------

app.listen(3000,()=>{console.log("server started at 3000")});


