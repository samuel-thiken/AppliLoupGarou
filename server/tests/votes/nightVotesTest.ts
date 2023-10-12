import { VoteType } from "../../models/voteModel";
import { Client, Power, Role } from "../main.test";
import { playerContaminated } from "../powers/contaminationTest";
import { test } from "../test-api/testAPI";

let resultVote: Client;

export const testVoteNight = async (players: Array<Client>, clientNotInGame: Client): Promise<void> => {
    const werewolves: Array<Client> = players.filter((p) => p.getRole() === Role.WEREWOLF);
    const humans: Array<Client> = players.filter((p) => p.getRole() === Role.HUMAN);
    const contamination: Client | undefined = players.find((p) => p.getPower() === Power.CONTAMINATION);

    resultVote = contamination ? humans.filter(p => p !== playerContaminated)[0] : werewolves[0];

    await test("Werewolves vote", async (t) => {
        werewolves[0].sendMessage(
            JSON.stringify({
                game_id: 1,
                event: "VOTE_SENT",
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    playerVoted: resultVote.getName()
                }
            })
        );

        for (const werewolf of werewolves)
            await t.testOrTimeout(werewolf.verifyEvent({ event: "ASK_RATIFICATION", game_id: 1, data: { vote_type: VoteType.VOTE_WEREWOLF, playerVoted: resultVote.getName() } }));
    });

    await test("Vote type error", async (t) => {
        werewolves[1].sendMessage(
            JSON.stringify({
                event: "RESPONSE_RATIFICATION",
                game_id: 1,
                data: {
                    vote_type: VoteType.VOTE_VILLAGE,
                    playerVoted: resultVote.getName(),
                    ratification: true
                }
            })
        );

        await t.testOrTimeout(
            werewolves[1].verifyEvent({
                event: "VOTE_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: `Vote type is ${VoteType.VOTE_VILLAGE} but vote type ${VoteType.VOTE_WEREWOLF} is expected`
                }
            })
        );
    });

    await test("Wrong participant to the vote", async (t) => {
        humans[1].sendMessage(
            JSON.stringify({
                event: "VOTE_SENT",
                game_id: 1,
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    playerVoted: werewolves[1].getName()
                }
            })
        );

        await t.testOrTimeout(
            humans[1].verifyEvent({
                event: "VOTE_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "You're not a participant of this vote"
                }
            })
        );
    });

    await test("Player voted not in the game", async (t) => {
        werewolves[0].sendMessage(
            JSON.stringify({
                event: "RESPONSE_RATIFICATION",
                game_id: 1,
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    playerVoted: clientNotInGame.getName(),
                    ratification: true
                }
            })
        );

        await t.testOrTimeout(
            werewolves[0].verifyEvent({
                event: "VOTE_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Target player is not in the game"
                }
            })
        );
    });

    await test("Ratification of the proposition", async (t) => {
        let nbValidation = 0;
        for (const werewolf of werewolves) {
            werewolf.sendMessage(
                JSON.stringify({
                    event: "RESPONSE_RATIFICATION",
                    game_id: 1,
                    data: {
                        vote_type: VoteType.VOTE_WEREWOLF,
                        playerVoted: resultVote.getName(),
                        ratification: true
                    }
                })
            );

            for (const w of werewolves) {
                if (nbValidation <= werewolves.length / 2) {
                    await t.testOrTimeout(
                        w.verifyEvent({
                            event: "UPDATE_PROPOSITION",
                            game_id: 1,
                            data: {
                                vote_type: VoteType.VOTE_WEREWOLF,
                                playerVoted: resultVote.getName(),
                                nbValidation: nbValidation + 1,
                                nbInvalidation: 0
                            }
                        })
                    );
                }
            }
            nbValidation += 1;
        }

        for (const werewolf of werewolves) {
            await t.testOrTimeout(
                werewolf.verifyEvent({
                    event: "VOTE_VALID",
                    game_id: 1,
                    data: {
                        vote_type: VoteType.VOTE_WEREWOLF,
                        playerVoted: resultVote.getName()
                    }
                })
            );
        }
    });

    await test("Vote closed", async (t) => {
        werewolves[1].sendMessage(
            JSON.stringify({
                event: "VOTE_SENT",
                game_id: 1,
                data: {
                    vote_type: VoteType.VOTE_WEREWOLF,
                    playerVoted: humans[1].getName()
                }
            })
        );

        await t.testOrTimeout(
            werewolves[1].verifyEvent({
                event: "VOTE_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Vote is closed"
                }
            })
        );
    });
};

export const verifyNightVoteResult = async (): Promise<void> => {
    await test("Verify werewolves vote result", async (t) => {
        t.assert(!resultVote.isAlive());
    });
};
