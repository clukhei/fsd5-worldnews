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
const headers = {
	"X-Api-Key": `${process.env.API_KEY}`,
};
app.use(express.static(__dirname + "/static"));
app.engine("hbs", hbs({ defaultLayout: "default.hbs" }));
app.set("view engine", "hbs");

app.get("/", async (req, res) => {
	const search = [];
	res.status(200);
	res.type("text/html");
	res.render("index", { searchState: JSON.stringify(search) });
});

app.get(
	"/submit",
	(req, res, next) => {
		const prevSearches = JSON.parse(req.query.searchState);
		console.log(prevSearches);
		const filter = prevSearches.filter((s) => {
			if (
				s.q == req.query.search &&
				s.country == req.query.country &&
				s.category == req.query.category
			) {
				return s;
			}
		});

		if (filter.length > 0) {
			console.log("did this happen");
			res.status(201);
			res.type("text/html");
			res.render("index", {
				searchState: JSON.stringify(prevSearches),
				articlesArr: filter[0].articlesArr,
			});
		} else {
			return next();
		}
	},
	async (req, res) => {
		console.log("we are fetching");
		const fetchUrl = withQuery(NEWS_URL, {
			q: req.query.search,
			/* apiKey: `${process.env.API_KEY}`, */
			country: req.query.country,
			category: req.query.category,
		});
		const prevSearches = JSON.parse(req.query.searchState);

		try {
			const result = await fetch(fetchUrl, { headers });
			const data = await result.json();

			const articlesArr = data.articles;
			console.log(data);
			prevSearches.push({
				q: req.query.search,
				country: req.query.country,
				category: req.query.category,
				fetchUrl,
				articlesArr,
			});
			res.status(201);
			res.type("text/html");
			console.log("we are rendering");
			res.render("index", {
				articlesArr,
				searchState: JSON.stringify(prevSearches),
			});
		} catch (e) {
			console.log(e);
		}
	}
);

app.listen(PORT, () => {
	console.log(`PORT ${PORT} started`);
});
