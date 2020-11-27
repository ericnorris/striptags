import { StateMachineOptions, State, StateTransitionFunction, InPlaintextState } from "./states";

export const DefaultStateMachineOptions: StateMachineOptions = {
    allowedTags: new Set<string>(),
    tagReplacementText: "",
    encodePlaintextTagDelimiters: true,
};

export class StateMachine {
    private state: State;

    private transitionFunction: StateTransitionFunction;

    constructor(partialOptions: Partial<StateMachineOptions> = {}) {
        this.state = new InPlaintextState({
            ...DefaultStateMachineOptions,
            ...partialOptions,
        });

        this.transitionFunction = ((next: State): void => {
            this.state = next;
        }).bind(this);
    }

    public consume(text: string): string {
        let outputBuffer = "";

        for (const character of text) {
            outputBuffer += this.state.consume(character, this.transitionFunction);
        }

        return outputBuffer;
    }
}

export function striptags(text: string, options: Partial<StateMachineOptions> = {}): string {
    return new StateMachine(options).consume(text);
}
