import {
    StateMachineOptions,
    State,
    TagMode,
    InPlaintextState,
    InTagNameState,
    InTagState,
    InCommentState,
    InQuotedStringInTagState,
} from "../src/states";

const AllowedTagName = "allowed";
const DisallowedTagName = "disallowed";
const ImplicitlyAllowedTagName = "notdisallowed";
const TagReplacementText = "~replaced~";

const DefaultTestOptions = {
    allowedTags: new Set([AllowedTagName]),
    tagReplacementText: TagReplacementText,
};

const OptionsWithEncodingEnabled: StateMachineOptions = {
    ...DefaultTestOptions,
    encodePlaintextTagDelimiters: true,
};

const OptionsWithEncodingDisabled: StateMachineOptions = {
    ...DefaultTestOptions,
    encodePlaintextTagDelimiters: false,
};

const OptionsWithDisallowedTags: StateMachineOptions = {
    disallowedTags: new Set([DisallowedTagName]),
    tagReplacementText: TagReplacementText,
    encodePlaintextTagDelimiters: true,
};

function consumeStringUntilTransitionOrEOF(start: State, text: string): [string, State] {
    let currentState = start;
    let outputBuffer = "";

    for (const character of text) {
        outputBuffer += start.consume(character, (next: State) => {
            currentState = next;
        });

        if (currentState != start) {
            break;
        }
    }

    return [outputBuffer, currentState];
}

describe("InPlaintextState", () => {
    it("should transition upon seeing a '<' character", () => {
        const start = new InPlaintextState(OptionsWithEncodingEnabled);

        const text = "a string <atag";
        const want = "a string ";

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InTagNameState);
    });

    it("should encode spurious '>' characters", () => {
        const start = new InPlaintextState(OptionsWithEncodingEnabled);

        const text = "a string >";
        const want = "a string &gt;";

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InPlaintextState);
    });

    it("should not encode spurious '>' characters", () => {
        const start = new InPlaintextState(OptionsWithEncodingDisabled);

        const text = "a string >";
        const want = text;

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InPlaintextState);
    });
});

describe("InTagNameState", () => {
    it("should output an encoded '<' character if immediately followed by a space", () => {
        const start = new InTagNameState(OptionsWithEncodingEnabled);

        const text = " ";
        const want = `&lt;${text}`;

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InPlaintextState);
    });

    it("should output a '<' character if immediately followed by a space", () => {
        const start = new InTagNameState(OptionsWithEncodingDisabled);

        const text = " ";
        const want = `<${text}`;

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, " ");

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InPlaintextState);
    });

    it("should transition to InTagState w/ allowed mode upon seeing a space", () => {
        const start = new InTagNameState(OptionsWithEncodingEnabled);

        const text = `${AllowedTagName} `;
        const want = `<${text}`;

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InTagState);
        expect(endState).toHaveProperty("mode", TagMode.Allowed);
    });

    it("should transition to InTagState w/ allowed mode upon seeing a space after a closing tag name", () => {
        const start = new InTagNameState(OptionsWithEncodingEnabled);

        const text = `/${AllowedTagName} `;
        const want = `<${text}`;

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InTagState);
        expect(endState).toHaveProperty("mode", TagMode.Allowed);
    });

    it("should transition to InTagState w/ disallowed mode upon seeing a space", () => {
        const start = new InTagNameState(OptionsWithEncodingEnabled);

        const text = "disallowed ";
        const want = TagReplacementText;

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InTagState);
        expect(endState).toHaveProperty("mode", TagMode.Disallowed);
    });

    it("should allow tags with no attributes", () => {
        const start = new InTagNameState(OptionsWithEncodingEnabled);

        const text = `${AllowedTagName}>`;
        const want = `<${text}`;

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InPlaintextState);
    });

    it("should allow closing tags with no attributes", () => {
        const start = new InTagNameState(OptionsWithEncodingEnabled);

        const text = `/${AllowedTagName}>`;
        const want = `<${text}`;

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InPlaintextState);
    });

    it("should disallow tags with no attributes", () => {
        const start = new InTagNameState(OptionsWithEncodingEnabled);

        const text = "disallowed>";
        const want = TagReplacementText;

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InPlaintextState);
    });

    it("should disallow tags in a disallowedTags set", () => {
        const start = new InTagNameState(OptionsWithDisallowedTags);

        const text = `${DisallowedTagName} `;
        const want = TagReplacementText;

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InTagState);
        expect(endState).toHaveProperty("mode", TagMode.Disallowed);
    });

    it("should allow tags not in a disallowedTags set", () => {
        const start = new InTagNameState(OptionsWithDisallowedTags);

        const text = `${ImplicitlyAllowedTagName} `;
        const want = `<${text}`;

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InTagState);
        expect(endState).toHaveProperty("mode", TagMode.Allowed);
    });

    it("should transition to InCommentState for comments", () => {
        const start = new InTagNameState(OptionsWithEncodingEnabled);

        const text = "!-- a comment";
        const want = "";

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InCommentState);
    });
});

describe("InTagState", () => {
    it("should return text if allowed", () => {
        const start = new InTagState(TagMode.Allowed, OptionsWithEncodingEnabled);

        const text = "tag body text";
        const want = text;

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InTagState);
    });

    it("should not return text if disallowed", () => {
        const start = new InTagState(TagMode.Disallowed, OptionsWithEncodingEnabled);

        const text = "tag body < text";
        const want = "";

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InTagState);
    });

    describe("should transition to InQuotedStringInTagState upon seeing a quote character", () => {
        it('" character', () => {
            const start = new InTagState(TagMode.Disallowed, OptionsWithEncodingEnabled);

            const text = 'attr="';
            const want = "";

            const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

            expect(got).toEqual(want);
            expect(endState).toBeInstanceOf(InQuotedStringInTagState);
            expect(endState).toHaveProperty("mode", TagMode.Disallowed);
            expect(endState).toHaveProperty("quoteCharacter", '"');
        });

        it("' character", () => {
            const start = new InTagState(TagMode.Allowed, OptionsWithEncodingEnabled);

            const text = "attr='";
            const want = "attr='";

            const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

            expect(got).toEqual(want);
            expect(endState).toBeInstanceOf(InQuotedStringInTagState);
            expect(endState).toHaveProperty("mode", TagMode.Allowed);
            expect(endState).toHaveProperty("quoteCharacter", "'");
        });
    });

    it("should encode spurious '<' characters", () => {
        const start = new InTagState(TagMode.Allowed, OptionsWithEncodingEnabled);

        const text = "tag body < text";
        const want = "tag body &lt; text";

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InTagState);
    });

    it("should transition to InPlaintextState upon seeing a '>' character", () => {
        const start = new InTagState(TagMode.Allowed, OptionsWithEncodingEnabled);

        const text = "tag body> text";
        const want = "tag body>";

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InPlaintextState);
    });
});

describe("InQuotedStringInTagState", () => {
    it("should return text if allowed", () => {
        const start = new InQuotedStringInTagState(
            TagMode.Allowed,
            "'",
            OptionsWithEncodingEnabled,
        );

        const text = 'attr body " text < >';
        const want = 'attr body " text &lt; &gt;';

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InQuotedStringInTagState);
    });

    it("should not return text if disallowed", () => {
        const start = new InQuotedStringInTagState(
            TagMode.Disallowed,
            "'",
            OptionsWithEncodingEnabled,
        );

        const text = "attr body text < >";
        const want = "";

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InQuotedStringInTagState);
    });

    describe("should transition back to InTagState upon seeing a closing quote character", () => {
        it('" character', () => {
            const start = new InQuotedStringInTagState(
                TagMode.Allowed,
                '"',
                OptionsWithEncodingEnabled,
            );

            const text = 'attr body text" ';
            const want = 'attr body text"';

            const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

            expect(got).toEqual(want);
            expect(endState).toBeInstanceOf(InTagState);
            expect(endState).toHaveProperty("mode", TagMode.Allowed);
        });

        it("' character", () => {
            const start = new InQuotedStringInTagState(
                TagMode.Disallowed,
                "'",
                OptionsWithEncodingEnabled,
            );

            const text = "attr body text' ";
            const want = "";

            const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

            expect(got).toEqual(want);
            expect(endState).toBeInstanceOf(InTagState);
            expect(endState).toHaveProperty("mode", TagMode.Disallowed);
        });
    });
});

describe("InCommentState", () => {
    it("should ignore extra hyphens", () => {
        const start = new InCommentState(OptionsWithEncodingEnabled);

        const text = "-a- -";
        const want = "";

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InCommentState);
    });

    it("should transition back to InPlaintextState upon seeing a closing comment tag", () => {
        const start = new InCommentState(OptionsWithEncodingEnabled);

        const text = "some text -->";
        const want = "";

        const [got, endState] = consumeStringUntilTransitionOrEOF(start, text);

        expect(got).toEqual(want);
        expect(endState).toBeInstanceOf(InPlaintextState);
    });
});
