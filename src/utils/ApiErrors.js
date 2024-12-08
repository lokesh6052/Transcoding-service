class ApiErrors extends Error {
	constructor(
		statusCode,
		message = "something went wrong!",
		Error = [],
		stack = ""
	) {
		super(message);
		this.statusCode = statusCode;
		this.Error = Error;
		this.message = message;
		this.success = false;
		this.data = null;

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

export { ApiErrors };
