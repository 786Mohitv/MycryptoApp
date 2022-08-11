require('dotenv').config();
const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser")
const https = require("https")
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const app = express();

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static("public"))

app.use(session({
  secret: process.env.KEY, //have to put this key into env     /// it is a random unique string key, which is used to authenticate a session
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

///////////////////////////// /////////////////////////////////////////creating database for register page/////////////////////////////////////////////////////////////////////////////////////////////
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  mobnum: String,
  username: {
    type: String,
    unique: true,
    lowercase: true
  },
  password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//////////////////////////////////////////////////////////////////////end of creating database//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/", function(req, res) {
  //res.sendFile(__dirname + "/list.html");
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
})








app.get("/news", function(req, res) {
  res.render("news");
})



//////////////////////////////////////////////////////////////////////////////// created for sending data to table of coin list...///////////////////////////////////////////////////////////////////////..
  app.get("/coin_list", function(req, res) {

    if (req.isAuthenticated()) {
      const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d"
      https.get(url, (response) => {
        let data = "";
        response.on("data", piece => {
          data += piece;
        });
        response.on("end", () => {
          let coinData = JSON.parse(data);
          res.render("coins", {
            pageData: coinData
          })
        })

      })
    } else {
      res.redirect("/");
    }


  }).on('error', (e) => {
    console.error(e);
  });


////////////////////////////////////////////////////////////on-clicking any coin it should render to there chart , creating for coin.ejs.....////////////////////////////////////////////////////////////////////

app.get("/coin/:id", function(req, res) {

  const queryId = req.params['id'];
  const url = "https://api.coingecko.com/api/v3/coins/" + queryId + "?market_data=true";

  https.get(url, function(response) {
    let body = [];
    response.on("data", function(data) {
      body.push(data);
    }).on("end", function() {
      body = Buffer.concat(body).toString();
      jsonData = JSON.parse(body)
      res.render("coin", {
        pageData: jsonData
      });
    });
  });

})

/////////////////////////////////////////////////////////////////////////////help section//////////////////////////////////////////////////////////////////////////////
app.get('/help', function(req, res) {
  if (req.isAuthenticated()) {
    res.render("help");
  } else {
    res.render('login');
  }
})


//////////////////////////////////////////////////////////////////////////////account section////////////////////////////////////////////////////////////////////////////

app.get('/account', async (req, res) => {
  if (req.isAuthenticated()) {
    var user = req.user;
    res.render('account', {
      user: user
    });
  } else {
    res.render("login");
  }

})

app.get("/logout", function(req, res) {
  req.logout(function(err) {
    if (err) {
      return next(err); //for exploring from wehere this next came  goto  https://www.passportjs.org/concepts/authentication/logout/
    } else {
      res.redirect("/");
    }
  });
});


//*************************************************************************ALL POST ROUTES START FROM HERE*************************************************************************************************

///////////////////////////////////////////////////////////////////////// creating for clicking on prev / next button of coin list page.....//////////////////////////////////////////////////////////////////////////////

let query = 1;

app.post("/coin_list", function(req, res) {

  if (req.isAuthenticated()) {
    if (req.body.hasOwnProperty("btn1")) {
      query--;
    } else {
      query++;
    }

    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=" + query + "&sparkline=false&price_change_percentage=1h%2C24h%2C7d"

    https.get(url, (response) => {
      let data = "";
      response.on("data", piece => {
        data += piece;
      });
      response.on("end", () => {
        let coinData = JSON.parse(data);
        res.render("coins", {
          pageData: coinData
        })
      });

    })
  } else {
    res.redirect("/");
  }

}).on('error', (e) => {
  console.error(e);
});

//////////////////////////////////////////////////for registering new user///////////////////////////////////

app.post("/register", function(req, res) {
  const newUser = new User({
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    mobnum: req.body.mobnum,
    username: req.body.username,
  });


  User.register(newUser, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/coin_list");
      });
    }
  });


});



//////////////////////////////////////on clicking login button//////////////////////////////////
app.post('/', function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  })

  req.login(user, function(err) {
    if (err) {
      return next(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/coin_list");
      });
    }
  })
})


/////////////////////////////////////////////////////////password change route////////////////////////////////////////////////////
app.post('/account', function(req, res) {

  User.findOne({
      username: req.user.username
    })
    .then(foundUser => {
      foundUser.changePassword(req.body.oldPass, req.body.newPass)
        .then(() => {
          //console.log('password changed');
          //req.flash('message', 'Password Changed Successfully :)');
          res.redirect('/account')
        })
        .catch((error) => {
          console.log(error);
        })
    })
    .catch((error) => {
      console.log(error);
    });

})








const port = process.env.PORT;
app.listen(port, function() {
  console.log("Server started at port ${process.env.PORT}")
})




//
// const getSearchData= ((url1) => {return new Promise((resolve, reject) =>
// {
//   const req = https.get(url1,  function(response1) {
//     let body1 = [];
//     response1.on("data", function(data) {
//       body1.push(data);
//     });
//     response1.on("error",reject);
//     response1.on("end", function() {
//       body1 = Buffer.concat(body1).toString();
//       jsonData1 = JSON.parse(body1)
//       //console.log(jsonData1.coins);
//       // temp.push(jsonData1);
//       resolve(jsonData1)
//       })
//       // console.log(temp[0]);
//       //res.render("searched_coins",{pageData:pageData1});
//     });
//     req.on('error',reject);
//     req.end();
// });
//
// });
//
//
// app.post("/coin_list", async function(req, res) {
//
//   const toSearch = req.body.search;
//   const url1 = "https://api.coingecko.com/api/v3/search?query=" + toSearch;
//   let temp = [];
//   const jsonData1 = await getSearchData(url1) ;
//
//   res.render("coins",{searchData:jsonData1.coins});
//   });
