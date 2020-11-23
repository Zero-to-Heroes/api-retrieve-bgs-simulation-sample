/* eslint-disable @typescript-eslint/no-use-before-define */
import { getConnection as getConnectionBgs } from './services/rds-bgs';
import { decode } from './services/utils';

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
	try {
		// console.log('processing event', event);
		const sampleId = event.pathParameters && event.pathParameters.proxy;
		// console.log('loading sample with id', sampleId);
		const mysqlBgs = await getConnectionBgs();

		// Check if this sample already exists in db
		const dbResults: any[] = await mysqlBgs.query(
			`
				SELECT sample FROM bgs_simulation_samples
				WHERE id = '${sampleId}'
			`,
		);
		await mysqlBgs.end();
		// console.log('ran query', dbResults);

		if (!dbResults || dbResults.length === 0) {
			console.log('no match');
			return {
				statusCode: 404,
				headers: headers,
			};
		}

		const result: string = dbResults[0].sample;
		// console.log('found sample', result);
		const decoded = decode(result);
		// console.log('returning results', decoded);
		return {
			statusCode: 200,
			headers: headers,
			body: decoded,
		};
	} catch (e) {
		console.error('issue saving sample', e);
		const response = {
			statusCode: 500,
			headers: headers,
			isBase64Encoded: false,
			body: null,
		};
		console.log('sending back error reponse', response);
		return response;
	}
};
