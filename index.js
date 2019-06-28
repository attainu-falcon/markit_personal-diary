/* eslint-disable no-unused-vars */
const mongoose = require( "mongoose" );
// mongoose.connect('mongodb://localhost/27017');
const express = require( "express" );
const expressSession = require( "express-session" );
const bodyParser = require( "body-parser" );

const app = express();
//---------------------------------------------

const multipart = require( "connect-multiparty" );

const cloudinary = require( "cloudinary" );
const resolve = require( "path" );
const { multerUploads, dataUri } = require( "./middlewares/multer" );
// import { resolve } from  'path';
// import { uploader, cloudinaryConfig } from './config/cloudinaryConfig'
// var config=require("./config/cloudinaryConfig");
// const cloudinaryConfig=config.cloudinaryConfig;
const { uploader, cloudinaryConfig } = require( "./config/cloudinaryConfig" );
// console.log(config);
app.use( "*", cloudinaryConfig );

//-------------------------------------------------

app.use( bodyParser.json() );

app.use( express.static( "./public" ) );

// var db = mongoose.connection;

app.get( "/signup", ( req, res ) => {
    res.end( "Registration Succesfully Completed!" );

    const db = mongoose.connection;
    db.on( "error", console.error.bind( console, "connection error:" ) );
    db.once( "open", ( callback ) => {
        console.log( "connected." );
    } );

    const RegSchema = mongoose.Schema( {
        Name: String,
        Email: String,
        Pass: String,
        Num: Number,
        reg_time: {
            type: Date, default: Date.now,
        },
    }, { collection: "AddressCol" } );

    const UserReg = mongoose.model( "UserReg", RegSchema );

    const UserAdd = new UserReg( {
        Name: req.session.name,
        Email: req.body.email,
        Pass: req.body.pass,
        Num: req.body.num,
    } );

    UserAdd.save( ( err, fluffy ) => {
        if ( err ) return console.error( err );
    } );
} );
app.get( "/", ( req, res, next ) => {
    const user = {
        Name: req.session.name,
        Email: req.body.email,
        Pass: req.body.pass,
        Num: req.body.num,
    };
    const UserReg = mongoose.model( "UserReg", RegSchema );
    UserReg.create( user, ( err, newUser ) => {
        if ( err ) return next( err );
        req.session.user = email;
        return res.send( "Logged In!" );
    } );
} );
app.get( "/", ( req, res ) => {
    res.reindirect( "index.html" );
} );

app.get( "/login", ( req, res, next ) => {
    const { email } = req.body;
    const { pass } = req.body;

    User.findOne( { Email: email, Pass: pass }, ( err, user ) => {
        if ( err ) return next( err );
        if ( !user ) return res.send( "Not logged in!" );

        req.session.user = email;
        return res.send( "Logged In!" );
    } );
} );

app.get( "/logout", ( req, res ) => {
    req.session.user = null;
} );

// --------------UPLOAD route---------------------

app.post( "/upload", multerUploads, ( req, res ) => {
    if ( 1 ) {
        if ( req.file ) {
            const file = dataUri( req ).content;
            return uploader.upload( file, () => { }, { resource_type: "auto" } ).then( ( result ) => {
                const image = result.url;
                return res.status( 200 ).json( {
                    messge: "Your image has been uploded successfully to cloudinary",
                    data: {
                        image,
                    },
                } );
            } ).catch( err => res.status( 400 ).json( {
                messge: "someting went wrong while processing your request",
                data: {
                    err,
                },
            } ) );
        }
    }
} );

//-------------------------------------------------

app.listen( 3000, () => { console.log( "server started at 3000" ); } );
