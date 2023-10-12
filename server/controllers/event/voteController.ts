import { Game } from "../../models/gameModel";
import { Player } from "../../models/playerModel";
import { Vote, VoteType } from "../../models/voteModel";
import { Event } from "../eventController";

const voteVerification = (game: Game, player: Player, data: { vote_type: VoteType; playerVoted: string; ratification?: boolean }): boolean => {
    if (!game.getVote()) {
        player.sendError("VOTE_ERROR", 403, "There isn't any vote yet");
        return false;
    }
    if (game.getVote().getType() !== data.vote_type) {
        player.sendError("VOTE_ERROR", 403, `Vote type is ${data.vote_type} but vote type ${game.getVote().getType()} is expected`);
        return false;
    }
    if (game.getVote().isClosed()) {
        player.sendError("VOTE_ERROR", 403, "Vote is closed");
        return false;
    }
    if (player.isDead()) {
        player.sendError("VOTE_ERROR", 403, "Dead player cannot participate to the vote");
        return false;
    }
    if (!game.getVote().getParticipants().includes(player)) {
        player.sendError("VOTE_ERROR", 403, "You're not a participant of this vote");
        return false;
    }
    const target: Player = game.getPlayer(data.playerVoted);
    if (!target) {
        player.sendError("VOTE_ERROR", 403, "Target player is not in the game");
        return false;
    }
    if (target.isDead()) {
        player.sendError("VOTE_ERROR", 403, "Target player is already dead");
        return false;
    }
    return true;
};

const voteProposition = (game: Game, player: Player, data: { vote_type: VoteType; playerVoted: string }): void => {
    if (!voteVerification(game, player, data)) return;
    game.getVote().addProposition(player, game.getPlayer(data.playerVoted));
};

const voteRatification = (game: Game, player: Player, data: { vote_type: VoteType; playerVoted: string; ratification: boolean }): void => {
    if (!voteVerification(game, player, data)) return;
    game.getVote().ratifyProposition(player, game.getPlayer(data.playerVoted), data.ratification);
};

const getAllVotes = (game: Game, player: Player): void => {
    const vote: Vote = game.getVote();
    if (!vote.getParticipants().includes(player)) return;
    vote.sendVoteStart(player);
    vote.sendAllInfo(player);
    vote.sendVoteValid(player);
};

// Liste des événements relatifs aux votes
Event.registerHandlers("VOTE_SENT", voteProposition);
Event.registerHandlers("RESPONSE_RATIFICATION", voteRatification);
Event.registerHandlers("GET_ALL_INFO", getAllVotes);
