import mongoose from "mongoose";

const connectionDB = async () => {
	try {
		const connectionInstance = await mongoose.connect(
			`${process.env.MONGO_URI}/${process.env.DATABASE_NAME}`
		);
		console.log(
			"connection is Successful, the Mongo Host is :",
			connectionInstance.connection.host
		);
	} catch (error) {
		console.error(
			"Error generated when code is connection to the database : ",
			error
		);
		process.exit(1);
	}
};

export { connectionDB };
