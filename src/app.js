import express from "express";
import cors from "cors";
const app = express();

//Essential middlewares

app.use(
	cors({
		origin: "*",
		credentials: true,
		methods: "GET, POST, PUT, DELETE",
	})
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//Importing the Routes
import uploadRouter from "./routes/upload.routes.js";

//Declaring the Routes
app.use("/upload", uploadRouter);


app.use("/",(req,res)=>{
	res.send("Welcome to the API");
});

export { app };
