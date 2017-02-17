//where all the page connections happen and back-end javascript
var mysql = require("mysql");
var fs = require("fs");
var TBA = require('thebluealliance');
var tba = new TBA('FRCScout2017','Software for scouting for 2017 season','1.1.1');

function REST_ROUTER(router, connection)
{
    var self = this;
    self.handleRoutes(router, connection);
}

REST_ROUTER.prototype.handleRoutes = function(router, connection)
{

  var most_recent = 0;
  var query_bool = 0;
  var query_res = "";

  // index page
  router.get('/', function(req, res) {       //PAGE RENDER
    var team_list = "";
    var score_list = "";
    var get_teams = "SELECT * FROM teams";
    //TEAM QUERY
    connection.query(get_teams, function(err,rows,fields) {
      for(var x in rows)
      {
        team_list += "<tr class='clickable-row' data-href='/team/"+ rows[x].team_num +"'><td>"+ rows[x].team_num +"</td><td>"+ rows[x].team_name +"</td></tr>";
      }
    });
    //CONTRIB SCORE QUERY
    var get_contrib_score_rank = "SELECT * FROM teams ORDER BY avg_contrib_kpa DESC, team_num ASC";
    connection.query(get_contrib_score_rank, function(err, rows, fields) {
      for(var x in rows)
      {
        score_list += "<tr title='"+ rows[x].team_name +"' class='clickable-row' data-href='/team/"+ rows[x].team_num +"'><td>"+ rows[x].team_num +"</td><td>"+ rows[x].avg_contrib_kpa +"</td></tr>";
      }
      res.render('pages/index', {
        team_list: team_list,
        score_list: score_list
      });
    });
  });

  router.get("/sql", function(req, res) {
    var message = "";
    if(query_bool == -1)
      message = "<div class=\"alert alert-danger\" role=\"alert\"><p><b>Oh snap</b>, looks like there's a mistake in your query. Data not queried.</p></div>";
    else if(query_bool != -1 && query_bool != 0)
      message = "<div class=\"alert alert-success\" role=\"alert\"><p>Data has been <b>successfully</b> queried.</p></div>";
    res.render("pages/sql", {
      message: message,
      result: query_res
    });
    if(query_bool == 1)
    {
      query_res = "";
      query_bool = 0;
    }
  });
  router.post("/query", function(req, res) {
    var sql = req.body.query;
    query_res = "";
    connection.query(sql, function(err, rows, fields) {
      if(err)
      {
        console.log(err);
        query_bool = -1;
      }
      else
      {
        query_bool = 1;
        query_res += "<tr>";
        for(var p in rows[0])
        {
          query_res += "<th>" + p + "</th>";
        }
        for(var i in rows)
        {
          query_res += "</tr><tr>";
          for(var p in rows[i])
          {
            query_res += "<td>" + rows[i][p] + "</td>";
          }
          query_res += "</tr>";
        }
      }
      res.redirect("/sql");
    });
  });
  router.get("/export", function(req, res) {
    var teams_sql = "SELECT * FROM teams";
    var filename = "teams.csv";
    var data = "";
    connection.query(teams_sql, function(err, rows, fields) {
      for(var p in rows[0])
      {
        data += p + ", ";
      }
      data = data.slice(0, data.length - 2); // Remove the extra comma
      data += "\n";
      for(var i in rows)
      {
        for(var p in rows[i])
        {
          data += rows[i][p] + ", ";
        }
        data = data.slice(0, data.length - 2); // Remove the extra comma
        data += "\n";
      }
      fs.writeFile(filename, data, function(err) {
        console.log(err ? err : "File saved to " + __dirname);
        res.download(__dirname + "/teams.csv");
      });
    });
  });

  router.get("/video/:match_number", function(req, res) {
    var match_number = req.params.match_number - 1;


  });

  router.get("/ppt", function(req, res) {
    var ppt_template = require("ppt-template");
    var Presentation = ppt_template.Presentation;

    var myPres = new Presentation();
    myPres.loadFile("C:/Users/Adam/Desktop/in.pptx")
    .then(() => {
      // console.log("Filed loaded");
      // console.log(myPres.getSlideCount());
      var slide1 = myPres.getSlide(1); // Index starts at 1 for some reason
      // console.log("cloned slide");
      slide1.fill([{
        key: "dd",
        value: "Not dd anymore!"
      }]);
      // console.log("returning now");
      var slides = [slide1];
      return myPres.generate(slides);
    }).then((newPres) => {
      // console.log("generated successfully");
      // console.log(newPres);
      newPres.saveAs("C:/Users/Adam/Desktop/out.pptx");
    });
  });

  router.get("/event", function(req, res) {
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var date_str = "2017-" + month + "-" + day;
    var events = "";
    tba.getEventList(function(err, list_of_teams) {
      for(var x in list_of_teams) {
        var event_date = list_of_teams[x].start_date.split("-");
        if((Number(event_date[1]) > Number(month)) || (Number(event_date[1]) == Number(month) && Number(event_date[2]) > Number(day))) {
          events += "<option>" + list_of_teams[x].event_code + "-" + list_of_teams[x].name + "</option>\n";
        }
      }

      res.render("pages/event", {
        events: events
      });
    });
  });

  router.post("/parse-event", function(req, res) {
    var event_code = req.body.event.split("-")[0];
    var teams = [];
    tba.getEventTeams(event_code, 2017, function(err, team_list) {
      var drop_teams_sql = "TRUNCATE teams;"
      connection.query(drop_teams_sql, function(err) {
        if(err) {
          console.log(err);
        }
        var drop_matches_sql = "TRUNCATE matches;"
        connection.query(drop_matches_sql, function(err) {
          if(err) {
            console.log(err);
          }

          for(var x in team_list) {
            var team_sql = "INSERT INTO teams (team_num, team_name) VALUES (" + team_list[x].team_number + ", \"" + team_list[x].nickname + "\")";
            connection.query(team_sql, function(err) {
              if(err)
              console.log(err);
            });
          }
          res.redirect("/");
        });
      });
    });
  });


  router.get("/alliance-gen", function(req, res) {
    res.render("pages/alliance_gen");
  });

  router.post("/alliance-gen", function(req, res) {
    var team_1 = req.body.team_1;
    var team_2 = req.body.team_2;
    var team_3 = req.body.team_3;
    var team_4 = req.body.team_4;
    var team_5 = req.body.team_5;
    var team_6 = req.body.team_6;
    // console.log(team_4 != "");
    // console.log(team_4 != "");
    // console.log(typeof team_6);
    if(team_4 == "")
      res.redirect("/alliance/" + team_1 + "," + team_2 + "," + team_3 + ",0,0,0");
    else if(team_5 == "")
      res.redirect("/alliance/" + team_1 + "," + team_2 + "," + team_3 + "," + team_4 + ",0,0");
    else if(team_6 == "")
      res.redirect("/alliance/" + team_1 + "," + team_2 + "," + team_3 + "," + team_4 + "," + team_5 + ",0");
    else
      res.redirect("/alliance/" + team_1 + "," + team_2 + "," + team_3 + "," + team_4 + "," + team_5 + "," + team_6);
  });

	router.get('/alliance/:team_1,:team_2,:team_3,:team_4,:team_5,:team_6', function(req, res) {
		// console.log(req.params.team_1);
		// console.log(req.params.team_2);
		// console.log(req.params.team_3);

		var team_num_1 = !Number.isNaN(req.params.team_1) ? Number(req.params.team_1) : 0;
    var team_name_1 = "";
    var next_team_num_1 = 0;
    var previous_team_num_1 = 0;
    var avg_auto_gears_scored_1 = 0;
    var avg_auto_gears_attempts_1 = 0;
    var avg_auto_high_made_1 = 0;
    var avg_auto_high_attempts_1 = 0;
    var avg_auto_low_made_1 = 0;
    var avg_auto_low_attempts_1 = 0;
    var tot_baseline_cross_1 = 0;
    var avg_auto_hopper_intake_1 = 0;
    var avg_auto_floor_gear_intake_1 = 0;
    var avg_auto_floor_ball_intake_1 = 0;
    var avg_auto_contrib_kpa_1 = 0;

    var avg_num_cycles_1 = 0;
    var avg_cycle_time_1 = 0;
    var avg_tele_high_made_1 = 0;
    var avg_tele_high_attempts_1 = 0;
    var avg_tele_low_made_1 = 0;
    var avg_tele_low_attempts_1 = 0;
    var avg_tele_gears_scored_1 = 0;
    var avg_tele_gears_attempts_1 = 0;
    var avg_tele_gears_dropped_1 = 0;
    var avg_tele_gear_knockouts_1 = 0;
    var avg_tele_floor_ball_intake_1 = 0;
    var avg_tele_floor_gear_intake_1 = 0;
    var avg_tele_hopper_intake_1 = 0;
    var avg_hp_ball_intake_1 = 0;
    var avg_hp_gear_intake_1 = 0;
    var tot_climb_1 = 0;
    var tot_climb_attempts_1 = 0;
    var tot_fouls_1 = 0;
    var tot_deads_1 = 0;
    var avg_contrib_kpa_1 = 0;
    var no_autos_1 = 0;

		var team_num_2 = !Number.isNaN(req.params.team_2) ? Number(req.params.team_2) : 0;
    var team_name_2 = "";
    var next_team_num_2 = 0;
    var previous_team_num_2 = 0;
    var avg_auto_gears_scored_2 = 0;
    var avg_auto_gears_attempts_2 = 0;
    var avg_auto_high_made_2 = 0;
    var avg_auto_high_attempts_2 = 0;
    var avg_auto_low_made_2 = 0;
    var avg_auto_low_attempts_2 = 0;
    var tot_baseline_cross_2 = 0;
    var avg_auto_hopper_intake_2 = 0;
    var avg_auto_floor_gear_intake_2 = 0;
    var avg_auto_floor_ball_intake_2 = 0;
    var avg_auto_contrib_kpa_2 = 0;

    var avg_num_cycles_2 = 0;
    var avg_cycle_time_2 = 0;
    var avg_tele_high_made_2 = 0;
    var avg_tele_high_attempts_2 = 0;
    var avg_tele_low_made_2 = 0;
    var avg_tele_low_attempts_2 = 0;
    var avg_tele_gears_scored_2 = 0;
    var avg_tele_gears_attempts_2 = 0;
    var avg_tele_gears_dropped_2 = 0;
    var avg_tele_gear_knockouts_2 = 0;
    var avg_tele_floor_ball_intake_2 = 0;
    var avg_tele_floor_gear_intake_2 = 0;
    var avg_tele_hopper_intake_2 = 0;
    var avg_hp_ball_intake_2 = 0;
    var avg_hp_gear_intake_2 = 0;
    var tot_climb_2 = 0;
    var tot_climb_attempts_2 = 0;
    var tot_fouls_2 = 0;
    var tot_deads_2 = 0;
    var avg_contrib_kpa_2 = 0;
    var no_autos_2 = 0;

		var team_num_3 = !Number.isNaN(req.params.team_3) ? Number(req.params.team_3) : 0;
    var team_name_3 = "";
    var next_team_num_3 = 0;
    var previous_team_num_3 = 0;
    var avg_auto_gears_scored_3 = 0;
    var avg_auto_gears_attempts_3 = 0;
    var avg_auto_high_made_3 = 0;
    var avg_auto_high_attempts_3 = 0;
    var avg_auto_low_made_3 = 0;
    var avg_auto_low_attempts_3 = 0;
    var tot_baseline_cross_3 = 0;
    var avg_auto_hopper_intake_3 = 0;
    var avg_auto_floor_gear_intake_3 = 0;
    var avg_auto_floor_ball_intake_3 = 0;
    var avg_auto_contrib_kpa_3 = 0;

    var avg_num_cycles_3 = 0;
    var avg_cycle_time_3 = 0;
    var avg_tele_high_made_3 = 0;
    var avg_tele_high_attempts_3 = 0;
    var avg_tele_low_made_3 = 0;
    var avg_tele_low_attempts_3 = 0;
    var avg_tele_gears_scored_3 = 0;
    var avg_tele_gears_attempts_3 = 0;
    var avg_tele_gears_dropped_3 = 0;
    var avg_tele_gear_knockouts_3 = 0;
    var avg_tele_floor_ball_intake_3 = 0;
    var avg_tele_floor_gear_intake_3 = 0;
    var avg_tele_hopper_intake_3 = 0;
    var avg_hp_ball_intake_3 = 0;
    var avg_hp_gear_intake_3 = 0;
    var tot_climb_3 = 0;
    var tot_climb_attempts_3 = 0;
    var tot_fouls_3 = 0;
    var tot_deads_3 = 0;
    var avg_contrib_kpa_3 = 0;
    var no_autos_3 = 0;

    var team_num_4 = !Number.isNaN(req.params.team_4) ? Number(req.params.team_4) : undefined;
    var team_name_4 = "";
    var next_team_num_4 = 0;
    var previous_team_num_4 = 0;
    var avg_auto_gears_scored_4 = 0;
    var avg_auto_gears_attempts_4 = 0;
    var avg_auto_high_made_4 = 0;
    var avg_auto_high_attempts_4 = 0;
    var avg_auto_low_made_4 = 0;
    var avg_auto_low_attempts_4 = 0;
    var tot_baseline_cross_4 = 0;
    var avg_auto_hopper_intake_4 = 0;
    var avg_auto_floor_gear_intake_4 = 0;
    var avg_auto_floor_ball_intake_4 = 0;
    var avg_auto_contrib_kpa_4 = 0;

    var avg_num_cycles_4 = 0;
    var avg_cycle_time_4 = 0;
    var avg_tele_high_made_4 = 0;
    var avg_tele_high_attempts_4 = 0;
    var avg_tele_low_made_4 = 0;
    var avg_tele_low_attempts_4 = 0;
    var avg_tele_gears_scored_4 = 0;
    var avg_tele_gears_attempts_4 = 0;
    var avg_tele_gears_dropped_4 = 0;
    var avg_tele_gear_knockouts_4 = 0;
    var avg_tele_floor_ball_intake_4 = 0;
    var avg_tele_floor_gear_intake_4 = 0;
    var avg_tele_hopper_intake_4 = 0;
    var avg_hp_ball_intake_4 = 0;
    var avg_hp_gear_intake_4 = 0;
    var tot_climb_4 = 0;
    var tot_climb_attempts_4 = 0;
    var tot_fouls_4 = 0;
    var tot_deads_4 = 0;
    var avg_contrib_kpa_4 = 0;
    var no_autos_4 = 0;

		var team_num_5 = !Number.isNaN(req.params.team_5) ? Number(req.params.team_5) : undefined;
    var team_name_5 = "";
    var next_team_num_5 = 0;
    var previous_team_num_5 = 0;
    var avg_auto_gears_scored_5 = 0;
    var avg_auto_gears_attempts_5 = 0;
    var avg_auto_high_made_5 = 0;
    var avg_auto_high_attempts_5 = 0;
    var avg_auto_low_made_5 = 0;
    var avg_auto_low_attempts_5 = 0;
    var tot_baseline_cross_5 = 0;
    var avg_auto_hopper_intake_5 = 0;
    var avg_auto_floor_gear_intake_5 = 0;
    var avg_auto_floor_ball_intake_5 = 0;
    var avg_auto_contrib_kpa_5 = 0;

    var avg_num_cycles_5 = 0;
    var avg_cycle_time_5 = 0;
    var avg_tele_high_made_5 = 0;
    var avg_tele_high_attempts_5 = 0;
    var avg_tele_low_made_5 = 0;
    var avg_tele_low_attempts_5 = 0;
    var avg_tele_gears_scored_5 = 0;
    var avg_tele_gears_attempts_5 = 0;
    var avg_tele_gears_dropped_5 = 0;
    var avg_tele_gear_knockouts_5 = 0;
    var avg_tele_floor_ball_intake_5 = 0;
    var avg_tele_floor_gear_intake_5 = 0;
    var avg_tele_hopper_intake_5 = 0;
    var avg_hp_ball_intake_5 = 0;
    var avg_hp_gear_intake_5 = 0;
    var tot_climb_5 = 0;
    var tot_climb_attempts_5 = 0;
    var tot_fouls_5 = 0;
    var tot_deads_5 = 0;
    var avg_contrib_kpa_5 = 0;
    var no_autos_5 = 0;

		var team_num_6 = !Number.isNaN(req.params.team_6) ? Number(req.params.team_6) : undefined;
    var team_name_6 = "";
    var next_team_num_6 = 0;
    var previous_team_num_6 = 0;
    var avg_auto_gears_scored_6 = 0;
    var avg_auto_gears_attempts_6 = 0;
    var avg_auto_high_made_6 = 0;
    var avg_auto_high_attempts_6 = 0;
    var avg_auto_low_made_6 = 0;
    var avg_auto_low_attempts_6 = 0;
    var tot_baseline_cross_6 = 0;
    var avg_auto_hopper_intake_6 = 0;
    var avg_auto_floor_gear_intake_6 = 0;
    var avg_auto_floor_ball_intake_6 = 0;
    var avg_auto_contrib_kpa_6 = 0;

    var avg_num_cycles_6 = 0;
    var avg_cycle_time_6 = 0;
    var avg_tele_high_made_6 = 0;
    var avg_tele_high_attempts_6 = 0;
    var avg_tele_low_made_6 = 0;
    var avg_tele_low_attempts_6 = 0;
    var avg_tele_gears_scored_6 = 0;
    var avg_tele_gears_attempts_6 = 0;
    var avg_tele_gears_dropped_6 = 0;
    var avg_tele_gear_knockouts_6 = 0;
    var avg_tele_floor_ball_intake_6 = 0;
    var avg_tele_floor_gear_intake_6 = 0;
    var avg_tele_hopper_intake_6 = 0;
    var avg_hp_ball_intake_6 = 0;
    var avg_hp_gear_intake_6 = 0;
    var tot_climb_6 = 0;
    var tot_climb_attempts_6 = 0;
    var tot_fouls_6 = 0;
    var tot_deads_6 = 0;
    var avg_contrib_kpa_6 = 0;
    var no_autos_6 = 0;


		if(team_num_1 != 0 && team_num_2 != 0 && team_num_3 != 0)
		{
      // updateContribScores(team_num_1);
			// updateContribScores(team_num_2);
			// updateContribScores(team_num_3);
      updateTeams(team_num_1);
			updateTeams(team_num_2);
			updateTeams(team_num_3);

		//if(!isNaN(team_num_1))
		//{
			var get_data_1 = "SELECT * FROM teams WHERE team_num='"+ team_num_1 +"'";

			connection.query(get_data_1, function(err, rows, fields) {
        // console.log(rows[0] != undefined);
        team_name_1 = rows[0].team_name;
        avg_auto_gears_scored_1 = rows[0].avg_auto_gears_scored;
        avg_auto_gears_attempts_1 = rows[0].avg_auto_gears_attempts;
        avg_auto_high_made_1 = rows[0].avg_auto_high_made;
        avg_auto_high_attempts_1 = rows[0].avg_auto_high_attempts;
        avg_auto_low_made_1 = rows[0].avg_auto_low_made;
        avg_auto_low_attempts_1 = rows[0].avg_auto_low_attempts;
        tot_baseline_cross_1 = rows[0].tot_baseline_cross;
        avg_auto_hopper_intake_1 = rows[0].avg_auto_hopper_intake;
        avg_auto_floor_gear_intake_1 = rows[0].avg_auto_floor_gear_intake;
        avg_auto_floor_ball_intake_1 = rows[0].avg_auto_floor_ball_intake;
        avg_auto_contrib_kpa_1 = rows[0].avg_auto_contrib_kpa;

        avg_num_cycles_1 = rows[0].avg_num_cycles;
        avg_cycle_time_1 = rows[0].avg_cycle_time;
        avg_tele_high_made_1 = rows[0].avg_tele_high_made;
        avg_tele_high_attempts_1 = rows[0].avg_tele_high_attempts;
        avg_tele_low_made_1 = rows[0].avg_tele_low_made;
        avg_tele_low_attempts_1 = rows[0].avg_tele_low_attempts;
        avg_tele_gears_scored_1 = rows[0].avg_tele_gears_scored;
        avg_tele_gears_attempts_1 = rows[0].avg_tele_gears_attempts;
        avg_tele_gears_dropped_1 = rows[0].avg_tele_gears_dropped;
        avg_tele_gear_knockouts_1 = rows[0].avg_tele_gear_knockouts;
        avg_tele_floor_ball_intake_1 = rows[0].avg_tele_floor_ball_intake;
        avg_tele_floor_gear_intake_1 = rows[0].avg_tele_floor_gear_intake;
        avg_tele_hopper_intake_1 = rows[0].avg_tele_hopper_intake;
        avg_hp_ball_intake_1 = rows[0].avg_hp_ball_intake;
        avg_hp_gear_intake_1 = rows[0].avg_hp_gear_intake;
        tot_climb_1 = rows[0].tot_climb;
        tot_climb_attempts_1 = rows[0].tot_climb_attempts;
        tot_fouls_1 = rows[0].tot_fouls;
        tot_deads_1 = rows[0].tot_deads;
        avg_contrib_kpa_1 = rows[0].avg_contrib_kpa;
			});

      var no_auto_sql_1 = "SELECT * FROM matches WHERE team_num='"+ team_num_1 +"'";
      connection.query(no_auto_sql_1, function(err, rows, fields) {
        for(var x in rows)
        {
          if(rows[x].auto_contrib_kpa == 0 && rows[x].auto_gears_scored == 0 && rows[x].baseline_cross == 0)
          {
            no_autos_1++;
          }
        }
			});
		//}

		//if(!isNaN(team_num_2))
		//{
			var get_data_2 = "SELECT * FROM teams WHERE team_num='"+ team_num_2 +"'";

			connection.query(get_data_2, function(err, rows, fields) {
        // console.log(rows[0] != undefined);
				if(rows[0] != undefined)
				{
          team_name_2 = rows[0].team_name;
          avg_auto_gears_scored_2 = rows[0].avg_auto_gears_scored;
          avg_auto_gears_attempts_2 = rows[0].avg_auto_gears_attempts;
          avg_auto_high_made_2 = rows[0].avg_auto_high_made;
          avg_auto_high_attempts_2 = rows[0].avg_auto_high_attempts;
          avg_auto_low_made_2 = rows[0].avg_auto_low_made;
          avg_auto_low_attempts_2 = rows[0].avg_auto_low_attempts;
          tot_baseline_cross_2 = rows[0].tot_baseline_cross;
          avg_auto_hopper_intake_2 = rows[0].avg_auto_hopper_intake;
          avg_auto_floor_gear_intake_2 = rows[0].avg_auto_floor_gear_intake;
          avg_auto_floor_ball_intake_2 = rows[0].avg_auto_floor_ball_intake;
          avg_auto_contrib_kpa_2 = rows[0].avg_auto_contrib_kpa;

          avg_num_cycles_2 = rows[0].avg_num_cycles;
          avg_cycle_time_2 = rows[0].avg_cycle_time;
          avg_tele_high_made_2 = rows[0].avg_tele_high_made;
          avg_tele_high_attempts_2 = rows[0].avg_tele_high_attempts;
          avg_tele_low_made_2 = rows[0].avg_tele_low_made;
          avg_tele_low_attempts_2 = rows[0].avg_tele_low_attempts;
          avg_tele_gears_scored_2 = rows[0].avg_tele_gears_scored;
          avg_tele_gears_attempts_2 = rows[0].avg_tele_gears_attempts;
          avg_tele_gears_dropped_2 = rows[0].avg_tele_gears_dropped;
          avg_tele_gear_knockouts_2 = rows[0].avg_tele_gear_knockouts;
          avg_tele_floor_ball_intake_2 = rows[0].avg_tele_floor_ball_intake;
          avg_tele_floor_gear_intake_2 = rows[0].avg_tele_floor_gear_intake;
          avg_tele_hopper_intake_2 = rows[0].avg_tele_hopper_intake;
          avg_hp_ball_intake_2 = rows[0].avg_hp_ball_intake;
          avg_hp_gear_intake_2 = rows[0].avg_hp_gear_intake;
          tot_climb_2 = rows[0].tot_climb;
          tot_climb_attempts_2 = rows[0].tot_climb_attempts;
          tot_fouls_2 = rows[0].tot_fouls;
          tot_deads_2 = rows[0].tot_deads;
          avg_contrib_kpa_2 = rows[0].avg_contrib_kpa;
				}
			});

      var no_auto_sql_2 = "SELECT * FROM matches WHERE team_num='"+ team_num_2 +"'";
      connection.query(no_auto_sql_2, function(err, rows, fields) {
        for(var x in rows)
        {
          if(rows[x].auto_contrib_kpa == 0 && rows[x].auto_gears_scored == 0 && rows[x].baseline_cross == 0)
          {
            no_autos_2++;
          }
        }
			});
		//}

		//if(!isNaN(team_num_3))
		//{
			var get_data_3 = "SELECT * FROM teams WHERE team_num='"+ team_num_3 +"'";

			connection.query(get_data_3, function(err, rows, fields) {
        // console.log(rows[0] != undefined);
				if(rows[0] != undefined)
				{
          team_name_3 = rows[0].team_name;
          avg_auto_gears_scored_3 = rows[0].avg_auto_gears_scored;
          avg_auto_gears_attempts_3 = rows[0].avg_auto_gears_attempts;
          avg_auto_high_made_3 = rows[0].avg_auto_high_made;
          avg_auto_high_attempts_3 = rows[0].avg_auto_high_attempts;
          avg_auto_low_made_3 = rows[0].avg_auto_low_made;
          avg_auto_low_attempts_3 = rows[0].avg_auto_low_attempts;
          tot_baseline_cross_3 = rows[0].tot_baseline_cross;
          avg_auto_hopper_intake_3 = rows[0].avg_auto_hopper_intake;
          avg_auto_floor_gear_intake_3 = rows[0].avg_auto_floor_gear_intake;
          avg_auto_floor_ball_intake_3 = rows[0].avg_auto_floor_ball_intake;
          avg_auto_contrib_kpa_3 = rows[0].avg_auto_contrib_kpa;

          avg_num_cycles_3 = rows[0].avg_num_cycles;
          avg_cycle_time_3 = rows[0].avg_cycle_time;
          avg_tele_high_made_3 = rows[0].avg_tele_high_made;
          avg_tele_high_attempts_3 = rows[0].avg_tele_high_attempts;
          avg_tele_low_made_3 = rows[0].avg_tele_low_made;
          avg_tele_low_attempts_3 = rows[0].avg_tele_low_attempts;
          avg_tele_gears_scored_3 = rows[0].avg_tele_gears_scored;
          avg_tele_gears_attempts_3 = rows[0].avg_tele_gears_attempts;
          avg_tele_gears_dropped_3 = rows[0].avg_tele_gears_dropped;
          avg_tele_gear_knockouts_3 = rows[0].avg_tele_gear_knockouts;
          avg_tele_floor_ball_intake_3 = rows[0].avg_tele_floor_ball_intake;
          avg_tele_floor_gear_intake_3 = rows[0].avg_tele_floor_gear_intake;
          avg_tele_hopper_intake_3 = rows[0].avg_tele_hopper_intake;
          avg_hp_ball_intake_3 = rows[0].avg_hp_ball_intake;
          avg_hp_gear_intake_3 = rows[0].avg_hp_gear_intake;
          tot_climb_3 = rows[0].tot_climb;
          tot_climb_attempts_3 = rows[0].tot_climb_attempts;
          tot_fouls_3 = rows[0].tot_fouls;
          tot_deads_3 = rows[0].tot_deads;
          avg_contrib_kpa_3 = rows[0].avg_contrib_kpa;
				}

        var no_auto_sql_3 = "SELECT * FROM matches WHERE team_num='"+ team_num_3 +"'";
        connection.query(no_auto_sql_3, function(err, rows, fields) {
          for(var x in rows)
          {
            if(rows[x].auto_contrib_kpa == 0 && rows[x].auto_gears_scored == 0 && rows[x].baseline_cross == 0)
            {
              no_autos_3++;
            }
          }
        });
      });
    }

      if(team_num_4 != 0) {
        updateTeams(team_num_4);

        var get_data_4 = "SELECT * FROM teams WHERE team_num='"+ team_num_4 +"'";

  			connection.query(get_data_4, function(err, rows, fields) {
          // console.log(rows[0] != undefined);
          team_name_4 = rows[0].team_name;
          avg_auto_gears_scored_4 = rows[0].avg_auto_gears_scored;
          avg_auto_gears_attempts_4 = rows[0].avg_auto_gears_attempts;
          avg_auto_high_made_4 = rows[0].avg_auto_high_made;
          avg_auto_high_attempts_4 = rows[0].avg_auto_high_attempts;
          avg_auto_low_made_4 = rows[0].avg_auto_low_made;
          avg_auto_low_attempts_4 = rows[0].avg_auto_low_attempts;
          tot_baseline_cross_4 = rows[0].tot_baseline_cross;
          avg_auto_hopper_intake_4 = rows[0].avg_auto_hopper_intake;
          avg_auto_floor_gear_intake_4 = rows[0].avg_auto_floor_gear_intake;
          avg_auto_floor_ball_intake_4 = rows[0].avg_auto_floor_ball_intake;
          avg_auto_contrib_kpa_4 = rows[0].avg_auto_contrib_kpa;

          avg_num_cycles_4 = rows[0].avg_num_cycles;
          avg_cycle_time_4 = rows[0].avg_cycle_time;
          avg_tele_high_made_4 = rows[0].avg_tele_high_made;
          avg_tele_high_attempts_4 = rows[0].avg_tele_high_attempts;
          avg_tele_low_made_4 = rows[0].avg_tele_low_made;
          avg_tele_low_attempts_4 = rows[0].avg_tele_low_attempts;
          avg_tele_gears_scored_4 = rows[0].avg_tele_gears_scored;
          avg_tele_gears_attempts_4 = rows[0].avg_tele_gears_attempts;
          avg_tele_gears_dropped_4 = rows[0].avg_tele_gears_dropped;
          avg_tele_gear_knockouts_4 = rows[0].avg_tele_gear_knockouts;
          avg_tele_floor_ball_intake_4 = rows[0].avg_tele_floor_ball_intake;
          avg_tele_floor_gear_intake_4 = rows[0].avg_tele_floor_gear_intake;
          avg_tele_hopper_intake_4 = rows[0].avg_tele_hopper_intake;
          avg_hp_ball_intake_4 = rows[0].avg_hp_ball_intake;
          avg_hp_gear_intake_4 = rows[0].avg_hp_gear_intake;
          tot_climb_4 = rows[0].tot_climb;
          tot_climb_attempts_4 = rows[0].tot_climb_attempts;
          tot_fouls_4 = rows[0].tot_fouls;
          tot_deads_4 = rows[0].tot_deads;
          avg_contrib_kpa_4 = rows[0].avg_contrib_kpa;
  			});

        var no_auto_sql_4 = "SELECT * FROM matches WHERE team_num='"+ team_num_4 +"'";
        connection.query(no_auto_sql_4, function(err, rows, fields) {
          for(var x in rows)
          {
            if(rows[x].auto_contrib_kpa == 0 && rows[x].auto_gears_scored == 0 && rows[x].baseline_cross == 0)
            {
              no_autos_4++;
            }
          }
  			});
      }
      if(team_num_5 != 0) {
        updateTeams(team_num_5);

        var get_data_5 = "SELECT * FROM teams WHERE team_num='"+ team_num_5 +"'";

  			connection.query(get_data_5, function(err, rows, fields) {
          // console.log(rows[0] != undefined);
          team_name_5 = rows[0].team_name;
          avg_auto_gears_scored_5 = rows[0].avg_auto_gears_scored;
          avg_auto_gears_attempts_5 = rows[0].avg_auto_gears_attempts;
          avg_auto_high_made_5 = rows[0].avg_auto_high_made;
          avg_auto_high_attempts_5 = rows[0].avg_auto_high_attempts;
          avg_auto_low_made_5 = rows[0].avg_auto_low_made;
          avg_auto_low_attempts_5 = rows[0].avg_auto_low_attempts;
          tot_baseline_cross_5 = rows[0].tot_baseline_cross;
          avg_auto_hopper_intake_5 = rows[0].avg_auto_hopper_intake;
          avg_auto_floor_gear_intake_5 = rows[0].avg_auto_floor_gear_intake;
          avg_auto_floor_ball_intake_5 = rows[0].avg_auto_floor_ball_intake;
          avg_auto_contrib_kpa_5 = rows[0].avg_auto_contrib_kpa;

          avg_num_cycles_5 = rows[0].avg_num_cycles;
          avg_cycle_time_5 = rows[0].avg_cycle_time;
          avg_tele_high_made_5 = rows[0].avg_tele_high_made;
          avg_tele_high_attempts_5 = rows[0].avg_tele_high_attempts;
          avg_tele_low_made_5 = rows[0].avg_tele_low_made;
          avg_tele_low_attempts_5 = rows[0].avg_tele_low_attempts;
          avg_tele_gears_scored_5 = rows[0].avg_tele_gears_scored;
          avg_tele_gears_attempts_5 = rows[0].avg_tele_gears_attempts;
          avg_tele_gears_dropped_5 = rows[0].avg_tele_gears_dropped;
          avg_tele_gear_knockouts_5 = rows[0].avg_tele_gear_knockouts;
          avg_tele_floor_ball_intake_5 = rows[0].avg_tele_floor_ball_intake;
          avg_tele_floor_gear_intake_5 = rows[0].avg_tele_floor_gear_intake;
          avg_tele_hopper_intake_5 = rows[0].avg_tele_hopper_intake;
          avg_hp_ball_intake_5 = rows[0].avg_hp_ball_intake;
          avg_hp_gear_intake_5 = rows[0].avg_hp_gear_intake;
          tot_climb_5 = rows[0].tot_climb;
          tot_climb_attempts_5 = rows[0].tot_climb_attempts;
          tot_fouls_5 = rows[0].tot_fouls;
          tot_deads_5 = rows[0].tot_deads;
          avg_contrib_kpa_5 = rows[0].avg_contrib_kpa;
  			});

        var no_auto_sql_5 = "SELECT * FROM matches WHERE team_num='"+ team_num_5 +"'";
        connection.query(no_auto_sql_5, function(err, rows, fields) {
          for(var x in rows)
          {
            if(rows[x].auto_contrib_kpa == 0 && rows[x].auto_gears_scored == 0 && rows[x].baseline_cross == 0)
            {
              no_autos_5++;
            }
          }
  			});
      }
      if(team_num_6 != 0) {
        updateTeams(team_num_6);

        var get_data_6 = "SELECT * FROM teams WHERE team_num='"+ team_num_6 +"'";

  			connection.query(get_data_6, function(err, rows, fields) {
          // console.log(rows[0] != undefined);
          team_name_6 = rows[0].team_name;
          avg_auto_gears_scored_6 = rows[0].avg_auto_gears_scored;
          avg_auto_gears_attempts_6 = rows[0].avg_auto_gears_attempts;
          avg_auto_high_made_6 = rows[0].avg_auto_high_made;
          avg_auto_high_attempts_6 = rows[0].avg_auto_high_attempts;
          avg_auto_low_made_6 = rows[0].avg_auto_low_made;
          avg_auto_low_attempts_6 = rows[0].avg_auto_low_attempts;
          tot_baseline_cross_6 = rows[0].tot_baseline_cross;
          avg_auto_hopper_intake_6 = rows[0].avg_auto_hopper_intake;
          avg_auto_floor_gear_intake_6 = rows[0].avg_auto_floor_gear_intake;
          avg_auto_floor_ball_intake_6 = rows[0].avg_auto_floor_ball_intake;
          avg_auto_contrib_kpa_6 = rows[0].avg_auto_contrib_kpa;

          avg_num_cycles_6 = rows[0].avg_num_cycles;
          avg_cycle_time_6 = rows[0].avg_cycle_time;
          avg_tele_high_made_6 = rows[0].avg_tele_high_made;
          avg_tele_high_attempts_6 = rows[0].avg_tele_high_attempts;
          avg_tele_low_made_6 = rows[0].avg_tele_low_made;
          avg_tele_low_attempts_6 = rows[0].avg_tele_low_attempts;
          avg_tele_gears_scored_6 = rows[0].avg_tele_gears_scored;
          avg_tele_gears_attempts_6 = rows[0].avg_tele_gears_attempts;
          avg_tele_gears_dropped_6 = rows[0].avg_tele_gears_dropped;
          avg_tele_gear_knockouts_6 = rows[0].avg_tele_gear_knockouts;
          avg_tele_floor_ball_intake_6 = rows[0].avg_tele_floor_ball_intake;
          avg_tele_floor_gear_intake_6 = rows[0].avg_tele_floor_gear_intake;
          avg_tele_hopper_intake_6 = rows[0].avg_tele_hopper_intake;
          avg_hp_ball_intake_6 = rows[0].avg_hp_ball_intake;
          avg_hp_gear_intake_6 = rows[0].avg_hp_gear_intake;
          tot_climb_6 = rows[0].tot_climb;
          tot_climb_attempts_6 = rows[0].tot_climb_attempts;
          tot_fouls_6 = rows[0].tot_fouls;
          tot_deads_6 = rows[0].tot_deads;
          avg_contrib_kpa_6 = rows[0].avg_contrib_kpa;
  			});

        var no_auto_sql_6 = "SELECT * FROM matches WHERE team_num='"+ team_num_6 +"'";
        connection.query(no_auto_sql_6, function(err, rows, fields) {
          for(var x in rows)
          {
            if(rows[x].auto_contrib_kpa == 0 && rows[x].auto_gears_scored == 0 && rows[x].baseline_cross == 0)
            {
              no_autos_6++;
            }
          }
  			});
      }

          // console.log(avg_auto_gears_scored_1);
      setTimeout(() => {
        var ppt_template = require("ppt-template");
        var Presentation = ppt_template.Presentation;

        var myPres = new Presentation();
        myPres.loadFile(__dirname + "/alliances/alliance_in.pptx")
        .then(() => {
          var slide1 = myPres.getSlide(1); // Index starts at 1 for some reason
          slide1.fill([
            {
              key: "team_num_1",
              value: team_num_1
            },
            {
              key: "avg_contrib_kpa_1",
              value: avg_contrib_kpa_1
            },
            {
              key: "tot_baseline_cross_1",
              value: tot_baseline_cross_1
            },
            {
              key: "avg_auto_high_made_1",
              value: avg_auto_high_made_1
            },
            {
              key: "avg_auto_high_attempts_1",
              value: avg_auto_high_attempts_1
            },
            {
              key: "avg_auto_low_made_1",
              value: avg_auto_low_made_1
            },
            {
              key: "avg_auto_low_attempts_1",
              value: avg_auto_low_attempts_1
            },
            {
              key: "avg_auto_hopper_intake_1",
              value: avg_auto_hopper_intake_1
            },
            {
              key: "avg_auto_floor_gear_intake_1",
              value: avg_auto_floor_gear_intake_1
            },
            {
              key: "avg_auto_floor_ball_intake_1",
              value: avg_auto_floor_ball_intake_1
            },
            {
              key: "avg_auto_gears_scored_1",
              value: avg_auto_gears_scored_1
            },
            {
              key: "avg_num_cycles_1",
              value: avg_num_cycles_1
            },
            {
              key: "avg_tele_high_made_1",
              value: avg_tele_high_made_1
            },
            {
              key: "avg_tele_high_attempts_1",
              value: avg_tele_high_attempts_1
            },
            {
              key: "avg_tele_low_made_1",
              value: avg_tele_low_made_1
            },
            {
              key: "avg_tele_low_attempts_1",
              value: avg_tele_low_attempts_1
            },
            {
              key: "avg_tele_gears_scored_1",
              value: avg_tele_gears_scored_1
            },
            {
              key: "avg_tele_gears_attempts_1",
              value: avg_tele_gears_attempts_1
            },
            {
              key: "avg_tele_gears_dropped_1",
              value: avg_tele_gears_dropped_1
            },
            {
              key: "avg_tele_floor_ball_intake_1",
              value: avg_tele_floor_ball_intake_1
            },
            {
              key: "avg_tele_hopper_intake_1",
              value: avg_tele_hopper_intake_1
            },
            {
              key: "avg_hp_ball_intake_1",
              value: avg_hp_ball_intake_1
            },
            {
              key: "avg_tele_floor_gear_intake_1",
              value: avg_tele_floor_gear_intake_1
            },
            {
              key: "avg_hp_gear_intake_1",
              value: avg_hp_gear_intake_1
            },
            {
              key: "tot_climb_1",
              value: tot_climb_1
            },
            {
              key: "tot_climb_attempts_1",
              value: tot_climb_attempts_1
            },
            {
              key: "avg_tele_gear_knockouts_1",
              value: avg_tele_gear_knockouts_1
            },
            {
              key: "team_num_2",
              value: team_num_2
            },
            {
              key: "avg_contrib_kpa_2",
              value: avg_contrib_kpa_2
            },
            {
              key: "tot_baseline_cross_2",
              value: tot_baseline_cross_2
            },
            {
              key: "avg_auto_high_made_2",
              value: avg_auto_high_made_2
            },
            {
              key: "avg_auto_high_attempts_2",
              value: avg_auto_high_attempts_2
            },
            {
              key: "avg_auto_low_made_2",
              value: avg_auto_low_made_2
            },
            {
              key: "avg_auto_low_attempts_2",
              value: avg_auto_low_attempts_2
            },
            {
              key: "avg_auto_hopper_intake_2",
              value: avg_auto_hopper_intake_2
            },
            {
              key: "avg_auto_floor_gear_intake_2",
              value: avg_auto_floor_gear_intake_2
            },
            {
              key: "avg_auto_floor_ball_intake_2",
              value: avg_auto_floor_ball_intake_2
            },
            {
              key: "avg_auto_gears_scored_2",
              value: avg_auto_gears_scored_2
            },
            {
              key: "avg_num_cycles_2",
              value: avg_num_cycles_2
            },
            {
              key: "avg_tele_high_made_2",
              value: avg_tele_high_made_2
            },
            {
              key: "avg_tele_high_attempts_2",
              value: avg_tele_high_attempts_2
            },
            {
              key: "avg_tele_low_made_2",
              value: avg_tele_low_made_2
            },
            {
              key: "avg_tele_low_attempts_2",
              value: avg_tele_low_attempts_2
            },
            {
              key: "avg_tele_gears_scored_2",
              value: avg_tele_gears_scored_2
            },
            {
              key: "avg_tele_gears_attempts_2",
              value: avg_tele_gears_attempts_2
            },
            {
              key: "avg_tele_gears_dropped_2",
              value: avg_tele_gears_dropped_2
            },
            {
              key: "avg_tele_floor_ball_intake_2",
              value: avg_tele_floor_ball_intake_2
            },
            {
              key: "avg_tele_hopper_intake_2",
              value: avg_tele_hopper_intake_2
            },
            {
              key: "avg_hp_ball_intake_2",
              value: avg_hp_ball_intake_2
            },
            {
              key: "avg_tele_floor_gear_intake_2",
              value: avg_tele_floor_gear_intake_2
            },
            {
              key: "avg_hp_gear_intake_2",
              value: avg_hp_gear_intake_2
            },
            {
              key: "tot_climb_2",
              value: tot_climb_2
            },
            {
              key: "tot_climb_attempts_2",
              value: tot_climb_attempts_2
            },
            {
              key: "avg_tele_gear_knockouts_2",
              value: avg_tele_gear_knockouts_2
            },
            {
              key: "team_num_3",
              value: team_num_3
            },
            {
              key: "avg_contrib_kpa_3",
              value: avg_contrib_kpa_3
            },
            {
              key: "tot_baseline_cross_3",
              value: tot_baseline_cross_3
            },
            {
              key: "avg_auto_high_made_3",
              value: avg_auto_high_made_3
            },
            {
              key: "avg_auto_high_attempts_3",
              value: avg_auto_high_attempts_3
            },
            {
              key: "avg_auto_low_made_3",
              value: avg_auto_low_made_3
            },
            {
              key: "avg_auto_low_attempts_3",
              value: avg_auto_low_attempts_3
            },
            {
              key: "avg_auto_hopper_intake_3",
              value: avg_auto_hopper_intake_3
            },
            {
              key: "avg_auto_floor_gear_intake_3",
              value: avg_auto_floor_gear_intake_3
            },
            {
              key: "avg_auto_floor_ball_intake_3",
              value: avg_auto_floor_ball_intake_3
            },
            {
              key: "avg_auto_gears_scored_3",
              value: avg_auto_gears_scored_3
            },
            {
              key: "avg_num_cycles_3",
              value: avg_num_cycles_3
            },
            {
              key: "avg_tele_high_made_3",
              value: avg_tele_high_made_3
            },
            {
              key: "avg_tele_high_attempts_3",
              value: avg_tele_high_attempts_3
            },
            {
              key: "avg_tele_low_made_3",
              value: avg_tele_low_made_3
            },
            {
              key: "avg_tele_low_attempts_3",
              value: avg_tele_low_attempts_3
            },
            {
              key: "avg_tele_gears_scored_3",
              value: avg_tele_gears_scored_3
            },
            {
              key: "avg_tele_gears_attempts_3",
              value: avg_tele_gears_attempts_3
            },
            {
              key: "avg_tele_gears_dropped_3",
              value: avg_tele_gears_dropped_3
            },
            {
              key: "avg_tele_floor_ball_intake_3",
              value: avg_tele_floor_ball_intake_3
            },
            {
              key: "avg_tele_hopper_intake_3",
              value: avg_tele_hopper_intake_3
            },
            {
              key: "avg_hp_ball_intake_3",
              value: avg_hp_ball_intake_3
            },
            {
              key: "avg_tele_floor_gear_intake_3",
              value: avg_tele_floor_gear_intake_3
            },
            {
              key: "avg_hp_gear_intake_3",
              value: avg_hp_gear_intake_3
            },
            {
              key: "tot_climb_3",
              value: tot_climb_3
            },
            {
              key: "tot_climb_attempts_3",
              value: tot_climb_attempts_3
            },
            {
              key: "avg_tele_gear_knockouts_3",
              value: avg_tele_gear_knockouts_3
            },
            {
              key: "team_num_4",
              value: team_num_4
            },
            {
              key: "avg_contrib_kpa_4",
              value: avg_contrib_kpa_4
            },
            {
              key: "tot_baseline_cross_4",
              value: tot_baseline_cross_4
            },
            {
              key: "avg_auto_high_made_4",
              value: avg_auto_high_made_4
            },
            {
              key: "avg_auto_high_attempts_4",
              value: avg_auto_high_attempts_4
            },
            {
              key: "avg_auto_low_made_4",
              value: avg_auto_low_made_4
            },
            {
              key: "avg_auto_low_attempts_4",
              value: avg_auto_low_attempts_4
            },
            {
              key: "avg_auto_hopper_intake_4",
              value: avg_auto_hopper_intake_4
            },
            {
              key: "avg_auto_floor_gear_intake_4",
              value: avg_auto_floor_gear_intake_4
            },
            {
              key: "avg_auto_floor_ball_intake_4",
              value: avg_auto_floor_ball_intake_4
            },
            {
              key: "avg_auto_gears_scored_4",
              value: avg_auto_gears_scored_4
            },
            {
              key: "avg_num_cycles_4",
              value: avg_num_cycles_4
            },
            {
              key: "avg_tele_high_made_4",
              value: avg_tele_high_made_4
            },
            {
              key: "avg_tele_high_attempts_4",
              value: avg_tele_high_attempts_4
            },
            {
              key: "avg_tele_low_made_4",
              value: avg_tele_low_made_4
            },
            {
              key: "avg_tele_low_attempts_4",
              value: avg_tele_low_attempts_4
            },
            {
              key: "avg_tele_gears_scored_4",
              value: avg_tele_gears_scored_4
            },
            {
              key: "avg_tele_gears_attempts_4",
              value: avg_tele_gears_attempts_4
            },
            {
              key: "avg_tele_gears_dropped_4",
              value: avg_tele_gears_dropped_4
            },
            {
              key: "avg_tele_floor_ball_intake_4",
              value: avg_tele_floor_ball_intake_4
            },
            {
              key: "avg_tele_hopper_intake_4",
              value: avg_tele_hopper_intake_4
            },
            {
              key: "avg_hp_ball_intake_4",
              value: avg_hp_ball_intake_4
            },
            {
              key: "avg_tele_floor_gear_intake_4",
              value: avg_tele_floor_gear_intake_4
            },
            {
              key: "avg_hp_gear_intake_4",
              value: avg_hp_gear_intake_4
            },
            {
              key: "tot_climb_4",
              value: tot_climb_4
            },
            {
              key: "tot_climb_attempts_4",
              value: tot_climb_attempts_4
            },
            {
              key: "avg_tele_gear_knockouts_4",
              value: avg_tele_gear_knockouts_4
            },
            {
              key: "team_num_5",
              value: team_num_5
            },
            {
              key: "avg_contrib_kpa_5",
              value: avg_contrib_kpa_5
            },
            {
              key: "tot_baseline_cross_5",
              value: tot_baseline_cross_5
            },
            {
              key: "avg_auto_high_made_5",
              value: avg_auto_high_made_5
            },
            {
              key: "avg_auto_high_attempts_5",
              value: avg_auto_high_attempts_5
            },
            {
              key: "avg_auto_low_made_5",
              value: avg_auto_low_made_5
            },
            {
              key: "avg_auto_low_attempts_5",
              value: avg_auto_low_attempts_5
            },
            {
              key: "avg_auto_hopper_intake_5",
              value: avg_auto_hopper_intake_5
            },
            {
              key: "avg_auto_floor_gear_intake_5",
              value: avg_auto_floor_gear_intake_5
            },
            {
              key: "avg_auto_floor_ball_intake_5",
              value: avg_auto_floor_ball_intake_5
            },
            {
              key: "avg_auto_gears_scored_5",
              value: avg_auto_gears_scored_5
            },
            {
              key: "avg_num_cycles_5",
              value: avg_num_cycles_5
            },
            {
              key: "avg_tele_high_made_5",
              value: avg_tele_high_made_5
            },
            {
              key: "avg_tele_high_attempts_5",
              value: avg_tele_high_attempts_5
            },
            {
              key: "avg_tele_low_made_5",
              value: avg_tele_low_made_5
            },
            {
              key: "avg_tele_low_attempts_5",
              value: avg_tele_low_attempts_5
            },
            {
              key: "avg_tele_gears_scored_5",
              value: avg_tele_gears_scored_5
            },
            {
              key: "avg_tele_gears_attempts_5",
              value: avg_tele_gears_attempts_5
            },
            {
              key: "avg_tele_gears_dropped_5",
              value: avg_tele_gears_dropped_5
            },
            {
              key: "avg_tele_floor_ball_intake_5",
              value: avg_tele_floor_ball_intake_5
            },
            {
              key: "avg_tele_hopper_intake_5",
              value: avg_tele_hopper_intake_5
            },
            {
              key: "avg_hp_ball_intake_5",
              value: avg_hp_ball_intake_5
            },
            {
              key: "avg_tele_floor_gear_intake_5",
              value: avg_tele_floor_gear_intake_5
            },
            {
              key: "avg_hp_gear_intake_5",
              value: avg_hp_gear_intake_5
            },
            {
              key: "tot_climb_5",
              value: tot_climb_5
            },
            {
              key: "tot_climb_attempts_5",
              value: tot_climb_attempts_5
            },
            {
              key: "avg_tele_gear_knockouts_5",
              value: avg_tele_gear_knockouts_5
            },
            {
              key: "team_num_6",
              value: team_num_6
            },
            {
              key: "avg_contrib_kpa_6",
              value: avg_contrib_kpa_6
            },
            {
              key: "tot_baseline_cross_6",
              value: tot_baseline_cross_6
            },
            {
              key: "avg_auto_high_made_6",
              value: avg_auto_high_made_6
            },
            {
              key: "avg_auto_high_attempts_6",
              value: avg_auto_high_attempts_6
            },
            {
              key: "avg_auto_low_made_6",
              value: avg_auto_low_made_6
            },
            {
              key: "avg_auto_low_attempts_6",
              value: avg_auto_low_attempts_6
            },
            {
              key: "avg_auto_hopper_intake_6",
              value: avg_auto_hopper_intake_6
            },
            {
              key: "avg_auto_floor_gear_intake_6",
              value: avg_auto_floor_gear_intake_6
            },
            {
              key: "avg_auto_floor_ball_intake_6",
              value: avg_auto_floor_ball_intake_6
            },
            {
              key: "avg_auto_gears_scored_6",
              value: avg_auto_gears_scored_6
            },
            {
              key: "avg_num_cycles_6",
              value: avg_num_cycles_6
            },
            {
              key: "avg_tele_high_made_6",
              value: avg_tele_high_made_6
            },
            {
              key: "avg_tele_high_attempts_6",
              value: avg_tele_high_attempts_6
            },
            {
              key: "avg_tele_low_made_6",
              value: avg_tele_low_made_6
            },
            {
              key: "avg_tele_low_attempts_6",
              value: avg_tele_low_attempts_6
            },
            {
              key: "avg_tele_gears_scored_6",
              value: avg_tele_gears_scored_6
            },
            {
              key: "avg_tele_gears_attempts_6",
              value: avg_tele_gears_attempts_6
            },
            {
              key: "avg_tele_gears_dropped_6",
              value: avg_tele_gears_dropped_6
            },
            {
              key: "avg_tele_floor_ball_intake_6",
              value: avg_tele_floor_ball_intake_6
            },
            {
              key: "avg_tele_hopper_intake_6",
              value: avg_tele_hopper_intake_6
            },
            {
              key: "avg_hp_ball_intake_6",
              value: avg_hp_ball_intake_6
            },
            {
              key: "avg_tele_floor_gear_intake_6",
              value: avg_tele_floor_gear_intake_6
            },
            {
              key: "avg_hp_gear_intake_6",
              value: avg_hp_gear_intake_6
            },
            {
              key: "tot_climb_6",
              value: tot_climb_6
            },
            {
              key: "tot_climb_attempts_6",
              value: tot_climb_attempts_6
            },
            {
              key: "avg_tele_gear_knockouts_6",
              value: avg_tele_gear_knockouts_6
            }
          ]);
          var slides = [slide1];
          return myPres.generate(slides);
        }).then((newPres) => {
          newPres.saveAs(__dirname + "/alliances/alliance_" + team_num_1 + "_" + team_num_2 + "_" + team_num_3 + "_"
                          + team_num_4 + "_" + team_num_5 + "_" + team_num_6 + ".pptx");

          res.render('pages/alliance', {
            team_num_1: team_num_1,
            team_name_1: team_name_1,
            avg_auto_gears_scored_1: avg_auto_gears_scored_1,
            avg_auto_gears_attempts_1: avg_auto_gears_attempts_1,
            avg_auto_high_made_1: avg_auto_high_made_1,
            avg_auto_high_attempts_1: avg_auto_high_attempts_1,
            avg_auto_low_made_1: avg_auto_low_made_1,
            avg_auto_low_attempts_1: avg_auto_low_attempts_1,
            tot_baseline_cross_1: tot_baseline_cross_1,
            avg_auto_hopper_intake_1: avg_auto_hopper_intake_1,
            avg_auto_floor_gear_intake_1: avg_auto_floor_gear_intake_1,
            avg_auto_floor_ball_intake_1: avg_auto_floor_ball_intake_1,
            avg_auto_contrib_kpa_1: avg_auto_contrib_kpa_1,
            avg_num_cycles_1: avg_num_cycles_1,
            avg_cycle_time_1: avg_cycle_time_1,
            avg_tele_high_made_1: avg_tele_high_made_1,
            avg_tele_high_attempts_1: avg_tele_high_attempts_1,
            avg_tele_low_made_1: avg_tele_low_made_1,
            avg_tele_low_attempts_1: avg_tele_low_attempts_1,
            avg_tele_gears_scored_1: avg_tele_gears_scored_1,
            avg_tele_gears_attempts_1: avg_tele_gears_attempts_1,
            avg_tele_floor_ball_intake_1: avg_tele_floor_ball_intake_1,
            avg_tele_floor_gear_intake_1: avg_tele_floor_gear_intake_1,
            avg_tele_hopper_intake_1: avg_tele_hopper_intake_1,
            avg_hp_ball_intake_1: avg_hp_ball_intake_1,
            avg_hp_gear_intake_1: avg_hp_gear_intake_1,
            avg_tele_gears_dropped_1: avg_tele_gears_dropped_1,
            avg_tele_gear_knockouts_1: avg_tele_gear_knockouts_1,
            tot_climb_1: tot_climb_1,
            tot_climb_attempts_1: tot_climb_attempts_1,
            tot_fouls_1: tot_fouls_1,
            tot_deads_1: tot_deads_1,
            avg_contrib_kpa_1: avg_contrib_kpa_1,
            no_autos_1: no_autos_1,

            team_num_2: team_num_2,
            team_name_2: team_name_2,
            avg_auto_gears_scored_2: avg_auto_gears_scored_2,
            avg_auto_gears_attempts_2: avg_auto_gears_attempts_2,
            avg_auto_high_made_2: avg_auto_high_made_2,
            avg_auto_high_attempts_2: avg_auto_high_attempts_2,
            avg_auto_low_made_2: avg_auto_low_made_2,
            avg_auto_low_attempts_2: avg_auto_low_attempts_2,
            tot_baseline_cross_2: tot_baseline_cross_2,
            avg_auto_hopper_intake_2: avg_auto_hopper_intake_2,
            avg_auto_floor_gear_intake_2: avg_auto_floor_gear_intake_2,
            avg_auto_floor_ball_intake_2: avg_auto_floor_ball_intake_2,
            avg_auto_contrib_kpa_2: avg_auto_contrib_kpa_2,
            avg_num_cycles_2: avg_num_cycles_2,
            avg_cycle_time_2: avg_cycle_time_2,
            avg_tele_high_made_2: avg_tele_high_made_2,
            avg_tele_high_attempts_2: avg_tele_high_attempts_2,
            avg_tele_low_made_2: avg_tele_low_made_2,
            avg_tele_low_attempts_2: avg_tele_low_attempts_2,
            avg_tele_gears_scored_2: avg_tele_gears_scored_2,
            avg_tele_gears_attempts_2: avg_tele_gears_attempts_2,
            avg_tele_floor_ball_intake_2: avg_tele_floor_ball_intake_2,
            avg_tele_floor_gear_intake_2: avg_tele_floor_gear_intake_2,
            avg_tele_hopper_intake_2: avg_tele_hopper_intake_2,
            avg_hp_ball_intake_2: avg_hp_ball_intake_2,
            avg_hp_gear_intake_2: avg_hp_gear_intake_2,
            avg_tele_gears_dropped_2: avg_tele_gears_dropped_2,
            avg_tele_gear_knockouts_2: avg_tele_gear_knockouts_2,
            tot_climb_2: tot_climb_2,
            tot_climb_attempts_2: tot_climb_attempts_2,
            tot_fouls_2: tot_fouls_2,
            tot_deads_2: tot_deads_2,
            avg_contrib_kpa_2: avg_contrib_kpa_2,
            no_autos_2: no_autos_2,

            team_num_3: team_num_3,
            team_name_3: team_name_3,
            avg_auto_gears_scored_3: avg_auto_gears_scored_3,
            avg_auto_gears_attempts_3: avg_auto_gears_attempts_3,
            avg_auto_high_made_3: avg_auto_high_made_3,
            avg_auto_high_attempts_3: avg_auto_high_attempts_3,
            avg_auto_low_made_3: avg_auto_low_made_3,
            avg_auto_low_attempts_3: avg_auto_low_attempts_3,
            tot_baseline_cross_3: tot_baseline_cross_3,
            avg_auto_hopper_intake_3: avg_auto_hopper_intake_3,
            avg_auto_floor_gear_intake_3: avg_auto_floor_gear_intake_3,
            avg_auto_floor_ball_intake_3: avg_auto_floor_ball_intake_3,
            avg_auto_contrib_kpa_3: avg_auto_contrib_kpa_3,
            avg_num_cycles_3: avg_num_cycles_3,
            avg_cycle_time_3: avg_cycle_time_3,
            avg_tele_high_made_3: avg_tele_high_made_3,
            avg_tele_high_attempts_3: avg_tele_high_attempts_3,
            avg_tele_low_made_3: avg_tele_low_made_3,
            avg_tele_low_attempts_3: avg_tele_low_attempts_3,
            avg_tele_gears_scored_3: avg_tele_gears_scored_3,
            avg_tele_gears_attempts_3: avg_tele_gears_attempts_3,
            avg_tele_floor_ball_intake_3: avg_tele_floor_ball_intake_3,
            avg_tele_floor_gear_intake_3: avg_tele_floor_gear_intake_3,
            avg_tele_hopper_intake_3: avg_tele_hopper_intake_3,
            avg_hp_ball_intake_3: avg_hp_ball_intake_3,
            avg_hp_gear_intake_3: avg_hp_gear_intake_3,
            avg_tele_gears_dropped_3: avg_tele_gears_dropped_3,
            avg_tele_gear_knockouts_3: avg_tele_gear_knockouts_3,
            tot_climb_3: tot_climb_3,
            tot_climb_attempts_3: tot_climb_attempts_3,
            tot_fouls_3: tot_fouls_3,
            tot_deads_3: tot_deads_3,
            avg_contrib_kpa_3: avg_contrib_kpa_3,
            no_autos_3: no_autos_3,

            team_num_4: team_num_4,
            team_name_4: team_name_4,
            avg_auto_gears_scored_4: avg_auto_gears_scored_4,
            avg_auto_gears_attempts_4: avg_auto_gears_attempts_4,
            avg_auto_high_made_4: avg_auto_high_made_4,
            avg_auto_high_attempts_4: avg_auto_high_attempts_4,
            avg_auto_low_made_4: avg_auto_low_made_4,
            avg_auto_low_attempts_4: avg_auto_low_attempts_4,
            tot_baseline_cross_4: tot_baseline_cross_4,
            avg_auto_hopper_intake_4: avg_auto_hopper_intake_4,
            avg_auto_floor_gear_intake_4: avg_auto_floor_gear_intake_4,
            avg_auto_floor_ball_intake_4: avg_auto_floor_ball_intake_4,
            avg_auto_contrib_kpa_4: avg_auto_contrib_kpa_4,
            avg_num_cycles_4: avg_num_cycles_4,
            avg_cycle_time_4: avg_cycle_time_4,
            avg_tele_high_made_4: avg_tele_high_made_4,
            avg_tele_high_attempts_4: avg_tele_high_attempts_4,
            avg_tele_low_made_4: avg_tele_low_made_4,
            avg_tele_low_attempts_4: avg_tele_low_attempts_4,
            avg_tele_gears_scored_4: avg_tele_gears_scored_4,
            avg_tele_gears_attempts_4: avg_tele_gears_attempts_4,
            avg_tele_floor_ball_intake_4: avg_tele_floor_ball_intake_4,
            avg_tele_floor_gear_intake_4: avg_tele_floor_gear_intake_4,
            avg_tele_hopper_intake_4: avg_tele_hopper_intake_4,
            avg_hp_ball_intake_4: avg_hp_ball_intake_4,
            avg_hp_gear_intake_4: avg_hp_gear_intake_4,
            avg_tele_gears_dropped_4: avg_tele_gears_dropped_4,
            avg_tele_gear_knockouts_4: avg_tele_gear_knockouts_4,
            tot_climb_4: tot_climb_4,
            tot_climb_attempts_4: tot_climb_attempts_4,
            tot_fouls_4: tot_fouls_4,
            tot_deads_4: tot_deads_4,
            avg_contrib_kpa_4: avg_contrib_kpa_4,
            no_autos_4: no_autos_4,

            team_num_5: team_num_5,
            team_name_5: team_name_5,
            avg_auto_gears_scored_5: avg_auto_gears_scored_5,
            avg_auto_gears_attempts_5: avg_auto_gears_attempts_5,
            avg_auto_high_made_5: avg_auto_high_made_5,
            avg_auto_high_attempts_5: avg_auto_high_attempts_5,
            avg_auto_low_made_5: avg_auto_low_made_5,
            avg_auto_low_attempts_5: avg_auto_low_attempts_5,
            tot_baseline_cross_5: tot_baseline_cross_5,
            avg_auto_hopper_intake_5: avg_auto_hopper_intake_5,
            avg_auto_floor_gear_intake_5: avg_auto_floor_gear_intake_5,
            avg_auto_floor_ball_intake_5: avg_auto_floor_ball_intake_5,
            avg_auto_contrib_kpa_5: avg_auto_contrib_kpa_5,
            avg_num_cycles_5: avg_num_cycles_5,
            avg_cycle_time_5: avg_cycle_time_5,
            avg_tele_high_made_5: avg_tele_high_made_5,
            avg_tele_high_attempts_5: avg_tele_high_attempts_5,
            avg_tele_low_made_5: avg_tele_low_made_5,
            avg_tele_low_attempts_5: avg_tele_low_attempts_5,
            avg_tele_gears_scored_5: avg_tele_gears_scored_5,
            avg_tele_gears_attempts_5: avg_tele_gears_attempts_5,
            avg_tele_floor_ball_intake_5: avg_tele_floor_ball_intake_5,
            avg_tele_floor_gear_intake_5: avg_tele_floor_gear_intake_5,
            avg_tele_hopper_intake_5: avg_tele_hopper_intake_5,
            avg_hp_ball_intake_5: avg_hp_ball_intake_5,
            avg_hp_gear_intake_5: avg_hp_gear_intake_5,
            avg_tele_gears_dropped_5: avg_tele_gears_dropped_5,
            avg_tele_gear_knockouts_5: avg_tele_gear_knockouts_5,
            tot_climb_5: tot_climb_5,
            tot_climb_attempts_5: tot_climb_attempts_5,
            tot_fouls_5: tot_fouls_5,
            tot_deads_5: tot_deads_5,
            avg_contrib_kpa_5: avg_contrib_kpa_5,
            no_autos_5: no_autos_5,

            team_num_6: team_num_6,
            team_name_6: team_name_6,
            avg_auto_gears_scored_6: avg_auto_gears_scored_6,
            avg_auto_gears_attempts_6: avg_auto_gears_attempts_6,
            avg_auto_high_made_6: avg_auto_high_made_6,
            avg_auto_high_attempts_6: avg_auto_high_attempts_6,
            avg_auto_low_made_6: avg_auto_low_made_6,
            avg_auto_low_attempts_6: avg_auto_low_attempts_6,
            tot_baseline_cross_6: tot_baseline_cross_6,
            avg_auto_hopper_intake_6: avg_auto_hopper_intake_6,
            avg_auto_floor_gear_intake_6: avg_auto_floor_gear_intake_6,
            avg_auto_floor_ball_intake_6: avg_auto_floor_ball_intake_6,
            avg_auto_contrib_kpa_6: avg_auto_contrib_kpa_6,
            avg_num_cycles_6: avg_num_cycles_6,
            avg_cycle_time_6: avg_cycle_time_6,
            avg_tele_high_made_6: avg_tele_high_made_6,
            avg_tele_high_attempts_6: avg_tele_high_attempts_6,
            avg_tele_low_made_6: avg_tele_low_made_6,
            avg_tele_low_attempts_6: avg_tele_low_attempts_6,
            avg_tele_gears_scored_6: avg_tele_gears_scored_6,
            avg_tele_gears_attempts_6: avg_tele_gears_attempts_6,
            avg_tele_floor_ball_intake_6: avg_tele_floor_ball_intake_6,
            avg_tele_floor_gear_intake_6: avg_tele_floor_gear_intake_6,
            avg_tele_hopper_intake_6: avg_tele_hopper_intake_6,
            avg_hp_ball_intake_6: avg_hp_ball_intake_6,
            avg_hp_gear_intake_6: avg_hp_gear_intake_6,
            avg_tele_gears_dropped_6: avg_tele_gears_dropped_6,
            avg_tele_gear_knockouts_6: avg_tele_gear_knockouts_6,
            tot_climb_6: tot_climb_6,
            tot_climb_attempts_6: tot_climb_attempts_6,
            tot_fouls_6: tot_fouls_6,
            tot_deads_6: tot_deads_6,
            avg_contrib_kpa_6: avg_contrib_kpa_6,
            no_autos_6: no_autos_6
          });
        });
      }, 1000);
		// });
	});

  router.get("/alliance-ppt/:team_1,:team_2,:team_3,:team_4,:team_5,:team_6", function(req, res) {
    var team_num_1 = req.params.team_1;
    var team_num_2 = req.params.team_2;
    var team_num_3 = req.params.team_3;
    var team_num_4 = req.params.team_4;
    var team_num_5 = req.params.team_5;
    var team_num_6 = req.params.team_6;
    res.download(__dirname + "/alliances/alliance_" + team_num_1 + "_" + team_num_2 + "_" + team_num_3 + "_"
                    + team_num_4 + "_" + team_num_5 + "_" + team_num_6 + ".pptx");
  });

  router.get('/team/:team_num', function(req,res) {
    var team_num = req.params.team_num;
    var team_name = "";
    var num_matches = 0;
    var next_team_num = 0;
    var previous_team_num = 0;
    var avg_auto_gears_scored = 0;
    var avg_auto_gears_attempts = 0;
    var avg_auto_high_made = 0;
    var avg_auto_high_attempts = 0;
    var avg_auto_low_made = 0;
    var avg_auto_low_attempts = 0;
    var tot_baseline_cross = 0;
    var avg_auto_hopper_intake = 0;
    var avg_auto_floor_gear_intake = 0;
    var avg_auto_floor_ball_intake = 0;
    var avg_auto_contrib_kpa = 0;

    var avg_num_cycles = 0;
    var avg_cycle_time = 0;
    var avg_tele_high_made = 0;
    var avg_tele_high_attempts = 0;
    var avg_tele_low_made = 0;
    var avg_tele_low_attempts = 0;
    var avg_tele_gears_scored = 0;
    var avg_tele_gears_attempts = 0;
    var avg_tele_floor_ball_intake = 0;
    var avg_tele_floor_gear_intake = 0;
    var avg_tele_hopper_intake= 0;
    var avg_hp_ball_intake = 0;
    var avg_hp_gear_intake = 0;
    var avg_tele_gears_dropped = 0;
    var avg_tele_gear_knockouts = 0;
    var tot_climb = 0;
    var tot_climb_attempts = 0;
    var tot_fouls = 0;
    var tot_deads = 0;
    var avg_contrib_kpa = 0;

    var no_autos = 0;
    var trend_labels = "";
    var tele_gears_trend = "";
    var auto_gears_trend = "";
    var tele_high_goal_trend = "";
    var auto_high_goal_trend = "";
    var videos = "";
//updateContribScores(team_num);
    updateTeams(team_num);


    var get_data = "SELECT * FROM teams WHERE team_num='"+ team_num +"'";
    var next_team = "SELECT * FROM teams WHERE team_num > '"+ team_num +"' ORDER BY team_num LIMIT 1";
    var previous_team = "SELECT * FROM teams WHERE team_num < '"+ team_num +"' ORDER BY team_num DESC LIMIT 1";
    var get_graph_data = "SELECT * FROM matches WHERE team_num='"+ team_num +"' ORDER BY match_num";

    connection.query(get_data, function(err, rows, fields) {
      team_name = rows[0].team_name;
      num_matches = rows[0].num_matches;
      avg_auto_gears_scored = rows[0].avg_auto_gears_scored;
      avg_auto_gears_attempts = rows[0].avg_auto_gears_attempts;
      avg_auto_high_made = rows[0].avg_auto_high_made;
      avg_auto_high_attempts = rows[0].avg_auto_high_attempts;
      avg_auto_low_made = rows[0].avg_auto_low_made;
      avg_auto_low_attempts = rows[0].avg_auto_low_attempts;
      tot_baseline_cross = rows[0].tot_baseline_cross;
      avg_auto_hopper_intake = rows[0].avg_auto_hopper_intake;
      avg_auto_floor_gear_intake = rows[0].avg_auto_floor_gear_intake;
      avg_auto_floor_ball_intake = rows[0].avg_auto_floor_ball_intake;
      avg_auto_contrib_kpa = rows[0].avg_auto_contrib_kpa;

      avg_num_cycles = rows[0].avg_num_cycles;
      avg_cycle_time = rows[0].avg_cycle_time;
      avg_tele_high_made = rows[0].avg_tele_high_made;
      avg_tele_high_attempts = rows[0].avg_tele_high_attempts;
      avg_tele_low_made = rows[0].avg_tele_low_made;
      avg_tele_low_attempts = rows[0].avg_tele_low_attempts;
      avg_tele_gears_scored = rows[0].avg_tele_gears_scored;
      avg_tele_gears_attempts = rows[0].avg_tele_gears_attempts;
      avg_tele_floor_ball_intake = rows[0].avg_tele_floor_ball_intake;
      avg_tele_floor_gear_intake = rows[0].avg_tele_floor_gear_intake;
      avg_tele_hopper_intake = rows[0].avg_tele_hopper_intake;
      avg_hp_ball_intake = rows[0].avg_hp_ball_intake;
      avg_hp_gear_intake = rows[0].avg_hp_gear_intake;
      avg_tele_gears_dropped = rows[0].avg_tele_gears_dropped;
      avg_tele_gear_knockouts = rows[0].avg_tele_gear_knockouts;
      tot_climb = rows[0].tot_climb;
      tot_climb_attempts = rows[0].tot_climb_attempts;
      tot_fouls = rows[0].tot_fouls;
      tot_deads = rows[0].tot_deads;
      avg_contrib_kpa = rows[0].avg_contrib_kpa;
    });

    var no_auto_sql = "SELECT * FROM matches WHERE team_num='"+ team_num +"'";
    connection.query(no_auto_sql, function(err, rows, fields) {
      for(var x in rows)
      {
        if(rows[x].auto_contrib_kpa == 0 && rows[x].auto_gears_scored == 0 && rows[x].baseline_cross == 0)
        {
          no_autos++;
        }
      }
    });

    var last_team;
    var first_team;
    var get_last_team_sql = "SELECT team_num FROM teams WHERE 1=1 ORDER BY team_num DESC";
    var get_first_team_sql = "SELECT team_num FROM teams WHERE 1=1";
    connection.query(get_last_team_sql, function(err, rows, fields) {
       last_team = rows[0].team_num;
    });
    connection.query(get_first_team_sql, function(err, rows, fields) {
      first_team = rows[0].team_num;
    });

    connection.query(next_team, function(err, rows, fields) {
      if(team_num == last_team)
        next_team_num = first_team;
      else
        next_team_num = rows[0].team_num;
    });

    connection.query(previous_team, function(err, rows, fields) {
      if(team_num == first_team)
        previous_team_num = last_team;
      else
        previous_team_num = rows[0].team_num;
    });

    connection.query(get_graph_data, function(err, rows, fields){
      // console.log(rows);
      for(var x in rows)
      {
        trend_labels += rows[x].match_num + ", ";
        tele_gears_trend += rows[x].tele_gears_scored + ", ";
        auto_gears_trend += rows[x].auto_gears_scored + ", ";
        tele_high_goal_trend += rows[x].tele_high_made + ", ";
        auto_high_goal_trend += rows[x].auto_high_made + ", ";
      }
      // console.log(high_goal_trend);
      // console.log(gears_trend);

    });

    var dir = __dirname + "\\public\\videos";
    var files = null;

    fs.readdir(dir, function(err, files) {
      files = files.map(function (fileName) {
        return {
          name: fileName,
          time: fs.statSync(dir + '/' + fileName).mtime.getTime()
        };
      })
      .sort(function (a, b) {
        return b.time - a.time; })
      .map(function (v) {
        return v.name; });

      // console.log(files);

      var match_sql = "SELECT match_num FROM matches WHERE team_num = " + team_num;
      connection.query(match_sql, function(err, rows, fields) {
        for(var x in rows) {
          // console.log(x % 2 === 0);// + ", " + x % 2 === 1 + ", " + x + 1 >= rows.size + ", " + rows.size + ", " + x);
          // console.log(x % 2 === 1);
          // console.log((Number(x) + 1) >= rows.length);
          // console.log(rows.length);
          // console.log(x);
          if(x % 2 === 0) {
            // console.log("first in a row");
            videos += "<div class=\"row\">";
          }
          videos += "<div class=\"col-lg-6\"><video width=\"480\" height=\"360\" controls><source src=\"../videos/" + files[rows[x].match_num - 1] + "\" type=\"video/mp4\"/></video><h4>Match " + rows[x].match_num + "</h4></div>";
          if(x % 2 === 1 || (Number(x) + 1) >= rows.length) {
            // console.log("last in a row");
            videos += "</div>";
          }
        }
        // console.log(videos);
        res.render('pages/team', {
          team_num: team_num,
          team_name: team_name,
          previous_team_num: previous_team_num,
          next_team_num: next_team_num,
          avg_auto_gears_scored: avg_auto_gears_scored,
          avg_auto_gears_attempts: avg_auto_gears_attempts,
          avg_auto_high_made: avg_auto_high_made,
          avg_auto_high_attempts: avg_auto_high_attempts,
          avg_auto_low_made: avg_auto_low_made,
          avg_auto_low_attempts: avg_auto_low_attempts,
          tot_baseline_cross: tot_baseline_cross,
          avg_auto_hopper_intake: avg_auto_hopper_intake,
          avg_auto_floor_gear_intake: avg_auto_floor_gear_intake,
          avg_auto_floor_ball_intake: avg_auto_floor_ball_intake,
          avg_auto_contrib_kpa: avg_auto_contrib_kpa,

          avg_num_cycles: avg_num_cycles,
          avg_cycle_time: avg_cycle_time,
          avg_tele_high_made: avg_tele_high_made,
          avg_tele_high_attempts: avg_tele_high_attempts,
          avg_tele_low_made: avg_tele_low_made,
          avg_tele_low_attempts: avg_tele_low_attempts,
          avg_tele_gears_scored: avg_tele_gears_scored,
          avg_tele_gears_attempts: avg_tele_gears_attempts,
          avg_tele_floor_ball_intake: avg_tele_floor_ball_intake,
          avg_tele_floor_gear_intake: avg_tele_floor_gear_intake,
          avg_tele_hopper_intake: avg_tele_hopper_intake,
          avg_hp_ball_intake: avg_hp_ball_intake,
          avg_hp_gear_intake: avg_hp_gear_intake,
          avg_tele_gears_dropped: avg_tele_gears_dropped,
          avg_tele_gear_knockouts: avg_tele_gear_knockouts,
          tot_climb: tot_climb,
          tot_climb_attempts: tot_climb_attempts,
          tot_fouls: tot_fouls,
          tot_deads: tot_deads,
          avg_contrib_kpa: avg_contrib_kpa,
          no_autos: no_autos,
          trend_labels: trend_labels,
          tele_gears_trend: tele_gears_trend,
          auto_gears_trend: auto_gears_trend,
          tele_high_goal_trend: tele_high_goal_trend,
          auto_high_goal_trend: auto_high_goal_trend,
          videos: videos
        });
      });
    });
  });

  router.get('/data-entry', function(req, res) {
      var display_entry = "";
      if(most_recent == -1)
          display_entry = '<div class="alert alert-danger" role="alert"><p><b>Oh snap</b>, looks like this is a duplicate entry. Data not queried.</p></div>';
      else if(most_recent != -1 && most_recent != 0)
          display_entry = '<div class="alert alert-success" role="alert"><p>Data for <b>'+ most_recent +'</b> has been <b>successfully</b> entered.</p></div>';


      res.render('pages/data_entry', {
          message: display_entry
      });
  });

  router.post('/parse-data', function(req, res) {
    var team_num = Number(req.body.team_num);
    var match_num = Number(req.body.match_num);

    var auto_high_made = Number(req.body.auto_high_made);
    var auto_high_missed = Number(req.body.auto_high_missed);
    var auto_low_made = Number(req.body.auto_low_made);
    var auto_low_missed = Number(req.body.auto_low_missed);
    var baseline_cross = Number(req.body.baseline_cross);
    var auto_hopper_intake = Number(req.body.auto_hopper_intake);
    var auto_floor_gear_intake = Number(req.body.auto_floor_gear_intake);
    var auto_floor_ball_intake = Number(req.body.auto_floor_ball_intake);
    var auto_gears_scored = Number(req.body.auto_gears_scored);
    var auto_gears_missed = Number(req.body.auto_gears_missed);
    var tele_high_made = Number(req.body.tele_high_made);
    var tele_high_missed = Number(req.body.tele_high_missed);
    var tele_low_made = Number(req.body.tele_low_made);
    var tele_low_missed = Number(req.body.tele_low_missed);
    var num_cycles = Number(req.body.num_cycles);
    var tele_floor_ball_intake = Number(req.body.tele_floor_ball_intake);
    var hp_ball_intake = Number(req.body.hp_ball_intake);
    var tele_hopper_intake = Number(req.body.tele_hopper_intake);
    var tele_gears_scored = Number(req.body.tele_gears_scored);
    var tele_gears_missed = Number(req.body.tele_gears_missed);
    var tele_floor_gear_intake = Number(req.body.tele_floor_gear_intake);
    var hp_gear_intake = Number(req.body.hp_gear_intake);
    var tele_gears_dropped = Number(req.body.tele_gears_dropped);
    var tele_gear_knockouts = Number(req.body.tele_gear_knockouts);
    var fouls = Number(req.body.fouls);
    var dead = Number(req.body.dead);
    var climb = Number(req.body.climb);
    var failed_climb = Number(req.body.failed_climb);

    var auto_kpa = auto_high_made + 1/3 * auto_low_made;
    var tot_kpa = auto_kpa + 1/3 * tele_high_made + 1/9 * tele_low_made;

    var matches_sql_v2 = "INSERT INTO `matches` (`match_num`, `team_num`, `auto_high_made`, `auto_high_missed`, " +
      "`auto_low_made`, `auto_low_missed`, `baseline_cross`, `auto_hopper_intake`, `auto_floor_gear_intake`, " +
      "`auto_floor_ball_intake`, `auto_gears_scored`, `auto_gears_missed`, `tele_high_made`, `tele_high_missed`, `tele_low_made`, " +
      "`tele_low_missed`, `num_cycles`, `tele_floor_ball_intake`, `hp_ball_intake`, `tele_hopper_intake`, `tele_gears_scored`, " +
      "`tele_gears_missed`, `tele_floor_gear_intake`, `hp_gear_intake`, `tele_gears_dropped`, `tele_gear_knockouts`, `fouls`," +
      "`dead`, `climb`, `failed_climb`, `auto_contrib_kpa`, `contrib_kpa`) VALUES (" + match_num + ", " + team_num +
      ", " + auto_high_made + ", " + auto_high_missed + ", " + auto_low_made + ", " + auto_low_missed + ", " + baseline_cross +
      ", " + auto_hopper_intake + ", " + auto_floor_gear_intake + ", " + auto_floor_ball_intake + ", " + auto_gears_scored +
      ", " + auto_gears_missed + ", " + tele_high_made + ", " + tele_high_missed + ", " + tele_low_made + ", " + tele_low_missed +
      ", " + num_cycles + ", " + tele_floor_ball_intake + ", " + hp_ball_intake + ", " + tele_hopper_intake + ", " + tele_gears_scored +
      ", " + tele_gears_missed + ", " + tele_floor_gear_intake + ", " + hp_gear_intake + ", " + tele_gears_dropped +
      ", " + tele_gear_knockouts + ", " + fouls + ", " + dead + ", " + climb + ", " + failed_climb + "," + auto_kpa + ", " + tot_kpa + ");"

    connection.query(matches_sql_v2, function(err) {
      if(err)
      {
        most_recent = -1;
        console.log(err);
        res.redirect('/data-entry');
      }
      else
      {
        updateTeams(team_num);
        most_recent = team_num;
        res.redirect('/data-entry');
      }
    });
  });


function updateContribScores(team_num)
{
grab_data_sql = "SELECT * FROM matches WHERE team_num='"+ team_num +"'";

connection.query(grab_data_sql, function(err, rows, fields) {
          console.log(err);

	for(var x in rows)
	{
		var a1 = rows[x].a1_total;
		if(a1>2)
			a1 = 2;
		var a2 = rows[x].a2_total;
		if(a2)
			a2 = 2;
		var b1 = rows[x].b1_total;
		if(b1>2)
			b1 = 2;
		var b2 = rows[x].b2_total;
		if(b2>2)
			b2 = 2;
		var c1 = rows[x].c1_total;
		if(c1>2)
			c1 = 2;
		var c2 = rows[x].c2_total;
		if(c2>2)
			c2 = 2;
		var d1 = rows[x].d1_total;
		if(d1>2)
			d1 = 2;
		var d2 = rows[x].d2_total;
		if(d2>2)
			d2 = 2;
		var lb = rows[x].lb_total;
		if(lb>2)
			lb = 2;


		console.log(a1);
		console.log(a2);
		console.log(b1);
		console.log(b2);
		console.log(c1);
		console.log(c2);
		console.log(d1);
		console.log(d2);
		console.log(lb);
		var dis_contributed_score = rows[x].auton_score + (5*(a1 + a2 + b1 + b2 + c1 + c2 + d1 + d2 + lb) + 2*rows[x].tele_low_made + 5*rows[x].tele_high_made + 15*rows[x].tele_hang + 5*rows[x].tele_challenge);
		console.log(dis_contributed_score);
		var update_sql_script = "UPDATE matches SET contributed_score='"+ dis_contributed_score +"' WHERE team_num='"+ team_num +"' AND match_number='"+ rows[x].match_number +"'";


		connection.query(update_sql_script);
	}
      });

}

  function updateTeams(team_num)
  {
      console.log("updating data into teams for team: " + team_num);

      var team_sql = "UPDATE teams SET num_matches=(SELECT COUNT(*) FROM matches WHERE team_num=" + team_num + "), " +
      "perc_auto_gears_scored=100*(SELECT SUM(auto_gears_scored)/(SUM(auto_gears_missed)+SUM(auto_gears_scored)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_gears_scored=(SELECT SUM(auto_gears_scored) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_gears_attempts=(SELECT SUM(auto_gears_scored)+SUM(auto_gears_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_auto_gears_scored=(SELECT AVG(auto_gears_scored) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_auto_gears_attempts=(SELECT AVG(auto_gears_scored+auto_gears_missed) FROM matches WHERE team_num=" + team_num + "), " +

      "perc_auto_high_made=100*(SELECT SUM(auto_high_made)/(SUM(auto_high_missed)+SUM(auto_high_made)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_high_made=(SELECT SUM(auto_high_made) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_high_attempts=(SELECT SUM(auto_high_made)+SUM(auto_high_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_auto_high_made=(SELECT AVG(auto_high_made) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_auto_high_attempts=(SELECT AVG(auto_high_made+auto_high_missed) FROM matches WHERE team_num=" + team_num + "), " +

      "perc_auto_low_made=100*(SELECT SUM(auto_low_made)/(SUM(auto_low_missed)+SUM(auto_low_made)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_low_made=(SELECT SUM(auto_low_made) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_low_attempts=(SELECT SUM(auto_low_made)+SUM(auto_low_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_auto_low_made=(SELECT AVG(auto_low_made) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_auto_low_attempts=(SELECT AVG(auto_low_made+auto_low_missed) FROM matches WHERE team_num=" + team_num + "), " +

      "tot_baseline_cross=(SELECT SUM(baseline_cross) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_auto_hopper_intake=(SELECT AVG(auto_hopper_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_hopper_intake=(SELECT SUM(auto_hopper_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_auto_floor_gear_intake=(SELECT AVG(auto_floor_gear_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_floor_gear_intake=(SELECT SUM(auto_floor_gear_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_auto_floor_ball_intake=(SELECT AVG(auto_floor_ball_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_floor_ball_intake=(SELECT SUM(auto_floor_ball_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_num_cycles=(SELECT AVG(num_cycles) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_cycle_time=135/(SELECT AVG(num_cycles) FROM matches WHERE team_num=" + team_num + "), " +

      "perc_tele_high_made=100*(SELECT SUM(tele_high_made)/(SUM(tele_high_missed)+SUM(tele_high_made)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_high_made=(SELECT SUM(tele_high_made) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_high_attempts=(SELECT SUM(tele_high_made)+SUM(tele_high_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_high_made=(SELECT AVG(tele_high_made) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_high_attempts=(SELECT AVG(tele_high_made+tele_high_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_high_made_per_cycle=(SELECT AVG(tele_high_made)/AVG(num_cycles) FROM matches WHERE team_num=" + team_num + "), " +

      "perc_tele_low_made=100*(SELECT SUM(tele_low_made)/(SUM(tele_low_missed)+SUM(tele_low_made)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_low_made=(SELECT SUM(tele_low_made) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_low_attempts=(SELECT SUM(tele_low_made)+SUM(tele_low_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_low_made=(SELECT AVG(tele_low_made) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_low_attempts=(SELECT AVG(tele_low_made+tele_low_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_low_made_per_cycle=(SELECT AVG(tele_low_made)/AVG(num_cycles) FROM matches WHERE team_num=" + team_num + "), " +

      "perc_tele_gears_scored=100*(SELECT SUM(tele_gears_scored)/(SUM(tele_gears_missed)+SUM(tele_gears_scored)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_gears_scored=(SELECT SUM(tele_gears_scored) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_gears_attempts=(SELECT SUM(tele_gears_scored)+SUM(tele_gears_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_gears_scored=(SELECT AVG(tele_gears_scored) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_gears_attempts=(SELECT AVG(tele_gears_scored+tele_gears_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_gears_scored_per_cycle=(SELECT AVG(tele_gears_scored)/AVG(num_cycles) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_tele_floor_ball_intake=(SELECT AVG(tele_floor_ball_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_floor_ball_intake=(SELECT SUM(tele_floor_ball_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_tele_hopper_intake=(SELECT AVG(tele_hopper_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_hopper_intake=(SELECT SUM(tele_hopper_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_tele_floor_gear_intake=(SELECT AVG(tele_floor_gear_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_floor_gear_intake=(SELECT SUM(tele_floor_gear_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_hp_ball_intake=(SELECT AVG(hp_ball_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_hp_ball_intake=(SELECT SUM(hp_ball_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_hp_gear_intake=(SELECT AVG(hp_gear_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_hp_gear_intake=(SELECT SUM(hp_gear_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_tele_gears_dropped=(SELECT AVG(tele_gears_dropped) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_gears_dropped=(SELECT SUM(tele_gears_dropped) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_tele_gear_knockouts=(SELECT AVG(tele_gear_knockouts) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_gear_knockouts=(SELECT SUM(tele_gear_knockouts) FROM matches WHERE team_num=" + team_num + "), " +

      "perc_climb=100*(SELECT SUM(climb)/(SUM(failed_climb)+SUM(climb)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_climb=(SELECT SUM(climb) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_climb_attempts=(SELECT SUM(climb)+SUM(failed_climb) FROM matches WHERE team_num=" + team_num + "), " +

      "tot_fouls=(SELECT SUM(fouls) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_deads=(SELECT SUM(dead) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_auto_contrib_kpa=(SELECT AVG(auto_contrib_kpa) FROM matches WHERE team_num=" + team_num + "), "  +
      "avg_contrib_kpa=(SELECT AVG(contrib_kpa) FROM matches WHERE team_num=" + team_num + ") " +


      "WHERE team_num=" + team_num;

      connection.query(team_sql, function(err) {
        if(err)
          console.log(err);
      });
      // var next_sql = "UPDATE teams SET total_auto_crossings=((SELECT COUNT(*) FROM matches WHERE team_num='"+ team_num +"' AND auton_defense_crossed='PC' AND auton_defense_total<>'0') + (SELECT COUNT(*) FROM matches WHERE team_num='"+ team_num +"' AND auton_defense_crossed='CF' AND auton_defense_total<>'0') + (SELECT COUNT(*) FROM matches WHERE team_num='"+ team_num +"' AND auton_defense_crossed='M' AND auton_defense_total<>'0')  + (SELECT COUNT(*) FROM matches WHERE team_num='"+ team_num +"' AND auton_defense_crossed='R' AND auton_defense_total<>'0')  + (SELECT COUNT(*) FROM matches WHERE team_num='"+ team_num +"' AND auton_defense_crossed='DB' AND auton_defense_total<>'0') + (SELECT COUNT(*) FROM matches WHERE team_num='"+ team_num +"' AND auton_defense_crossed='SP' AND auton_defense_total<>'0') + (SELECT COUNT(*) FROM matches WHERE team_num='"+ team_num +"' AND auton_defense_crossed='RW' AND auton_defense_total<>'0') + (SELECT COUNT(*) FROM matches WHERE team_num='"+ team_num +"' AND auton_defense_crossed='RT' AND auton_defense_total<>'0') + (SELECT COUNT(*) FROM matches WHERE team_num='"+ team_num +"' AND auton_defense_crossed='LB' AND auton_defense_total<>'0')) WHERE team_num='"+ team_num +"'";

      // connection.query(next_sql, function(err) {
      //     console.log(err);
      //
      // });
  }


}


module.exports = REST_ROUTER;
