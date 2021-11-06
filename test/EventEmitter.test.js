import assert from 'assert';
import sinon from 'sinon';
import EventEmitter from '../src/EventEmitter.js';

describe('EventEmitter', () => {
    const callbackA = () => 'A';
    const callbackB = () => 'B';
    const callbackC = () => 'C';
    const callbackD = () => 'D';
    const context1  = {'1': 1};
    const context2  = {'2': 2};
    const context3  = {'3': 3};
    const context4  = {'4': 4};

    describe('constructor', () => {
        it('default values', () => {
            const emitter = new EventEmitter();

            assert.deepEqual(emitter._listeners, {});
        });

        describe('defined values', () => {
            it('simple', () => {
                const emitter = new EventEmitter({
                    on:   {
                        'nuff': callbackA
                    },
                    once: {
                        'narf': callbackB
                    }
                });

                assert.notDeepEqual(emitter._listeners, {});
                assert.deepEqual(emitter._listeners['nuff'], [{callback: callbackA, context: undefined}])
                assert.strict.ok(emitter._listeners['narf'] instanceof Array);
                assert.strict.equal(emitter._listeners['narf'].length, 1);
                assert.strict.equal(emitter._listeners['narf'][0].context, undefined);
                assert.strict.notEqual(emitter._listeners['narf'][0].callback, callbackB);
            });
        });
    });

    it('emit', async () => {
        const onNuff = sinon.stub().resolves(42);
        const onNarf = sinon.stub();
        const onAll  = sinon.stub().resolves(42);

        const emitter = new EventEmitter({
            on: {
                nuff:                     {callback: onNuff, context: context1},
                narf:                     onNarf,
                [EventEmitter.CATCH_ALL]: {callback: onAll, context: context2}
            }
        });

        assert.strict.equal(await emitter.emit('nuff', 42, 22), emitter);
        assert.strict.equal(await emitter.emit('narf', 'roflcopter'), emitter);
        assert.strict.equal(await emitter.emit('lol', 'lal'), emitter);

        assert.strict.equal(onNuff.callCount, 1);
        assert.strict.equal(onNuff.firstCall.thisValue, context1);
        assert.strict.equal(onNuff.firstCall.args.length, 2);
        assert.strict.equal(onNuff.firstCall.args[0], 42);
        assert.strict.equal(onNuff.firstCall.args[1], 22);

        assert.strict.equal(onNarf.callCount, 1);
        assert.strict.equal(onNarf.firstCall.thisValue, undefined);
        assert.strict.equal(onNarf.firstCall.args.length, 1);
        assert.strict.equal(onNarf.firstCall.args[0], 'roflcopter');

        assert.strict.equal(onAll.callCount, 3);
        assert.strict.equal(onAll.firstCall.thisValue, context2);
        assert.strict.equal(onAll.firstCall.args.length, 3);
        assert.strict.equal(onAll.firstCall.args[0], 'nuff');
        assert.strict.equal(onAll.firstCall.args[1], 42);
        assert.strict.equal(onAll.firstCall.args[2], 22);

        assert.strict.equal(onAll.secondCall.args.length, 2);
        assert.strict.equal(onAll.secondCall.thisValue, context2);
        assert.strict.equal(onAll.secondCall.args[0], 'narf');
        assert.strict.equal(onAll.secondCall.args[1], 'roflcopter');

        assert.strict.equal(onAll.thirdCall.args.length, 2);
        assert.strict.equal(onAll.thirdCall.thisValue, context2);
        assert.strict.equal(onAll.thirdCall.args[0], 'lol');
        assert.strict.equal(onAll.thirdCall.args[1], 'lal');
    });

    it('on', () => {
        const emitter = new EventEmitter();

        assert.deepEqual(emitter._listeners, {});

        assert.strict.equal(emitter.on('nuff', callbackA, context1), emitter);
        assert.deepEqual(emitter._listeners, {'nuff': [{callback: callbackA, context: context1}]});
    });

    it('once', () => {
        const onSpy   = sinon.spy();
        const emitter = new EventEmitter();

        assert.deepEqual(emitter._listeners, {});

        assert.strict.equal(emitter.once('narf', onSpy, context1), emitter);

        assert.notDeepEqual(emitter._listeners, {});
        assert.strict.ok(emitter._listeners['narf'] instanceof Array);
        assert.strict.equal(emitter._listeners['narf'].length, 1);
        assert.strict.equal(emitter._listeners['narf'][0].context, context1);
        assert.strict.notEqual(emitter._listeners['narf'][0].callback, onSpy);

        emitter.emit('narf', 42);
        emitter.emit('narf', 43);

        assert.deepEqual(emitter._listeners, {narf: []});
        assert.strict.equal(onSpy.callCount, 1);
        assert.strict.equal(onSpy.firstCall.args.length, 1);
        assert.strict.equal(onSpy.firstCall.args[0], 42);
    });

    describe('off', () => {
        let emitter;

        beforeEach(() => {
            emitter = new EventEmitter();
            emitter.on('a', callbackA, context1);
            emitter.on('a', callbackB, context2);
            emitter.on('b', callbackB, context2);
            emitter.on('c', callbackC, context3);
            emitter.on('d', callbackD, context4);

            assert.deepEqual(emitter._listeners, {
                a: [{callback: callbackA, context: context1}, {callback: callbackB, context: context2}],
                b: [{callback: callbackB, context: context2}],
                c: [{callback: callbackC, context: context3}],
                d: [{callback: callbackD, context: context4}],
            });
        });

        it('#1 remove all', () => {
            assert.strict.equal(emitter.off(), emitter);

            assert.deepEqual(emitter._listeners, {});
        });

        describe('#2 remove all for name', () => {
            it('found nothing', () => {
                assert.strict.equal(emitter.off('n'), emitter);
                assert.deepEqual(emitter._listeners, {
                    a: [{callback: callbackA, context: context1}, {callback: callbackB, context: context2}],
                    b: [{callback: callbackB, context: context2}],
                    c: [{callback: callbackC, context: context3}],
                    d: [{callback: callbackD, context: context4}],
                });
            });

            it('found one', () => {
                assert.strict.equal(emitter.off('a'), emitter);
                assert.deepEqual(emitter._listeners, {
                    b: [{callback: callbackB, context: context2}],
                    c: [{callback: callbackC, context: context3}],
                    d: [{callback: callbackD, context: context4}],
                });
            });
        });

        describe('#3 remove all for name and callback', () => {
            it('found nothing', () => {
                assert.strict.equal(emitter.off('b', callbackA), emitter);
                assert.strict.equal(emitter.off('x', callbackA), emitter);
                assert.deepEqual(emitter._listeners, {
                    a: [{callback: callbackA, context: context1}, {callback: callbackB, context: context2}],
                    b: [{callback: callbackB, context: context2}],
                    c: [{callback: callbackC, context: context3}],
                    d: [{callback: callbackD, context: context4}],
                });
            });

            it('found one', () => {
                assert.strict.equal(emitter.off('a', callbackA), emitter);
                assert.deepEqual(emitter._listeners, {
                    a: [{callback: callbackB, context: context2}],
                    b: [{callback: callbackB, context: context2}],
                    c: [{callback: callbackC, context: context3}],
                    d: [{callback: callbackD, context: context4}],
                });
            });
        });

        describe('#4 remove all for name and callback and context', () => {
            describe('found nothing', () => {
                it('#1', () => {
                    assert.strict.equal(emitter.off('b', callbackA, context2), emitter);
                    assert.strict.equal(emitter.off('x', callbackA, context2), emitter);
                    assert.deepEqual(emitter._listeners, {
                        a: [{callback: callbackA, context: context1}, {callback: callbackB, context: context2}],
                        b: [{callback: callbackB, context: context2}],
                        c: [{callback: callbackC, context: context3}],
                        d: [{callback: callbackD, context: context4}],
                    });
                });

                it('#2', () => {
                    assert.strict.equal(emitter.off('a', callbackA, context2), emitter);
                    assert.deepEqual(emitter._listeners, {
                        a: [{callback: callbackA, context: context1}, {callback: callbackB, context: context2}],
                        b: [{callback: callbackB, context: context2}],
                        c: [{callback: callbackC, context: context3}],
                        d: [{callback: callbackD, context: context4}],
                    });
                });
            });

            describe('found one', () => {
                it('#1', () => {
                    assert.strict.equal(emitter.off('a', callbackA, context1), emitter);
                    assert.deepEqual(emitter._listeners, {
                        a: [{callback: callbackB, context: context2}],
                        b: [{callback: callbackB, context: context2}],
                        c: [{callback: callbackC, context: context3}],
                        d: [{callback: callbackD, context: context4}],
                    });
                });

                it('#2', () => {
                    assert.strict.equal(emitter.off('a', callbackB, context2), emitter);
                    assert.deepEqual(emitter._listeners, {
                        a: [{callback: callbackA, context: context1}],
                        b: [{callback: callbackB, context: context2}],
                        c: [{callback: callbackC, context: context3}],
                        d: [{callback: callbackD, context: context4}],
                    });
                });

                it('#3', () => {
                    assert.strict.equal(emitter.off('c', callbackC, context3), emitter);
                    assert.deepEqual(emitter._listeners, {
                        a: [{callback: callbackA, context: context1}, {callback: callbackB, context: context2}],
                        b: [{callback: callbackB, context: context2}],
                        c: [],
                        d: [{callback: callbackD, context: context4}],
                    });
                });
            });
        });

        describe('#5 remove all for callback and context', () => {
            it('found nothing', () => {
                assert.strict.equal(emitter.off(null, callbackD, context1), emitter);
                assert.deepEqual(emitter._listeners, {
                    a: [{callback: callbackA, context: context1}, {callback: callbackB, context: context2}],
                    b: [{callback: callbackB, context: context2}],
                    c: [{callback: callbackC, context: context3}],
                    d: [{callback: callbackD, context: context4}],
                });
            });

            it('found one', () => {
                assert.strict.equal(emitter.off(null, callbackB, context2), emitter);
                assert.deepEqual(emitter._listeners, {
                    a: [{callback: callbackA, context: context1}],
                    b: [],
                    c: [{callback: callbackC, context: context3}],
                    d: [{callback: callbackD, context: context4}],
                });
            });
        });

        describe('#6 remove all for name and context', () => {
            it('found nothing', () => {
                assert.strict.equal(emitter.off('d', null, context1), emitter);
                assert.strict.equal(emitter.off('x', null, context1), emitter);
                assert.deepEqual(emitter._listeners, {
                    a: [{callback: callbackA, context: context1}, {callback: callbackB, context: context2}],
                    b: [{callback: callbackB, context: context2}],
                    c: [{callback: callbackC, context: context3}],
                    d: [{callback: callbackD, context: context4}],
                });
            });

            it('found one', () => {
                assert.strict.equal(emitter.off('a', null, context2), emitter);
                assert.deepEqual(emitter._listeners, {
                    a: [{callback: callbackA, context: context1}],
                    b: [{callback: callbackB, context: context2}],
                    c: [{callback: callbackC, context: context3}],
                    d: [{callback: callbackD, context: context4}],
                });
            });
        });

        describe('#7 remove all for context', () => {
            it('found nothing', () => {
                assert.strict.equal(emitter.off(null, null, {}), emitter);
                assert.deepEqual(emitter._listeners, {
                    a: [{callback: callbackA, context: context1}, {callback: callbackB, context: context2}],
                    b: [{callback: callbackB, context: context2}],
                    c: [{callback: callbackC, context: context3}],
                    d: [{callback: callbackD, context: context4}],
                });
            });

            it('found one', () => {
                assert.strict.equal(emitter.off(null, null, context2), emitter);
                assert.deepEqual(emitter._listeners, {
                    a: [{callback: callbackA, context: context1}],
                    b: [],
                    c: [{callback: callbackC, context: context3}],
                    d: [{callback: callbackD, context: context4}],
                });
            });
        });

        describe('#8 remove all for callback', () => {
            it('found nothing', () => {
                assert.strict.equal(emitter.off(null, () => false, null), emitter);
                assert.deepEqual(emitter._listeners, {
                    a: [{callback: callbackA, context: context1}, {callback: callbackB, context: context2}],
                    b: [{callback: callbackB, context: context2}],
                    c: [{callback: callbackC, context: context3}],
                    d: [{callback: callbackD, context: context4}],
                });
            });

            it('found one', () => {
                assert.strict.equal(emitter.off(null, callbackB, null), emitter);
                assert.deepEqual(emitter._listeners, {
                    a: [{callback: callbackA, context: context1}],
                    b: [],
                    c: [{callback: callbackC, context: context3}],
                    d: [{callback: callbackD, context: context4}],
                });
            });
        });
    });
});
