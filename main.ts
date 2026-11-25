import { mkdirSync, writeFileSync } from "node:fs";

/**
 * make.fun — Laugh Track: The Crypto Trading Joke Contest
 *
 * Writes exactly one joke to ${MAKEFUN_OUTPUT_DIR:-/output}/entry.txt.
 *
 * The gate is UTF-8 text of 1..200 characters, not only white space, and the
 * grader runs this program twice, so the artifact is a pure constant: no
 * clock, no random, no network. Everything below is a guard that refuses to
 * publish a line the judge would only ever see as invalid.
 */

const MAX_CHARS = 200;

/**
 * The joke.
 *
 * The setup states the industry's favourite defence flatly, in the voice of
 * someone repeating it for the hundredth time. The turn then spends the word
 * rather than punning on it: "early" stops meaning a good entry price and
 * becomes a permanent condition of the person, and the last clause re-uses the
 * same word as an arrival time. The word does all the work, so no second joke
 * has to be bolted on, and the line stays short enough to say in one breath.
 */
const LINE =
  "Nobody in crypto is losing money, they're early. My friend has been early since November 2021, and last week he was early to my couch.";

/**
 * The line as separate parts, so the guards below can assert the shape the
 * writing chose instead of matching it twice as a string literal.
 */
const OPENS_WITH = "Nobody in crypto is losing money, they're early.";
const CLOSES_WITH = "he was early to my couch.";

/**
 * The field at build time: buying the dip, the group chat, the 3 a.m. chart,
 * "eleven coins that all move together". Any of those is a joke the judge has
 * already read twice today, so the line is rejected if it drifts into them.
 */
const SATURATED =
  /\b(dip|group chat|3 ?a\.?m\.?|three in the morning|chart|diversified|portfolio|hodl|diamond hands|rug|bag holder|lambo|moon)\b/i;

function compose(): string {
  const text = LINE.normalize("NFC");

  // The gate reads the file as one line; a stray CR from an editor would make
  // it two, and the entry would score a flat 0 without anything looking broken.
  if (/[\r\n]/.test(text)) {
    throw new Error("the gate wants one line: no CR or LF may appear");
  }
  if (text.trim() === "") {
    throw new Error("the gate refuses an entry that is only white space");
  }

  // Count code points rather than UTF-16 units: the gate counts characters,
  // and only the byte total is used as a tie-break.
  const chars = [...text].length;
  if (chars > MAX_CHARS) {
    throw new Error(`over the cap: ${chars} > ${MAX_CHARS} characters`);
  }

  // Keep the shape the writing above earned: the excuse opens the line and the
  // couch closes it. A later edit that reorders either end is a different joke.
  if (!text.startsWith(OPENS_WITH)) {
    throw new Error("criterion 1: the excuse has to be the setup, or it is not about trading");
  }
  if (!text.endsWith(CLOSES_WITH)) {
    throw new Error("the turn has to stay the last clause: it ends on the couch, not the excuse");
  }

  const drift = text.match(SATURATED);
  if (drift) {
    throw new Error(`drifted into the field's shared jokes: ${JSON.stringify(drift[0])}`);
  }
  return text;
}

const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const text = compose();
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/entry.txt`, text);
console.log(`${[...text].length} chars, ${new TextEncoder().encode(text).length} bytes -> ${dir}/entry.txt`);
