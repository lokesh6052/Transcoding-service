const asyncHandler = (requestHandler) => {
	return async (req, res, next) => {
		try {
			Promise.resolve(requestHandler(req, res, next)).catch((error) => {
				next(error);
			});
		} catch (error) {
			next(error);
		}
	};
};

export { asyncHandler };
