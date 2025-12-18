console.log("A:sync start");

setTimeout(() => console.log("T1:timeout 0"), 0);
setImmediate(() => console.log("I1:immediate"));

process.nextTick(() => {
  console.log("N1:nextTick");
  Promise.resolve().then(() => console.log("P_from_N1:promise"));
});

Promise.resolve().then(() => {
  console.log("P1:promise then");

  process.nextTick(() => console.log("N_from_P1:nextTick"));

  queueMicrotask(() => {
    console.log("M_from_P1:microtask");
    Promise.resolve().then(() => console.log("P2:promise then"));
  });
});

queueMicrotask(() => {
  console.log("M1:microtask");
  process.nextTick(() => console.log("N_from_M1:nextTick"));
});

console.log("B:sync end");
