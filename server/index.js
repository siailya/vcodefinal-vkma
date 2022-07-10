let express = require('express');
let cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const {Schema, Model} = require("mongoose");
const cors = require("cors")
const bodyParser = require("body-parser")
const {log} = require("debug");
const history = require("connect-history-api-fallback")
const path = require("path");

let app = express();

const PORT = 5045
const MONGO_URI = "mongodb://vcodevkma:vcodevkma@85.193.89.172:27017/vcodevkma?authSource=admin&readPreference=primary&ssl=false"

const staticFileMiddleware = express.static(path.join(__dirname, "..", "client", "build"))

mongoose.connect(MONGO_URI)

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(cors())
app.use(bodyParser.json({type: 'application/*+json', limit: "10mb"}))

const autograph = new Schema({
    from: String,
    to: String,
    isAnon: Boolean,
    type: String,
    date: {type: Date, default: Date.now},
    text: String,
    image: String,
    displayName: String
})

const AutographModel = mongoose.model("Autograph", autograph)

const user = new Schema({
    id: String,
    leave: {type: String, default: "all"},
    view: {type: String, default: "all"}
})

const UserModel = mongoose.model("User", user)


app.get("/api/status", (req, res) => {
    res.send("Server running")
})

app.post("/api/addAutograph", async (req, res) => {
    await AutographModel.create(req.body)

    res.send("OK")
})

app.get("/api/getAutographsTo/:userId", async (req, res) => {
    const user = await UserModel.findOne({id: req.params.userId})

    if (!user || user?.view === "all" || JSON.parse(req.headers.own)) {
        res.send(await AutographModel.find({to: req.params.userId}).sort({"date": -1}))
    } else {
        res.send({denied: true})
    }
})

app.get("/api/getAutographsFrom/:userId", async (req, res) => {
    res.send(await AutographModel.find({from: req.params.userId}).sort({"date": -1}))
})

app.post("/api/setSettings", async (req, res) => {
    const user = await UserModel.findOne({id: req.body.id + ""})
    if (user) {
        user.leave = req.body?.leave || user.leave
        user.view = req.body?.view || user.view
        await user.save()
    } else {
        UserModel.create(req.body)
    }

    res.send("OK")
})

app.get("/api/canAddAutograph/:userId", async (req, res) => {
    const user = await UserModel.findOne({id: req.params.userId + ""})

    if (!user) {
        res.send({canAdd: true})
    } else {
        res.send({canAdd: user.leave === "all"})
    }
})


app.post("/api/getSettings", async (req, res) => {
    res.send(await UserModel.findOne({id: req.body.id}))
})

// region ServeClientStatic
app.use(history())
app.use(staticFileMiddleware)
// endregion


app.listen(PORT, () => {
    console.log("Server running at https://localhost:" + PORT)
})
