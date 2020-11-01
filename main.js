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

const cached = []

app.get(
	"/submit",
	(req, res, next) => {
		const filter = cached.filter((s) => {
            const cachedDate = Date.parse(s.date)
            const thresholdDate = Date.parse(new Date()) - 900000
			if (
				s.q == req.query.search &&
				s.country == req.query.country &&
				s.category == req.query.category &&
				cachedDate >= thresholdDate
			) {
				return s;
			}
		});
		if (filter.length > 0) {
			console.log("not fetching");
			res.status(201);
			res.type("text/html");
			res.render("index", {
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
			category: req.query.category
		});
		
		try {
			console.log("did we get to here")
			const result = await fetch(fetchUrl, { headers });
			const data = await result.json();

			const articlesArr = data.articles;
			
			cached.push({
				q: req.query.search,
				country: req.query.country,
				category: req.query.category,
				fetchUrl,
                articlesArr,
                date: new Date()
			});
			res.status(201);
			res.type("text/html");
			console.log("we are rendering");
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
