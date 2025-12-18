import fs from "fs";
import { fileURLToPath } from "url";

/**
 * Mini test Node.js — Runtime / Event loop / Async / Promises / Erreurs (TypeScript)
 * (Node >= 18 recommandé)
 */

const SHOW_ANSWERS = false;

function sep(title: string) {
  console.log("\n" + "=".repeat(88));
  console.log(title);
  console.log("=".repeat(88));
}

function q(text: string) {
  console.log("\n❓ QUESTION:");
  console.log(text);
}

function a(text: string) {
  if (!SHOW_ANSWERS) return;
  console.log("\n✅ RÉPONSE:");
  console.log(text);
}

function hint(text: string) {
  console.log("\n💡 HINT:");
  console.log(text);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Pour que le test marche en CommonJS (ts-node default) ET en ESM (ts-node/esm)
const THIS_FILE =
  typeof __filename !== "undefined"
    ? __filename
    : fileURLToPath(import.meta.url);

// Pour observer les erreurs "globales" (très utile en interview)
process.on("unhandledRejection", (reason) => {
  console.log(
    "[process.on unhandledRejection] =>",
    (reason as any)?.message ?? reason
  );
});
process.on("uncaughtException", (err) => {
  console.log(
    "[process.on uncaughtException] =>",
    (err as any)?.message ?? err
  );
});

async function main() {
  sep("0) Infos runtime");
  console.log(
    "node:",
    process.version,
    "| pid:",
    process.pid,
    "| showAnswers:",
    SHOW_ANSWERS
  );

  // ---------------------------------------------------------------------------
  sep("1A) Event loop — ordre des logs (top-level)");
  q(
    [
      "Sans exécuter, note l'ordre le PLUS probable des logs suivants :",
      "  1A:start, 1A:end, 1A:process.nextTick, 1A:Promise.then, 1A:queueMicrotask, 1A:setTimeout(0), 1A:setImmediate",
      "",
      "Puis : est-ce que setTimeout(0) et setImmediate ont un ordre garanti ici ? Pourquoi ?",
    ].join("\n")
  );
  // start, end, setImmediate, setTimeout(0), Promise.then, queueMicrotask, process.nextTick

  console.log("start");

  setTimeout(() => console.log("T"), 0);
  setImmediate(() => console.log("I"));

  Promise.resolve().then(() => console.log("P"));
  queueMicrotask(() => console.log("M"));
  process.nextTick(() => console.log("N"));

  console.log("end");

  a(
    [
      "Ordre attendu (partie déterministe) :",
      "  start",
      "  end",
      "  N",
      "  P",
      "  M",
      "",
      "Ensuite, entre setTimeout(0) et setImmediate au top-level, l'ordre n'est PAS strictement garanti.",
      "Dans la pratique, tu verras souvent setTimeout(0) avant setImmediate, mais ça peut varier selon timing/plateforme.",
    ].join("\n")
  );

  await sleep(40);

  // ---------------------------------------------------------------------------
  sep("1B) Event loop — ordre DÉTERMINISTE dans un callback I/O (fs.readFile)");
  q(
    [
      "Ici l'ordre setImmediate vs setTimeout(0) devient généralement déterministe.",
      "Prédiction : donne l'ordre exact des logs 1B:*.",
      "",
      "Indice : dans un callback I/O, setImmediate est dans la phase 'check' juste après l'I/O callbacks phase.",
    ].join("\n")
  );

  fs.readFile(THIS_FILE, "utf8", () => {
    console.log("1B:IO callback start");

    setTimeout(() => console.log("1B:setTimeout(0)"), 0);
    setImmediate(() => console.log("1B:setImmediate"));

    Promise.resolve().then(() => console.log("1B:Promise.then (microtask)"));
    queueMicrotask(() => console.log("1B:queueMicrotask (microtask)"));
    process.nextTick(() => console.log("1B:process.nextTick (tick queue)"));

    console.log("1B:IO callback end");
  });

  a(
    [
      "Ordre attendu (très standard) :",
      "  1B:IO callback start",
      "  1B:IO callback end",
      "  1B:process.nextTick",
      "  1B:Promise.then",
      "  1B:queueMicrotask",
      "  1B:setImmediate",
      "  1B:setTimeout(0)",
      "",
      "Pourquoi : après le callback I/O, Node draine nextTick, puis microtasks, puis passe à la phase 'check' => setImmediate.",
      "Les timers (setTimeout) seront ensuite traités au prochain passage de la phase timers.",
    ].join("\n")
  );

  await sleep(80);

  // ---------------------------------------------------------------------------
  sep("2A) async/await — try/catch: qu'est-ce qui est catché ?");
  q(
    [
      "Que loggue ce bloc ? Est-ce que l'erreur est catchée par try/catch ?",
      "Et pourquoi une erreur 'throw' dans une fonction async devient un rejet de Promise ?",
    ].join("\n")
  );

  async function throwsSync(): Promise<void> {
    // Erreur levée dans une fonction async => rejet de Promise
    throw new Error("boom from throwsSync()");
  }

  try {
    await throwsSync();
    console.log("2A:after await (ne devrait pas s'afficher)");
  } catch (e: any) {
    console.log("2A:caught =>", e.message);
  }

  a(
    [
      "Ça loggue :",
      "  2A:caught => boom from throwsSync()",
      "",
      "Explication : une fonction async renvoie toujours une Promise. Un throw dedans => Promise rejetée.",
      "Avec await, l'exception est 're-levée' (throw) au point du await, donc catchable par try/catch.",
    ].join("\n")
  );

  // ---------------------------------------------------------------------------
  sep("2B) BUG classique — oubli de await: où part l'erreur ?");
  q(
    [
      "Pourquoi le try/catch ci-dessous ne catch PAS l'erreur ?",
      "Qu'est-ce qui devrait apparaître côté process.on('unhandledRejection') ?",
      "Bonus : propose 2 façons de corriger.",
    ].join("\n")
  );

  async function bug_missing_await(): Promise<void> {
    try {
      // ⚠️ Oubli de await: le rejet se produit après la fin du try/catch
      throwsSync();
      console.log(
        "2B:still inside try after calling throwsSync() without await"
      );
    } catch (e: any) {
      console.log(
        "2B:caught =>",
        e.message,
        "(tu ne devrais normalement pas voir ça)"
      );
    }
  }

  await bug_missing_await();
  await sleep(40);

  a(
    [
      "Le try/catch ne marche pas parce qu'il ne capture que les exceptions SYNCHRONES pendant l'exécution du bloc.",
      "Ici, throwsSync() renvoie une Promise rejetée. Sans await/return, le rejet arrive 'plus tard'.",
      "",
      "Tu verras :",
      "  2B:still inside try ...",
      "  [process.on unhandledRejection] => boom from throwsSync()",
      "",
      "Corrections :",
      "  1) await throwsSync();",
      "  2) return throwsSync(); (et laisser l'appelant await/catch)",
      "  3) ou throwsSync().catch(...) (moins propre, mais parfois utile en fire-and-forget)",
    ].join("\n")
  );

  // ---------------------------------------------------------------------------
  sep("2C) Promises — throw dans executor vs throw dans un callback async");
  q(
    [
      "p1: un throw dans l'executor de Promise => est-ce catché par p1.catch ?",
      "p2: un throw dans setTimeout => est-ce catché par p2.catch ?",
      "Quelle différence clé cela révèle sur les Promises ?",
    ].join("\n")
  );

  const p1 = new Promise<void>((resolve, reject) => {
    throw new Error("boom in Promise executor");
  });
  p1.catch((e: any) => console.log("2C:p1 caught =>", e.message));

  const p2 = new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      // ⚠️ throw dans un callback asynchrone => PAS relié à p2 => uncaughtException
      throw new Error("boom in setTimeout callback (NOT caught by p2)");
    }, 0);
  });
  p2.catch((e: any) =>
    console.log(
      "2C:p2 caught =>",
      e.message,
      "(tu ne devrais normalement pas voir ça)"
    )
  );

  await sleep(40);

  a(
    [
      "p1: OUI, catché. Un throw dans l'executor est automatiquement converti en rejet de la Promise.",
      "p2: NON, pas catché par p2.catch. Le throw survient dans un callback séparé (hors chaîne de la Promise).",
      "=> Ça déclenche uncaughtException (ou crash si pas de handler).",
      "",
      "Leçon : une Promise ne capture pas magiquement les exceptions de callbacks async non chaînés.",
      "Pour relier, il faut reject(err) dans le callback, ou utiliser async/await + try/catch DANS le callback.",
    ].join("\n")
  );

  // ---------------------------------------------------------------------------
  sep("3A) Promise combinators — all vs allSettled");
  q(
    [
      "Que se passe-t-il avec Promise.all si UNE seule Promise rejette ?",
      "Les autres continuent-elles à s'exécuter ?",
      "Que renvoie allSettled ?",
    ].join("\n")
  );

  const okFast = Promise.resolve("OK fast");
  const okSlow = sleep(20).then(() => "OK slow");
  const koFast = Promise.reject(new Error("KO fast"));

  try {
    const all = await Promise.all([okFast, okSlow, koFast]);
    console.log("3A:Promise.all result =>", all);
  } catch (e: any) {
    console.log("3A:Promise.all caught =>", e.message);
  }

  const settled = await Promise.allSettled([okFast, okSlow, koFast]);
  console.log("3A:allSettled =>", settled);

  a(
    [
      "Promise.all rejette dès qu'une des Promises rejette => ici 'KO fast'.",
      "Important : les autres Promises ne sont pas automatiquement annulées (sauf si tu implémentes l'annulation).",
      "allSettled renvoie un tableau {status:'fulfilled'|'rejected', value|reason} pour chaque élément.",
    ].join("\n")
  );

  // ---------------------------------------------------------------------------
  sep("3B) Pattern d'interview — fire-and-forget SANS unhandledRejection");
  q(
    [
      "Implémente safeFireAndForget(p) pour lancer une Promise sans await",
      "mais SANS 'unhandledRejection'.",
      "Bonus : comment tu loggerais sans spammer ?",
    ].join("\n")
  );

  function safeFireAndForget<T>(
    promise: Promise<T>,
    label = "fire-and-forget"
  ): void {
    // ✅ Minimum acceptable : attacher un catch
    promise.catch((e: any) => {
      console.log(`3B:${label} caught =>`, e?.message ?? e);
    });
  }

  safeFireAndForget(Promise.reject(new Error("fire-and-forget boom")));
  await sleep(40);

  a(
    [
      "Solution minimale : promise.catch(...) (ou void promise.catch(...)).",
      "En prod, souvent on loggue avec un logger structuré + on ajoute un rate-limit / sampling.",
    ].join("\n")
  );

  // ---------------------------------------------------------------------------
  sep("4) Mini-exos (à faire en 5–15 min chacun)");
  q(
    [
      "A) Écris withTimeout(promise, ms) qui rejette après ms (sans fuir de timers).",
      "B) Écris mapLimit(items, limit, asyncFn) (concurrence max = limit).",
      "C) Explique quand utiliser : process.nextTick vs queueMicrotask vs setImmediate vs setTimeout(0).",
    ].join("\n")
  );

  a(
    [
      "A) withTimeout: tu peux utiliser AbortController pour fetch, ou un Promise.race + clearTimeout.",
      "B) mapLimit: queue + workers, ou un compteur d'inflight + next().",
      "C) nextTick: très prioritaire (dangereux si boucle); microtasks: après phase courante; setImmediate: après I/O; setTimeout(0): phase timers.",
    ].join("\n")
  );

  sep("Fin");
}

main().catch((e) => {
  console.error("Fatal in main:", e);
});
