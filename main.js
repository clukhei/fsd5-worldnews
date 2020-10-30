const express = require("express");
const hbs = require("express-handlebars");
const fetch = require("node-fetch");
const withQuery = require("with-query").default;
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT =
	parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000;
const NEWS_URL = "https://newsapi.org/v2/top-headlines";

app.use(express.static(__dirname + "/static"));
app.engine("hbs", hbs({ defaultLayout: "default.hbs" }));
app.set("view engine", "hbs");

app.get("/", async (req, res) => {
	res.status(200);
	res.type("text/html");
	res.render("index");
});

app.post(
	"/submit",
	express.urlencoded({ extended: true }),
	express.json(),
	async (req, res) => {
		const fetchUrl = withQuery(NEWS_URL, {
			q: req.body.search,
			apiKey: `${process.env.API_KEY}`,
			country: req.body.country,
			category: req.body.category,
		});

		try {
			const result = await fetch(fetchUrl);
			const data = await result.json();
			console.log(result);
			console.log(data);
            console.log(data.totalResults);
            console.log(data.articles)
            const articlesArr = data.articles
			res.status(201);
			res.type("text/html");
			res.render("index", {
                articlesArr
            });
		} catch (e) {
			console.log(e);
		}
	}
);

app.listen(PORT, () => {
	console.log(`PORT ${PORT} started`);
});
