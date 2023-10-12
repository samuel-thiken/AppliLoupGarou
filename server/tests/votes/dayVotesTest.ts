import { VoteType } from "../../models/voteModel";
import { Client, Power, Role } from "../main.test";
import { test } from "../test-api/testAPI";

let resultVote: Client;

export const testVoteDay = async (players: Array<Client>): Promise<void> => {
    const alivePlayers: Array<Client> = players.filter((p) => p.isAlive());
    const werewolves: Array<Client> = alivePlayers.filter((p) => p.getRole() === Role.WEREWOLF);
    const humans: Array<Client> = alivePlayers.filter((p) => p.getRole() === Role.HUMAN);
    const contamination: Client | undefined = players.find((p) => p.getPower() === Power.CONTAMINATION);
    const deadPlayer: Client = players.find((p) => !p.isAlive());

    resultVote = contamination ? humans[0] : werewolves[0];

    await test("Village vote", async (t) => {
        alivePlayers[0].sendMessage(
            JSON.stringify({
                event: "VOTE_SENT",
                game_id: 1,
                data: {
                    vote_type: VoteType.VOTE_VILLAGE,
                    playerVoted: resultVote.getName()
                }
            })
        );

        for (const player of alivePlayers)
            await t.testOrTimeout(player.verifyEvent({ event: "ASK_RATIFICATION", game_id: 1, data: { vote_type: VoteType.VOTE_VILLAGE, playerVoted: resultVote.getName() } }));
    });

    await test("Ratification of a dead player", async (t) => {
        deadPlayer.sendMessage(
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
            deadPlayer.verifyEvent({
                event: "VOTE_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Dead player cannot participate to the vote"
                }
            })
        );
    });

    await test("Dead player voted", async (t) => {
        alivePlayers[0].sendMessage(
            JSON.stringify({
                event: "RESPONSE_RATIFICATION",
                game_id: 1,
                data: {
                    vote_type: VoteType.VOTE_VILLAGE,
                    playerVoted: deadPlayer.getName(),
                    ratification: false
                }
            })
        );

        await t.testOrTimeout(
            alivePlayers[0].verifyEvent({
                event: "VOTE_ERROR",
                game_id: 1,
                data: {
                    status: 403,
                    message: "Target player is already dead"
                }
            })
        );
    });

    await test("Ratification of the proposition", async (t) => {
        let nbValidation = 0;
        for (const player of alivePlayers) {
            player.sendMessage(
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

            for (const p of alivePlayers) {
                if (nbValidation <= alivePlayers.length / 2) {
                    await t.testOrTimeout(
                        p.verifyEvent({
                            event: "UPDATE_PROPOSITION",
                            game_id: 1,
                            data: {
                                vote_type: VoteType.VOTE_VILLAGE,
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

        for (const player of alivePlayers) {
            await t.testOrTimeout(
                player.verifyEvent({
                    event: "VOTE_VALID",
                    game_id: 1,
                    data: {
                        vote_type: VoteType.VOTE_VILLAGE,
                        playerVoted: resultVote.getName()
                    }
                })
            );
        }
    });
};

export const verifyDayVoteResult = async (): Promise<void> => {
    await test("Verify village vote result", async (t) => {
        t.assert(!resultVote.isAlive());
    });
};
