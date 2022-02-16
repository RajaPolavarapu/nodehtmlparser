const express = require('express');
const { parse } = require("node-html-parser")
const HtmlTableToJson = require("./htmltableparser");
const { html } = require("./html");
const app = express()
const port = 3000

app.get('/', (req, res) => {
    var test = HtmlTableToJson.parse(html)
    res.json(test.results);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})