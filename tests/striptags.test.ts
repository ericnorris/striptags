import { StateMachineOptions, StateMachine, striptags } from "../src/striptags";

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
});
