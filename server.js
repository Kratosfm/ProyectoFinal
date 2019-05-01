const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
var methodOverride = require('method-override');
var logger = require('morgan');
var mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
var http = require('http');
var fs =require('fs');

const app = express();
const router = express.Router();
app.use('/static', express.static('css'))
app.use('/static', express.static('js'))

//Load View Engine
app.set('views', path.join(__dirname,'views'));
app.set('view engine','pug');

//Body Parser
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

mongoose.connect('mongodb://localhost/nodekb',{useNewUrlParser: true});
let db = mongoose.connection;
//Bringt models
let Pets = require('./js/pets');
//Bring in user models
let User = require('./js/user');

//Check conecction
db.once('open',function(){
  console.log('Conected to Mongo');
});

//Check db error
db.on('error',function(err){
  console.log(err);
})
app.get("/anadir",function(solicitur,respuesta){
  respuesta.render('anadir');
});

//Add Submit Post Route
app.post("/anadir",function(solicitur,respuesta){
  solicitur.checkBody('name','Name is required').notEmpty();
  solicitur.checkBody('animal','animal is required').notEmpty();
  solicitur.checkBody('age','age is required').notEmpty();

  //Get errors
  let errors = solicitur.validationErrors();

  if (errors) {
    respuesta.render('anadir',{
      errors: errors
    });
  } else {

  }

  let pets = new Pets();
  pets.name = solicitur.body.name;
  pets.animal = solicitur.body.animal;
  pets.age = solicitur.body.age;
  pets.save(function(err){
    if(err){
      console.log(err);
    } else {
      solicitur.flash('success','Pet Added');
      respuesta.redirect("/mypets");
    }
  })
})

//Load Edit form
app.get("/pet/edit/:id",function(solicitur,respuesta){
  Pets.findById(solicitur.params.id, function(err, pets){
    respuesta.render('edit_pet',{
    pets:pets
    });
  });
});

//Update Submit Post Route
app.post("/pet/edit/:id",function(solicitur,respuesta){
  let pets = {};
  pets.name = solicitur.body.name;
  pets.animal = solicitur.body.animal;
  pets.age = solicitur.body.age;

  let query = {_id:solicitur.params.id}

  Pets.update(query,pets,function(err){
    if(err){
      console.log(err);
    } else {
      solicitur.flash('success','Pet Update')
      respuesta.redirect("/mypets");
    }
  })
})
//Deletee Pet
app.delete('/pet/:id',function(solicitur,respuesta){
  let query = {_id:solicitur.params.id}
  Pets.remove(query, function(err){
    if (err) {
      console.log(err);
    }
    respuesta.send('Success');
  });
});

//Get single pets
app.get("/pet/:id",function(solicitur,respuesta){
  Pets.findById(solicitur.params.id, function(err, pets){
    respuesta.render('pet',{
    pets:pets
    });
  });
});

//Express session
app.use(session({
  secret:'keyboard cat',
  resave: true,
  saveUnitialized:true
}));

//Express messages middleware
app.use(require('connect-flash')());
app.use(function(req,res,next){
  res.locals.messages = require('express-messages')(req,res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


// Passport Config
require('./js/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get('/', function(req, res){
  Pets.find({}, function(err, pets){
    if(err){
      console.log(err);
    } else {
      res.render('main', {
        name:'Pets',
        pets: pets
      });
    }
  });
});

//Register form
app.get("/register",function(solicitur,respuesta){
  respuesta.render('register');
});

//Register Process
app.post('/register',function(solicitur,respuesta){
  const name = solicitur.body.name;
  const email = solicitur.body.email;
  const username = solicitur.body.username;
  const password = solicitur.body.password;
  const password2 = solicitur.body.password2;

  solicitur.checkBody('name','Name is required').notEmpty();
  solicitur.checkBody('email','Email is required').notEmpty();
  solicitur.checkBody('email','Email is required').isEmail();
  solicitur.checkBody('username','UserName is required').notEmpty();
  solicitur.checkBody('password','Password is required').notEmpty();
  solicitur.checkBody('password2','Password do not match').equals(solicitur.body.password);

  let errors = solicitur.validationErrors();
  if (errors) {
    respuesta.render('register',{
      errors:errors
    });
  } else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password
  });
  bcrypt.genSalt(10, function(err, salt){
    bcrypt.hash(newUser.password, salt, function(err, hash){
      if(err){
        console.log(err);
      }
      newUser.password = hash;
      newUser.save(function(err){
        if(err){
          console.log(err);
          return;
        } else {
          solicitur.flash('success','You are now registered and can log in');
          respuesta.redirect('/login');
        }
      });
    });
  });
}
});
//Login form
app.get("/login",function(solicitur,respuesta){
  respuesta.render('login');
});

//Login Process
app.post('/login', function(solicitur, respuesta, next){
  passport.authenticate('local', {
    successRedirect:'/mypets',
    failureRedirect:'/perros',
    failureFlash: true
  })(solicitur, respuesta, next);
});



//Get de ventanas
app.get("/mypets",function(solicitur,respuesta){
  Pets.find({},function(err, pets){
    if (err) {
      console.log(err);
    }
    else {
      respuesta.render('mypets',{
      name:'Pets',
      pets:pets
    });
  }
  });
});


app.get("/perros",function(solicitur,respuesta){
  respuesta.render('perros');
});

app.get("/gatos",function(solicitur,respuesta){
  respuesta.render('gatos');
});

app.get("/peces",function(solicitur,respuesta){
  respuesta.render('peces');
});

app.get("/home",function(solicitur,respuesta){
  respuesta.render('main');
});

//Logout
app.get('/logout', function(solicitur, respuesta){
  solicitur.logout();
  solicitur.flash('success', 'You are logged out');
  respuesta.redirect('/users/login');
});


app.listen(8080);
