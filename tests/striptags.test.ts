import { StateMachine, striptags } from "../src/striptags";
import striptagsDefault from "../src/striptags";

describe("StateMachine", () => {
    it("sanity check", () => {
        const machine = new StateMachine({allowedTags: new Set(["atag"])});

        const want = "a string </atag some attr>  some text";

        const got =
            machine.consume("a string </a") +
            machine.consume("tag some attr> <a") +
            machine.consume("nothertag> some text");

        expect(got).toEqual(want);
    });
});

describe("striptags", () => {
    it("sanity check", () => {
        const want = "a string </atag some attr>  some text";

        const got = striptags("a string </atag some attr> <anothertag> some text", {allowedTags: new Set(["atag"])});

        expect(got).toEqual(want);
    });
});

describe("default export", () => {
    it("sanity check", () => {
        expect(striptagsDefault).toEqual(striptags);
    });
});
