//where all the page connections happen and back-end javascript
var mysql = require("mysql");



function REST_ROUTER(router, connection, md5)
{
    var self = this;
    self.handleRoutes(router, connection, md5);
}

REST_ROUTER.prototype.handleRoutes = function(router, connection, md5)
{

        var most_recent = 0;

        // index page
        router.get('/', function(req, res) {       //PAGE RENDER
            var team_table = "";
            var team_score_table = "";
            var get_teams = "SELECT * FROM teams";

            //TEAM QUERY
            connection.query(get_teams, function(err,rows,fields) {
                for(var x in rows)
                {
                    team_table += "<tr class='clickable-row' data-href='/team/"+ rows[x].team_number +"'><td>"+ rows[x].team_number +"</td><td>"+ rows[x].team_name +"</td></tr>";
                }

            });

            //CONTRIB SCORE QUERY
            var get_contrib_score_rank = "SELECT * FROM teams ORDER BY avg_contrib_score DESC, team_number ASC";
            connection.query(get_contrib_score_rank, function(err, rows, fields) {
                for(var x in rows)
                {
                    team_score_table += "<tr title='"+ rows[x].team_name +"' class='clickable-row' data-href='/team/"+ rows[x].team_number +"'><td>"+ rows[x].team_number +"</td><td>"+ rows[x].avg_contrib_score +"</td><td>"+ rows[x].avg_driver_rating +"</td></tr>";
                }
                res.render('pages/index', {
                    teams1: team_table,
                    teams2: team_score_table
                });
            });


        });

		router.get('/alliance/:team_1,:team_2,:team_3', function(req, res) {
			console.log(req.params.team_1);
			console.log(req.params.team_2);
			console.log(req.params.team_3);

			var team_number_1 = !Number.isNaN(req.params.team_1) ? Number(req.params.team_1) : 0;
            var team_name_1 = "";
            var next_team_number_1 = 0;
            var previous_team_number_1 = 0;
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

			var team_number_2 = !Number.isNaN(req.params.team_2) ? Number(req.params.team_2) : 0;
            var team_name_2 = "";
            var next_team_number_2 = 0;
            var previous_team_number_2 = 0;
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

			var team_number_3 = !Number.isNaN(req.params.team_3) ? Number(req.params.team_3) : 0;
            var team_name_3 = "";
            var next_team_number_3 = 0;
            var previous_team_number_3 = 0;
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

			if(team_number_1 != 0 && team_number_2 != 0 && team_number_3 != 0)
			{
            updateContribScores(team_number_1);
			updateContribScores(team_number_2);
			updateContribScores(team_number_3);
            updateTeams(team_number_1);
			updateTeams(team_number_2);
			updateTeams(team_number_3);

			//if(!isNaN(team_number_1))
			//{
				var get_data_1 = "SELECT * FROM teams WHERE team_number='"+ team_number_1 +"'";

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

				var no_auto_sql_1 = "SELECT * FROM matches WHERE team_number='"+ team_number_1 +"'";
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

			//if(!isNaN(team_number_2))
			//{
				var get_data_2 = "SELECT * FROM teams WHERE team_number='"+ team_number_2 +"'";

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

				var no_auto_sql_2 = "SELECT * FROM matches WHERE team_number='"+ team_number_2 +"'";
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

			//if(!isNaN(team_number_3))
			//{
				var get_data_3 = "SELECT * FROM teams WHERE team_number='"+ team_number_3 +"'";

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

				var no_auto_sql_3 = "SELECT * FROM matches WHERE team_number='"+ team_number_3 +"'";
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
					team_number_1: team_number_1,
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
					team_number_2: team_number_2,
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
					team_number_3: team_number_3,
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

        router.get('/team/:team_number', function(req,res) {
            var team_number = req.params.team_number;
            var team_name = "";
            var next_team_number = 0;
            var previous_team_number = 0;
            var avg_score = 0;
            var avg_auton_score = 0;
            var perc_high_made = 0;
            var high_made = 0;
            var low_made = 0;
            var high_attempts = 0;
            var low_attempts = 0;
            var auton_defense_crossings = [0,0,0,0,0,0,0,0,0];
            var auton_defense_attempts = [0,0,0,0,0,0,0,0,0];
            var perferred_defense = "none";
            var auton_high_made = 0;
            var auton_high_attempts = 0;
            var auton_low_made = 0;
            var auton_low_attempts = 0;
            var avg_floor_intakes = 0;
            var avg_hp_intakes = 0;
            var knockouts = 0;
            var avg_bully_rating = 0;
            var fouls = 0;
            var deads = 0;
            var a1_success = 0;
            var a1_attempts = 0;
            var a2_success = 0;
            var a2_attempts = 0;
            var b1_success = 0;
            var b1_attempts = 0;
            var b2_success = 0;
            var b2_attempts = 0;
            var c1_success = 0;
            var c1_attempts = 0;
            var c2_success = 0;
            var c2_attempts = 0;
            var d1_success = 0;
            var d1_attempts = 0;
            var d2_success = 0;
            var d2_attempts = 0;
            var lb_success = 0;
            var lb_attempts = 0;

            var a1_speed = 0;
            var a2_speed = 0;
            var b1_speed = 0;
            var b2_speed = 0;
            var c1_speed = 0;
            var c2_speed = 0;
            var d1_speed = 0;
            var d2_speed = 0;
            var lb_speed = 0;

            var a1_stuck = 0;
            var a2_stuck = 0;
            var b1_stuck = 0;
            var b2_stuck = 0;
            var c1_stuck = 0;
            var c2_stuck = 0;
            var d1_stuck = 0;
            var d2_stuck = 0;
            var lb_stuck = 0;

			var a1_assists = 0;
            var a2_assists = 0;
            var b1_assists = 0;
            var b2_assists = 0;
            var c1_assists = 0;
            var c2_assists = 0;
            var d1_assists = 0;
            var d2_assists = 0;
            var lb_assists = 0;

            var hang_made = 0;
            var hang_attempts = 0;
            var challenge_made = 0;
            var challenge_attempts = 0;

            var auton_reaches = 0;
            var no_autos = 0;

            var trend_labels = "";
            var trend_data = "";
            var high_goal_trend = "";
			updateContribScores(team_number);
            updateTeams(team_number);


            var get_data = "SELECT * FROM teams WHERE team_number='"+ team_number +"'";
            var next_team = "SELECT * FROM teams WHERE team_number > '"+ team_number +"' ORDER BY team_number LIMIT 1";
            var previous_team = "SELECT * FROM teams WHERE team_number < '"+ team_number +"' ORDER BY team_number DESC LIMIT 1";
            var get_graph_data = "SELECT * FROM matches WHERE team_number='"+ team_number +"' ORDER BY match_number";

            connection.query(get_data, function(err, rows, fields) {
                team_name = rows[0].team_name;
                avg_score = rows[0].avg_contrib_score;
                avg_auton_score = rows[0].avg_auton_score;
                perc_high_made = rows[0].perc_high_made;
                auton_defense_crossings[0] = rows[0].auton_a1;
                auton_defense_crossings[1] = rows[0].auton_a2;
                auton_defense_crossings[2] = rows[0].auton_b1;
                auton_defense_crossings[3] = rows[0].auton_b2;
                auton_defense_crossings[4] = rows[0].auton_c1;
                auton_defense_crossings[5] = rows[0].auton_c2;
                auton_defense_crossings[6] = rows[0].auton_d1;
                auton_defense_crossings[7] = rows[0].auton_d2;
                auton_defense_crossings[8] = rows[0].auton_lb;
                auton_defense_attempts[0] = rows[0].auton_a1_attempts;
                auton_defense_attempts[1] = rows[0].auton_a2_attempts;
                auton_defense_attempts[2] = rows[0].auton_b1_attempts;
                auton_defense_attempts[3] = rows[0].auton_b2_attempts;
                auton_defense_attempts[4] = rows[0].auton_c1_attempts;
                auton_defense_attempts[5] = rows[0].auton_c2_attempts;
                auton_defense_attempts[6] = rows[0].auton_d1_attempts;
                auton_defense_attempts[7] = rows[0].auton_d2_attempts;
                auton_defense_attempts[8] = rows[0].auton_lb_attempts;
                auton_high_made = rows[0].auton_high_made;
                auton_high_attempts = rows[0].auton_high_attempts;
                auton_low_made = rows[0].auton_low_made;
                auton_low_attempts = rows[0].auton_low_attempts;
                high_made = rows[0].avg_high_made;
                low_made = rows[0].avg_low_made;
                high_attempts = rows[0].avg_high_attempts;
                low_attempts = rows[0].avg_low_attempts;
                avg_floor_intakes = rows[0].avg_floor_intakes;
                avg_hp_intakes = rows[0].avg_hp_intakes;
                avg_bully_rating = rows[0].avg_bully_rating;
                knockouts = rows[0].total_knockouts;
                fouls = rows[0].total_fouls;
                deads = rows[0].tot_dead;

                a1_success = rows[0].tot_a1_successful;
                a1_attempts = rows[0].tot_a1_attempts;
                a2_success = rows[0].tot_a2_successful;
                a2_attempts = rows[0].tot_a2_attempts;
                b1_success = rows[0].tot_b1_successful;
                b1_attempts = rows[0].tot_b1_attempts;
                b2_success = rows[0].tot_b2_successful;
                b2_attempts = rows[0].tot_b2_attempts;
                c1_success = rows[0].tot_c1_successful;
                c1_attempts = rows[0].tot_c1_attempts;
                c2_success = rows[0].tot_c2_successful;
                c2_attempts = rows[0].tot_c2_attempts;
                d1_success = rows[0].tot_d1_successful;
                d1_attempts = rows[0].tot_d1_attempts;
                d2_success = rows[0].tot_d2_successful;
                d2_attempts = rows[0].tot_d2_attempts;
                lb_success = rows[0].tot_lb_successful;
                lb_attempts = rows[0].tot_lb_attempts;

                a1_speed = rows[0].avg_a1_speed;
                a2_speed = rows[0].avg_a2_speed;
                b1_speed = rows[0].avg_b1_speed;
                b2_speed = rows[0].avg_b2_speed;
                c1_speed = rows[0].avg_c1_speed;
                c2_speed = rows[0].avg_c2_speed;
                d1_speed = rows[0].avg_d1_speed;
                d2_speed = rows[0].avg_d2_speed;
                lb_speed = rows[0].avg_lb_speed;

                a1_stuck = rows[0].tot_a1_stuck;
                a2_stuck = rows[0].tot_a2_stuck;
                b1_stuck = rows[0].tot_b1_stuck;
                b2_stuck = rows[0].tot_b2_stuck;
                c1_stuck = rows[0].tot_c1_stuck;
                c2_stuck = rows[0].tot_c2_stuck;
                d1_stuck = rows[0].tot_d1_stuck;
                d2_stuck = rows[0].tot_d2_stuck;
                lb_stuck = rows[0].tot_lb_stuck;

				a1_assists = rows[0].tot_a1_assisted;
                a2_assists = rows[0].tot_a2_assisted;
                b1_assists = rows[0].tot_b1_assisted;
                b2_assists = rows[0].tot_b2_assisted;
                c1_assists = rows[0].tot_c1_assisted;
                c2_assists = rows[0].tot_c2_assisted;
                d1_assists = rows[0].tot_d1_assisted;
                d2_assists = rows[0].tot_d2_assisted;
                lb_assists = rows[0].tot_lb_assisted;

                hang_made = rows[0].total_hangs;
                hang_attempts = rows[0].total_hang_attempts;
                challenge_made = rows[0].total_challenges;
                challenge_attempts = rows[0].total_challenge_attempts;

                auton_reaches = rows[0].auton_reaches_total;



            });

            var no_auto_sql = "SELECT * FROM matches WHERE team_number='"+ team_number +"'";
            connection.query(no_auto_sql, function(err, rows, fields) {
                for(var x in rows)
                {
                    if(rows[x].auton_score == '0')
                    {
                        no_autos++;
                    }
                }

            });


            var last_team;
            var first_team;
            var get_last_team_sql = "SELECT team_number FROM teams WHERE 1=1 ORDER BY team_number DESC";
            var get_first_team_sql = "SELECT team_number FROM teams WHERE 1=1";
            connection.query(get_last_team_sql, function(err, rows, fields) {
                 last_team = rows[0].team_number;
            });
            connection.query(get_first_team_sql, function(err, rows, fields) {
                first_team = rows[0].team_number;
            });

            connection.query(next_team, function(err, rows, fields) {
                if(team_number == last_team)
                    next_team_number = first_team;
                else
                    next_team_number = rows[0].team_number;
            });

            connection.query(previous_team, function(err, rows, fields) {
                if(team_number == first_team)
                    previous_team_number = last_team;
                else
                    previous_team_number = rows[0].team_number;
            });

            connection.query(get_graph_data, function(err, rows, fields){
                for(var x in rows)
                {
                    trend_labels += rows[x].match_number + ", ";
                    trend_data += rows[x].contributed_score + ", ";
                    high_goal_trend += rows[x].tele_high_made + ", ";
                }
                console.log(high_goal_trend);

                res.render('pages/team', {
                    team_number: team_number,
                    team_name: team_name,
                    next_team: next_team_number,
                    previous_team: previous_team_number,
                    avg_score: avg_score,
                    avg_auton_score: avg_auton_score,
                    auton_pc_crosses: auton_defense_crossings[0],
                    auton_cf_crosses: auton_defense_crossings[1],
                    auton_m_crosses: auton_defense_crossings[2],
                    auton_r_crosses: auton_defense_crossings[3],
                    auton_db_crosses: auton_defense_crossings[4],
                    auton_sp_crosses: auton_defense_crossings[5],
                    auton_rw_crosses: auton_defense_crossings[6],
                    auton_rt_crosses: auton_defense_crossings[7],
                    auton_lb_crosses: auton_defense_crossings[8],
                    auton_pc_attempts: auton_defense_attempts[0],
                    auton_cf_attempts: auton_defense_attempts[1],
                    auton_m_attempts: auton_defense_attempts[2],
                    auton_r_attempts: auton_defense_attempts[3],
                    auton_db_attempts: auton_defense_attempts[4],
                    auton_sp_attempts: auton_defense_attempts[5],
                    auton_rw_attempts: auton_defense_attempts[6],
                    auton_rt_attempts: auton_defense_attempts[7],
                    auton_lb_attempts: auton_defense_attempts[8],
                    auton_high_made: auton_high_made,
                    auton_high_attempts: auton_high_attempts,
                    auton_low_made: auton_low_made,
                    auton_low_attempts: auton_low_attempts,
                    high_made: high_made,
                    high_attempts: high_attempts,
                    low_made: low_made,
                    low_attempts: low_attempts,
                    avg_intakes: avg_floor_intakes,
                    avg_hp_intakes: avg_hp_intakes,
                    knockouts: knockouts,
                    trend_data: trend_data,
                    bully_rating: avg_bully_rating,
                    fouls: fouls,
                    deads: deads,
                    a1_success: a1_success,
                    a1_attempts: a1_attempts,
                    a2_success: a2_success,
                    a2_attempts: a2_attempts,
                    b1_success: b1_success,
                    b1_attempts: b1_attempts,
                    b2_success: b2_success,
                    b2_attempts: b2_attempts,
                    c1_success: c1_success,
                    c1_attempts: c1_attempts,
                    c2_success: c2_success,
                    c2_attempts: c2_attempts,
                    d1_success: d1_success,
                    d1_attempts: d1_attempts,
                    d2_success: d2_success,
                    d2_attempts: d2_attempts,
                    lb_success: lb_success,
                    lb_attempts: lb_attempts,
                    a1_speed: a1_speed,
                    a2_speed: a2_speed,
                    b1_speed: b1_speed,
                    b2_speed: b2_speed,
                    c1_speed: c1_speed,
                    c2_speed: c2_speed,
                    d1_speed: d1_speed,
                    d2_speed: d2_speed,
                    lb_speed: lb_speed,
                    a1_stuck: a1_stuck,
                    a2_stuck: a2_stuck,
                    b1_stuck: b1_stuck,
                    b2_stuck: b2_stuck,
                    c1_stuck: c1_stuck,
                    c2_stuck: c2_stuck,
                    d1_stuck: d1_stuck,
                    d2_stuck: d2_stuck,
                    lb_stuck: lb_stuck,
					a1_assists: a1_assists,
                    a2_assists: a2_assists,
                    b1_assists: b1_assists,
                    b2_assists: b2_assists,
                    c1_assists: c1_assists,
                    c2_assists: c2_assists,
                    d1_assists: d1_assists,
                    d2_assists: d2_assists,
                    lb_assists: lb_assists,
                    hang_made: hang_made,
                    hang_attempts: hang_attempts,
                    challenge_made: challenge_made,
                    challenge_attempts: challenge_attempts,
                    no_autos: no_autos,
                    auton_reaches: auton_reaches,
                    trend_labels: trend_labels,
                    high_goal_trend: high_goal_trend
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
            var auto_gear_intake = Number(req.body.auto_gear_intake);
            var auto_floor_intake = Number(req.body.auto_floor_intake);
            var auto_gears_scored = Number(req.body.auto_gears_scored);
            var tele_high_made = Number(req.body.tele_high_made);
            var tele_high_missed = Number(req.body.tele_high_missed);
            var tele_low_made = Number(req.body.tele_low_made);
            var tele_low_missed = Number(req.body.tele_low_missed);
            var num_cycles = Number(req.body.num_cycles);
            var floor_ball_intake = Number(req.body.floor_ball_intake);
            var hp_ball_intake = Number(req.body.hp_ball_intake);
            var hopper_intake = Number(req.body.hopper_intake);
            var gears_scored = Number(req.body.gears_scored);
            var gears_missed = Number(req.body.gears_missed);
            var floor_gear_intake = Number(req.body.floor_gear_intake);
            var hp_gear_intake = Number(req.body.hp_gear_intake);
            var fouls = Number(req.body.fouls);
            var dead = Number(req.body.dead);
            var climb = Number(req.body.climb);
            var failed_climb = Number(req.body.failed_climb);

            var matches_sql_v2 = "INSERT INTO `matches` (`match_num`, `team_num`, `auto_high_made`, `auto_high_missed`, " +
              "`auto_low_made`, `auto_low_missed`, `baseline_cross`, `auto_hopper_intake`, `auto_gear_intake`, " +
              "`auto_floor_intake`, `auto_gears_scored`, `tele_high_made`, `tele_high_missed`, `tele_low_made`, " +
              "`tele_low_missed`, `num_cycles`, `floor_ball_intake`, `hp_ball_intake`, `hopper_intake`, `gears_scored`, " +
              "`gears_missed`, `floor_gear_intake`, `hp_gear_intake`, `fouls`, `dead`, `climb`, `failed_climb`) VALUES" +
              "(" + match_num + ", " + team_num + ", " + auto_high_made + ", " + auto_high_missed + ", " + auto_low_made +
              ", " + auto_low_missed + ", " + baseline_cross + ", " + auto_hopper_intake + ", " + auto_gear_intake +
              ", " + auto_floor_intake + ", " + auto_gears_scored + ", " + tele_high_made + ", " + tele_high_missed +
              ", " + tele_low_made + ", " + tele_low_missed + ", " + num_cycles + ", " + floor_ball_intake +
              ", " + hp_ball_intake + ", " + hopper_intake + ", " + gears_scored + ", " + gears_missed + ", " + floor_gear_intake +
              ", " + hp_gear_intake + ", " + fouls + ", " + dead + ", " + climb + ", " + failed_climb + ");"

            connection.query(matches_sql_v2, function(err) {
                if(err)
                {
                    most_recent = -1;
                    console.log(err);
                    res.redirect('/data-entry');
                }
                else
                {
                    // updateTeams(team_number);
                    most_recent = team_num;
                    res.redirect('/data-entry');
                }
            });


        });


		function updateContribScores(team_number)
		{
			grab_data_sql = "SELECT * FROM matches WHERE team_number='"+ team_number +"'";

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
					var update_sql_script = "UPDATE matches SET contributed_score='"+ dis_contributed_score +"' WHERE team_number='"+ team_number +"' AND match_number='"+ rows[x].match_number +"'";


					connection.query(update_sql_script);
				}
            });

		}

        function updateTeams(team_number)
        {
            console.log("updating data into teams for team: " + team_number);
            var team_sql = "UPDATE teams SET                                                                                                 num_matches=(SELECT COUNT(*)  FROM matches WHERE team_number='"+ team_number +"'),                                                            avg_contrib_score=(SELECT AVG(contributed_score) FROM matches WHERE team_number='"+ team_number +"'),                                         avg_floor_intakes=(SELECT AVG(tele_floor_intake) FROM matches WHERE team_number='"+ team_number +"'),                                         perc_high_made=100*((SELECT SUM(tele_high_made) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(tele_high_made)+SUM(tele_high_missed) FROM matches WHERE team_number='"+ team_number +"')),                                               total_high_made=(SELECT SUM(tele_high_made) FROM matches WHERE team_number='"+ team_number +"'),                                             total_high_attempts=(SELECT SUM(tele_high_made)+SUM(tele_high_missed) FROM matches WHERE team_number='"+ team_number +"'),                   avg_high_made=(SELECT AVG(tele_high_made) FROM matches WHERE team_number='"+ team_number +"'),                                             avg_high_attempts=(SELECT AVG(tele_high_made + tele_high_missed) FROM matches WHERE team_number='"+ team_number +"'), avg_low_made=(SELECT AVG(tele_low_made) FROM matches WHERE team_number='"+ team_number +"'),                                             avg_low_attempts=(SELECT AVG(tele_low_made + tele_low_missed) FROM matches WHERE team_number='"+ team_number +"'),                     perc_low_goals=100*((SELECT SUM(tele_low_made) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(tele_low_made)+SUM(tele_low_missed) FROM matches WHERE team_number='"+ team_number +"')),                                                 total_low_made=(SELECT SUM(tele_low_made) FROM matches WHERE team_number='"+ team_number +"'),                                                total_low_attempts=(SELECT SUM(tele_low_made)+SUM(tele_low_missed) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                         perc_a1_cross=100*(SELECT SUM(a1_successful) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(a1_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                                                         tot_a1_successful=(SELECT SUM(a1_successful) FROM matches WHERE team_number='"+ team_number +"'),                                             tot_a1_attempts=(SELECT SUM(a1_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                 tot_a1_stuck=(SELECT SUM(a1_stuck) FROM matches WHERE team_number='"+ team_number +"'),                                                       tot_a1_assisted=(SELECT SUM(a1_assists) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                                                                                                                                                                                             perc_a2_cross=100*(SELECT SUM(a2_successful) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(a2_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                                                         tot_a2_successful=(SELECT SUM(a2_successful) FROM matches WHERE team_number='"+ team_number +"'),                                             tot_a2_attempts=(SELECT SUM(a2_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                 tot_a2_stuck=(SELECT SUM(a2_stuck) FROM matches WHERE team_number='"+ team_number +"'),                                                       tot_a2_assisted=(SELECT SUM(a2_assists) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                                                                                                                                                                                               perc_b1_cross=100*(SELECT SUM(b1_successful) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(b1_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                                                         tot_b1_successful=(SELECT SUM(b1_successful) FROM matches WHERE team_number='"+ team_number +"'),                                             tot_b1_attempts=(SELECT SUM(b1_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                 tot_b1_stuck=(SELECT SUM(b1_stuck) FROM matches WHERE team_number='"+ team_number +"'),                                                       tot_b1_assisted=(SELECT SUM(b1_assists) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                                                                                                                                                                                               perc_b2_cross=100*(SELECT SUM(b2_successful) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(b2_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                                                         tot_b2_successful=(SELECT SUM(b2_successful) FROM matches WHERE team_number='"+ team_number +"'),                                             tot_b2_attempts=(SELECT SUM(b2_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                 tot_b2_stuck=(SELECT SUM(b2_stuck) FROM matches WHERE team_number='"+ team_number +"'),                                                       tot_b2_assisted=(SELECT SUM(b2_assists) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                                                                                                                                                                                               perc_c1_cross=100*(SELECT SUM(c1_successful) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(c1_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                                                         tot_c1_successful=(SELECT SUM(c1_successful) FROM matches WHERE team_number='"+ team_number +"'),                                             tot_c1_attempts=(SELECT SUM(c1_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                 tot_c1_stuck=(SELECT SUM(c1_stuck) FROM matches WHERE team_number='"+ team_number +"'),                                                       tot_c1_assisted=(SELECT SUM(c1_assists) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                                                                                                                                                                                               perc_c2_cross=100*(SELECT SUM(c2_successful) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(c2_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                                                         tot_c2_successful=(SELECT SUM(c2_successful) FROM matches WHERE team_number='"+ team_number +"'),                                             tot_c2_attempts=(SELECT SUM(c2_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                 tot_c2_stuck=(SELECT SUM(c2_stuck) FROM matches WHERE team_number='"+ team_number +"'),                                                       tot_c2_assisted=(SELECT SUM(c2_assists) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                                                                                                                                                                                               perc_d1_cross=100*(SELECT SUM(d1_successful) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(d1_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                                                         tot_d1_successful=(SELECT SUM(d1_successful) FROM matches WHERE team_number='"+ team_number +"'),                                             tot_d1_attempts=(SELECT SUM(d1_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                 tot_d1_stuck=(SELECT SUM(d1_stuck) FROM matches WHERE team_number='"+ team_number +"'),                                                       tot_d1_assisted=(SELECT SUM(d1_assists) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                                                             perc_d2_cross=100*(SELECT SUM(d2_successful) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(d2_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                                                         tot_d2_successful=(SELECT SUM(d2_successful) FROM matches WHERE team_number='"+ team_number +"'),                                             tot_d2_attempts=(SELECT SUM(d2_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                 tot_d2_stuck=(SELECT SUM(d2_stuck) FROM matches WHERE team_number='" + team_number + "'), ";

        team_sql += "tot_d2_assisted=(SELECT SUM(d2_assists) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                                                               perc_lb_cross=100*(SELECT SUM(lb_successful) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(lb_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                                                         tot_lb_successful=(SELECT SUM(lb_successful) FROM matches WHERE team_number='"+ team_number +"'),                                             tot_lb_attempts=(SELECT SUM(lb_attempts) FROM matches WHERE team_number='"+ team_number +"'),                                                 tot_lb_stuck=(SELECT SUM(lb_stuck) FROM matches WHERE team_number='" + team_number + "'),                                           tot_lb_assisted=(SELECT SUM(lb_assists) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                                                               perc_hangs=100*(SELECT SUM(tele_hang) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(tele_hang)+SUM(tele_hang_failed) FROM matches WHERE team_number='"+ team_number +"'),                                                                                               total_hangs=(SELECT SUM(tele_hang) FROM matches WHERE team_number='"+ team_number +"'),                                                       total_hang_attempts=(SELECT SUM(tele_hang)+SUM(tele_hang_failed) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                                       perc_challenges=100*(SELECT SUM(tele_challenge) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(tele_challenge)+SUM(tele_challenge_failed) FROM matches WHERE team_number='"+ team_number +"'),                                            total_challenges=(SELECT SUM(tele_challenge) FROM matches WHERE team_number='"+ team_number +"'),                                             total_challenge_attempts=(SELECT SUM(tele_challenge)+SUM(tele_challenge_failed) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                      total_knockouts=(SELECT SUM(tele_knock_out) FROM matches WHERE team_number='"+ team_number +"'),                                             total_fouls=(SELECT SUM(fouls_noticed) FROM matches WHERE team_number='"+ team_number +"'),                                                   avg_driver_rating=(SELECT AVG(driver_rating) FROM matches WHERE team_number='"+ team_number +"'),                                            avg_bully_rating=(SELECT AVG(bully_rating) FROM matches WHERE team_number='"+ team_number +"' AND bully_rating<>0),                            avg_auton_score=(SELECT AVG(auton_score) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                                                                                       auton_a1_attempts=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='PC'),          auton_a2_attempts=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='CF'),         auton_b1_attempts=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='M'),         auton_b2_attempts=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='R'),          auton_c1_attempts=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='DB'),         auton_c2_attempts=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='SP'),         auton_d1_attempts=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='RW'),          auton_d2_attempts=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='RT'),         auton_lb_attempts=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='LB'),                  auton_a1=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='PC' AND auton_defense_total<>'0'),    auton_a2=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='CF' AND auton_defense_total<>'0'),   auton_b1=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='M' AND auton_defense_total<>'0'),     auton_b2=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='R' AND auton_defense_total<>'0'),      auton_c1=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='DB' AND auton_defense_total<>'0'),   auton_c2=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='SP' AND auton_defense_total<>'0'),   auton_d1=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='RW' AND auton_defense_total<>'0'),   auton_d2=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='RT' AND auton_defense_total<>'0'),   auton_lb=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='LB' AND auton_defense_total<>'0'),   perc_auton_high=100*((SELECT SUM(auton_high) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(auton_high)+SUM(auton_high_missed) FROM matches WHERE team_number='"+ team_number +"')),                                               auton_high_made=(SELECT SUM(auton_high) FROM matches WHERE team_number='"+ team_number +"'),                                             auton_high_attempts=(SELECT SUM(auton_high)+SUM(auton_high_missed) FROM matches WHERE team_number='"+ team_number +"'),                    perc_auton_low=100*((SELECT SUM(auton_low) FROM matches WHERE team_number='"+ team_number +"')/(SELECT SUM(auton_low)+SUM(auton_low_missed) FROM matches WHERE team_number='"+ team_number +"')),                                                                               auton_low_made=(SELECT SUM(auton_low) FROM matches WHERE team_number='"+ team_number +"'),                                                auton_low_attempts=(SELECT SUM(auton_low)+SUM(auton_low_missed) FROM matches WHERE team_number='"+ team_number +"'),      auton_reaches_total=(SELECT COUNT(auton_reach) FROM matches WHERE team_number='"+ team_number +"' AND auton_reach='1'),                        avg_a1_speed=((SELECT SUM(a1_total) FROM matches WHERE team_number='"+ team_number +"') / (SELECT SUM(a1_successful) FROM matches WHERE team_number='"+ team_number +"')),                                                                                                       avg_a2_speed=((SELECT SUM(a2_total) FROM matches WHERE team_number='"+ team_number +"') / (SELECT SUM(a2_successful) FROM matches WHERE team_number='"+ team_number +"')),                                                                                                       avg_b1_speed=((SELECT SUM(b1_total) FROM matches WHERE team_number='"+ team_number +"') / (SELECT SUM(b1_successful) FROM matches WHERE team_number='"+ team_number +"')),                                                                                                       avg_b2_speed=((SELECT SUM(b2_total) FROM matches WHERE team_number='"+ team_number +"') / (SELECT SUM(b2_successful) FROM matches WHERE team_number='"+ team_number +"')),                                                                                                       avg_c1_speed=((SELECT SUM(c1_total) FROM matches WHERE team_number='"+ team_number +"') / (SELECT SUM(c1_successful) FROM matches WHERE team_number='"+ team_number +"')),                                                                                                       avg_c2_speed=((SELECT SUM(c2_total) FROM matches WHERE team_number='"+ team_number +"') / (SELECT SUM(c2_successful) FROM matches WHERE team_number='"+ team_number +"')),                                                                                                       avg_d1_speed=((SELECT SUM(d1_total) FROM matches WHERE team_number='"+ team_number +"') / (SELECT SUM(d1_successful) FROM matches WHERE team_number='"+ team_number +"')),                                                                                                       avg_d2_speed=((SELECT SUM(d2_total) FROM matches WHERE team_number='"+ team_number +"') / (SELECT SUM(d2_successful) FROM matches WHERE team_number='"+ team_number +"')),                                                                                                       avg_lb_speed=((SELECT SUM(lb_total) FROM matches WHERE team_number='"+ team_number +"') / (SELECT SUM(lb_successful) FROM matches WHERE team_number='"+ team_number +"')),";

            team_sql += "                                                                                                                     total_stucks=(SELECT SUM(a1_stuck)+SUM(a2_stuck)+SUM(b1_stuck)+SUM(b2_stuck)+SUM(c1_stuck)+SUM(c2_stuck)+SUM(d1_stuck)+SUM(d2_stuck)+SUM(lb_stuck) FROM matches WHERE team_number='"+ team_number +"'),                                                                                               total_terrains=(SELECT SUM(b1_successful)+SUM(b2_successful)+SUM(d1_successful)+SUM(d2_successful) FROM matches WHERE team_number='"+ team_number +"'),                                                                                                                 total_defenses=(SELECT SUM(a1_successful)+SUM(a2_successful)+SUM(b1_successful)+SUM(b2_successful)+SUM(c1_successful)+SUM(c2_successful)+SUM(d1_successful)+SUM(d2_successful)+SUM(lb_successful) FROM matches WHERE team_number='"+ team_number +"'),                                                           auton_a1_perc=100*((SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='PC' AND auton_defense_total<>'0')/(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='PC')),               auton_a2_perc=100*((SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='CF' AND auton_defense_total<>'0')/(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='CF')),               auton_b1_perc=100*((SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='M' AND auton_defense_total<>'0')/(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='M')),               auton_b2_perc=100*((SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='R' AND auton_defense_total<>'0')/(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='R')),               auton_c1_perc=100*((SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='DB' AND auton_defense_total<>'0')/(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='DB')),               auton_c2_perc=100*((SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='SP' AND auton_defense_total<>'0')/(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='SP')),               auton_d1_perc=100*((SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='RW' AND auton_defense_total<>'0')/(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='RW')),               auton_d2_perc=100*((SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='RT' AND auton_defense_total<>'0')/(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='RT')),               auton_lb_perc=100*((SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='LB' AND auton_defense_total<>'0')/(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='LB')), tot_dead=(SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND dead='1')             WHERE team_number='"+ team_number +"'";
            connection.query(team_sql, function(err) {
                console.log(err);
            });
            var next_sql = "UPDATE teams SET total_auto_crossings=((SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='PC' AND auton_defense_total<>'0') + (SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='CF' AND auton_defense_total<>'0') + (SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='M' AND auton_defense_total<>'0')  + (SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='R' AND auton_defense_total<>'0')  + (SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='DB' AND auton_defense_total<>'0') + (SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='SP' AND auton_defense_total<>'0') + (SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='RW' AND auton_defense_total<>'0') + (SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='RT' AND auton_defense_total<>'0') + (SELECT COUNT(*) FROM matches WHERE team_number='"+ team_number +"' AND auton_defense_crossed='LB' AND auton_defense_total<>'0')) WHERE team_number='"+ team_number +"'";

            connection.query(next_sql, function(err) {
                console.log(err);

            });
        }


}


module.exports = REST_ROUTER;
