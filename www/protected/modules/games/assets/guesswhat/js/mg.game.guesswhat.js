var setTimeout_1,
    setTimeout_2,
    setTimeout_3,
    setTimeout_4;

MG_GAME_GUESSWHAT = function ($) {
    return $.extend(MG_GAME_API, {
        wordField: null,
        doQueryMessages: false,
        doPartnerSearch: true,

        hintWaitingTime: 0,
        hintWaitingTemplate: '#template-waiting-for-hint',
        hintTimeOutHint: 'TIMED OUT',

        /*
         * implementation of the game's init method called in the view
         */
        init: function (options) {
            var settings = $.extend(options, {
                ongameinit: MG_GAME_GUESSWHAT.ongameinit,
                onunload: function () {
                    // we can't make use of onunload to send an ajax request as the browser immediately stops working and the request might not be processed.
                    // thus if we are playing a multiplayer game the browsers will exit without error message
                    if (MG_GAME_GUESSWHAT.game.game_partner_id !== undefined && MG_GAME_GUESSWHAT.game.game_partner_id && !MG_GAME_GUESSWHAT.game.played_against_computer) {
                        if (MG_GAME_GUESSWHAT.game.game_partner_name == "Anonymous") {
                            MG_API.ajaxCall('/games/abortPartnerSearch/game_partner_id/' + MG_GAME_GUESSWHAT.game.game_partner_id, function (response) {
                            }, {async: false}, true); // we have to send a synchronous request as a async request might be aborted by page unload
                        } else {
                            if (MG_GAME_GUESSWHAT.game.played_game_id !== undefined && MG_GAME_GUESSWHAT.game.played_game_id && !MG_GAME_GUESSWHAT.game.played_against_computer) {
                                MG_API.ajaxCall('/games/abort/played_game_id/' + MG_GAME_GUESSWHAT.game.played_game_id, function (response) {
                                }, {async: false}, true); // we have to send a synchronous request as a async request might be aborted by page unload
                            }
                        }
                    } else {
                        return 'Quit ' + MG_GAME_API.game.name + '?';
                    }
                }
            });

            MG_GAME_GUESSWHAT.wordField = $("#tag");

            // submit on enter
            MG_GAME_GUESSWHAT.wordField.focus().keydown(function (event) {
                if (event.keyCode == 13) {
                    MG_GAME_GUESSWHAT.onSendHint();
                    return false;
                }
            });

            MG_GAME_GUESSWHAT.submitHintButton = $("#sendHint").click(MG_GAME_GUESSWHAT.onSendHint);

            MG_GAME_API.game_init(settings);

            // initialize MG_AUDIO helper component
            MG_AUDIO.init({
                swfPath: MG_GAME_GUESSWHAT.settings.base_url + "/js/jQuery.jPlayer"
            });

            MG_AUDIO.add("fail", {
                    m4a: MG_GAME_GUESSWHAT.settings.asset_url + "/audio/fail.oga",
                    mp3: MG_GAME_GUESSWHAT.settings.asset_url + "/audio/fail.mp3",
                    wav: MG_GAME_GUESSWHAT.settings.asset_url + "/audio/fail.wav"},
                {supplied: 'oga, mp3, wav'});
            MG_AUDIO.add("success", {
                    m4a: MG_GAME_GUESSWHAT.settings.asset_url + "/audio/success.oga",
                    mp3: MG_GAME_GUESSWHAT.settings.asset_url + "/audio/success.mp3",
                    wav: MG_GAME_GUESSWHAT.settings.asset_url + "/audio/success.wav"},
                {supplied: 'oga, mp3, wav'});
            MG_AUDIO.add("select", {
                    m4a: MG_GAME_GUESSWHAT.settings.asset_url + "/audio/select.oga",
                    mp3: MG_GAME_GUESSWHAT.settings.asset_url + "/audio/select.mp3",
                    wav: MG_GAME_GUESSWHAT.settings.asset_url + "/audio/select.wav"},
                {supplied: 'oga, mp3, wav'});
            MG_AUDIO.add("hint", {
                    m4a: MG_GAME_GUESSWHAT.settings.asset_url + "/audio/hint.oga",
                    mp3: MG_GAME_GUESSWHAT.settings.asset_url + "/audio/hint.mp3",
                    wav: MG_GAME_GUESSWHAT.settings.asset_url + "/audio/hint.wav"},
                {supplied: 'oga, mp3, wav'});
        },

        /*
         * check if new messages are available for the user and evaluate the response
         */
        queryMessages: function () {
            var count_errors;
            if (MG_GAME_GUESSWHAT.doQueryMessages && !MG_GAME_GUESSWHAT.game.played_against_computer) {
                clearTimeout(setTimeout_1);
                MG_API.ajaxCall('/games/messages/played_game_id/' + MG_GAME_GUESSWHAT.game.played_game_id, function (response) {
                    if (MG_API.checkResponse(response)) { // we have to check whether the API returned a HTTP Status 200 but still json.status == "error" response
                        count_errors = 0;
                        if (MG_GAME_GUESSWHAT.doQueryMessages) {
                            if (response.messages !== undefined && response.messages.length > 0) {
                                for (index in response.messages) {
                                    message = response.messages[index].message;

                                    code = message;

                                    try {
                                        var message = $.parseJSON(message); // jquery seems not to like to parse all strings xyz without ' throws an error
                                        if (message.code != undefined)
                                            code = message.code;
                                    } catch (err) {
                                    }

                                    switch (code) {
                                        case "aborted":
                                            MG_GAME_API.releaseOnBeforeUnload(); // make sure the user can navigate away without seeing the leaving confirmation
                                            MG_GAME_GUESSWHAT.busy = true;
                                            MG_GAME_GUESSWHAT.doQueryMessages = false;

                                            MG_GAME_API.curtain.show();
                                            $("#info-modal").html("");
                                            $("#template-info-modal-partner-aborted").tmpl({
                                                game_partner_name: MG_GAME_API.game.game_partner_name,
                                                game_base_url: MG_GAME_API.game.game_base_url,
                                                arcade_url: MG_GAME_API.game.arcade_url
                                            }).appendTo($("#info-modal"));
                                            $("#info-modal:hidden").fadeIn(500);
                                            break;

                                        case "waiting":
                                            $("#partner-waiting").html("");
                                            $("#template-waiting-for-guess").tmpl({game_partner_name: MG_GAME_API.game.game_partner_name}).appendTo($("#partner-waiting"));
                                            $("#partner-waiting").fadeIn(2500);
                                            break;

                                        case "hintrequest":
                                            $("#info-modal:visible").fadeOut(500);
                                            MG_GAME_API.curtain.hide();
                                            MG_GAME_GUESSWHAT.busy = false;

                                            MG_GAME_GUESSWHAT.hintWaitingTime = MG_GAME_GUESSWHAT.game.hint_time_out;
                                            MG_GAME_GUESSWHAT.hintWaitingTemplate = "#template-waiting-for-hint";
                                            MG_GAME_GUESSWHAT.hintTimeOut();

                                            $("#partner-waiting").fadeIn(500);
                                            break;

                                        case "failed":
                                            $("#info-modal:visible").fadeOut(500);
                                            MG_GAME_GUESSWHAT.busy = false;
                                            MG_GAME_GUESSWHAT.onsubmit();
                                            break;

                                        case "posted":
                                            $("#info-modal:visible").fadeOut(500);
                                            MG_GAME_GUESSWHAT.busy = false;
                                            MG_GAME_GUESSWHAT.onsubmitTurn();
                                            break;

                                        case "guess":
                                            $("#info-modal:visible").fadeOut(500);
                                            MG_GAME_GUESSWHAT.busy = false;
                                            MG_AUDIO.play("select");
                                            MG_GAME_GUESSWHAT.evaluateGuess(message.guessedImageId);
                                            break;

                                        case "hint":
                                            MG_GAME_GUESSWHAT.processHint(message.hint);
                                            break;
                                    }
                                }
                            }
                        }
                    } else {
                        alert('Error response');
                    }
                }, {
                    error: function (xhr, textStatus, thrownError) {
                        count_errors++;
                        if (count_errors > 3) {
                            if (textStatus === "timeout") {
                                var error = "Timeout error: Connection Has Been Lost";
                            } else {
                                var error = thrownError;
                            }
                            alert(error);
                            clearTimeout(setTimeout_1);
                        }
                    }
                }, true);

                // make sure that the messages are checked again after a certain interval
                setTimeout_1 = setTimeout(MG_GAME_GUESSWHAT.queryMessages, MG_GAME_API.settings.message_queue_interval);
            }
        },


        /*
         * manages the count down for the describer. The describer has got only a limited
         * amount of time. If the time runs out the system will show a time out information
         * and ask the guesser to make a guess.
         */

        /*
         * renders a guess turn
         */
        renderGuessTurn: function (response, score_info, turn_info, licence_info, more_info) {
            clearTimeout(setTimeout_1);
            $("#stage").hide();

            if (MG_GAME_API.game.number_hints > 0) {
                $("#requestHintContainer").html('').show();
                $("#template-request-hint-active").tmpl().appendTo($("#requestHintContainer"));
                $("#requestHint").click(MG_GAME_GUESSWHAT.onRequestHint);
            } else {
                $("#requestHintContainer").hide();
            }

            $("#scores").html("");
            $("#template-scores").tmpl(score_info).appendTo($("#scores"));

            if (!MG_GAME_GUESSWHAT.game.user_authenticated) {
                $("#scores .total_score").remove();
            }
            $("#game .describe").hide();
            $('#wrong-guesses').hide();
            $('#wrong-guesses > div').remove();
            $("#game .guess").show();
            $("#game .guess .images").html("");
            $("#game .guess .hints span").remove();
            $("#template-guess-image").tmpl(turn_info).appendTo($("#game .guess .images"));

            $("#licences").html("");
            $("#template-licence").tmpl(licence_info).appendTo($("#licences"));

            $("#more_info").html("");

            if (more_info.length > 0)
                $("#template-more-info").tmpl(more_info).appendTo($("#more_info"));

            $('a.guessthis').click(MG_GAME_GUESSWHAT.onguess);
            $("a[rel='zoom']").fancybox({overlayColor: '#000'});

            $("#stage").fadeIn(1000, function () {
                MG_GAME_GUESSWHAT.busy = false;
                MG_GAME_GUESSWHAT.wordField.focus();
            });
        },

        /*
         * renders a describe turn
         */
        renderDescribeTurn: function (response, score_info, turn_info, licence_info, more_info, words_to_avoid) {
            $("#stage").hide();

            if (MG_GAME_GUESSWHAT.areHintsAllowedLeft()) {
                $("#sendHintFormContainer").show();
                $("#hintFormMessage").html('');
                $("#template-hint-form-active").tmpl().appendTo($("#hintFormMessage"));
            }

            $("#scores").html("");
            $("#template-scores").tmpl(score_info).appendTo($("#scores"));
            if (!MG_GAME_GUESSWHAT.game.user_authenticated) {
                $("#scores .total_score").remove();
            }
            $("#requestHintContainer").hide();

            $("#game .guess").hide();
            $('#wrong-guesses').show();
            $('#wrong-guesses > div').remove();
            $("#game .describe").show();
            $("#game .describe .image").html("");
            $("#game .describe .hints span").remove();
            $("#template-describe-image").tmpl(turn_info).appendTo($("#game .describe .image"));

            $("#licences").html("");
            $("#template-licence").tmpl(licence_info).appendTo($("#licences"));

            $("#more_info").html("");

            if (more_info.length > 0)
                $("#template-more-info").tmpl(more_info).appendTo($("#more_info"));

            $("#words_to_avoid").html("");
            $("#template-words-to-avoid-heading").tmpl().appendTo($("#words_to_avoid"))
            $("#template-words-to-avoid").tmpl(words_to_avoid).appendTo($("#words_to_avoid"));

            $("a[rel='zoom']").fancybox({overlayColor: '#000'});

            $("#stage").fadeIn(1000, function () {
                MG_GAME_GUESSWHAT.busy = false;
                MG_GAME_GUESSWHAT.wordField.focus();
            });
        },

        /*
         * game is over render the final screen
         */
        renderFinal: function (response, score_info, turn_info, licence_info, more_info) {
            $("#stage").hide();

            $('.game_description').hide();
            $('#partner-waiting').remove();
            $("#messages").hide();
            $('#game').hide();

            $("#scores").addClass("final").html("");
            $("#template-final-scoring").tmpl(score_info).appendTo($("#scores"));

            $("#more_info").html("");
            if (more_info.length > 0)
                $("#template-more-info").tmpl(more_info).appendTo($("#more_info"));

            $("#words_to_avoid").html("");

            $('#finalScreen').show();
            $("#template-final-screen-turn-image").tmpl(turn_info).appendTo($("#finalScreen"));

            $("a[rel='zoom']").fancybox({overlayColor: '#000'});

            MG_GAME_API.releaseOnBeforeUnload(); // make sure the user can navigate away without seeing the leaving confirmation

            $("#stage").fadeIn(1000, function () {
                MG_GAME_GUESSWHAT.busy = false;
            });
        },

        // Update the 'score' section using the current values stored in
        // MG_GAME_GUESSWHAT.
        //
        // We copied-out this section so that we could call it from
        // inside the hint code. We need to call it in a couple of
        // places, so it would be ideal to refactor those locations to
        // make this shared code.
        updateScore: function () {
            var current_turn = MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1];

            var score_info = {
                user_name: MG_GAME_GUESSWHAT.game.user_name,
                game_partner_name: MG_GAME_GUESSWHAT.game.game_partner_name,
                user_score: MG_GAME_GUESSWHAT.game.user_score,
                current_score: current_turn.score,
                user_num_played: MG_GAME_GUESSWHAT.game.user_num_played,
                turns: MG_GAME_GUESSWHAT.game.turns,
                current_turn: MG_GAME_GUESSWHAT.turn,
                guess: current_turn.guesses.length,
                max_guesses: MG_GAME_GUESSWHAT.game.number_guesses,
                num_guesses_left: MG_GAME_GUESSWHAT.game.number_guesses - current_turn.guesses.length,
                max_hints: MG_GAME_GUESSWHAT.game.number_hints + MG_GAME_GUESSWHAT.game.number_guesses,
                num_hints_left: MG_GAME_GUESSWHAT.game.number_hints * 1 + MG_GAME_GUESSWHAT.game.number_guesses * 1 - current_turn.hints.length
            };

            $("#scores").html("");
            $("#template-scores").tmpl(score_info).appendTo($("#scores"));
            if (!MG_GAME_GUESSWHAT.game.user_authenticated) {
                $("#scores .total_score").remove();
            }
        },

        /*
         * the post request to the /api/games/play/ action has send an response.
         * here the response will be evaluated
         */
        onresponse: function (response) {
            MG_GAME_GUESSWHAT.doQueryMessages = false;
            if (response.status == "wait") { // wait for the second player to respond
                MG_GAME_GUESSWHAT.doQueryMessages = true;
                MG_GAME_GUESSWHAT.queryMessages();

                MG_GAME_API.curtain.show();
                $("#info-modal").html('');
                $("#template-info-modal-wait-for-partner-to-submit").tmpl({
                    game_partner_name: MG_GAME_API.game.game_partner_name,
                    game_base_url: MG_GAME_API.game.game_base_url,
                    arcade_url: MG_GAME_API.game.arcade_url
                }).appendTo($("#info-modal"));
                $("#info-modal:hidden").fadeIn(250);

            } else if (response.status == "retry") { // wait a bit longer for a second player
                // no partner available
                $("#info-modal").html("");
                $("#template-info-modal-wait-for-partner").tmpl({
                    seconds: Math.round(MG_GAME_API.settings.partner_wait_threshold - MG_GAME_API.settings.partner_waiting_time),
                    play_against_computer: MG_GAME_GUESSWHAT.game.play_against_computer,
                    arcade_url: MG_GAME_API.game.arcade_url
                }).appendTo($("#info-modal"));
                $("#info-modal:hidden").fadeIn(500);

                $('#playAgainstComputerNow').click(function () {
                    // this function allows the user to start to play agains a user immideately
                    // hide the waiting window and make a final game partner search call with attempt == MG_GAME_API.settings.partner_wait_threshold
                    // this will trigger the play against the computer mode
                    $("#info-modal").fadeOut(250);
                    MG_GAME_GUESSWHAT.doPartnerSearch = false;

                    // a throttle interval makes sure that the players api calls are not being throttled by the
                    // throttle filter
                    MG_API.waitForThrottleIntervalToPass(function () {
                        MG_API.ajaxCall('/games/play/gid/' + MG_GAME_API.settings.gid + '/a/' + MG_GAME_API.settings.partner_wait_threshold + '/gp/' + MG_GAME_GUESSWHAT.game.game_partner_id, function (response) {
                            if (MG_API.checkResponse(response)) {
                                MG_GAME_API.game = $.extend(MG_GAME_API.game, response.game);
                                MG_GAME_API.settings.ongameinit(response);
                            }
                        });
                    }, 1000);
                    return false;
                });

                // wait for throttle interval to pass and check if a partner came online
                MG_API.waitForThrottleIntervalToPass(function () {
                    if (MG_GAME_GUESSWHAT.doPartnerSearch) { // wait for other player
                        var interval = MG_GAME_API.settings.throttleInterval;
                        if (interval < 1000) // we want to check only ever second for a new player (controls also the countdown)
                            interval = 1000;

                        MG_GAME_API.settings.partner_waiting_time += (interval / 1000);
                        if (MG_GAME_API.settings.partner_waiting_time <= MG_GAME_API.settings.partner_wait_threshold) {
                            // check for new player by calling ../play as a get request
                            MG_API.ajaxCall('/games/play/gid/' + MG_GAME_API.settings.gid + '/a/' + MG_GAME_API.settings.partner_waiting_time + '/gp/' + MG_GAME_GUESSWHAT.game.game_partner_id, function (response) {
                                if (MG_API.checkResponse(response)) {
                                    MG_GAME_API.game = $.extend(MG_GAME_API.game, response.game);
                                    MG_GAME_API.settings.ongameinit(response);
                                }
                            });
                        } else {

                            MG_GAME_API.releaseOnBeforeUnload(); // make sure the user can navigate away without seeing the leaving confirmation
                            $("#info-modal").html("");
                            $("#template-info-modal-time-out").tmpl({
                                game_base_url: MG_GAME_API.game.game_base_url,
                                arcade_url: MG_GAME_API.game.arcade_url
                            }).appendTo($("#info-modal"));
                        }
                    }
                }, 1000);
            } else if (response.status = 'ok') {
                // great game has been initialized.
                // prepare data and render the turns
                MG_GAME_GUESSWHAT.wordField.val("");

                $("#info-modal").hide();
                MG_GAME_API.curtain.hide();

                MG_GAME_GUESSWHAT.turn++;
                MG_GAME_GUESSWHAT.turns.push(response.turn);
                MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].hints = [];
                MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].guesses = [];

                var more_info = {};
                if ($.trim(MG_GAME_GUESSWHAT.game.more_info_url) != "")
                    var more_info = {url: MG_GAME_GUESSWHAT.game.more_info_url, name: MG_GAME_GUESSWHAT.game.name};

                if (MG_GAME_GUESSWHAT.turn > MG_GAME_GUESSWHAT.game.turns) { // render final result

                    var licence_info = [];
                    var turn_info = [];
                    var prev_turn_score = 0;
                    if (MG_GAME_GUESSWHAT.turns.length) { // extract turn and licence info
                        for (i = 0; i < MG_GAME_GUESSWHAT.turns.length - 1; i++) {
                            var turn = MG_GAME_GUESSWHAT.turns[i];

                            var secret_media = turn.medias.describe;

                            var score = MG_GAME_GUESSWHAT.turns[i + 1].score;
                            if (i > 0) {
                                score -= MG_GAME_GUESSWHAT.turns[i].score;
                            }

                            var hints = [];
                            $(turn.hints).each(function (index, value) {
                                if (value != MG_GAME_GUESSWHAT.hintTimeOutHint)
                                    hints.push(value);
                            })


                            // get turn's describe media info
                            media_licence_info = MG_GAME_GUESSWHAT.extractImageLicenceInfo(turn.licences, secret_media);
                            var media_info = {
                                url: secret_media.guess,
                                url_full_size: secret_media.full_size,
                                licence_info: MG_GAME_API.parseLicenceInfo(media_licence_info),
                                num_guesses: turn.guesses.length,
                                num_hints: turn.hints.length,
                                hints: hints.join(','),
                                num_points: score
                            }
                            turn_info.push(media_info);

                            if (turn.licences.length) {
                                for (licence in turn.licences) { // licences
                                    var found = false;
                                    for (l_index in licence_info) {
                                        if (licence_info[l_index].id == turn.licences[licence].id) {
                                            found = true;
                                            break;
                                        }
                                    }

                                    if (!found)
                                        licence_info.push(turn.licences[licence]);
                                }
                            }
                        }
                    }

                    //score box
                    var score_info = {
                        user_name: MG_GAME_GUESSWHAT.game.user_name,
                        game_partner_name: MG_GAME_GUESSWHAT.game.game_partner_name,
                        user_score: MG_GAME_GUESSWHAT.game.user_score,
                        current_score: response.turn.score,
                        user_num_played: MG_GAME_GUESSWHAT.game.user_num_played,
                        turns: MG_GAME_GUESSWHAT.game.turns,
                        current_turn: MG_GAME_GUESSWHAT.turn,
                        game_base_url: MG_GAME_API.game.game_base_url
                    };

                    MG_GAME_GUESSWHAT.renderFinal(response, score_info, turn_info, licence_info, more_info);

                } else {

                    $("#words_to_avoid").hide();
                    var words_to_avoid = [];

                    //score box
                    var score_info = {
                        user_name: MG_GAME_GUESSWHAT.game.user_name,
                        game_partner_name: MG_GAME_GUESSWHAT.game.game_partner_name,
                        user_score: MG_GAME_GUESSWHAT.game.user_score,
                        current_score: response.turn.score,
                        user_num_played: MG_GAME_GUESSWHAT.game.user_num_played,
                        turns: MG_GAME_GUESSWHAT.game.turns,
                        current_turn: MG_GAME_GUESSWHAT.turn,
                        guess: 0,
                        guesses: MG_GAME_GUESSWHAT.game.number_guesses,
                        num_guesses_left: MG_GAME_GUESSWHAT.game.number_guesses,
                        num_hints_left: MG_GAME_GUESSWHAT.game.number_hints * 1 + MG_GAME_GUESSWHAT.game.number_guesses * 1
                    };

                    // find out in what mode we are this can't be only done for the first turn on the server
                    var mode = response.turn.mode;
                    if (MG_GAME_GUESSWHAT.game.played_against_computer) {
                        MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].mode = "guess";
                    }

                    if (MG_GAME_GUESSWHAT.turn > 1 && !MG_GAME_GUESSWHAT.game.played_against_computer) {
                        // user plays against other human
                        // to distinguish whether a user should describe or guess
                        // look back to first turn and figure out what the actual turn should be
                        if (MG_GAME_GUESSWHAT.turns[0].mode == "describe") {
                            // user started with the describe screen;
                            if (MG_GAME_GUESSWHAT.turn % 2 == 0) {
                                MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].mode = "guess";
                            } else {
                                MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].mode = "describe";
                            }
                        } else {
                            if (MG_GAME_GUESSWHAT.turn % 2 == 0) {
                                MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].mode = "describe";
                            } else {
                                MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].mode = "guess";
                            }
                        }
                    }

                    if (MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].mode == "describe") {
                        // prepare and render describe turn
                        MG_GAME_GUESSWHAT.hintWaitingTemplate = "#template-waiting-for-hint";

                        $('.game_description.describe').show();

                        if (response.turn.wordstoavoid) {
                            for (media in response.turn.wordstoavoid) {
                                for (tag in response.turn.wordstoavoid[media]) {
                                    words_to_avoid.push(response.turn.wordstoavoid[media][tag]);
                                }
                            }
                            if (words_to_avoid.length)
                                $("#words_to_avoid").show();
                        }

                        if (response.turn.medias && response.turn.medias['describe'] !== undefined) {
                            licence_info = MG_GAME_GUESSWHAT.extractImageLicenceInfo(response.turn.licences, response.turn.medias['describe']);

                            // turn info == media
                            var turn_info = {
                                url: response.turn.medias['describe'].scaled,
                                url_full_size: response.turn.medias['describe'].full_size,
                                licence_info: MG_GAME_API.parseLicenceInfo(licence_info)
                            }

                            MG_GAME_GUESSWHAT.renderDescribeTurn(response, score_info, turn_info, licence_info, more_info, words_to_avoid);
                            $("#sendHintFormContainer").show();
                            $("#hintFormMessage").hide();
                        }
                    } else {
                        // prepare and render guess turn

                        var licence_info = response.turn.licences;

                        var turn_info = [];
                        if (response.turn.medias && response.turn.medias['guess'] && response.turn.medias['guess'].length) {
                            for (i_media in response.turn.medias['guess']) {
                                var media = response.turn.medias['guess'][i_media];
                                turn_info.push({
                                    media_id: media.media_id,
                                    url: media.guess,
                                    url_full_size: media.full_size,
                                    licence_info: MG_GAME_API.parseLicenceInfo(MG_GAME_GUESSWHAT.extractImageLicenceInfo(response.turn.licences, media))
                                });
                            }
                        }

                        $('.game_description.guess').show();
                        MG_GAME_GUESSWHAT.renderGuessTurn(response, score_info, turn_info, licence_info, more_info);
                        MG_GAME_GUESSWHAT.sendHintRequest();
                    }

                    MG_GAME_GUESSWHAT.doQueryMessages = true;
                    MG_GAME_GUESSWHAT.queryMessages();
                }
            }
        },

        // Are any more hints are allowed to be given?
        areHintsAllowedLeft: function () {
            var current_turn = MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1];

            var total_allowed_per_turn = MG_GAME_API.game.number_hints * 1 + MG_GAME_GUESSWHAT.game.number_guesses * 1; // 1 hint per guess + additional hints
            var used_this_turn = current_turn.hints.length;
            var guesses = current_turn.guesses.length;

            var guesses_left = MG_GAME_GUESSWHAT.game.number_guesses * 1 - current_turn.guesses.length;

            return (total_allowed_per_turn - used_this_turn >= guesses_left);
        },

        // Prepare for the next hint (including blocking further hints,
        // if the appropriate conditions have been met).
        prepareForNextHint: function () {
            if (!MG_GAME_GUESSWHAT.areHintsAllowedLeft()) {
                // Delete our hint-giving and hint-requesting buttons,
                // replacing them with informative statements as to their
                // disappearance.
                $("#requestHintContainer").html('');
                $("#template-request-hint-inactive").tmpl().appendTo($("#requestHintContainer"));
                // XXX - Why can't we just create/destroy these elements? Why
                // does showing/hiding them give different behavior?
                $("#sendHintFormContainer").hide();
                $("#hintFormMessage").html('');
                $("#template-hint-form-inactive").tmpl().appendTo($("#hintFormMessage"));
                $("#hintFormMessage").show();
            }

            // Update the score.
            MG_GAME_GUESSWHAT.updateScore();

        },

        // on callback function. hint request clicked
        onRequestHint: function () {
            MG_GAME_GUESSWHAT.sendHintRequest();
            return false;
        },

        /*
         * on callback for desciber clicks on send hint button
         */
        onSendHint: function () {
            if (MG_GAME_GUESSWHAT.busy) {
                return false;
            }

            // check if the user
            var tags = $.trim(MG_GAME_GUESSWHAT.wordField.val());
            MG_GAME_GUESSWHAT.wordField.val("");
            if (tags == "") {
                // val filtered for all white spaces (trim)
                MG_GAME_GUESSWHAT.error("<h1>Ooops</h1><p>Please enter a word</p>");
                return false;
            }

            MG_GAME_GUESSWHAT.busy = true;
            MG_GAME_API.curtain.show();

            // validate hint if it is not on stop word list
            MG_GAME_API.callGameAPI('validateHint', {'hint': tags}, function (response) {
                var current_turn = MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1];

                if (!MG_API.checkResponse(response)) {
                    return false;
                }

                // The api call returns an empty string if the first
                // tag was a stop word.
                if (response.response == "") {
                    MG_GAME_GUESSWHAT.error($("#template-error-hint-stop-word").tmpl());
                    MG_GAME_GUESSWHAT.busy = false;
                    return false;
                }

                // hint is not a stopword
                // let's look if it is a word to avoid
                hint_ok = true;
                if (current_turn.wordstoavoid) {
                    for (media in current_turn.wordstoavoid) {
                        for (tag in current_turn.wordstoavoid[media]) {
                            if (current_turn.wordstoavoid[media][tag].tag.toLowerCase() ==
                                response.response.toLowerCase()) {
                                hint_ok = false;
                                MG_GAME_GUESSWHAT.error($("#template-error-hint-word-to-avoid").tmpl());
                                MG_GAME_GUESSWHAT.busy = false;
                                break;
                            }
                        }

                        if (!hint_ok)
                            break;
                    }
                }

                // also check if the hint hasn't been given twice
                if (current_turn.hints.length) {
                    for (h_index in current_turn.hints) {
                        if (current_turn.hints[h_index].toLowerCase() ==
                            response.response.toLowerCase()) {
                            hint_ok = false;
                            MG_GAME_GUESSWHAT.error($("#template-error-hint-given-twice").tmpl());
                            MG_GAME_GUESSWHAT.busy = false;
                        }
                    }
                }

                if (hint_ok) { // hint is ok
                    MG_GAME_GUESSWHAT.sendHintToGuesser(response.response);

                    $("#partner-waiting").hide();

                    MG_GAME_API.curtain.show();

                    $("#info-modal").html("").hide();
                    $("#template-info-modal-waiting-for-guess").tmpl({
                        game_partner_name: MG_GAME_API.game.game_partner_name,
                        game_base_url: MG_GAME_API.game.game_base_url,
                        arcade_url: MG_GAME_API.game.arcade_url
                    }).appendTo($("#info-modal"));

                    $("#info-modal:hidden").fadeIn(500, function () {
                        MG_GAME_API.postMessage('waiting');
                    });
                }
            }); // end of validate hint call back

            return false;
        },

        sendHintToGuesser: function (hint) {
            var current_turn = MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1];

            MG_GAME_GUESSWHAT.hintWaitingTime = -1;
            MG_AUDIO.play("hint");

            if (hint == MG_GAME_GUESSWHAT.hintTimeOutHint) {
                $('<span>').addClass("single-hint timedout").text(hint).appendTo($("#game .describe .hints"));
            } else {
                $('<span>').addClass("single-hint").text(hint).appendTo($("#game .describe .hints"));
            }

            $("#game .describe .hints:hidden").toggle();

            // send a message to the server to let the other player know about the new link
            MG_GAME_API.postMessage({code: 'hint', 'hint': hint});

            current_turn.hints.push(hint);

            // Immediately after adding a hint to the list, we need to
            // (potentially) redraw our hint interaction information so
            // that we can hide buttons if no more hints are to be given.
            MG_GAME_GUESSWHAT.prepareForNextHint();
        },

        /*
         * callback call if the a message of the type hint has been received
         */
        processHint: function (hint) {
            var current_turn = MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1];

            $("#info-modal:visible").fadeOut(500);
            MG_GAME_API.curtain.hide();
            MG_GAME_GUESSWHAT.busy = false;
            $("#game .guess .hints").show();

            var classes = "single-hint";
            if (hint == MG_GAME_GUESSWHAT.hintTimeOutHint)
                classes += " timedout";

            $('<span>').addClass(classes).text(hint).appendTo($("#game .guess .hints").fadeIn(2500, function () {
                MG_AUDIO.play("hint");
            }));

            current_turn.hints.push(hint);

            // Update the score field on the LHS.
            MG_GAME_GUESSWHAT.updateScore();

            // Prepare for the next hint.
            MG_GAME_GUESSWHAT.prepareForNextHint();
        },

        /*
         * callback called if the turn has been submitted. for this game it will be triggerd after
         * either the hint limit has been reached and the player clicks load new turn or after the
         * guess limit has been reached.
         */
        onsubmitTurn: function () {
            if (!MG_GAME_GUESSWHAT.busy) {
                $("#partner-waiting").hide();

                MG_GAME_API.curtain.show();
                MG_GAME_GUESSWHAT.busy = true;

                // we have to filter out all TIMED OUT hints as we don't really want to tag medias with this
                var hints = [];
                $(MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].hints).each(function (index, value) {
                    if (value != MG_GAME_GUESSWHAT.hintTimeOutHint)
                        hints.push(value);
                });

                MG_API.waitForThrottleIntervalToPass(function () {
                    var tags = "";

                    if (MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].mode == 'describe')
                        tags = hints;

                    MG_API.ajaxCall('/games/play/gid/' + MG_GAME_API.settings.gid, function (response) {
                        if (MG_API.checkResponse(response)) {
                            MG_GAME_GUESSWHAT.onresponse(response);
                        }
                    }, {
                        type: 'post',
                        data: {
                            turn: MG_GAME_GUESSWHAT.turn,
                            wordstoavoid: MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].wordstoavoid,
                            played_game_id: MG_GAME_GUESSWHAT.game.played_game_id,
                            submissions: [
                                {
                                    mode: MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].mode,
                                    hints: MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].hints,
                                    guesses: MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].guesses,
                                    media_id: MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].medias.describe.media_id,
                                    tags: tags
                                }
                            ]
                        }
                    });
                });
            }
            return false;
        },

        /*
         * callback if the guessing player chooses an media
         */
        onguess: function (event) {
            var link = $(this);
            var id = link.attr('id');

            event.preventDefault();

            if (id.length > 9) {
                var guessedImageId = id.substring(id.indexOf('guess-me-') + 9);
                if (!MG_GAME_GUESSWHAT.game.played_against_computer) {

                    // inform other player about guess
                    MG_GAME_API.postMessage({code: 'guess', 'guessedImageId': guessedImageId});
                }
                MG_AUDIO.play("select");
                MG_GAME_API.curtain.show();
                $("#partner-waiting").hide();
                // waiting opponent to guess an image
                // if time passed need stop this
                setTimeout_2 = setTimeout(function () {
                    MG_GAME_GUESSWHAT.evaluateGuess(guessedImageId);
                }, 1000);
            }

            return false;
        },

        /*
         * calback once the API get request sends a response
         */
        ongameinit: function (response) {
            MG_GAME_GUESSWHAT.onresponse(response);
        },

        /*
         * helper function to extract the licence infos for the medias
         */
        extractImageLicenceInfo: function (licences, media) {
            var licence_info = [];
            if (licences.length) { // reduce the licence info only on the licences of the displayed media
                for (i_licence_turn in licences) {
                    var licence_id = licences[i_licence_turn]['id'];
                    for (i_licence_media in media.licences) { //scores
                        if (media.licences[i_licence_media] == licence_id) {
                            licence_info.push(licences[i_licence_turn]);
                        }
                    }
                }
            }
            return licence_info;
        },

        /*
         * manages the count down for the describer. The describer has got only a limited
         * amount of time. If the time runs out the system will show a time out information
         * and ask the guesser to make a guess.
         */
        hintTimeOut: function () {
            if (MG_GAME_GUESSWHAT.hintWaitingTime > 0 && MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].mode == 'describe') {
                $("#partner-waiting").html("");

                $(MG_GAME_GUESSWHAT.hintWaitingTemplate).tmpl({
                    game_partner_name: MG_GAME_API.game.game_partner_name,
                    time_out: MG_GAME_GUESSWHAT.hintWaitingTime
                }).appendTo($("#partner-waiting"));

                setTimeout_3 = setTimeout(MG_GAME_GUESSWHAT.hintTimeOut, 1000);
                MG_GAME_GUESSWHAT.hintWaitingTime--;

                $("#partner-waiting:hidden").fadeIn(500);

            } else if (MG_GAME_GUESSWHAT.hintWaitingTime == 0
                && !MG_GAME_GUESSWHAT.busy
                && MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].mode == 'describe') {
                clearTimeout(setTimeout_3);
                $("#partner-waiting").hide();

                MG_GAME_API.curtain.show();
                $("#info-modal").html('');
                $("#template-info-modal-waiting-for-guess-time-out").tmpl({
                    game_partner_name: MG_GAME_API.game.game_partner_name,
                    game_base_url: MG_GAME_API.game.game_base_url,
                    arcade_url: MG_GAME_API.game.arcade_url
                }).appendTo($("#info-modal"));
                $("#info-modal:hidden").fadeIn(250);

                MG_GAME_GUESSWHAT.busy = true;
                MG_GAME_GUESSWHAT.sendHintToGuesser(MG_GAME_GUESSWHAT.hintTimeOutHint);
            }
        },

        /*
         * evaluate the guess. either directly after guessing player has clicked guess or after
         * discriber has received the guess from the message queue
         */
        evaluateGuess: function (guessedImageID) {
            MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1].guesses.push(guessedImageID);

            $("#partner-waiting").hide();

            var current_turn = MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1];
            var secret_media = current_turn.medias.describe;

            current_turn.medias.describe.media_id

            // If we're on our last guess...
            if (current_turn.guesses.length >=
                MG_GAME_GUESSWHAT.game.number_guesses) {

                if (current_turn.mode == "describe") {
                    clearInterval(setTimeout_1);
                }
                // If we got a correct guess...
                if (secret_media.media_id == guessedImageID) {
                    MG_AUDIO.play("success");
                    MG_GAME_GUESSWHAT.onsubmitTurn();
                } else {
                    // If we failed to pick the correct media within the allowed
                    // number of guesses, we will show the correct solution in a
                    // popup.
                    MG_AUDIO.play("fail");
                    if (current_turn.mode == "describe") {
                        licence_info = MG_GAME_GUESSWHAT.extractImageLicenceInfo(current_turn.licences, secret_media);
                        var media_info = {
                            game_partner_name: MG_GAME_GUESSWHAT.game.game_partner_name
                        }

                        MG_API.popup($("#template-partner-failed-to-guess").tmpl(media_info),
                            { modal: true,
                                onComplete: function () {
                                    $('#loadNextTurn').click(function () {
                                        MG_GAME_GUESSWHAT.onsubmitTurn();
                                        $.fancybox.close();
                                    });
                                }});
                    } else {
                        licence_info = MG_GAME_GUESSWHAT.extractImageLicenceInfo(current_turn.licences, secret_media);
                        var media_info = {
                            url: secret_media.scaled,
                            url_full_size: secret_media.full_size,
                            licence_info: MG_GAME_API.parseLicenceInfo(licence_info)
                        }

                        MG_API.popup($("#template-failed-to-guess").tmpl(media_info),
                            { modal: true,
                                onComplete: function () {
                                    $('#loadNextTurn').click(function () {
                                        $.fancybox.close();
                                        MG_GAME_GUESSWHAT.onsubmitTurn();
                                    });
                                }});
                    }
                }
                return false;
            }

            // If we're on a guess PRIOR to the last guess...

            // First, update the score.
            MG_GAME_GUESSWHAT.updateScore();

            if (current_turn.mode == "describe") {
                // If the partner has found the correct media...
                if (secret_media.media_id == guessedImageID) {
                    MG_AUDIO.play("success");
                    MG_GAME_GUESSWHAT.onsubmitTurn();
                } else {
                    // If the partner has chosen an incorrect media...
                    MG_AUDIO.play("fail");
                    if (current_turn.medias &&
                        current_turn.medias['guess'] &&
                        current_turn.medias['guess'].length) {
                        for (i_media in current_turn.medias['guess']) {
                            var media = current_turn.medias['guess'][i_media];
                            if (media.media_id == guessedImageID) {
                                media_info = {
                                    media_id: media.media_id,
                                    url: media.guess,
                                    url_full_size: media.full_size,
                                    licence_info: MG_GAME_API.parseLicenceInfo(MG_GAME_GUESSWHAT.extractImageLicenceInfo(current_turn.licences, media))
                                };
                                $("#template-wrong-guess-image").tmpl(media_info).appendTo($("#wrong-guesses"));
                                $("a[rel='zoom']").fancybox({overlayColor: '#000'});
                                $("#wrong-guesses").show();
                                break;
                            }
                        }
                    }
                }

                MG_GAME_API.curtain.hide();

                if (MG_GAME_GUESSWHAT.areHintsAllowedLeft()) {
                    MG_GAME_GUESSWHAT.hintWaitingTime = MG_GAME_GUESSWHAT.game.hint_time_out;
                    MG_GAME_GUESSWHAT.hintWaitingTemplate = "#template-wrong-guess-waiting-for-hint";
                    MG_GAME_GUESSWHAT.hintTimeOut();
                    $("#sendHintFormContainer").show();
                    $("#hintFormMessage").hide();
                } else {
                    $("#partner-waiting").html("");
                    $('#template-wrong-guess-waiting-for-guess').tmpl({game_partner_name: MG_GAME_API.game.game_partner_name}).appendTo($("#partner-waiting"));
                    $("#partner-waiting").fadeIn(500);
                    $("#sendHintFormContainer").hide();
                    $("#hintFormMessage").show();
                }


            } else {
                // opponent was waiting you to guess an image
                // you made a guess so timeout stops
                clearInterval(setTimeout_2);
                // If this player has found the correct media...
                if (secret_media.media_id == guessedImageID) {
                    MG_AUDIO.play("success");
                    MG_GAME_GUESSWHAT.onsubmitTurn();
                } else {
                    // If this player has chosen an incorrect media...
                    MG_AUDIO.play("fail");
                    // Mark this media as incorrect by adding the "wrong"
                    // class to it.
                    $('#guess-me-' + guessedImageID).unbind('click').click(function () {
                        return false;
                    }).parent().addClass("wrong");

                    if (MG_GAME_GUESSWHAT.game.played_against_computer) {
                        MG_GAME_API.curtain.show();
                        setTimeout_4 = setTimeout(function () {
                            MG_GAME_API.curtain.hide();
                            MG_GAME_GUESSWHAT.sendHintRequest();
                        }, 500);
                    } else {
                        // So what happens if there are no more hints to show?
                        // At this point we should only go into 'waiting for
                        // hint' mode if there are more hints for
                        // us. Otherwise, we should just stay in guessing
                        // mode.
                        if (MG_GAME_GUESSWHAT.areHintsAllowedLeft()) {
                            MG_GAME_API.curtain.show();
                            $("#info-modal").html("");
                            $("#template-info-modal-wrong-guess-waiting-for-hint").tmpl({
                                game_partner_name: MG_GAME_API.game.game_partner_name,
                                game_base_url: MG_GAME_API.game.game_base_url,
                                arcade_url: MG_GAME_API.game.arcade_url
                            }).appendTo($("#info-modal"));
                            $("#info-modal").show();
                        } else {
                            // If there are no hints left, then we do not use the
                            // curtain. We should only make a note in the
                            // #partner-waiting box that the user needs to keep on
                            // guessing.
                            //
                            // We also need to hide the curtain!
                            MG_GAME_API.curtain.hide();

                            $("#partner-waiting").html("Please make another guess!");
                            $("#partner-waiting").show();
                        }
                    }
                }
            }
        },

        /*
         * called if the guesser clicked the hint request.
         */
        sendHintRequest: function () {
            var current_turn = MG_GAME_GUESSWHAT.turns[MG_GAME_GUESSWHAT.turn - 1];

            // If there are no more hints, we terminate.
            if (!MG_GAME_GUESSWHAT.areHintsAllowedLeft()) {
                return 0;
            }

            MG_GAME_GUESSWHAT.busy = true;

            $("#partner-waiting").hide();

            MG_GAME_API.curtain.show();

            if (MG_GAME_GUESSWHAT.game.played_against_computer) {
                // played against computer extract hint from decribing medias tags

                if (current_turn.medias.describe.available_hints === undefined) {
                    current_turn.medias.describe.available_hints = [];
                    for (var hint in current_turn.medias.describe.hints) {
                        current_turn.medias.describe.available_hints.push(current_turn.medias.describe.hints[hint]);
                    }
                }
                var secret_media = current_turn.medias.describe;
                var next_hint = "";

                if (secret_media.available_hints.length > 0) {
                    pos = MG_GAME_GUESSWHAT.getRandomInt(0, secret_media.available_hints.length - 1);
                    next_hint = secret_media.available_hints[pos].tag;
                    current_turn.medias.describe.available_hints.splice(pos, 1);
                }

                if (next_hint == "") {
                    next_hint = MG_GAME_GUESSWHAT.hintTimeOutHint;
                }

                if (next_hint != "") {
                    MG_GAME_GUESSWHAT.processHint(next_hint);
                } else {
                    MG_GAME_GUESSWHAT.onsubmitTurn();
                }
            } else {
                if (MG_GAME_GUESSWHAT.areHintsAllowedLeft()) {
                    // if you can still ask for hints
                    $("#info-modal").html("").hide();
                    $("#template-info-modal-waiting-for-hint").tmpl({
                        game_partner_name: MG_GAME_API.game.game_partner_name,
                        game_base_url: MG_GAME_API.game.game_base_url,
                        arcade_url: MG_GAME_API.game.arcade_url
                    }).appendTo($("#info-modal"));
                    $("#info-modal:hidden").fadeIn(500);
                    MG_GAME_API.postMessage('hintrequest');

                    // Prepare for the next hint.
                    MG_GAME_GUESSWHAT.prepareForNextHint();
                } else {

                    // If there are no more hints, we need to lift the curtain
                    // and prod the player to make another guess.
                    MG_GAME_API.curtain.hide();

                    $("#partner-waiting").html("Make another guess!");
                    $("#partner-waiting").show();

                    // Question: Do we need to make sure that the other player
                    // (the "hint-giver") is getting updates about the # of
                    // guesses left, etc? I'd assume that such information is
                    // getting propagated earlier, when this player (the
                    // "picker") initially chooses an media, but we might need
                    // to check.
                }
            }
        },

        /*
         * helper funciton get random hint
         */
        getRandomInt: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    });
}(jQuery);

