import { StateMachineOptions, State, InPlaintextState } from "./states";

export class StateMachine {

    private state: State;

    constructor(partialOptions: Partial<StateMachineOptions>) {
        const options = {
            allowedTags: new Set<string>(),
            tagReplacementText:  "",
            encodePlaintextTagDelimiters: true,
        };

        Object.assign(options, partialOptions);

        this.state = new InPlaintextState(options);
    }

    public consume(text: string): string {
        let outputBuffer = "";

        for (const character of text) {
            outputBuffer += this.state.consume(character, this.transitionState);
        }

        return outputBuffer;
    }

    private transitionState(next: State): void {
        this.state = next;
    }
}
