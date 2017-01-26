//where all the page connections happen and back-end javascript
var mysql = require("mysql");
var fs = require("fs");

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

		router.get('/alliance/:team_1,:team_2,:team_3', function(req, res) {
			console.log(req.params.team_1);
			console.log(req.params.team_2);
			console.log(req.params.team_3);

			var team_num_1 = !Number.isNaN(req.params.team_1) ? Number(req.params.team_1) : 0;
            var team_name_1 = "";
            var next_team_num_1 = 0;
            var previous_team_num_1 = 0;
            var avg_score_1 = 0;
            var avg_auton_score_1 = 0;
            var perc_high_made_1 = 0;
            var high_made_1 = 0;
            var low_made_1 = 0;
            var high_attempts_1 = 0;
            var low_attempts_1 = 0;
            var auton_defense_crossings_1 = [0,0,0,0,0,0,0,0,0];
            var auton_defense_attempts_1 = [0,0,0,0,0,0,0,0,0];
            var perferred_defense_1 = "none";
            var auton_high_made_1 = 0;
            var auton_high_attempts_1 = 0;
            var auton_low_made_1 = 0;
            var auton_low_attempts_1 = 0;
            var avg_floor_intakes_1 = 0;
            var avg_hp_intakes_1 = 0;
            var knockouts_1 = 0;
            var avg_bully_rating_1 = 0;
            var fouls_1 = 0;
            var deads_1 = 0;
            var a1_success_1 = 0;
            var a1_attempts_1 = 0;
            var a2_success_1 = 0;
            var a2_attempts_1 = 0;
            var b1_success_1 = 0;
            var b1_attempts_1 = 0;
            var b2_success_1 = 0;
            var b2_attempts_1 = 0;
            var c1_success_1 = 0;
            var c1_attempts_1 = 0;
            var c2_success_1 = 0;
            var c2_attempts_1 = 0;
            var d1_success_1 = 0;
            var d1_attempts_1 = 0;
            var d2_success_1 = 0;
            var d2_attempts_1 = 0;
            var lb_success_1 = 0;
            var lb_attempts_1 = 0;
            var a1_speed_1 = 0;
            var a2_speed_1 = 0;
            var b1_speed_1 = 0;
            var b2_speed_1 = 0;
            var c1_speed_1 = 0;
            var c2_speed_1 = 0;
            var d1_speed_1 = 0;
            var d2_speed_1 = 0;
            var lb_speed_1 = 0;
            var a1_stuck_1 = 0;
            var a2_stuck_1 = 0;
            var b1_stuck_1 = 0;
            var b2_stuck_1 = 0;
            var c1_stuck_1 = 0;
            var c2_stuck_1 = 0;
            var d1_stuck_1 = 0;
            var d2_stuck_1 = 0;
            var lb_stuck_1 = 0;
			var a1_assists_1 = 0;
            var a2_assists_1 = 0;
            var b1_assists_1 = 0;
            var b2_assists_1 = 0;
            var c1_assists_1 = 0;
            var c2_assists_1 = 0;
            var d1_assists_1 = 0;
            var d2_assists_1 = 0;
            var lb_assists_1 = 0;
            var hang_made_1 = 0;
            var hang_attempts_1 = 0;
            var challenge_made_1 = 0;
            var challenge_attempts_1 = 0;
            var auton_reaches_1 = 0;
            var no_autos_1 = 0;

			var team_num_2 = !Number.isNaN(req.params.team_2) ? Number(req.params.team_2) : 0;
            var team_name_2 = "";
            var next_team_num_2 = 0;
            var previous_team_num_2 = 0;
            var avg_score_2 = 0;
            var avg_auton_score_2 = 0;
            var perc_high_made_2 = 0;
            var high_made_2 = 0;
            var low_made_2 = 0;
            var high_attempts_2 = 0;
            var low_attempts_2 = 0;
            var auton_defense_crossings_2 = [0,0,0,0,0,0,0,0,0];
            var auton_defense_attempts_2 = [0,0,0,0,0,0,0,0,0];
            var perferred_defense_2 = "none";
            var auton_high_made_2 = 0;
            var auton_high_attempts_2 = 0;
            var auton_low_made_2 = 0;
            var auton_low_attempts_2 = 0;
            var avg_floor_intakes_2 = 0;
            var avg_hp_intakes_2 = 0;
            var knockouts_2 = 0;
            var avg_bully_rating_2 = 0;
            var fouls_2 = 0;
            var deads_2 = 0;
            var a1_success_2 = 0;
            var a1_attempts_2 = 0;
            var a2_success_2 = 0;
            var a2_attempts_2 = 0;
            var b1_success_2 = 0;
            var b1_attempts_2 = 0;
            var b2_success_2 = 0;
            var b2_attempts_2 = 0;
            var c1_success_2 = 0;
            var c1_attempts_2 = 0;
            var c2_success_2 = 0;
            var c2_attempts_2 = 0;
            var d1_success_2 = 0;
            var d1_attempts_2 = 0;
            var d2_success_2 = 0;
            var d2_attempts_2 = 0;
            var lb_success_2 = 0;
            var lb_attempts_2 = 0;
            var a1_speed_2 = 0;
            var a2_speed_2 = 0;
            var b1_speed_2 = 0;
            var b2_speed_2 = 0;
            var c1_speed_2 = 0;
            var c2_speed_2 = 0;
            var d1_speed_2 = 0;
            var d2_speed_2 = 0;
            var lb_speed_2 = 0;
            var a1_stuck_2 = 0;
            var a2_stuck_2 = 0;
            var b1_stuck_2 = 0;
            var b2_stuck_2 = 0;
            var c1_stuck_2 = 0;
            var c2_stuck_2 = 0;
            var d1_stuck_2 = 0;
            var d2_stuck_2 = 0;
            var lb_stuck_2 = 0;
			var a1_assists_2 = 0;
            var a2_assists_2 = 0;
            var b1_assists_2 = 0;
            var b2_assists_2 = 0;
            var c1_assists_2 = 0;
            var c2_assists_2 = 0;
            var d1_assists_2 = 0;
            var d2_assists_2 = 0;
            var lb_assists_2 = 0;
            var hang_made_2 = 0;
            var hang_attempts_2 = 0;
            var challenge_made_2 = 0;
            var challenge_attempts_2 = 0;
            var auton_reaches_2 = 0;
            var no_autos_2 = 0;

			var team_num_3 = !Number.isNaN(req.params.team_3) ? Number(req.params.team_3) : 0;
            var team_name_3 = "";
            var next_team_num_3 = 0;
            var previous_team_num_3 = 0;
            var avg_score_3 = 0;
            var avg_auton_score_3 = 0;
            var perc_high_made_3 = 0;
            var high_made_3 = 0;
            var low_made_3 = 0;
            var high_attempts_3 = 0;
            var low_attempts_3 = 0;
            var auton_defense_crossings_3 = [0,0,0,0,0,0,0,0,0];
            var auton_defense_attempts_3 = [0,0,0,0,0,0,0,0,0];
            var perferred_defense_3 = "none";
            var auton_high_made_3 = 0;
            var auton_high_attempts_3 = 0;
            var auton_low_made_3 = 0;
            var auton_low_attempts_3 = 0;
            var avg_floor_intakes_3 = 0;
            var avg_hp_intakes_3 = 0;
            var knockouts_3 = 0;
            var avg_bully_rating_3 = 0;
            var fouls_3 = 0;
            var deads_3 = 0;
            var a1_success_3 = 0;
            var a1_attempts_3 = 0;
            var a2_success_3 = 0;
            var a2_attempts_3 = 0;
            var b1_success_3 = 0;
            var b1_attempts_3 = 0;
            var b2_success_3 = 0;
            var b2_attempts_3 = 0;
            var c1_success_3 = 0;
            var c1_attempts_3 = 0;
            var c2_success_3 = 0;
            var c2_attempts_3 = 0;
            var d1_success_3 = 0;
            var d1_attempts_3 = 0;
            var d2_success_3 = 0;
            var d2_attempts_3 = 0;
            var lb_success_3 = 0;
            var lb_attempts_3 = 0;
            var a1_speed_3 = 0;
            var a2_speed_3 = 0;
            var b1_speed_3 = 0;
            var b2_speed_3 = 0;
            var c1_speed_3 = 0;
            var c2_speed_3 = 0;
            var d1_speed_3 = 0;
            var d2_speed_3 = 0;
            var lb_speed_3 = 0;
            var a1_stuck_3 = 0;
            var a2_stuck_3 = 0;
            var b1_stuck_3 = 0;
            var b2_stuck_3 = 0;
            var c1_stuck_3 = 0;
            var c2_stuck_3 = 0;
            var d1_stuck_3 = 0;
            var d2_stuck_3 = 0;
            var lb_stuck_3 = 0;
			var a1_assists_3 = 0;
            var a2_assists_3 = 0;
            var b1_assists_3 = 0;
            var b2_assists_3 = 0;
            var c1_assists_3 = 0;
            var c2_assists_3 = 0;
            var d1_assists_3 = 0;
            var d2_assists_3 = 0;
            var lb_assists_3 = 0;
            var hang_made_3 = 0;
            var hang_attempts_3 = 0;
            var challenge_made_3 = 0;
            var challenge_attempts_3 = 0;
            var auton_reaches_3 = 0;
            var no_autos_3 = 0;

			if(team_num_1 != 0 && team_num_2 != 0 && team_num_3 != 0)
			{
            updateContribScores(team_num_1);
			updateContribScores(team_num_2);
			updateContribScores(team_num_3);
            updateTeams(team_num_1);
			updateTeams(team_num_2);
			updateTeams(team_num_3);

			//if(!isNaN(team_num_1))
			//{
				var get_data_1 = "SELECT * FROM teams WHERE team_num='"+ team_num_1 +"'";

				connection.query(get_data_1, function(err, rows, fields) {
					team_name_1 = rows[0].team_name;
					avg_score_1 = rows[0].avg_contrib_score;
					avg_auton_score_1 = rows[0].avg_auton_score;
					perc_high_made_1 = rows[0].perc_high_made;
					auton_defense_crossings_1[0] = rows[0].auton_a1;
					auton_defense_crossings_1[1] = rows[0].auton_a2;
					auton_defense_crossings_1[2] = rows[0].auton_b1;
					auton_defense_crossings_1[3] = rows[0].auton_b2;
					auton_defense_crossings_1[4] = rows[0].auton_c1;
					auton_defense_crossings_1[5] = rows[0].auton_c2;
					auton_defense_crossings_1[6] = rows[0].auton_d1;
					auton_defense_crossings_1[7] = rows[0].auton_d2;
					auton_defense_crossings_1[8] = rows[0].auton_lb;
					auton_defense_attempts_1[0] = rows[0].auton_a1_attempts;
					auton_defense_attempts_1[1] = rows[0].auton_a2_attempts;
					auton_defense_attempts_1[2] = rows[0].auton_b1_attempts;
					auton_defense_attempts_1[3] = rows[0].auton_b2_attempts;
					auton_defense_attempts_1[4] = rows[0].auton_c1_attempts;
					auton_defense_attempts_1[5] = rows[0].auton_c2_attempts;
					auton_defense_attempts_1[6] = rows[0].auton_d1_attempts;
					auton_defense_attempts_1[7] = rows[0].auton_d2_attempts;
					auton_defense_attempts_1[8] = rows[0].auton_lb_attempts;
					auton_high_made_1 = rows[0].auton_high_made;
					auton_high_attempts_1 = rows[0].auton_high_attempts;
					auton_low_made_1 = rows[0].auton_low_made;
					auton_low_attempts_1 = rows[0].auton_low_attempts;
					high_made_1 = rows[0].avg_high_made;
					low_made_1 = rows[0].avg_low_made;
					high_attempts_1 = rows[0].avg_high_attempts;
					low_attempts_1 = rows[0].avg_low_attempts;
					avg_floor_intakes_1 = rows[0].avg_floor_intakes;
					avg_hp_intakes_1 = rows[0].avg_hp_intakes;
					avg_bully_rating_1 = rows[0].avg_bully_rating;
					knockouts_1 = rows[0].total_knockouts;
					fouls_1 = rows[0].total_fouls;
					deads_1 = rows[0].tot_dead;

					a1_success_1 = rows[0].tot_a1_successful;
					a1_attempts_1 = rows[0].tot_a1_attempts;
					a2_success_1 = rows[0].tot_a2_successful;
					a2_attempts_1 = rows[0].tot_a2_attempts;
					b1_success_1 = rows[0].tot_b1_successful;
					b1_attempts_1 = rows[0].tot_b1_attempts;
					b2_success_1 = rows[0].tot_b2_successful;
					b2_attempts_1 = rows[0].tot_b2_attempts;
					c1_success_1 = rows[0].tot_c1_successful;
					c1_attempts_1 = rows[0].tot_c1_attempts;
					c2_success_1 = rows[0].tot_c2_successful;
					c2_attempts_1 = rows[0].tot_c2_attempts;
					d1_success_1 = rows[0].tot_d1_successful;
					d1_attempts_1 = rows[0].tot_d1_attempts;
					d2_success_1 = rows[0].tot_d2_successful;
					d2_attempts_1 = rows[0].tot_d2_attempts;
					lb_success_1 = rows[0].tot_lb_successful;
					lb_attempts_1 = rows[0].tot_lb_attempts;

					a1_speed_1 = rows[0].avg_a1_speed;
					a2_speed_1 = rows[0].avg_a2_speed;
					b1_speed_1 = rows[0].avg_b1_speed;
					b2_speed_1 = rows[0].avg_b2_speed;
					c1_speed_1 = rows[0].avg_c1_speed;
					c2_speed_1 = rows[0].avg_c2_speed;
					d1_speed_1 = rows[0].avg_d1_speed;
					d2_speed_1 = rows[0].avg_d2_speed;
					lb_speed_1 = rows[0].avg_lb_speed;

					a1_stuck_1 = rows[0].tot_a1_stuck;
					a2_stuck_1 = rows[0].tot_a2_stuck;
					b1_stuck_1 = rows[0].tot_b1_stuck;
					b2_stuck_1 = rows[0].tot_b2_stuck;
					c1_stuck_1 = rows[0].tot_c1_stuck;
					c2_stuck_1 = rows[0].tot_c2_stuck;
					d1_stuck_1 = rows[0].tot_d1_stuck;
					d2_stuck_1 = rows[0].tot_d2_stuck;
					lb_stuck_1 = rows[0].tot_lb_stuck;

					a1_assists_1 = rows[0].tot_a1_assisted;
					a2_assists_1 = rows[0].tot_a2_assisted;
					b1_assists_1 = rows[0].tot_b1_assisted;
					b2_assists_1 = rows[0].tot_b2_assisted;
					c1_assists_1 = rows[0].tot_c1_assisted;
					c2_assists_1 = rows[0].tot_c2_assisted;
					d1_assists_1 = rows[0].tot_d1_assisted;
					d2_assists_1 = rows[0].tot_d2_assisted;
					lb_assists_1 = rows[0].tot_lb_assisted;

					hang_made_1 = rows[0].total_hangs;
					hang_attempts_1 = rows[0].total_hang_attempts;
					challenge_made_1 = rows[0].total_challenges;
					challenge_attempts_1 = rows[0].total_challenge_attempts;

					auton_reaches_1 = rows[0].auton_reaches_total;
				});

				var no_auto_sql_1 = "SELECT * FROM matches WHERE team_num='"+ team_num_1 +"'";
				connection.query(no_auto_sql_1, function(err, rows, fields) {
					for(var x in rows)
					{
						if(rows[x].auton_score == '0')
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
					if(rows[0] != undefined)
					{
						team_name_2 = rows[0].team_name;
						avg_score_2 = rows[0].avg_contrib_score;
						avg_auton_score_2 = rows[0].avg_auton_score;
						perc_high_made_2 = rows[0].perc_high_made;
						auton_defense_crossings_2[0] = rows[0].auton_a1;
						auton_defense_crossings_2[1] = rows[0].auton_a2;
						auton_defense_crossings_2[2] = rows[0].auton_b1;
						auton_defense_crossings_2[3] = rows[0].auton_b2;
						auton_defense_crossings_2[4] = rows[0].auton_c1;
						auton_defense_crossings_2[5] = rows[0].auton_c2;
						auton_defense_crossings_2[6] = rows[0].auton_d1;
						auton_defense_crossings_2[7] = rows[0].auton_d2;
						auton_defense_crossings_2[8] = rows[0].auton_lb;
						auton_defense_attempts_2[0] = rows[0].auton_a1_attempts;
						auton_defense_attempts_2[1] = rows[0].auton_a2_attempts;
						auton_defense_attempts_2[2] = rows[0].auton_b1_attempts;
						auton_defense_attempts_2[3] = rows[0].auton_b2_attempts;
						auton_defense_attempts_2[4] = rows[0].auton_c1_attempts;
						auton_defense_attempts_2[5] = rows[0].auton_c2_attempts;
						auton_defense_attempts_2[6] = rows[0].auton_d1_attempts;
						auton_defense_attempts_2[7] = rows[0].auton_d2_attempts;
						auton_defense_attempts_2[8] = rows[0].auton_lb_attempts;
						auton_high_made_2 = rows[0].auton_high_made;
						auton_high_attempts_2 = rows[0].auton_high_attempts;
						auton_low_made_2 = rows[0].auton_low_made;
						auton_low_attempts_2 = rows[0].auton_low_attempts;
						high_made_2 = rows[0].avg_high_made;
						low_made_2 = rows[0].avg_low_made;
						high_attempts_2 = rows[0].avg_high_attempts;
						low_attempts_2 = rows[0].avg_low_attempts;
						avg_floor_intakes_2 = rows[0].avg_floor_intakes;
						avg_hp_intakes_2 = rows[0].avg_hp_intakes;
						avg_bully_rating_2 = rows[0].avg_bully_rating;
						knockouts_2 = rows[0].total_knockouts;
						fouls_2 = rows[0].total_fouls;
						deads_2 = rows[0].tot_dead;

						a1_success_2 = rows[0].tot_a1_successful;
						a1_attempts_2 = rows[0].tot_a1_attempts;
						a2_success_2 = rows[0].tot_a2_successful;
						a2_attempts_2 = rows[0].tot_a2_attempts;
						b1_success_2 = rows[0].tot_b1_successful;
						b1_attempts_2 = rows[0].tot_b1_attempts;
						b2_success_2 = rows[0].tot_b2_successful;
						b2_attempts_2 = rows[0].tot_b2_attempts;
						c1_success_2 = rows[0].tot_c1_successful;
						c1_attempts_2 = rows[0].tot_c1_attempts;
						c2_success_2 = rows[0].tot_c2_successful;
						c2_attempts_2 = rows[0].tot_c2_attempts;
						d1_success_2 = rows[0].tot_d1_successful;
						d1_attempts_2 = rows[0].tot_d1_attempts;
						d2_success_2 = rows[0].tot_d2_successful;
						d2_attempts_2 = rows[0].tot_d2_attempts;
						lb_success_2 = rows[0].tot_lb_successful;
						lb_attempts_2 = rows[0].tot_lb_attempts;

						a1_speed_2 = rows[0].avg_a1_speed;
						a2_speed_2 = rows[0].avg_a2_speed;
						b1_speed_2 = rows[0].avg_b1_speed;
						b2_speed_2 = rows[0].avg_b2_speed;
						c1_speed_2 = rows[0].avg_c1_speed;
						c2_speed_2 = rows[0].avg_c2_speed;
						d1_speed_2 = rows[0].avg_d1_speed;
						d2_speed_2 = rows[0].avg_d2_speed;
						lb_speed_2 = rows[0].avg_lb_speed;

						a1_stuck_2 = rows[0].tot_a1_stuck;
						a2_stuck_2 = rows[0].tot_a2_stuck;
						b1_stuck_2 = rows[0].tot_b1_stuck;
						b2_stuck_2 = rows[0].tot_b2_stuck;
						c1_stuck_2 = rows[0].tot_c1_stuck;
						c2_stuck_2 = rows[0].tot_c2_stuck;
						d1_stuck_2 = rows[0].tot_d1_stuck;
						d2_stuck_2 = rows[0].tot_d2_stuck;
						lb_stuck_2 = rows[0].tot_lb_stuck;

						a1_assists_2 = rows[0].tot_a1_assisted;
						a2_assists_2 = rows[0].tot_a2_assisted;
						b1_assists_2 = rows[0].tot_b1_assisted;
						b2_assists_2 = rows[0].tot_b2_assisted;
						c1_assists_2 = rows[0].tot_c1_assisted;
						c2_assists_2 = rows[0].tot_c2_assisted;
						d1_assists_2 = rows[0].tot_d1_assisted;
						d2_assists_2 = rows[0].tot_d2_assisted;
						lb_assists_2 = rows[0].tot_lb_assisted;

						hang_made_2 = rows[0].total_hangs;
						hang_attempts_2 = rows[0].total_hang_attempts;
						challenge_made_2 = rows[0].total_challenges;
						challenge_attempts_2 = rows[0].total_challenge_attempts;

						auton_reaches_2 = rows[0].auton_reaches_total;
					}
				});

				var no_auto_sql_2 = "SELECT * FROM matches WHERE team_num='"+ team_num_2 +"'";
				connection.query(no_auto_sql_2, function(err, rows, fields) {
					for(var x in rows)
					{
						if(rows[x].auton_score == '0')
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
					if(rows[0] != undefined)
					{
						team_name_3 = rows[0].team_name;
						avg_score_3 = rows[0].avg_contrib_score;
						avg_auton_score_3 = rows[0].avg_auton_score;
						perc_high_made_3 = rows[0].perc_high_made;
						auton_defense_crossings_3[0] = rows[0].auton_a1;
						auton_defense_crossings_3[1] = rows[0].auton_a2;
						auton_defense_crossings_3[2] = rows[0].auton_b1;
						auton_defense_crossings_3[3] = rows[0].auton_b2;
						auton_defense_crossings_3[4] = rows[0].auton_c1;
						auton_defense_crossings_3[5] = rows[0].auton_c2;
						auton_defense_crossings_3[6] = rows[0].auton_d1;
						auton_defense_crossings_3[7] = rows[0].auton_d2;
						auton_defense_crossings_3[8] = rows[0].auton_lb;
						auton_defense_attempts_3[0] = rows[0].auton_a1_attempts;
						auton_defense_attempts_3[1] = rows[0].auton_a2_attempts;
						auton_defense_attempts_3[2] = rows[0].auton_b1_attempts;
						auton_defense_attempts_3[3] = rows[0].auton_b2_attempts;
						auton_defense_attempts_3[4] = rows[0].auton_c1_attempts;
						auton_defense_attempts_3[5] = rows[0].auton_c2_attempts;
						auton_defense_attempts_3[6] = rows[0].auton_d1_attempts;
						auton_defense_attempts_3[7] = rows[0].auton_d2_attempts;
						auton_defense_attempts_3[8] = rows[0].auton_lb_attempts;
						auton_high_made_3 = rows[0].auton_high_made;
						auton_high_attempts_3 = rows[0].auton_high_attempts;
						auton_low_made_3 = rows[0].auton_low_made;
						auton_low_attempts_3 = rows[0].auton_low_attempts;
						high_made_3 = rows[0].avg_high_made;
						low_made_3 = rows[0].avg_low_made;
						high_attempts_3 = rows[0].avg_high_attempts;
						low_attempts_3 = rows[0].avg_low_attempts;
						avg_floor_intakes_3 = rows[0].avg_floor_intakes;
						avg_hp_intakes_3 = rows[0].avg_hp_intakes;
						avg_bully_rating_3 = rows[0].avg_bully_rating;
						knockouts_3 = rows[0].total_knockouts;
						fouls_3 = rows[0].total_fouls;
						deads_3 = rows[0].tot_dead;

						a1_success_3 = rows[0].tot_a1_successful;
						a1_attempts_3 = rows[0].tot_a1_attempts;
						a2_success_3 = rows[0].tot_a2_successful;
						a2_attempts_3 = rows[0].tot_a2_attempts;
						b1_success_3 = rows[0].tot_b1_successful;
						b1_attempts_3 = rows[0].tot_b1_attempts;
						b2_success_3 = rows[0].tot_b2_successful;
						b2_attempts_3 = rows[0].tot_b2_attempts;
						c1_success_3 = rows[0].tot_c1_successful;
						c1_attempts_3 = rows[0].tot_c1_attempts;
						c2_success_3 = rows[0].tot_c2_successful;
						c2_attempts_3 = rows[0].tot_c2_attempts;
						d1_success_3 = rows[0].tot_d1_successful;
						d1_attempts_3 = rows[0].tot_d1_attempts;
						d2_success_3 = rows[0].tot_d2_successful;
						d2_attempts_3 = rows[0].tot_d2_attempts;
						lb_success_3 = rows[0].tot_lb_successful;
						lb_attempts_3 = rows[0].tot_lb_attempts;

						a1_speed_3 = rows[0].avg_a1_speed;
						a2_speed_3 = rows[0].avg_a2_speed;
						b1_speed_3 = rows[0].avg_b1_speed;
						b2_speed_3 = rows[0].avg_b2_speed;
						c1_speed_3 = rows[0].avg_c1_speed;
						c2_speed_3 = rows[0].avg_c2_speed;
						d1_speed_3 = rows[0].avg_d1_speed;
						d2_speed_3 = rows[0].avg_d2_speed;
						lb_speed_3 = rows[0].avg_lb_speed;

						a1_stuck_3 = rows[0].tot_a1_stuck;
						a2_stuck_3 = rows[0].tot_a2_stuck;
						b1_stuck_3 = rows[0].tot_b1_stuck;
						b2_stuck_3 = rows[0].tot_b2_stuck;
						c1_stuck_3 = rows[0].tot_c1_stuck;
						c2_stuck_3 = rows[0].tot_c2_stuck;
						d1_stuck_3 = rows[0].tot_d1_stuck;
						d2_stuck_3 = rows[0].tot_d2_stuck;
						lb_stuck_3 = rows[0].tot_lb_stuck;

						a1_assists_3 = rows[0].tot_a1_assisted;
						a2_assists_3 = rows[0].tot_a2_assisted;
						b1_assists_3 = rows[0].tot_b1_assisted;
						b2_assists_3 = rows[0].tot_b2_assisted;
						c1_assists_3 = rows[0].tot_c1_assisted;
						c2_assists_3 = rows[0].tot_c2_assisted;
						d1_assists_3 = rows[0].tot_d1_assisted;
						d2_assists_3 = rows[0].tot_d2_assisted;
						lb_assists_3 = rows[0].tot_lb_assisted;

						hang_made_3 = rows[0].total_hangs;
						hang_attempts_3 = rows[0].total_hang_attempts;
						challenge_made_3 = rows[0].total_challenges;
						challenge_attempts_3 = rows[0].total_challenge_attempts;

						auton_reaches_3 = rows[0].auton_reaches_total;
					}
				});

				var no_auto_sql_3 = "SELECT * FROM matches WHERE team_num='"+ team_num_3 +"'";
				connection.query(no_auto_sql_3, function(err, rows, fields) {
					for(var x in rows)
					{
						if(rows[x].auton_score == '0')
						{
							no_autos_3++;
						}
					}
				});
			//}


				res.render('pages/alliance', {
					team_num_1: team_num_1,
					team_name_1: team_name_1,
					avg_score_1: avg_score_1,
					avg_auton_score_1: avg_auton_score_1,
					auton_pc_crosses_1: auton_defense_crossings_1[0],
					auton_cf_crosses_1: auton_defense_crossings_1[1],
					auton_m_crosses_1: auton_defense_crossings_1[2],
					auton_r_crosses_1: auton_defense_crossings_1[3],
					auton_db_crosses_1: auton_defense_crossings_1[4],
					auton_sp_crosses_1: auton_defense_crossings_1[5],
					auton_rw_crosses_1: auton_defense_crossings_1[6],
					auton_rt_crosses_1: auton_defense_crossings_1[7],
					auton_lb_crosses_1: auton_defense_crossings_1[8],
					auton_pc_attempts_1: auton_defense_attempts_1[0],
					auton_cf_attempts_1: auton_defense_attempts_1[1],
					auton_m_attempts_1: auton_defense_attempts_1[2],
					auton_r_attempts_1: auton_defense_attempts_1[3],
					auton_db_attempts_1: auton_defense_attempts_1[4],
					auton_sp_attempts_1: auton_defense_attempts_1[5],
					auton_rw_attempts_1: auton_defense_attempts_1[6],
					auton_rt_attempts_1: auton_defense_attempts_1[7],
					auton_lb_attempts_1: auton_defense_attempts_1[8],
					auton_high_made_1: auton_high_made_1,
					auton_high_attempts_1: auton_high_attempts_1,
					auton_low_made_1: auton_low_made_1,
					auton_low_attempts_1: auton_low_attempts_1,
					high_made_1: high_made_1,
					high_attempts_1: high_attempts_1,
					low_made_1: low_made_1,
					low_attempts_1: low_attempts_1,
					avg_intakes_1: avg_floor_intakes_1,
					avg_hp_intakes_1: avg_hp_intakes_1,
					knockouts_1: knockouts_1,
					bully_rating_1: avg_bully_rating_1,
					fouls_1: fouls_1,
					deads_1: deads_1,
					a1_success_1: a1_success_1,
					a1_attempts_1: a1_attempts_1,
					a2_success_1: a2_success_1,
					a2_attempts_1: a2_attempts_1,
					b1_success_1: b1_success_1,
					b1_attempts_1: b1_attempts_1,
					b2_success_1: b2_success_1,
					b2_attempts_1: b2_attempts_1,
					c1_success_1: c1_success_1,
					c1_attempts_1: c1_attempts_1,
					c2_success_1: c2_success_1,
					c2_attempts_1: c2_attempts_1,
					d1_success_1: d1_success_1,
					d1_attempts_1: d1_attempts_1,
					d2_success_1: d2_success_1,
					d2_attempts_1: d2_attempts_1,
					lb_success_1: lb_success_1,
					lb_attempts_1: lb_attempts_1,
					a1_speed_1: a1_speed_1,
					a2_speed_1: a2_speed_1,
					b1_speed_1: b1_speed_1,
					b2_speed_1: b2_speed_1,
					c1_speed_1: c1_speed_1,
					c2_speed_1: c2_speed_1,
					d1_speed_1: d1_speed_1,
					d2_speed_1: d2_speed_1,
					lb_speed_1: lb_speed_1,
					a1_stuck_1: a1_stuck_1,
					a2_stuck_1: a2_stuck_1,
					b1_stuck_1: b1_stuck_1,
					b2_stuck_1: b2_stuck_1,
					c1_stuck_1: c1_stuck_1,
					c2_stuck_1: c2_stuck_1,
					d1_stuck_1: d1_stuck_1,
					d2_stuck_1: d2_stuck_1,
					lb_stuck_1: lb_stuck_1,
					a1_assists_1: a1_assists_1,
					a2_assists_1: a2_assists_1,
					b1_assists_1: b1_assists_1,
					b2_assists_1: b2_assists_1,
					c1_assists_1: c1_assists_1,
					c2_assists_1: c2_assists_1,
					d1_assists_1: d1_assists_1,
					d2_assists_1: d2_assists_1,
					lb_assists_1: lb_assists_1,
					hang_made_1: hang_made_1,
					hang_attempts_1: hang_attempts_1,
					challenge_made_1: challenge_made_1,
					challenge_attempts_1: challenge_attempts_1,
					no_autos_1: no_autos_1,
					auton_reaches_1: auton_reaches_1,
					team_num_2: team_num_2,
					team_name_2: team_name_2,
					avg_score_2: avg_score_2,
					avg_auton_score_2: avg_auton_score_2,
					auton_pc_crosses_2: auton_defense_crossings_2[0],
					auton_cf_crosses_2: auton_defense_crossings_2[1],
					auton_m_crosses_2: auton_defense_crossings_2[2],
					auton_r_crosses_2: auton_defense_crossings_2[3],
					auton_db_crosses_2: auton_defense_crossings_2[4],
					auton_sp_crosses_2: auton_defense_crossings_2[5],
					auton_rw_crosses_2: auton_defense_crossings_2[6],
					auton_rt_crosses_2: auton_defense_crossings_2[7],
					auton_lb_crosses_2: auton_defense_crossings_2[8],
					auton_pc_attempts_2: auton_defense_attempts_2[0],
					auton_cf_attempts_2: auton_defense_attempts_2[1],
					auton_m_attempts_2: auton_defense_attempts_2[2],
					auton_r_attempts_2: auton_defense_attempts_2[3],
					auton_db_attempts_2: auton_defense_attempts_2[4],
					auton_sp_attempts_2: auton_defense_attempts_2[5],
					auton_rw_attempts_2: auton_defense_attempts_2[6],
					auton_rt_attempts_2: auton_defense_attempts_2[7],
					auton_lb_attempts_2: auton_defense_attempts_2[8],
					auton_high_made_2: auton_high_made_2,
					auton_high_attempts_2: auton_high_attempts_2,
					auton_low_made_2: auton_low_made_2,
					auton_low_attempts_2: auton_low_attempts_2,
					high_made_2: high_made_2,
					high_attempts_2: high_attempts_2,
					low_made_2: low_made_2,
					low_attempts_2: low_attempts_2,
					avg_intakes_2: avg_floor_intakes_2,
					avg_hp_intakes_2: avg_hp_intakes_2,
					knockouts_2: knockouts_2,
					bully_rating_2: avg_bully_rating_2,
					fouls_2: fouls_2,
					deads_2: deads_2,
					a1_success_2: a1_success_2,
					a1_attempts_2: a1_attempts_2,
					a2_success_2: a2_success_2,
					a2_attempts_2: a2_attempts_2,
					b1_success_2: b1_success_2,
					b1_attempts_2: b1_attempts_2,
					b2_success_2: b2_success_2,
					b2_attempts_2: b2_attempts_2,
					c1_success_2: c1_success_2,
					c1_attempts_2: c1_attempts_2,
					c2_success_2: c2_success_2,
					c2_attempts_2: c2_attempts_2,
					d1_success_2: d1_success_2,
					d1_attempts_2: d1_attempts_2,
					d2_success_2: d2_success_2,
					d2_attempts_2: d2_attempts_2,
					lb_success_2: lb_success_2,
					lb_attempts_2: lb_attempts_2,
					a1_speed_2: a1_speed_2,
					a2_speed_2: a2_speed_2,
					b1_speed_2: b1_speed_2,
					b2_speed_2: b2_speed_2,
					c1_speed_2: c1_speed_2,
					c2_speed_2: c2_speed_2,
					d1_speed_2: d1_speed_2,
					d2_speed_2: d2_speed_2,
					lb_speed_2: lb_speed_2,
					a1_stuck_2: a1_stuck_2,
					a2_stuck_2: a2_stuck_2,
					b1_stuck_2: b1_stuck_2,
					b2_stuck_2: b2_stuck_2,
					c1_stuck_2: c1_stuck_2,
					c2_stuck_2: c2_stuck_2,
					d1_stuck_2: d1_stuck_2,
					d2_stuck_2: d2_stuck_2,
					lb_stuck_2: lb_stuck_2,
					a1_assists_2: a1_assists_2,
					a2_assists_2: a2_assists_2,
					b1_assists_2: b1_assists_2,
					b2_assists_2: b2_assists_2,
					c1_assists_2: c1_assists_2,
					c2_assists_2: c2_assists_2,
					d1_assists_2: d1_assists_2,
					d2_assists_2: d2_assists_2,
					lb_assists_2: lb_assists_2,
					hang_made_2: hang_made_2,
					hang_attempts_2: hang_attempts_2,
					challenge_made_2: challenge_made_2,
					challenge_attempts_2: challenge_attempts_2,
					no_autos_2: no_autos_2,
					auton_reaches_2: auton_reaches_2,
					team_num_3: team_num_3,
					team_name_3: team_name_3,
					avg_score_3: avg_score_3,
					avg_auton_score_3: avg_auton_score_3,
					auton_pc_crosses_3: auton_defense_crossings_3[0],
					auton_cf_crosses_3: auton_defense_crossings_3[1],
					auton_m_crosses_3: auton_defense_crossings_3[2],
					auton_r_crosses_3: auton_defense_crossings_3[3],
					auton_db_crosses_3: auton_defense_crossings_3[4],
					auton_sp_crosses_3: auton_defense_crossings_3[5],
					auton_rw_crosses_3: auton_defense_crossings_3[6],
					auton_rt_crosses_3: auton_defense_crossings_3[7],
					auton_lb_crosses_3: auton_defense_crossings_3[8],
					auton_pc_attempts_3: auton_defense_attempts_3[0],
					auton_cf_attempts_3: auton_defense_attempts_3[1],
					auton_m_attempts_3: auton_defense_attempts_3[2],
					auton_r_attempts_3: auton_defense_attempts_3[3],
					auton_db_attempts_3: auton_defense_attempts_3[4],
					auton_sp_attempts_3: auton_defense_attempts_3[5],
					auton_rw_attempts_3: auton_defense_attempts_3[6],
					auton_rt_attempts_3: auton_defense_attempts_3[7],
					auton_lb_attempts_3: auton_defense_attempts_3[8],
					auton_high_made_3: auton_high_made_3,
					auton_high_attempts_3: auton_high_attempts_3,
					auton_low_made_3: auton_low_made_3,
					auton_low_attempts_3: auton_low_attempts_3,
					high_made_3: high_made_3,
					high_attempts_3: high_attempts_3,
					low_made_3: low_made_3,
					low_attempts_3: low_attempts_3,
					avg_intakes_3: avg_floor_intakes_3,
					avg_hp_intakes_3: avg_hp_intakes_3,
					knockouts_3: knockouts_3,
					bully_rating_3: avg_bully_rating_3,
					fouls_3: fouls_3,
					deads_3: deads_3,
					a1_success_3: a1_success_3,
					a1_attempts_3: a1_attempts_3,
					a2_success_3: a2_success_3,
					a2_attempts_3: a2_attempts_3,
					b1_success_3: b1_success_3,
					b1_attempts_3: b1_attempts_3,
					b2_success_3: b2_success_3,
					b2_attempts_3: b2_attempts_3,
					c1_success_3: c1_success_3,
					c1_attempts_3: c1_attempts_3,
					c2_success_3: c2_success_3,
					c2_attempts_3: c2_attempts_3,
					d1_success_3: d1_success_3,
					d1_attempts_3: d1_attempts_3,
					d2_success_3: d2_success_3,
					d2_attempts_3: d2_attempts_3,
					lb_success_3: lb_success_3,
					lb_attempts_3: lb_attempts_3,
					a1_speed_3: a1_speed_3,
					a2_speed_3: a2_speed_3,
					b1_speed_3: b1_speed_3,
					b2_speed_3: b2_speed_3,
					c1_speed_3: c1_speed_3,
					c2_speed_3: c2_speed_3,
					d1_speed_3: d1_speed_3,
					d2_speed_3: d2_speed_3,
					lb_speed_3: lb_speed_3,
					a1_stuck_3: a1_stuck_3,
					a2_stuck_3: a2_stuck_3,
					b1_stuck_3: b1_stuck_3,
					b2_stuck_3: b2_stuck_3,
					c1_stuck_3: c1_stuck_3,
					c2_stuck_3: c2_stuck_3,
					d1_stuck_3: d1_stuck_3,
					d2_stuck_3: d2_stuck_3,
					lb_stuck_3: lb_stuck_3,
					a1_assists_3: a1_assists_3,
					a2_assists_3: a2_assists_3,
					b1_assists_3: b1_assists_3,
					b2_assists_3: b2_assists_3,
					c1_assists_3: c1_assists_3,
					c2_assists_3: c2_assists_3,
					d1_assists_3: d1_assists_3,
					d2_assists_3: d2_assists_3,
					lb_assists_3: lb_assists_3,
					hang_made_3: hang_made_3,
					hang_attempts_3: hang_attempts_3,
					challenge_made_3: challenge_made_3,
					challenge_attempts_3: challenge_attempts_3,
					no_autos_3: no_autos_3,
					auton_reaches_3: auton_reaches_3
				});
			}
		});

        router.get('/team/:team_num', function(req,res) {
            var team_num = req.params.team_num;
            var team_name = "";
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
			//updateContribScores(team_num);
            updateTeams(team_num);


            var get_data = "SELECT * FROM teams WHERE team_num='"+ team_num +"'";
            var next_team = "SELECT * FROM teams WHERE team_num > '"+ team_num +"' ORDER BY team_num LIMIT 1";
            var previous_team = "SELECT * FROM teams WHERE team_num < '"+ team_num +"' ORDER BY team_num DESC LIMIT 1";
            var get_graph_data = "SELECT * FROM matches WHERE team_num='"+ team_num +"' ORDER BY match_num";

            connection.query(get_data, function(err, rows, fields) {
              team_name = rows[0].team_name;
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
                    auto_high_goal_trend: auto_high_goal_trend
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
            var fouls = Number(req.body.fouls);
            var dead = Number(req.body.dead);
            var climb = Number(req.body.climb);
            var failed_climb = Number(req.body.failed_climb);

            var auto_kpa = auto_high_made + 1/3 * auto_low_made;
            var tot_kpa = auto_kpa + 1/3 * tele_high_made + 1/9 * tele_low_made;

            console.log(auto_kpa + ", " + tot_kpa);

            var matches_sql_v2 = "INSERT INTO `matches` (`match_num`, `team_num`, `auto_high_made`, `auto_high_missed`, " +
              "`auto_low_made`, `auto_low_missed`, `baseline_cross`, `auto_hopper_intake`, `auto_floor_gear_intake`, " +
              "`auto_floor_ball_intake`, `auto_gears_scored`, `auto_gears_missed`, `tele_high_made`, `tele_high_missed`, `tele_low_made`, " +
              "`tele_low_missed`, `num_cycles`, `tele_floor_ball_intake`, `hp_ball_intake`, `tele_hopper_intake`, `tele_gears_scored`, " +
              "`tele_gears_missed`, `tele_floor_gear_intake`, `hp_gear_intake`, `fouls`, `dead`, `climb`, `failed_climb`, `auto_contrib_kpa`, " +
              "`contrib_kpa`) VALUES (" + match_num + ", " + team_num + ", " + auto_high_made + ", " + auto_high_missed + ", " + auto_low_made +
              ", " + auto_low_missed + ", " + baseline_cross + ", " + auto_hopper_intake + ", " + auto_floor_gear_intake +
              ", " + auto_floor_ball_intake + ", " + auto_gears_scored + ", " + auto_gears_missed + ", " + tele_high_made +
              ", " + tele_high_missed + ", " + tele_low_made + ", " + tele_low_missed + ", " + num_cycles + ", " + tele_floor_ball_intake +
              ", " + hp_ball_intake + ", " + tele_hopper_intake + ", " + tele_gears_scored + ", " + tele_gears_missed + ", " + tele_floor_gear_intake +
              ", " + hp_gear_intake + ", " + fouls + ", " + dead + ", " + climb + ", " + failed_climb + "," + auto_kpa + ", " + tot_kpa + ");"

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
