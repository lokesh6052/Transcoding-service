class ApiResponses {
	constructor(statusCode, message = "success", data) {
		this.message = message;
		this.data = data;
		this.success = statusCode < 400 ? statusCode : 200;
		this.statusCode = statusCode;
	}
}

export { ApiResponses };
