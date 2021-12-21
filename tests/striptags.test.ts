import { StateMachineOptions, StateMachine, striptags } from "../src/striptags";
import { Parser } from "htmlparser2";

const OptionsWithAllowedTags: Partial<StateMachineOptions> = {
    allowedTags: new Set(["atag"]),
    tagReplacementText: " ",
};

const OptionsWithDisallowedTags: Partial<StateMachineOptions> = {
    disallowedTags: new Set(["atag"]),
    tagReplacementText: " ",
};

const ExampleText = `<atag someattr="value">some text<btag>more text</btag></atag>`;

const WantWhenUsingDefault = "some textmore text";
const WantWhenUsingAllowedTags = `<atag someattr="value">some text more text </atag>`;
const WantWhenUsingDisallowedTags = " some text<btag>more text</btag> ";

describe("StateMachine", () => {
    it("defaults sanity check", () => {
        const machine = new StateMachine();

        const got = ExampleText.split(/(?= )/g)
            .map((partial) => machine.consume(partial))
            .join("");

        expect(got).toEqual(WantWhenUsingDefault);
    });

    it("allowed tags sanity check", () => {
        const machine = new StateMachine(OptionsWithAllowedTags);

        const got = ExampleText.split(/(?= )/g)
            .map((partial) => machine.consume(partial))
            .join("");

        expect(got).toEqual(WantWhenUsingAllowedTags);
    });

    it("disallowed tags sanity check", () => {
        const machine = new StateMachine(OptionsWithDisallowedTags);

        const got = ExampleText.split(/(?= )/g)
            .map((partial) => machine.consume(partial))
            .join("");

        expect(got).toEqual(WantWhenUsingDisallowedTags);
    });
});

describe("striptags", () => {
    it("defaults sanity check", () => {
        const got = striptags(ExampleText);

        expect(got).toEqual(WantWhenUsingDefault);
    });

    it("allowed tags sanity check", () => {
        const got = striptags(ExampleText, OptionsWithAllowedTags);

        expect(got).toEqual(WantWhenUsingAllowedTags);
    });

    it("disallowed tags sanity check", () => {
        const got = striptags(ExampleText, OptionsWithDisallowedTags);

        expect(got).toEqual(WantWhenUsingDisallowedTags);
    });

    it("can handle bad html", () => {
        const badHtml = `
<p><mark class="green">{{first_name}}</mark>,</p>

Your recent LinkedIn post on <mark class="green">{{! POST TOPIC }}</mark> made me want to
reach out. I’d love to know how you’re addressing
<span class="painpoint contenteditable="false"
    >Generating more leads that fit your ICP.</span
>

and what your thoughts are on
<mark class="blue"
    >Use more relevant account-level insights to know which companies that fit your ICP are ready to
    buy now, not later.</mark
>. If you’re interested in talking more, I’m free
<span class="timeslot" contenteditable="false">Tuesday @ 11:00am</span>
and
<span class="timeslot" contenteditable="false">Thursday @ 1:00pm</span>
for a quick call.
<p></p>
<p>Thanks,</p>
<p><mark class="green">{{sender.first_name}}</mark></p>
`;
        const got = striptags(badHtml, {
            tagReplacementText: "",
        });
        const better = stripHtml(badHtml);
        expect(got.trim()).toEqual(better);
    });
});

function stripHtml(html: string) {
    html = (html || "").trim();
    if (!html) {
        return html;
    }
    const content: string[] = [];

    const parser = new Parser(
        {
            ontext: (text) => {
                content.push(text);
            },
        },
        { decodeEntities: true },
    );

    parser.write(html);
    parser.end();

    return content.join("");
}
