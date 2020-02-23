import express from "express";

const app = express();
const port = 3010;

app.use(express.static("dist/client"));
app.use(express.static("assets"));

app.get("/", (req, res) => {
	res.sendFile("index.htm", { root: "dist/client" });
});

app.listen(port, () => console.log(`App listening on port ${port}!`));