console.log("A:sync start");
setTimeout(function () { return console.log("T1:timeout 0"); }, 0);
setImmediate(function () { return console.log("I1:immediate"); });
process.nextTick(function () {
    console.log("N1:nextTick");
    Promise.resolve().then(function () { return console.log("P_from_N1:promise"); });
});
Promise.resolve().then(function () {
    console.log("P1:promise then");
    process.nextTick(function () { return console.log("N_from_P1:nextTick"); });
    queueMicrotask(function () {
        console.log("M_from_P1:microtask");
        Promise.resolve().then(function () { return console.log("P2:promise then"); });
    });
});
queueMicrotask(function () {
    console.log("M1:microtask");
    process.nextTick(function () { return console.log("N_from_M1:nextTick"); });
});
console.log("B:sync end");
// I predict the output will be:
// A, B, N1, P1, M1,
