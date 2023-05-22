/* eslint-disable @typescript-eslint/no-use-before-define */
import { decode, getConnection } from '@firestone-hs/aws-lambda-utils';
import SqlString from 'sqlstring';

const headers = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
	'Access-Control-Allow-Methods': '*',
	'Access-Control-Allow-Credentials ': '*',
};

// This example demonstrates a NodeJS 8.10 async handler[1], however of course you could use
// the more traditional callback-style handler.
// [1]: https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
export default async (event): Promise<any> => {
	const sampleId = event.requestContext?.http?.path?.length
		? event.requestContext.http.path.split('/')[1]
		: event.pathParameters && event.pathParameters.proxy;
	const escape = SqlString.escape;

	// Check if this sample already exists in db
	const mysql = await getConnection();
	const dbResults: any[] = await mysql.query(
		`
				SELECT sample FROM bgs_simulation_samples
				WHERE id = ${escape(sampleId)}
			`,
	);
	await mysql.end();
	if (!dbResults || dbResults.length === 0) {
		return {
			statusCode: 404,
			headers: headers,
		};
	}

	const result: string = dbResults[0].sample;
	const decoded = decode(result);
	return {
		statusCode: 200,
		headers: headers,
		body: decoded,
	};
};
