let express = require('express');
let cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const {Schema, Model} = require("mongoose");
const cors = require("cors")
const bodyParser = require("body-parser")

let app = express();

const PORT = 5045
const MONGO_URI = "mongodb://vcodevkma:vcodevkma@85.193.89.172:27017/vcodevkma?authSource=admin&readPreference=primary&ssl=false"

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

app.get("/api/status", (req, res) => {
    res.send("Server running")
})

app.post("/api/addAutograph", async (req, res) => {
    await AutographModel.create(req.body)

    res.send("OK")
})

app.get("/api/getAutographsTo/:userId", async (req, res) => {
    res.send(await AutographModel.find({to: req.params.userId}).sort({"date": -1}))
})

app.get("/api/getAutographsFrom/:userId", async (req, res) => {
    res.send(await AutographModel.find({from: req.params.userId}).sort({"date": -1}))
})

app.listen(PORT, () => {
    console.log("Server running at https://localhost:" + PORT)
})
