const app = require("express")();
const { Client } = require("pg");
const HashRing = require("hashring");
const crypto = require("crypto");

const hr = new HashRing();
hr.add("5434")
hr.add("5435")
hr.add("5436")

const clients = {
    "5434": new Client({
        "port": "5434",
        "user": "postgres",
        "password": "postgres",
        "database": "postgres"
    }),
    "5435": new Client({
        "port": "5435",
        "user": "postgres",
        "password": "postgres",
        "database": "postgres"
    }),
    "5436": new Client({
        "port": "5436",
        "user": "postgres",
        "password": "postgres",
        "database": "postgres"
    })
}

connect();
async function connect() {
    await clients["5434"].connect();
    await clients["5435"].connect();
    await clients["5436"].connect();
}

app.get("/:urlId", async (req, res) => {
    const urlId = req.params.urlId;
    const server = hr.get(urlId);

    try {
        const result = await clients[server].query(
            "select * from url_table where url_id = $1",
            [urlId]
        );

        if (result.rowCount > 0) {
            res.send({
                urlId: urlId,
                url: result.rows[0].url, // get actual URL string
                server: server
            });
        } else {
            res.sendStatus(404);
        }
    } catch (err) {
        console.error("Query error:", err);
        res.status(500).send({ error: "Query failed" });
    }
});

app.post("/", (req, res) => {
    const url = req.query.url;

    // consistently hash this to get the port!
    const hash = crypto.createHash("sha256").update(url).digest("base64")
    const urlId = hash.substring(0, 5)

    const server = hr.get(urlId)

    clients[server].query(
        "insert into url_table(url, url_id) values ($1, $2)",
        [url, urlId],
        (err) => {
            if (err) {
                console.error("Insert error:", err);
                res.status(500).send({ error: "Insert failed" });
            } else {
                res.send({
                    urlId: urlId,
                    url: url,
                    server: server
                });
            }
        }
    );
})

app.listen("8081", () => console.log("Listening to port 8081"))