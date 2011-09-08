MG_GAME_ZENTAG = function ($) {
  return $.extend(MG_GAME_API, {
    wordField : null,
    
    submitButton : null,
    
    init : function (options) {
      var settings = $.extend(options, {
        ongameinit: MG_GAME_ZENTAG.ongameinit
      });
      
      MG_GAME_ZENTAG.wordField = $("#words");
      
      // submit on enter
      MG_GAME_ZENTAG.wordField.focus().keydown(function(event) {
        if(event.keyCode == 13) {
          MG_GAME_ZENTAG.onsubmit(); 
          return false;
        }
        
        $('#game_description:visible').fadeOut(3500);
      });
      
      MG_GAME_ZENTAG.submitButton = $("#button-play").click(MG_GAME_ZENTAG.onsubmit);
      
      MG_GAME_API.game_init(settings);
    },
    
    submit : function () {
      MG_API.ajaxCall('/games/play/gid/' + MG_GAME_API.settings.gid , function(response) {
        if (MG_API.checkResponse(response)) { // we have to check whether the API returned a HTTP Status 200 but still json.status == "error" response
          MG_GAME_API.game = $.extend(MG_GAME_API.game, response.game);
          MG_GAME_API.settings.ongameinit(response);
        }
      });
    },
    
    renderTurn : function (response, score_info, turn_info, licence_info, more_info) {
      $("#stage").hide();
      
      $("#scores").html(""); 
      $("#template-scores").tmpl(score_info ).appendTo($("#scores"));
      if (!MG_GAME_ZENTAG.game.user_authenticated) {
        $("#scores .total_score").remove();
      }
      
      $("#image_container").html("");
      $("#template-turn").tmpl(turn_info).appendTo($("#image_container"));
      
      $("#licences").html("");
      $("#template-licence").tmpl(licence_info).appendTo($("#licences"));
      
      $("a[rel='zoom']").fancybox({overlayColor: '#000'});
      
      $("#stage").fadeIn(1000, function () {MG_GAME_ZENTAG.busy = false;MG_GAME_ZENTAG.wordField.focus();});
    },
    
    renderFinal : function (response, score_info, turn_info, licence_info, more_info) {
      $("#stage").hide();
      
      $("#scores").html(""); 
      
      // xxx what about licence info
      $("#fieldholder").html("");
      $("#template-final-info").tmpl(score_info ).appendTo($("#fieldholder"));
      if (score_info.tags_new != "") 
        $("#template-final-tags-new").tmpl(score_info ).appendTo($("#fieldholder"));
        
      if (score_info.tags_matched != "")
        $("#template-final-tags-matched").tmpl(score_info ).appendTo($("#fieldholder"));
        
      $("#image_container").html("");
      
      if (MG_GAME_ZENTAG.game.play_once_and_move_on == 1) {
        $("#template-final-info-play-once").tmpl(score_info ).appendTo($("#fieldholder"));
        $("#template-final-summary-play-once").tmpl(turn_info).appendTo($("#image_container"));
        $("#box1").hide();
          window.setTimeout(function() {window.location = score_info.play_once_and_move_on_url;}, 10000);
      } else {
        $("#template-final-summary").tmpl(turn_info).appendTo($("#image_container"));
      }
      $("a[rel='zoom']").fancybox({overlayColor: '#000'});
      
      $(window).unbind('beforeunload');
      MG_GAME_ZENTAG.submitButton.addClass("again").unbind("click").attr("href", window.location.href);
      
      $("#stage").fadeIn(1000, function () {MG_GAME_ZENTAG.busy = false;MG_GAME_ZENTAG.wordField.focus();});
    },
    
    onresponse : function (response) {
      MG_GAME_API.curtain.hide();
      
      MG_GAME_ZENTAG.turn++;
      MG_GAME_ZENTAG.turns.push(response.turn);

      if (MG_GAME_ZENTAG.turn > MG_GAME_ZENTAG.game.turns) { // render final result
        
        MG_GAME_ZENTAG.turn
        
        var taginfo = {
          'tags_new' : {
            tags : [],
            score: 0
          },
          'tags_matched' : {
            tags : [],
            score: 0
          },
        };
        
        if (MG_GAME_ZENTAG.turns.length) {
          for (i_turn in MG_GAME_ZENTAG.turns) {
            var turn = MG_GAME_ZENTAG.turns[i_turn];
            for (i_img in turn.tags.user) {
              var image = turn.tags.user[i_img];
              for (i_tag in image) {
                var tag = image[i_tag];
                switch (tag.type) {
                  case "new":
                    taginfo.tags_new.tags.push(i_tag);
                    taginfo.tags_new.score += tag.score;
                    break;
                    
                  case "match":
                    taginfo.tags_matched.tags.push(i_tag);
                    taginfo.tags_matched.score += tag.score;
                    break;  
                }
              }
            }
          }
        }
        
        //score box
        var score_info = {
          user_name : MG_GAME_ZENTAG.game.user_name,
          user_score : MG_GAME_ZENTAG.game.user_score,
          current_score : response.turn.score,
          user_num_played : MG_GAME_ZENTAG.game.user_num_played,
          turns : MG_GAME_ZENTAG.game.turns,
          current_turn : MG_GAME_ZENTAG.turn,
          tags_new : taginfo.tags_new.tags.join(", "),
          tags_new_score : taginfo.tags_new.score,
          tags_matched : taginfo.tags_matched.tags.join(", "),
          tags_matched_score : taginfo.tags_matched.score,
        };
        
        var licence_info = {}; //xxx here should come the global info about all licences 
        
        var more_info = {}; //xxx add more_info parsing here
        
        if (MG_GAME_ZENTAG.game.play_once_and_move_on == 1) {
          if (MG_GAME_ZENTAG.game.play_once_and_move_on_url == "")
            MG_GAME_ZENTAG.game.play_once_and_move_on_url = "/";
          
          score_info.play_once_and_move_on_url = MG_GAME_ZENTAG.game.play_once_and_move_on_url;
          
          // turn info == image 
          var turn_info = {
            url : MG_GAME_ZENTAG.turns[0].images[0].scaled,
            url_full_size : MG_GAME_ZENTAG.turns[0].images[0].full_size,
            licence_info : 'xxx add some licence info',
          };
        } else {
          // turn info == image 
          var turn_info = {
            url_1 : MG_GAME_ZENTAG.turns[0].images[0].final_screen,
            url_full_size_1 : MG_GAME_ZENTAG.turns[0].images[0].full_size,
            licence_info_1 : MG_GAME_API.parseLicenceInfo(MG_GAME_ZENTAG.turns[0].licences),
            url_2 : MG_GAME_ZENTAG.turns[1].images[0].final_screen,
            url_full_size_2 : MG_GAME_ZENTAG.turns[1].images[0].full_size,
            licence_info_2 : MG_GAME_API.parseLicenceInfo(MG_GAME_ZENTAG.turns[1].licences),
            url_3 : MG_GAME_ZENTAG.turns[2].images[0].final_screen,
            url_full_size_3 : MG_GAME_ZENTAG.turns[2].images[0].full_size,
            licence_info_3 : MG_GAME_API.parseLicenceInfo(MG_GAME_ZENTAG.turns[2].licences),
            url_4 : MG_GAME_ZENTAG.turns[3].images[0].final_screen,
            url_full_size_4 : MG_GAME_ZENTAG.turns[3].images[0].full_size,
            licence_info_4 : MG_GAME_API.parseLicenceInfo(MG_GAME_ZENTAG.turns[3].licences)
          }
        }
        
        MG_GAME_API.renderFinal(response, score_info, turn_info, licence_info, more_info);
         
      } else {
        
        //score box
        var score_info = {
          user_name : MG_GAME_ZENTAG.game.user_name,
          user_score : MG_GAME_ZENTAG.game.user_score,
          current_score : response.turn.score,
          user_num_played : MG_GAME_ZENTAG.game.user_num_played,
          turns : MG_GAME_ZENTAG.game.turns,
          current_turn : MG_GAME_ZENTAG.turn
        };
        
        var licence_info = response.turn.licences; //xxx add licence parsing here
        
        var more_info = {}; //xxx add more_info parsing here
        
        // turn info == image 
        var turn_info = {
          url : response.turn.images[0].scaled,
          url_full_size : response.turn.images[0].full_size,
          licence_info : MG_GAME_API.parseLicenceInfo(licence_info)
        }
        
        MG_GAME_API.renderTurn(response, score_info, turn_info, licence_info, more_info); 
      }
    },
    
    onsubmit : function () {
      if (!MG_GAME_ZENTAG.busy) {
        var tags = MG_GAME_ZENTAG.wordField.val().replace(/^\s+|\s+$/g,"");
        if (tags == "") {
          // val filtered for all white spaces (trim)
          MG_GAME_ZENTAG.error("<h1>Ooops</h1><p>Please enter at least one word</p>");
        } else {
          MG_GAME_API.curtain.show();
          MG_GAME_ZENTAG.busy = true;
          
          MG_API.ajaxCall('/games/play/gid/' + MG_GAME_API.settings.gid , function(response) {
            if (MG_API.checkResponse(response)) {
              MG_GAME_ZENTAG.wordField.val("");
              MG_GAME_ZENTAG.onresponse(response);
            }
          }, {
            type:'post',
            data: {
              turn:MG_GAME_ZENTAG.turn,
              played_game_id:MG_GAME_ZENTAG.game.played_game_id,
              'submissions': [{
                image_id : MG_GAME_ZENTAG.turns[MG_GAME_ZENTAG.turn-1].images[0].image_id,
                tags: tags
              }]
            }
          });
        }
      }
      return false;
    },
    
    ongameinit : function (response) {
      MG_GAME_ZENTAG.onresponse(response);
    },
  });
}(jQuery);

