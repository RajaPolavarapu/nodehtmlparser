const express = require('express');
const HtmlTableToJson = require("./htmltableparser");
const cheerio = require('cheerio')
const axios = require("axios");
const { html } = require("./html");
const arjit = require("./arjit");
const arjitProcessed = require("./arjitProcessed");
const ytArjit = require("./ytArjit");
const app = express()
const port = 3000
const ytKey = "AqVX1VB1HVYecf4VinspoAIzaSyBfXNCam4mpKR";
const fs = require('fs')

app.get('/', (req, res) => {
    var test = HtmlTableToJson.parse(html)
    res.json(test.results);
})

app.get('/youtube', (req, res) => {

    let proms = [];

    arjitProcessed.map(d => {
        const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${d.songid}&key=${ytKey}`;
        const prom = new Promise((resolve, reject) => {
            axios
                .get(url)
                .then((response) => {
                    console.log(response.data, typeof response)
                    resolve({
                        songdata: d,
                        youtube: response.data,
                        fetch: "success"
                    })

                })
                .catch((err) => {
                    reject({
                        songdata: d,
                        youtube: null,
                        fetch: "failed"
                    })
                });
        });
        proms.push(prom)
    });
    Promise.all(proms)
        .then(d => {
            res.json(d);
        })
        .catch(e => {
            res.json({
                error: e,
                status: "failed"
            })
        })

})

app.get('/arjit', (req, res) => {
    res.json(arjit.map(d => {
        return {
            songName: d.SongName?.value,
            movie: d.Movie?.value,
            actors: d.Stars?.value,
            songDescription: d.songDescription,
            musicLabel: d.label,
            songid: d.youtubeid || "Raja",
            lyricsURL: d.SongName?.href
        }
    }));
})

app.get('/final', (req, res) => {
    res.json(ytArjit);
})

app.get('/cheerio', (req, res) => {
    let proms = [];
    var test = HtmlTableToJson.parse(html)
    test.results[0].map(d => {
        const prom = new Promise((resolve, reject) => {
            axios
                .get(d['Song Name'].href)
                .then((response) => {
                    const $ = cheerio.load(response.data);

                    const songDescription = $(".entry-start>.lyrics-details").html();
                    const youtubeid = $(".youtube-container>.youtube-player").attr("data-id");
                    const lyrics = $(".lyric-content").html();
                    const label = $($(".entry-content>em")[1]).text().replace("Music Label: ", "");

                    resolve({
                        ...d,
                        songDescription,
                        youtubeid,
                        lyrics,
                        label,
                        fetch: "success"

                    })


                })
                .catch((err) => {
                    resolve({
                        ...d,
                        fetch: "failed"
                    })
                });
        });
        proms.push(prom)
    });

    Promise.all(proms)
        .then(results => {
            res.json(results)
        })
        .catch(e => {
            res.json({
                error: e
            })
        })

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})