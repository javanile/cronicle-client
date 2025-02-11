'use strict';

import {
    getFutureUtcTiming,
    getFutureTiming,
    CronicleClient,
    CronicleError,
    NumberedBoolean,
    BaseCategories,
    BaseTargets,
    IHttpPluginData, IShellPluginData, ITestPluginData, basePlugins
} from '../../dist/';
import moment = require('moment');
import {expect} from 'chai';
import * as proxyquire from 'proxyquire';
// @ts-ignore
import * as sinon from 'sinon';
// @ts-ignore
import * as timezoneMock from 'timezone-mock';
import {IPluginNames} from '../../src';

const requestStub = sinon.stub();
(requestStub as any)['@global'] = true;
const stubs = {
    'request-promise': requestStub,
};
// tslint:disable-next-line
const allImports = proxyquire('../../dist/', stubs);
const cronicleClientStubbed: typeof CronicleClient = allImports.CronicleClient;
const cronicleErrorStubbed: typeof CronicleError = allImports.CronicleError;

const masterUrl = 'http://my.croncicle.com:3012';
const apiKey = 'myApiKey';
const defaultVersion = 'v1';

describe('cronicle client', () => {

    describe('timing helpers ', () => {

        describe('utc timing helpers ', () => {

            it('should create timing object from moment', () => {
                const timing = getFutureUtcTiming(moment.utc('2016-05-26T14:50:50.900Z'));
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(14);
                expect(timing.minutes![0]).to.eq(50);
            });

            it('should create timing object from date', () => {
                const timing = getFutureUtcTiming(new Date('2016-05-26T14:50:50.900Z'));
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(14);
                expect(timing.minutes![0]).to.eq(50);
            });

            it('should create timing object from string', () => {
                const timing = getFutureUtcTiming('2016-05-26T14:50:50.900Z');
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(14);
                expect(timing.minutes![0]).to.eq(50);
            });

        });

        describe('non utc timing helpers ', () => {

            before(() => {
                timezoneMock.register('US/Pacific');
            });

            after(() => {
                timezoneMock.unregister();
            });

            it('should create timing object from moment', () => {
                const timing = getFutureTiming(moment('2016-05-26T14:50:50.900Z'));
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(7);
                expect(timing.minutes![0]).to.eq(50);
            });

            it('should create timing object from date', () => {
                const timing = getFutureTiming(new Date('2016-05-26T14:50:50.900Z'));
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(7);
                expect(timing.minutes![0]).to.eq(50);
            });

            it('should create timing object from string', () => {
                const timing = getFutureTiming('2016-05-26T14:50:50.900Z');
                expect(timing.years![0]).to.eq(2016);
                expect(timing.months![0]).to.eq(5);
                expect(timing.days![0]).to.eq(26);
                expect(timing.hours![0]).to.eq(7);
                expect(timing.minutes![0]).to.eq(50);
            });

        });

    });

    describe('cronicle client', () => {

        beforeEach(() => {
            requestStub.reset();
        });

        describe('constructor', () => {

            it('should fail if no master url is provided', (done) => {
                try {
                    new CronicleClient({apiKey} as any);
                } catch (error) {
                    expect(error.message).to.eql('cronicle master url is required');
                    done();
                }
            });

            it('should fail if no api key is provided', (done) => {
                try {
                    new CronicleClient({masterUrl} as any);
                } catch (error) {
                    expect(error.message).to.eql('cronicle api key is required');
                    done();
                }
            });
        });

        describe('typing', () => {

            it('should allow extended plugins', () => {
                enum Categories {
                    // Default category
                    GENERAL = 'general',
                    // Custom categories...
                    TEST_CATEGORY = 'cjw6g085901',
                    TEST_CATEGORY2 = 'cjw6l8mnb02',
                }
                const client = new cronicleClientStubbed<Categories>({masterUrl, apiKey});
                const request = {
                    title: 'myTitle',
                    enabled: NumberedBoolean.TRUE,
                    category: Categories.TEST_CATEGORY,
                    target: BaseTargets.MAIN,
                    plugin: basePlugins.shellplug,
                    params: {
                        script: 'myScript',
                        annotate: NumberedBoolean.FALSE,
                        json: NumberedBoolean.TRUE,
                    },
                    log_max_size: 30,
                };
                client.createEvent(request);
            });

            it('should allow extended targets', () => {
                enum Categories {
                    // Default category
                    GENERAL = 'general',
                    // Custom categories...
                    TEST_CATEGORY = 'cjw6g085901',
                    TEST_CATEGORY2 = 'cjw6l8mnb02',
                }
                enum Targets {
                    // Default targets...
                    ALL = 'allgrp',
                    MAIN = 'maingrp',
                    // Custom targets...
                    AWS = 'awsgrp',
                    GCP = 'gcpgrp',
                }
                const client = new cronicleClientStubbed<Categories, Targets>({masterUrl, apiKey});
                const request = {
                    title: 'myTitle',
                    enabled: NumberedBoolean.TRUE,
                    category: Categories.TEST_CATEGORY2,
                    target: Targets.AWS,
                    plugin: basePlugins.shellplug,
                    params: {
                        script: 'myScript',
                        annotate: NumberedBoolean.FALSE,
                        json: NumberedBoolean.TRUE,
                    },
                    log_max_size: 30,
                };
                client.createEvent(request);
            });

            it('should allow extended plugins', () => {
                enum Categories {
                    // Default category
                    GENERAL = 'general',
                    // Custom categories...
                    TEST_CATEGORY = 'cjw6g085901',
                    TEST_CATEGORY2 = 'cjw6l8mnb02',
                }
                enum Targets {
                    // Default targets...
                    ALL = 'allgrp',
                    MAIN = 'maingrp',
                    // Custom targets...
                    AWS = 'awsgrp',
                    GCP = 'gcpgrp',
                }
                interface ICustomPluginData {
                    duration: string;
                    action: string;
                }

                interface Plugins {
                    // Default plugins
                    urlplug: IHttpPluginData;
                    shellplug: IShellPluginData;
                    testplug: ITestPluginData;
                    // Custom plugins
                    mycustomplug: ICustomPluginData;
                }
                const plugins: IPluginNames<Plugins> = {
                    urlplug: 'urlplug',
                    shellplug: 'shellplug',
                    testplug: 'testplug',
                    mycustomplug: 'mycustomplug',
                };
                const client = new cronicleClientStubbed<Categories, Targets, Plugins>({masterUrl, apiKey});
                const request = {
                    title: 'myTitle',
                    enabled: NumberedBoolean.TRUE,
                    category: Categories.TEST_CATEGORY2,
                    target: Targets.AWS,
                    plugin: plugins.mycustomplug,
                    params: {
                        duration: 'myDiration',
                        action: 'myAction',
                    },
                    log_max_size: 30,
                };
                client.createEvent(request);
            });

        });

        describe('methods', () => {

            describe('get event', () => {

                it('should get event with id and master url with trailing slash', () => {
                    const client = new cronicleClientStubbed({masterUrl: `${masterUrl}/`, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    return client.getEvent({id})
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: {
                                    id,
                                },
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/get_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get event with id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    return client.getEvent({id})
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: {
                                    id,
                                },
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/get_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get event with title', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const title = 'myTitle';
                    return client.getEvent({title})
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: {
                                    title,
                                },
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/get_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get event with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.getEvent({id})
                        .catch((error) => {
                            error.should.be.instanceOf(cronicleErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

            });

            describe('get schedule', () => {

                it('should get schedule with no params', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    return client.getSchedule()
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_schedule/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get schedule with offset', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const offset = 1;
                    return client.getSchedule({offset})
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_schedule/${defaultVersion}?offset=${offset}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get schedule with limit', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const limit = 1;
                    return client.getSchedule({limit})
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_schedule/${defaultVersion}?limit=${limit}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get schedule with limit and offset', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const limit = 1;
                    const offset = 1;
                    return client.getSchedule({limit, offset})
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_schedule/${defaultVersion}?\
limit=${limit}&offset=${offset}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get schedule with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.getSchedule()
                        .catch((error) => {
                            error.should.be.instanceOf(cronicleErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

            });

            describe('run event', () => {

                it('should run event with id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    const request = {
                        id,
                        log_max_size: 30,
                    };
                    return client.runEvent(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/run_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should run event with title', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const title = 'myTtile';
                    const request = {
                        title,
                        log_max_size: 30,
                    };
                    return client.runEvent(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/run_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should run event with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.runEvent({id})
                        .catch((error) => {
                            error.should.be.instanceOf(cronicleErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

            });

            describe('create event', () => {

                it('should create event', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const request = {
                        title: 'myTitle',
                        enabled: NumberedBoolean.TRUE,
                        category: BaseCategories.GENERAL,
                        target: BaseTargets.MAIN,
                        plugin: basePlugins.shellplug,
                        params: {
                            script: 'myScript',
                            annotate: NumberedBoolean.FALSE,
                            json: NumberedBoolean.TRUE,
                        },
                        log_max_size: 30,
                    };
                    return client.createEvent(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/create_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should create event with unique title', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.onCall(0).resolves({code: 'not found', description: 'event with title not found'});
                    requestStub.onCall(1).resolves(response);
                    const title = 'myTitle';
                    const request = {
                        title,
                        enabled: NumberedBoolean.TRUE,
                        category: BaseCategories.GENERAL,
                        target: BaseTargets.MAIN,
                        plugin: basePlugins.shellplug,
                        params: {
                            script: 'myScript',
                            annotate: NumberedBoolean.FALSE,
                            json: NumberedBoolean.TRUE,
                        },
                        log_max_size: 30,
                    };
                    return client.createEvent(request, true)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: {
                                    title,
                                },
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/get_event/${defaultVersion}`,
                            });
                            expect(requestStub.getCall(1).args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/create_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should create event with error due to duplicate title', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    requestStub.resolves( {code: 0});
                    const title = 'myTitle';
                    const request = {
                        title,
                        enabled: NumberedBoolean.TRUE,
                        category: BaseCategories.GENERAL,
                        target: BaseTargets.MAIN,
                        plugin: basePlugins.shellplug,
                        params: {
                            script: 'myScript',
                            annotate: NumberedBoolean.FALSE,
                            json: NumberedBoolean.TRUE,
                        },
                        log_max_size: 30,
                    };
                    client.createEvent(request, true)
                        .catch((error) => {
                            error.should.be.instanceOf(cronicleErrorStubbed);
                            expect(error.code).to.eql('unique');
                            expect(error.message).to.eql('event already exists');
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: {
                                    title,
                                },
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/get_event/${defaultVersion}`,
                            });
                            expect(requestStub.getCall(1)).to.eql(null);
                            done();
                        });
                });

                it('should create event with unique id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.onCall(0).resolves({code: 'not found', description: 'event with id not found'});
                    requestStub.onCall(1).resolves(response);
                    const id = 'myId';
                    const request = {
                        id,
                        title: 'myTitle',
                        enabled: NumberedBoolean.TRUE,
                        category: BaseCategories.GENERAL,
                        target: BaseTargets.MAIN,
                        plugin: basePlugins.shellplug,
                        params: {
                            script: 'myScript',
                            annotate: NumberedBoolean.FALSE,
                            json: NumberedBoolean.TRUE,
                        },
                        log_max_size: 30,
                    };
                    return client.createEvent(request, true)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: {
                                    id,
                                },
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/get_event/${defaultVersion}`,
                            });
                            expect(requestStub.getCall(1).args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/create_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should create event with error due to duplicate id', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    requestStub.resolves( {code: 0});
                    const id = 'myId';
                    const request = {
                        id,
                        title: 'myTitle',
                        enabled: NumberedBoolean.TRUE,
                        category: BaseCategories.GENERAL,
                        target: BaseTargets.MAIN,
                        plugin: basePlugins.shellplug,
                        params: {
                            script: 'myScript',
                            annotate: NumberedBoolean.FALSE,
                            json: NumberedBoolean.TRUE,
                        },
                        log_max_size: 30,
                    };
                    client.createEvent(request, true)
                        .catch((error) => {
                            error.should.be.instanceOf(cronicleErrorStubbed);
                            expect(error.code).to.eql('unique');
                            expect(error.message).to.eql('event already exists');
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: {
                                    id,
                                },
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/get_event/${defaultVersion}`,
                            });
                            expect(requestStub.getCall(1)).to.eql(null);
                            done();
                        });
                });

                it('should create event with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    const request = {
                        title: 'myTitle',
                        enabled: NumberedBoolean.TRUE,
                        category: BaseCategories.GENERAL,
                        target: BaseTargets.MAIN,
                        plugin: basePlugins.shellplug,
                        params: {
                            script: 'myScript',
                            annotate: NumberedBoolean.FALSE,
                            json: NumberedBoolean.TRUE,
                        },
                        log_max_size: 30,
                    };
                    client.createEvent(request)
                        .catch((error) => {
                            error.should.be.instanceOf(cronicleErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

            });

            describe('update event', () => {

                it('should update event with id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    const request = {
                        id,
                        timeout: 30,
                        reset_cursor: NumberedBoolean.TRUE,
                    };
                    return client.updateEvent(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/update_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should update event with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.updateEvent({id})
                        .catch((error) => {
                            error.should.be.instanceOf(cronicleErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

            });

            describe('update job', () => {

                it('should update job with id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    const request = {
                        id,
                        timeout: 30,
                        reset_cursor: NumberedBoolean.TRUE,
                    };
                    return client.updateJob(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/update_job/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should update job with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.updateJob({id})
                        .catch((error) => {
                            error.should.be.instanceOf(cronicleErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

            });

            describe('delete event', () => {

                it('should delete event with id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    const request = {
                        id,
                        log_max_size: 30,
                    };
                    return client.deleteEvent(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/delete_event/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should delete event with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.deleteEvent({id})
                        .catch((error) => {
                            error.should.be.instanceOf(cronicleErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

            });

            describe('abort job', () => {

                it('should abort job with id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    const request = {
                        id,
                    };
                    return client.abortJob(request)
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: request,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'POST',
                                url: `${masterUrl}/api/app/abort_job/${defaultVersion}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should abort job with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.abortJob({id})
                        .catch((error) => {
                            error.should.be.instanceOf(cronicleErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

            });

            describe('get job status', () => {

                it('should get job status with id', () => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const response = {code: 0};
                    requestStub.resolves(response);
                    const id = 'myId';
                    return client.getJobStatus({id})
                        .then((resp) => {
                            expect(requestStub.firstCall.args[0]).to.eql({
                                body: undefined,
                                headers: {
                                    'X-API-Key': apiKey,
                                },
                                json: true,
                                method: 'GET',
                                url: `${masterUrl}/api/app/get_job_status/${defaultVersion}?id=${id}`,
                            });
                            expect(resp).to.eq(response);
                        });
                });

                it('should get job status with error', (done) => {
                    const client = new cronicleClientStubbed({masterUrl, apiKey});
                    const id = 'myId';
                    const code = 'myCode';
                    const description = 'mydDescription';
                    requestStub.resolves({code, description});
                    client.getJobStatus({id})
                        .catch((error) => {
                            error.should.be.instanceOf(cronicleErrorStubbed);
                            expect(error.code).to.eql(code);
                            expect(error.message).to.eql(description);
                            done();
                        });
                });

            });

        });

    });
});
