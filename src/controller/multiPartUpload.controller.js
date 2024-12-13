import { video } from "../models/video.models.js";
import mongoose from "mongoose";
import AWS from "aws-sdk"; // Replace Minio with AWS SDK
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponses } from "../utils/ApiResponses.js";

const s3 = new AWS.S3({
	endpoint: new AWS.Endpoint(process.env.BUCKET_ENDPOINT), // Use AWS.Endpoint
	accessKeyId: process.env.BUCKET_ACCESS_KEY,
	secretAccessKey: process.env.BUCKET_SECRET_KEY,
	s3ForcePathStyle: true, // Needed for Minio
	signatureVersion: "v4",
});

console.log("AWS S3 Client Configuration:");
console.log("EndPoint:", process.env.BUCKET_ENDPOINT);
console.log("Access Key:", process.env.BUCKET_ACCESS_KEY);

// Function to ensure the bucket exists
const ensureBucket = async (bucketName) => {
	try {
		const params = { Bucket: bucketName };
		await s3.headBucket(params).promise();
		console.log(`Bucket "${bucketName}" exists.`);
	} catch (err) {
		if (err.statusCode === 404) {
			await s3.createBucket({ Bucket: bucketName }).promise();
			console.log(`Bucket "${bucketName}" created successfully.`);
		} else {
			console.error("Error checking/creating bucket:", err);
			throw err;
		}
	}
};

// Function to initiate multipart upload
export const intiatialzedUpload = asyncHandler(async (req, res) => {
	const bucketName = process.env.BUCKET_NAME;
	console.log("Bucket Name from env:", bucketName); // Log bucketName to verify
	const objectName = req.body.fileName; // Ensure this is a string

	console.log("Initiating upload for:", objectName);

	// Validate bucketName
	if (typeof bucketName !== "string") {
		return ApiErrors.handleError(
			res,
			new Error("Bucket name must be a string.")
		);
	}

	// Validate objectName
	if (typeof objectName !== "string") {
		return ApiErrors.handleError(
			res,
			new Error("Object name must be a string.")
		);
	}

	console.log("Bucket Name:", bucketName, typeof bucketName);
	console.log("Object Name:", objectName, typeof objectName);

	try {
		await ensureBucket(bucketName);

		const createParams = {
			Bucket: bucketName,
			Key: objectName,
			ContentType: "video/mp4",
		};

		console.log(createParams);

		const multipartParams = await s3
			.createMultipartUpload(createParams)
			.promise();

		console.log("Multipart Params:", multipartParams);

		const uploadId = multipartParams.UploadId;
		console.log("Upload ID:", uploadId);

		return res
			.status(200)
			.json(new ApiResponses(200, "Upload initiated successfully", uploadId));
	} catch (error) {
		return res
			.status(500)
			.json(
				new ApiErrors(
					500,
					"something wrong in the intializing the bucket",
					error.message,
					error
				)
			);
	}
});

// Function to upload a chunk
export const uploadChunk = asyncHandler(async (req, res) => {
	try {
		console.log("uploading the chunks");
		const { fileName, chunkIndex, uploadId } = req.body;
		const bucketName = process.env.BUCKET_NAME;
		console.log("Bucket Name from env:", bucketName); // Log bucketName to verify

		await ensureBucket(bucketName);
		console.log("Bucket Name:", bucketName, typeof bucketName);

		// Check if the chunk size is at least 5 MB
		if (req.file.buffer.length < 5 * 1024 * 1024) {
			return res
				.status(400)
				.json(
					new ApiErrors(
						400,
						"Chunk size must be at least 5 MB",
						"Your proposed upload is smaller than the minimum allowed object size."
					)
				);
		}

		const partParams = {
			Bucket: bucketName,
			Key: fileName,
			UploadId: uploadId,
			PartNumber: parseInt(chunkIndex) + 1,
			Body: req.file.buffer,
		};

		console.log("Part Params:", partParams);
		console.log("Part Number:", partParams.PartNumber);
		console.log("Bucket name:", bucketName, typeof bucketName);

		const data = await s3.uploadPart(partParams).promise();
		console.log("Data---------", data);

		return res
			.status(200)
			.json(new ApiResponses(200, "Chunk Uploaded Successfully", { data }));
	} catch (error) {
		return res
			.status(400)
			.json(
				new ApiErrors(
					400,
					"something wrong in the uploading the chunk",
					error.message,
					error
				)
			);
	}
});

// Function of Complete the multi-part upload
export const completeUpload = asyncHandler(async (req, res) => {
	try {
		console.log("Completing the upload function invoked");
		const { fileName, totalChunks, uploadId, title, description, author } =
			req.body;

		console.log("Key:", fileName);
		console.log("Upload ID:", uploadId);
		// console.log("Uploaded Parts:", uploadedParts.at(0));

		const bucketName = process.env.BUCKET_NAME;

		const uploadedParts = [];

		// Build uploadParts array from request body
		for (let i = 0; i < totalChunks; i++) {
			uploadedParts.push({ PartNumber: i + 1, ETag: req.body[`part${i + 1}`] });
		}

		console.log("Key:", fileName);
		console.log("Upload ID:", uploadId);
		console.log("Uploaded Parts:", uploadedParts);

		const completeParams = {
			Bucket: bucketName,
			Key: fileName,
			UploadId: uploadId,
		};

		// Listing parts using promise
		const data = await s3.listParts(completeParams).promise();
		console.log("Data-----", data);

		const parts = data.Parts.map((part) => ({
			ETag: part.ETag,
			PartNumber: part.PartNumber,
		}));
		console.log("Parts-----", parts);

		completeParams.MultipartUpload = {
			Parts: parts,
		};
		console.log(
			"Complete Params:",
			completeParams,
			completeParams.MultipartUpload.Parts
		);

		// Completing multipart upload using promise
		const uploadResult = await s3
			.completeMultipartUpload(completeParams)
			.promise();

		console.log("data----- ", uploadResult);
		// await video.create({
		// 	title,
		// 	description,
		// 	author,
		// 	url: uploadResult.Location,
		// });

		return res.status(200).json(
			new ApiResponses(200, "multipart upload completed successfully", {
				uploadResult,
			})
		);
	} catch (error) {
		return res
			.status(400)
			.json(
				new ApiErrors(
					400,
					"Something went wrong in the completing the upload",
					error.message,
					error
				)
			);
	}
});
