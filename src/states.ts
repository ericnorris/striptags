type SpaceCharacter = " "|"\n"|"\r"|"\t";

function isSpace(character: string): character is SpaceCharacter  {
    return character == " " || character == "\n" || character == "\r" || character == "\t";
}

type QuoteCharacter = '"'|"'";

function isQuote(character: string): character is QuoteCharacter {
    return character == '"' || character == "'";
}

const TAG_START = "<";
const TAG_END = ">";

const ENCODED_TAG_START = "&lt;";
const ENCODED_TAG_END = "&gt;";

export interface StateMachineOptions {
    readonly allowedTags: Set<string>;
    readonly tagReplacementText: string;
    readonly encodePlaintextTagDelimiters: boolean;
}

export type StateTransitionFunction = (next: State) => void;

export interface State {
    consume(character: string, transition: StateTransitionFunction): string;
}

type InPlaintextStateTransitionFunction = (next: InTagNameState) => void;

export class InPlaintextState implements State {

    constructor(private readonly options: StateMachineOptions) {}

    consume(character: string, transition: InPlaintextStateTransitionFunction): string {
        if (character == TAG_START) {
            transition(new InTagNameState(this.options));

            return "";
        } else if (character == TAG_END && this.options.encodePlaintextTagDelimiters) {
            return ENCODED_TAG_END;
        }

        return character;
    }

}

export const enum TagMode {
    Allowed,
    Disallowed,
}

type InTagNameStateTransitionFunction = (next: InPlaintextState|InTagState<TagMode.Allowed>|InTagState<TagMode.Disallowed>|InCommentState) => void;

export class InTagNameState implements State {

    private nameBuffer = "";
    private isClosingTag = false;

    constructor(private readonly options: StateMachineOptions) {}

    consume(character: string, transition: InTagNameStateTransitionFunction): string {
        if (this.nameBuffer.length == 0) {
            if (isSpace(character)) {
                transition(new InPlaintextState(this.options));

                return (this.options.encodePlaintextTagDelimiters ? ENCODED_TAG_START : "<") + character;
            }

            if (character == "/") {
                this.isClosingTag = true;

                return "";
            }
        }

        if (isSpace(character)) {
            if (this.options.allowedTags.has(this.nameBuffer.toLowerCase())) {
                transition(new InTagState(TagMode.Allowed, this.options));

                return TAG_START + (this.isClosingTag ? "/" : "") + this.nameBuffer + character;
            } else {
                transition(new InTagState(TagMode.Disallowed, this.options));

                return this.options.tagReplacementText;
            }
        }

        if (character == TAG_START) {
            this.nameBuffer += ENCODED_TAG_START;
        }

        if (character == TAG_END) {
            transition(new InPlaintextState(this.options));

            if (this.options.allowedTags.has(this.nameBuffer.toLowerCase())) {
                return TAG_START + (this.isClosingTag ? "/" : "") + this.nameBuffer + character;
            } else {
                return this.options.tagReplacementText;
            }
        }

        if (character == "-" && this.nameBuffer == "!-") {
            transition(new InCommentState(this.options));

            return "";
        }

        this.nameBuffer += character;

        return "";
    }

}

type InTagStateTransitionFunction<T extends TagMode> = (next: InPlaintextState|InQuotedStringInTagState<T>) => void;

export class InTagState<T extends TagMode> implements State {

    constructor(public readonly mode: T, private readonly options: StateMachineOptions) {}

    consume(character: string, transition: InTagStateTransitionFunction<T>): string {
        if (character == TAG_END) {
            transition(new InPlaintextState(this.options));
        } else if (isQuote(character)) {
            transition(new InQuotedStringInTagState<T>(this.mode, character, this.options));
        }

        if (this.mode == TagMode.Disallowed) {
            return "";
        }

        if (character == TAG_START) {
            return ENCODED_TAG_START;
        } else {
            return character;
        }
    }

}

type InQuotedStringInTagStateTransitionFunction<T extends TagMode> = (next: InTagState<T>) => void;

export class InQuotedStringInTagState<T extends TagMode> implements State {

    constructor(public readonly mode: T, public readonly quoteCharacter: QuoteCharacter, private readonly options: StateMachineOptions) {}

    consume(character: string, transition: InQuotedStringInTagStateTransitionFunction<T>): string {
        if (character == this.quoteCharacter) {
            transition(new InTagState<T>(this.mode, this.options));
        }

        if (this.mode == TagMode.Disallowed) {
            return "";
        }

        if (character == TAG_START) {
            return ENCODED_TAG_START;
        } else if (character == TAG_END) {
            return ENCODED_TAG_END;
        } else {
            return character;
        }
    }

}

type InCommentStateTransitionFunction = (next: InPlaintextState) => void;

export class InCommentState implements State {

    private consecutiveHyphens = 0;

    constructor(private readonly options: StateMachineOptions) {}

    consume(character: string, transition: InCommentStateTransitionFunction): string {
        if (character == ">" && this.consecutiveHyphens == 2) {
            transition(new InPlaintextState(this.options));
        } else if (character == "-") {
            this.consecutiveHyphens++;
        } else {
            this.consecutiveHyphens = 0;
        }

        return "";
    }

}
