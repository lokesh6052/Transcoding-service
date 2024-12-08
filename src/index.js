import dotenv from "dotenv";
import { app } from "./app.js";
import { connectionDB } from "./DB/dbconnection.js";

dotenv.config({
	path: "./.env",
});

connectionDB()
	.then((result) => {
		app.listen(process.env.PORT || 5000, () => {
			console.log(`Server is Running on PORT : ${`${process.env.PORT}`}`);
		});
	})
	.catch((error) => {
		console.error("Error generated when connection to the database : ", error);
	});
