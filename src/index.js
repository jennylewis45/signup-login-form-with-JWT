const express = require("express");
const Collection = require("./mongo");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, "../templates");

app.set('view engine', 'hbs');
app.set("views", templatePath);

async function hashPassword(password) {
    const res = await bcryptjs.hash(password, 10);
    return res;
}

async function comparePassword(userpass, hashpass) {
    const res = await bcryptjs.compare(userpass, hashpass);
    return res;
}

app.get("/", (req, res) => {
    if (req.cookies.jwt) {
        try {
            const verify = jwt.verify(req.cookies.jwt, "helloandwelcometotechywebdevtutorialonauthhelloandwelcometotechywebdevtutorialonauth");
            res.render("home", { name: verify.name });
        } catch (err) {
            console.error(err);
        }
    } else {
        res.render("login");
    }
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    try {
        const check = await Collection.findOne({ name: req.body.name });
        if (check) {
            res.send("user already exists");
        } else {
            const token = jwt.sign({ name: req.body.name }, "helloandwelcometotechywebdevtutorialonauthhelloandwelcometotechywebdevtutorialonauth");
            res.cookie("jwt", token, {
                maxAge: 600000,
                httpOnly: true
            });

            const hashedPassword = await hashPassword(req.body.password);
            const data = {
                name: req.body.name,
                password: hashedPassword,
                token: token
            };
            await Collection.insertMany([data]);
            res.render("home", { name: req.body.name });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    try {
        const check = await Collection.findOne({ name: req.body.name });
        if (check) {
            const checkPass = await comparePassword(req.body.password, check.password);
            if (checkPass) {
                res.cookie("jwt", check.token, {
                    maxAge: 600000,
                    httpOnly: true
                });
                res.render("home", { name: req.body.name });
            } else {
                res.send("wrong details");
            }
        } else {
            res.send("user does not exist");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(8000, () => {
    console.log("app is listening on port 8000");
});





