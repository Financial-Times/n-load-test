#!/usr/bin/env node
const autocannon = require('autocannon');

const fs = require('fs')
const path = require('path');
const {Command, flags} = require('@oclif/command');
const cli = require('cli-ux').cli;


const convertSmokeToAutocannon = (config) => {
	const requests = [];
	config.forEach(testGroup => {

		Object.entries(testGroup.urls).forEach(([url, opts])=> {
			const req = {
				path: url,
			};
			if(opts.body || testGroup.body) {
				req.body = opts.body || testGroup.body;
			}
			if(opts.headers || testGroup.headers) {
				req.headers = opts.headers || testGroup.headers;
			}
			if(opts.method || testGroup.method) {
				req.method = opts.method || testGroup.method;
			}
			requests.push(req);
		});

	});
	return requests;
};


class LoadTest extends Command {
	async run() {
		const { flags } = this.parse(LoadTest);
		const config = require(path.join(process.cwd(), flags.configFile));
		const requests = convertSmokeToAutocannon(config);

		cli.action.start(`Starting Load Test with ${flags.numberOfRequests} requests`);
		this.log(`Host: ${flags.host}`);
		this.log(`Got ${requests.length} possible requests to test from ${flags.configFile}`);

		autocannon({
			url: flags.host,
			connections: flags.concurrentUsers,
			amount: flags.numberOfRequests,
			requests
		}, this.done.bind(this));
	}

	done(err, results) {
		this.log(`Completed ${results.requests.total} requests in ${results.duration}s`);
		this.log('\n======== Response Statii ========');
		this.log(`2xx: ${results['2xx']}`);
		this.log(`3xx: ${results['3xx']}`);
		this.log(`4xx: ${results['4xx']}`);
		this.log(`5xx: ${results['5xx']}`);

		this.log('\n======== Response Times ========');
		this.log(`Mean: ${results.latency.mean}`);
		this.log(`Median: ${results.latency.p50}`);
		this.log(`90th Percentile: ${results.latency.p90}`);
		this.log(`99th Percentile: ${results.latency.p99}`);
		this.log(`Max: ${results.latency.max}`);

		this.log('\n');
		cli.action.stop();
	}
}

LoadTest.flags = {
	version: flags.version(),
	help: flags.help(),
	// run with --dir= or -d=
	configFile: flags.string({
		char: 'C',
		default: './test/smoke.js',
	}),
	host: flags.string({
		char: 'H',
		default: 'http://local.ft.com:3002'
	}),
	numberOfRequests: flags.integer({
		char: 'n',
		default: 200
	}),
	concurrentUsers: flags.integer({
		char: 'c',
		default: 10
	})
};

LoadTest.run()
	.catch(require('@oclif/errors/handle'));
