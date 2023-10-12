import { Player } from "./playerModel";

export enum VoteType {
    VOTE_VILLAGE = "VOTE_VILLAGE",
    VOTE_WEREWOLF = "VOTE_WEREWOLF",
}

export class Vote {

    private type: VoteType;
    private votes: { [key: string]: { [key: string]: boolean | undefined } } = {};
    private participants: Array<Player>;
    private result: Player;

    constructor(type: VoteType, players: Array<Player>) {
        this.type = type;
        this.participants = players;
        this.result = null;
    }

    public getType(): VoteType {
        return this.type;
    }

    public getParticipants(): Array<Player> {
        return this.participants;
    }

    public getResult(): Player {
        return this.result;
    }

    public getVotes(): { [key: string]: { [key: string]: boolean | undefined } } {
        return this.votes;
    }

    public open(): void {
        this.participants.forEach((participant) => {
            this.sendVoteStart(participant);
        });
    }

    public sendVoteStart(player: Player): void {
        player.sendMessage("VOTE_START", { vote_type: this.type });
    }

    public close(): void {
        this.participants.forEach((participant) => {
            this.sendVoteEnd(participant);
        });
    }

    public sendVoteEnd(player: Player): void {
        player.sendMessage("VOTE_END", { vote_type: this.type });
    }

    public sendVoteValid(player: Player): void {
        if (this.isClosed()) player.sendMessage("VOTE_VALID", { vote_type: this.type, playerVoted: this.result.getName() });
    }

    public sendAllInfo(player: Player): void {
        player.sendMessage("GET_ALL_INFO_VOTE", { ratifications: this.countRatification(), nbParticipants: this.getParticipants().length });
    }

    public isClosed(): boolean {
        return this.result !== null;
    }

    public countRatification(): { [key: string]: { nbValidation: number; nbInvalidation: number } } {
        const res: { [key: string]: { nbValidation: number; nbInvalidation: number } } = {};

        for (const target of Object.keys(this.votes)) {
            const targetCounts = Object.values(this.votes[target])
                .map((v) => ({ nbValidation: v ? 1 : 0, nbInvalidation: v ? 0 : 1 }))
                .reduce(
                    (a, b) => ({
                        nbValidation: a.nbValidation + b.nbValidation,
                        nbInvalidation: a.nbInvalidation + b.nbInvalidation
                    }),
                    { nbValidation: 0, nbInvalidation: 0 }
                );
            if (targetCounts.nbValidation > 0 || targetCounts.nbInvalidation > 0) res[target] = targetCounts;
        }

        return res;
    }

    private voteValidation(playerVoted: Player): void {
        const nbVote = Object.values(this.votes[playerVoted.getName()])
            .map((val) => (val ? 1 : 0))
            .reduce((a, b) => a + b, 0);

        if (nbVote > this.participants.length / 2) {
            this.result = playerVoted;
            // On annonce à tous les joueurs que le vote est validé
            this.participants.forEach((player) => this.sendVoteValid(player));
        }
    }

    public addProposition(playerWhoVote: Player, playerVoted: Player): void {
        this.votes[playerVoted.getName()] = {
            [playerWhoVote.getName()]: true
        };

        this.participants.forEach((player) => player.sendMessage("ASK_RATIFICATION", { vote_type: this.type, playerVoted: playerVoted.getName() }));

        // On regarde si le vote est terminée et/ou valide
        this.voteValidation(playerVoted);
    }

    public ratifyProposition(playerWhoRatify: Player, playerVoted: Player, ratification: boolean): void {
        this.votes[playerVoted.getName()][playerWhoRatify.getName()] = ratification;

        // On envoie une mise à jour du vote à tous les participants
        const cpt: { nbValidation: number; nbInvalidation: number } = this.countRatification()[playerVoted.getName()];
        this.participants.forEach((player) =>
            player.sendMessage("UPDATE_PROPOSITION", { vote_type: this.type, playerVoted: playerVoted.getName(), nbValidation: cpt.nbValidation, nbInvalidation: cpt.nbInvalidation })
        );

        // On regarde si le vote est terminée et/ou valide
        this.voteValidation(playerVoted);
    }

}
