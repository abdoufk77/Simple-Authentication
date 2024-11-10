const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
require("./src/dbconnexion");

const Users = require("./src/models/Users");

const app = express();
const PORT = 3000;

app.use(express.json());
app.set("views", "./src/views/pages");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//configurer la session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

function checkAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.session.userId) {
    return res.redirect("/");
  }
  next();
}

app.get("/", checkAuthenticated, async (req, res) => {
  try {
    const user = await Users.findById(req.session.userId);
    res.render("index", { name: user.username });
  } catch (err) {
    console.log(err);
  }
});

//get la poge de login
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login", { message: null });
});

//get la page de register
app.get("/register", (req, res) => {
  res.render("register", { message: null });
});

//poster les info de login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Users.findOne({ username: username });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.userId = user.id;
        res.redirect("/");
      } else {
        return res.render("login", {
          message: "Email ou mot de passe incorrect",
        });
      }
    } else {
      res.render("login", { message: "Email ou mot de passe incorrect" });
    }
  } catch (error) {
    console.log(error);
  }
});

//poster les info de regiser
app.post("/register", async (req, res) => {
  const { username, password, cpassword } = req.body;

  try {
    const user = await Users.findOne({ username: username });
    if (user) {
      return res.render("register", { message: "user already exists" });
    }
  } catch (error) {
    console.log("Erreur lors de la recherche de l'utilisateur");
  }

  if (username.length == 0) {
    return res.render("register", { message: "username empty" });
  }

  if (password !== cpassword) {
    return res.render("register", { message: "verfier password" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new Users();
    user.username = username;
    user.password = hashedPassword;

    await user.save();
    res.redirect("login");
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l’utilisateur" });
  }
});

//logout
app.post("/logout", (res, req) => {
  res.session.destroy();
  res.redirect("login");
});

app.listen(PORT, () => {
  console.log(`server listing on port ${PORT}`);
});
