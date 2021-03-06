//where all the page connections happen and back-end javascript
var mysql = require("mysql");
var fs = require("fs");
var TBA = require('thebluealliance');
var tba = new TBA('FRCScout2017','Software for scouting for 2017 season','1.1.1');
var ensureLogin = require('connect-ensure-login');
var message = "";

function reqAdmin()
{
  return [
    ensureLogin.ensureLoggedIn('/login'),
    function(req, res, next) {
      if(req.user && req.user.admin == 1)
        next();
      else
      {
	message = 'Higher permissions necessary to access page.';
	res.redirect('/login');
      }
    }
  ]
}

function REST_ROUTER(router, connection, passport)
{
    var self = this;
    self.handleRoutes(router, connection, passport);
}

REST_ROUTER.prototype.handleRoutes = function(router, connection, passport)
{

  // var upload = require("multer")({dest: "public/images"});

  var most_recent = 0;
  var most_recent_match = 0;
  var num_matches = 0;
  var query_bool = 0;
  var query_res = "";

  var tele_gear_rank = [];
  var auto_gear_rank = [];
  var climb_rank = [];

  var variable_map = [];
  variable_map["Auto Gears Scored"] = "tot_auto_gears_scored";
  variable_map["Tele Gears Scored"] = "avg_tele_gears_scored";
  variable_map["Auto High Made"] = "avg_auto_high_made";
  variable_map["Tele High Made"] = "avg_tele_high_made";
  variable_map["Auto Low Made"] = "avg_auto_low_made";
  variable_map["Tele Low Made"] = "avg_tele_low_made";
  variable_map["Climb Percentage"] = "perc_climb";
  variable_map["Mobility Rating"] = "avg_mobility_rating";
  variable_map["Defense Rating"] = "avg_defense_rating";
  variable_map["Auto Contrib kPa"] = "avg_auto_contrib_kpa";
  variable_map["Contrib kPa"] = "avg_contrib_kpa";


  // index page
  router.get('/', ensureLogin.ensureLoggedIn('/login'), function(req, res) {       //PAGE RENDER
    var team_list = "";
    var score_list = "";
    var consist_list = "";
    var notes_query = "";
    
    var get_teams = "SELECT * FROM teams";
    //TEAM QUERY
    connection.query(get_teams, function(err,rows,fields) {
      notes_query = "INSERT INTO notes (user, notes) VALUES ('" + req.user.username + "', '";
      for(var x in rows)
      {
        team_list += "<tr class='clickable-row' data-href='/team/"+ rows[x].team_num +"'><td>"+ rows[x].team_num +"</td><td>"+ rows[x].team_name +"</td></tr>";
	updateTeams(rows[x].team_num);
	notes_query += rows[x].team_num + "` `";
      }
      notes_query = notes_query.substring(0, notes_query.length - 2) + "');"
    });
    //CONTRIB SCORE QUERY
    var get_contrib_score_rank = "SELECT * FROM teams ORDER BY avg_auto_gears_scored+avg_tele_gears_scored DESC, avg_contrib_kpa DESC, team_num ASC";
    connection.query(get_contrib_score_rank, function(err, rows, fields) {
      for(var x in rows)
      {
        score_list += "<tr title='"+ rows[x].team_name +"' class='clickable-row' data-href='/team/"+ rows[x].team_num +"'><td>"+ rows[x].team_num +"</td><td>"+ Number(Number(rows[x].avg_tele_gears_scored) + Number(rows[x].avg_auto_gears_scored)).toFixed(3) +"</td><td>"+ rows[x].avg_contrib_kpa +"</td><td>"+ rows[x].avg_climb_rating +"</td></tr>";
      }
    });
    
    connection.query("SELECT * FROM notes WHERE user='" + req.user.username + "'", function(err, rows) {
      if(!rows.length)
      {
	connection.query(notes_query, function(err) {
          if(err) console.log(err);
	});
      }
    });
    
    var get_consist_rank = "SELECT * FROM teams ORDER BY cst_tele_gears_scored DESC, team_num ASC";
    connection.query(get_consist_rank, function(err, rows) {
      // console.log(rows);
      for(var x in rows)
      {
        consist_list += "<tr class='clickable-row' data-href='/team/"+ rows[x].team_num +"'><td>"+ rows[x].team_num +"</td><td>"+ rows[x].cst_tele_gears_scored + "</td></tr>";
      }
      res.render('pages/index', {
	req: req,
        team_list: team_list,
        score_list: score_list,
        consist_list: consist_list
      });
    });
  });

  router.get("/login", function(req, res) {
    res.render("pages/login", { req: req, message: message });
    message = '';
  });

  router.post("/login", function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if(err) { return next(err); }
      if(!user) { return res.render('pages/login', { req: req, message: info.message }); }
      req.logIn(user, function(err) {
	if(err) { return next(err); }
	return res.redirect(req.session.returnTo || '/');
      });
    })(req, res, next);
  });

  router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
  });

  router.get("/user", ensureLogin.ensureLoggedIn('/login'), function(req, res) {
    console.log(req.user);
    res.redirect("/");
  });

  router.get("/notes", ensureLogin.ensureLoggedIn('/login'), function(req, res) {
    var notes = [];
    var notes_ejs = "";
    var query = "SELECT * FROM notes WHERE user='" + req.user.username + "';";
    //console.log(query);
    connection.query(query, function(err, rows) {
      notes = rows[0].notes.split('`');
      //console.log(notes);
      for(var x = 0; x < notes.length; x += 2)
      {
        notes_ejs += "<tr><td>"+ notes[x] +"</td><td>"+ notes[x + 1] +"</td></tr>";
      }
      //console.log(notes_ejs);
      res.render("pages/notes", {
	req: req,
	notes: notes_ejs
      });
    });
  });
  
      
  router.post("/notes", ensureLogin.ensureLoggedIn('/login'), function(req, res) {
    //console.log(req.body);
    var query = "UPDATE notes SET notes='" + req.body.notes + "' WHERE user='" + req.user.username + "'";
    connection.query(query, function(err) {
      if(err) console.log(err);
      res.redirect("/notes");
    });
  });

  router.get("/sql", reqAdmin(), function(req, res) {
    var message = "";
    if(query_bool == -1)
      message = "<div class=\"alert alert-danger\" role=\"alert\"><p><b>Oh snap</b>, looks like there's a mistake in your query. Data not queried.</p></div>";
    else if(query_bool != -1 && query_bool != 0)
      message = "<div class=\"alert alert-success\" role=\"alert\"><p>Data has been <b>successfully</b> queried.</p></div>";
    res.render("pages/sql", {
      req: req,
      message: message,
      result: query_res
    });
    if(query_bool == 1)
    {
      query_res = "";
      query_bool = 0;
    }
  });
  router.post("/query", reqAdmin(), function(req, res) {
    var sql = JSON.stringify(req.body.query);
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
  router.get("/export", reqAdmin(), function(req, res) {
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

  router.get("/pit-entry", reqAdmin(), function(req, res) {
    res.render("pages/pit_entry", { req: req });
  });

  router.post("/pit-parse", reqAdmin(), function(req, res) {
    var team_num = Number(req.body.team_num);
    var drive_type = JSON.stringify(req.body.drive_type);
    var weight = Number(req.body.weight);
    var filename = JSON.stringify(req.body.pic_filename);
    // console.log(req.file);
    // fs.createReadStream(filename).pipe(fs.createWriteStream(__dirname + "/public/images/" + filename));
    var insert_sql = "UPDATE teams SET drive_type=\"" + drive_type + "\", weight=" + weight + " WHERE team_num=" + team_num;
    connection.query(insert_sql, function(err) {
      res.redirect("/pit-entry");
    });
  })

  router.get("/stats-gen", ensureLogin.ensureLoggedIn('/login'), function(req, res) {
    res.render("pages/stats_gen", { req: req });
  });

  router.post("/stats_gen", ensureLogin.ensureLoggedIn('/login'), function(req, res) {
    var var_name_1 = req.body.var_name_1;
    var var_name_2 = req.body.var_name_2;
    res.redirect("/stats/" + var_name_1 + "," + var_name_2);
  });

  router.get("/stats/:var_name_1,:var_name_2", ensureLogin.ensureLoggedIn('/login'), function(req, res) {
    var var_name_1 = req.params.var_name_1;
    var var_name_2 = req.params.var_name_2;
    var rank_list_1 = "";
    var rank_list_2 = "";
    var rank_sql_1 = "SELECT * FROM teams ORDER BY " + variable_map[var_name_1] + " DESC, team_num ASC LIMIT 30";
    var rank_sql_2 = "SELECT * FROM teams ORDER BY " + variable_map[var_name_2] + " DESC, team_num ASC LIMIT 30";
    connection.query(rank_sql_1, function(err, rows) {
      for(var x in rows) {
        rank_list_1 += "<tr title='"+ rows[x].team_name +"' class='clickable-row' data-href='/team/"+ rows[x].team_num +"'><td>"+ Number(Number(x)+1) +"</td><td>"+ rows[x].team_num +"</td><td>"+ rows[x][variable_map[var_name_1]] +"</td></tr>";
      }
      connection.query(rank_sql_2, function(err, rows) {
        for(var x in rows) {
          rank_list_2 += "<tr title='"+ rows[x].team_name +"' class='clickable-row' data-href='/team/"+ rows[x].team_num +"'><td>"+ Number(Number(x)+1) +"</td><td>"+ rows[x].team_num +"</td><td>"+ rows[x][variable_map[var_name_2]] +"</td></tr>";
        }
        res.render("pages/stats", {
	  req: req,
          var_name_1: var_name_1,
          rank_list_1: rank_list_1,
          var_name_2: var_name_2,
          rank_list_2: rank_list_2
        });
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

  router.get("/event", reqAdmin(), function(req, res) {
    var date = new Date();
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var date_str = "2017-" + month + "-" + day;
    var events = "";
    tba.getEventList(function(err, list_of_teams) {
      for(var x in list_of_teams) {
        var event_date = list_of_teams[x].start_date.split("-");
        // if((Number(event_date[1]) > Number(month)) || (Number(event_date[1]) == Number(month) && Number(event_date[2]) > Number(day))) {
          events += "<option>" + list_of_teams[x].event_code + "-" + list_of_teams[x].name + "</option>\n";
        // }
      }

      res.render("pages/event", {
	req: req,
        events: events
      });
    });
  });

  router.post("/parse-event", reqAdmin(), function(req, res) {
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


  router.get("/alliance-gen", ensureLogin.ensureLoggedIn('/login'), function(req, res) {
    res.render("pages/alliance_gen", { req: req });
  });

  router.post("/alliance-gen", ensureLogin.ensureLoggedIn('/login'), function(req, res) {
    var team_1 = Number(req.body.team_1);
    var team_2 = Number(req.body.team_2);
    var team_3 = Number(req.body.team_3);
    var team_4 = Number(req.body.team_4);
    var team_5 = Number(req.body.team_5);
    var team_6 = Number(req.body.team_6);
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
    var most_recent_match_1 = [];
    var num_matches_1 = 0;
    var tot_auto_gears_scored_fdr_1 = 0;
    var tot_auto_gears_scored_mid_1 = 0;
    var tot_auto_gears_scored_boi_1 = 0;
    var tot_auto_gears_scored_1 = 0;
    var max_auto_gears_scored_1 = 0;
    var tot_auto_gears_attempts_1 = 0;
    var avg_auto_high_made_1 = 0;
    var max_auto_high_made_1 = 0;
    var avg_auto_high_attempts_1 = 0;
    var avg_auto_low_made_1 = 0;
    var max_auto_low_made_1 = 0;
    var avg_auto_low_attempts_1 = 0;
    var tot_baseline_cross_1 = 0;
    var avg_auto_hopper_intake_1 = 0;
    var avg_auto_contrib_kpa_1 = 0;
    var max_auto_contrib_kpa_1 = 0;
    var avg_tele_high_made_1 = 0;
    var max_tele_high_made_1 = 0;
    var avg_tele_high_attempts_1 = 0;
    var avg_tele_low_made_1 = 0;
    var max_tele_low_made_1 = 0;
    var avg_tele_low_attempts_1 = 0;
    var avg_tele_gears_scored_1 = 0;
    var max_tele_gears_scored_1 = 0;
    var avg_tele_gears_attempts_1 = 0;
    var avg_tele_floor_ball_intake_1 = 0;
    var avg_tele_floor_gear_intake_1 = 0;
    var avg_tele_hopper_intake_1 = 0;
    var avg_hp_gear_intake_1 = 0;
    var avg_hp_gear_intake_miss_1 = 0;
    var avg_tele_gears_dropped_1 = 0;
    var tot_tele_gear_knockouts_1 = 0;
    var tot_climb_1 = 0;
    var tot_climb_attempts_1 = 0;
    var avg_climb_rating_1 = 0;
    var avg_climb_time_1 = 0;
    var avg_mobility_rating_1 = 0;
    var avg_defense_rating_1 = 0;
    var avg_contrib_kpa_1 = 0;
    var max_contrib_kpa_1 = 0;
    var no_autos_1 = 0;

    var team_num_2 = !Number.isNaN(req.params.team_2) ? Number(req.params.team_2) : 0;
    var team_name_2 = "";
    var most_recent_match_2 = [];
    var num_matches_2 = 0;
    var tot_auto_gears_scored_fdr_2 = 0;
    var tot_auto_gears_scored_mid_2 = 0;
    var tot_auto_gears_scored_boi_2 = 0;
    var tot_auto_gears_scored_2 = 0;
    var max_auto_gears_scored_2 = 0;
    var tot_auto_gears_attempts_2 = 0;
    var avg_auto_high_made_2 = 0;
    var max_auto_high_made_2 = 0;
    var avg_auto_high_attempts_2 = 0;
    var avg_auto_low_made_2 = 0;
    var max_auto_low_made_2 = 0;
    var avg_auto_low_attempts_2 = 0;
    var tot_baseline_cross_2 = 0;
    var avg_auto_hopper_intake_2 = 0;
    var avg_auto_contrib_kpa_2 = 0;
    var max_auto_contrib_kpa_2 = 0;
    var avg_tele_high_made_2 = 0;
    var max_tele_high_made_2 = 0;
    var avg_tele_high_attempts_2 = 0;
    var avg_tele_low_made_2 = 0;
    var max_tele_low_made_2 = 0;
    var avg_tele_low_attempts_2 = 0;
    var avg_tele_gears_scored_2 = 0;
    var max_tele_gears_scored_2 = 0;
    var avg_tele_gears_attempts_2 = 0;
    var avg_tele_floor_ball_intake_2 = 0;
    var avg_tele_floor_gear_intake_2 = 0;
    var avg_tele_hopper_intake_2 = 0;
    var avg_hp_gear_intake_2 = 0;
    var avg_hp_gear_intake_miss_2 = 0;
    var avg_tele_gears_dropped_2 = 0;
    var tot_tele_gear_knockouts_2 = 0;
    var tot_climb_2 = 0;
    var tot_climb_attempts_2 = 0;
    var avg_climb_rating_2 = 0;
    var avg_climb_time_2 = 0;
    var avg_mobility_rating_2 = 0;
    var avg_defense_rating_2 = 0;
    var avg_contrib_kpa_2 = 0;
    var max_contrib_kpa_2 = 0;
    var no_autos_2 = 0;

    var team_num_3 = !Number.isNaN(req.params.team_3) ? Number(req.params.team_3) : 0;
    var team_name_3 = "";
    var most_recent_match_3 = [];
    var num_matches_3 = 0;
    var tot_auto_gears_scored_fdr_3 = 0;
    var tot_auto_gears_scored_mid_3 = 0;
    var tot_auto_gears_scored_boi_3 = 0;
    var tot_auto_gears_scored_3 = 0;
    var max_auto_gears_scored_3 = 0;
    var tot_auto_gears_attempts_3 = 0;
    var avg_auto_high_made_3 = 0;
    var max_auto_high_made_3 = 0;
    var avg_auto_high_attempts_3 = 0;
    var avg_auto_low_made_3 = 0;
    var max_auto_low_made_3 = 0;
    var avg_auto_low_attempts_3 = 0;
    var tot_baseline_cross_3 = 0;
    var avg_auto_hopper_intake_3 = 0;
    var avg_auto_contrib_kpa_3 = 0;
    var max_auto_contrib_kpa_3 = 0;
    var avg_tele_high_made_3 = 0;
    var max_tele_high_made_3 = 0;
    var avg_tele_high_attempts_3 = 0;
    var avg_tele_low_made_3 = 0;
    var max_tele_low_made_3 = 0;
    var avg_tele_low_attempts_3 = 0;
    var avg_tele_gears_scored_3 = 0;
    var max_tele_gears_scored_3 = 0;
    var avg_tele_gears_attempts_3 = 0;
    var avg_tele_floor_ball_intake_3 = 0;
    var avg_tele_floor_gear_intake_3 = 0;
    var avg_tele_hopper_intake_3 = 0;
    var avg_hp_gear_intake_3 = 0;
    var avg_hp_gear_intake_miss_3 = 0;
    var avg_tele_gears_dropped_3 = 0;
    var tot_tele_gear_knockouts_3 = 0;
    var tot_climb_3 = 0;
    var tot_climb_attempts_3 = 0;
    var avg_climb_rating_3 = 0;
    var avg_climb_time_3 = 0;
    var avg_mobility_rating_3 = 0;
    var avg_defense_rating_3 = 0;
    var avg_contrib_kpa_3 = 0;
    var max_contrib_kpa_3 = 0;
    var no_autos_3 = 0;

    var team_num_4 = !Number.isNaN(req.params.team_4) ? Number(req.params.team_4) : 0;
    var team_name_4 = "";
    var most_recent_match_4 = [];
    var num_matches_4 = 0;
    var tot_auto_gears_scored_fdr_4 = 0;
    var tot_auto_gears_scored_mid_4 = 0;
    var tot_auto_gears_scored_boi_4 = 0;
    var tot_auto_gears_scored_4 = 0;
    var max_auto_gears_scored_4 = 0;
    var tot_auto_gears_attempts_4 = 0;
    var avg_auto_high_made_4 = 0;
    var max_auto_high_made_4 = 0;
    var avg_auto_high_attempts_4 = 0;
    var avg_auto_low_made_4 = 0;
    var max_auto_low_made_4 = 0;
    var avg_auto_low_attempts_4 = 0;
    var tot_baseline_cross_4 = 0;
    var avg_auto_hopper_intake_4 = 0;
    var avg_auto_contrib_kpa_4 = 0;
    var max_auto_contrib_kpa_4 = 0;
    var avg_tele_high_made_4 = 0;
    var max_tele_high_made_4 = 0;
    var avg_tele_high_attempts_4 = 0;
    var avg_tele_low_made_4 = 0;
    var max_tele_low_made_4 = 0;
    var avg_tele_low_attempts_4 = 0;
    var avg_tele_gears_scored_4 = 0;
    var max_tele_gears_scored_4 = 0;
    var avg_tele_gears_attempts_4 = 0;
    var avg_tele_floor_ball_intake_4 = 0;
    var avg_tele_floor_gear_intake_4 = 0;
    var avg_tele_hopper_intake_4 = 0;
    var avg_hp_gear_intake_4 = 0;
    var avg_hp_gear_intake_miss_4 = 0;
    var avg_tele_gears_dropped_4 = 0;
    var tot_tele_gear_knockouts_4 = 0;
    var tot_climb_4 = 0;
    var tot_climb_attempts_4 = 0;
    var avg_climb_rating_4 = 0;
    var avg_climb_time_4 = 0;
    var avg_mobility_rating_4 = 0;
    var avg_defense_rating_4 = 0;
    var avg_contrib_kpa_4 = 0;
    var max_contrib_kpa_4 = 0;
    var no_autos_4 = 0;

    var team_num_5 = !Number.isNaN(req.params.team_5) ? Number(req.params.team_5) : 0;
    var team_name_5 = "";
    var most_recent_match_5 = [];
    var num_matches_5 = 0;
    var tot_auto_gears_scored_fdr_5 = 0;
    var tot_auto_gears_scored_mid_5 = 0;
    var tot_auto_gears_scored_boi_5 = 0;
    var tot_auto_gears_scored_5 = 0;
    var max_auto_gears_scored_5 = 0;
    var tot_auto_gears_attempts_5 = 0;
    var avg_auto_high_made_5 = 0;
    var max_auto_high_made_5 = 0;
    var avg_auto_high_attempts_5 = 0;
    var avg_auto_low_made_5 = 0;
    var max_auto_low_made_5 = 0;
    var avg_auto_low_attempts_5 = 0;
    var tot_baseline_cross_5 = 0;
    var avg_auto_hopper_intake_5 = 0;
    var avg_auto_contrib_kpa_5 = 0;
    var max_auto_contrib_kpa_5 = 0;
    var avg_tele_high_made_5 = 0;
    var max_tele_high_made_5 = 0;
    var avg_tele_high_attempts_5 = 0;
    var avg_tele_low_made_5 = 0;
    var max_tele_low_made_5 = 0;
    var avg_tele_low_attempts_5 = 0;
    var avg_tele_gears_scored_5 = 0;
    var max_tele_gears_scored_5 = 0;
    var avg_tele_gears_attempts_5 = 0;
    var avg_tele_floor_ball_intake_5 = 0;
    var avg_tele_floor_gear_intake_5 = 0;
    var avg_tele_hopper_intake_5 = 0;
    var avg_hp_gear_intake_5 = 0;
    var avg_hp_gear_intake_miss_5 = 0;
    var avg_tele_gears_dropped_5 = 0;
    var tot_tele_gear_knockouts_5 = 0;
    var tot_climb_5 = 0;
    var tot_climb_attempts_5 = 0;
    var avg_climb_rating_5 = 0;
    var avg_climb_time_5 = 0;
    var avg_mobility_rating_5 = 0;
    var avg_defense_rating_5 = 0;
    var avg_contrib_kpa_5 = 0;
    var max_contrib_kpa_5 = 0;
    var no_autos_5 = 0;

    var team_num_6 = !Number.isNaN(req.params.team_6) ? Number(req.params.team_6) : 0;
    var team_name_6 = "";
    var most_recent_match_6 = [];
    var num_matches_6 = 0;
    var tot_auto_gears_scored_fdr_6 = 0;
    var tot_auto_gears_scored_mid_6 = 0;
    var tot_auto_gears_scored_boi_6 = 0;
    var tot_auto_gears_scored_6 = 0;
    var max_auto_gears_scored_6 = 0;
    var tot_auto_gears_attempts_6 = 0;
    var avg_auto_high_made_6 = 0;
    var max_auto_high_made_6 = 0;
    var avg_auto_high_attempts_6 = 0;
    var avg_auto_low_made_6 = 0;
    var max_auto_low_made_6 = 0;
    var avg_auto_low_attempts_6 = 0;
    var tot_baseline_cross_6 = 0;
    var avg_auto_hopper_intake_6 = 0;
    var avg_auto_contrib_kpa_6 = 0;
    var max_auto_contrib_kpa_6 = 0;
    var avg_tele_high_made_6 = 0;
    var max_tele_high_made_6 = 0;
    var avg_tele_high_attempts_6 = 0;
    var avg_tele_low_made_6 = 0;
    var max_tele_low_made_6 = 0;
    var avg_tele_low_attempts_6 = 0;
    var avg_tele_gears_scored_6 = 0;
    var max_tele_gears_scored_6 = 0;
    var avg_tele_gears_attempts_6 = 0;
    var avg_tele_floor_ball_intake_6 = 0;
    var avg_tele_floor_gear_intake_6 = 0;
    var avg_tele_hopper_intake_6 = 0;
    var avg_hp_gear_intake_6 = 0;
    var avg_hp_gear_intake_miss_6 = 0;
    var avg_tele_gears_dropped_6 = 0;
    var tot_tele_gear_knockouts_6 = 0;
    var tot_climb_6 = 0;
    var tot_climb_attempts_6 = 0;
    var avg_climb_rating_6 = 0;
    var avg_climb_time_6 = 0;
    var avg_mobility_rating_6 = 0;
    var avg_defense_rating_6 = 0;
    var avg_contrib_kpa_6 = 0;
    var max_contrib_kpa_6 = 0;
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
        num_matches_1 = rows[0].num_matches;
        tot_auto_gears_scored_fdr_1 = rows[0].tot_auto_gears_scored_fdr;
        tot_auto_gears_scored_mid_1 = rows[0].tot_auto_gears_scored_mid;
        tot_auto_gears_scored_boi_1 = rows[0].tot_auto_gears_scored_boi;
        tot_auto_gears_scored_1 = rows[0].tot_auto_gears_scored;
        max_auto_gears_scored_1 = rows[0].max_auto_gears_scored;
        tot_auto_gears_attempts_1 = rows[0].tot_auto_gears_attempts;
        avg_auto_high_made_1 = rows[0].avg_auto_high_made;
        max_auto_high_made_1 = rows[0].max_auto_high_made;
        avg_auto_high_attempts_1 = rows[0].avg_auto_high_attempts;
        avg_auto_low_made_1 = rows[0].avg_auto_low_made;
        max_auto_low_made_1 = rows[0].max_auto_low_made;
        avg_auto_low_attempts_1 = rows[0].avg_auto_low_attempts;
        tot_baseline_cross_1 = rows[0].tot_baseline_cross;
        avg_auto_hopper_intake_1 = rows[0].avg_auto_hopper_intake;
        avg_auto_contrib_kpa_1 = rows[0].avg_auto_contrib_kpa;
        max_auto_contrib_kpa_1 = rows[0].max_auto_contrib_kpa;

        avg_tele_high_made_1 = rows[0].avg_tele_high_made;
        max_tele_high_made_1 = rows[0].avg_tele_high_made;
        avg_tele_high_attempts_1 = rows[0].avg_tele_high_attempts;
        avg_tele_low_made_1 = rows[0].avg_tele_low_made;
        max_tele_low_made_1 = rows[0].max_tele_low_made;
        avg_tele_low_attempts_1 = rows[0].avg_tele_low_attempts;
        avg_tele_gears_scored_1 = rows[0].avg_tele_gears_scored;
        max_tele_gears_scored_1 = rows[0].max_tele_gears_scored;
        avg_tele_gears_attempts_1 = rows[0].avg_tele_gears_attempts;
        avg_tele_floor_ball_intake_1 = rows[0].avg_tele_floor_ball_intake;
        avg_tele_floor_gear_intake_1 = rows[0].avg_tele_floor_gear_intake;
        avg_tele_hopper_intake_1 = rows[0].avg_tele_hopper_intake;
        avg_hp_gear_intake_1 = rows[0].avg_hp_gear_intake;
        avg_hp_gear_intake_miss_1 = rows[0].avg_hp_gear_intake_miss;
        avg_tele_gears_dropped_1 = rows[0].avg_tele_gears_dropped;
        tot_tele_gear_knockouts_1 = rows[0].tot_tele_gear_knockouts;
        tot_climb_1 = rows[0].tot_climb;
        tot_climb_attempts_1 = rows[0].tot_climb_attempts;
        avg_climb_rating_1 = rows[0].avg_climb_rating;
        avg_climb_time_1 = rows[0].avg_climb_time;
        avg_mobility_rating_1 = rows[0].avg_mobility_rating;
        avg_defense_rating_1 = rows[0].avg_defense_rating;
        drive_type_1 = rows[0].drive_type;
        avg_contrib_kpa_1 = rows[0].avg_contrib_kpa;
        max_contrib_kpa_1 = rows[0].max_contrib_kpa;
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
          num_matches_2 = rows[0].num_matches;
          tot_auto_gears_scored_fdr_2 = rows[0].tot_auto_gears_scored_fdr;
          tot_auto_gears_scored_mid_2 = rows[0].tot_auto_gears_scored_mid;
          tot_auto_gears_scored_boi_2 = rows[0].tot_auto_gears_scored_boi;
          tot_auto_gears_scored_2 = rows[0].tot_auto_gears_scored;
          max_auto_gears_scored_2 = rows[0].max_auto_gears_scored;
          tot_auto_gears_attempts_2 = rows[0].tot_auto_gears_attempts;
          avg_auto_high_made_2 = rows[0].avg_auto_high_made;
          max_auto_high_made_2 = rows[0].max_auto_high_made;
          avg_auto_high_attempts_2 = rows[0].avg_auto_high_attempts;
          avg_auto_low_made_2 = rows[0].avg_auto_low_made;
          max_auto_low_made_2 = rows[0].max_auto_low_made;
          avg_auto_low_attempts_2 = rows[0].avg_auto_low_attempts;
          tot_baseline_cross_2 = rows[0].tot_baseline_cross;
          avg_auto_hopper_intake_2 = rows[0].avg_auto_hopper_intake;
          avg_auto_contrib_kpa_2 = rows[0].avg_auto_contrib_kpa;
          max_auto_contrib_kpa_2 = rows[0].max_auto_contrib_kpa;

          avg_tele_high_made_2 = rows[0].avg_tele_high_made;
          max_tele_high_made_2 = rows[0].avg_tele_high_made;
          avg_tele_high_attempts_2 = rows[0].avg_tele_high_attempts;
          avg_tele_low_made_2 = rows[0].avg_tele_low_made;
          max_tele_low_made_2 = rows[0].max_tele_low_made;
          avg_tele_low_attempts_2 = rows[0].avg_tele_low_attempts;
          avg_tele_gears_scored_2 = rows[0].avg_tele_gears_scored;
          max_tele_gears_scored_2 = rows[0].max_tele_gears_scored;
          avg_tele_gears_attempts_2 = rows[0].avg_tele_gears_attempts;
          avg_tele_floor_ball_intake_2 = rows[0].avg_tele_floor_ball_intake;
          avg_tele_floor_gear_intake_2 = rows[0].avg_tele_floor_gear_intake;
          avg_tele_hopper_intake_2 = rows[0].avg_tele_hopper_intake;
          avg_hp_gear_intake_2 = rows[0].avg_hp_gear_intake;
          avg_hp_gear_intake_miss_2 = rows[0].avg_hp_gear_intake_miss;
          avg_tele_gears_dropped_2 = rows[0].avg_tele_gears_dropped;
          tot_tele_gear_knockouts_2 = rows[0].tot_tele_gear_knockouts;
          tot_climb_2 = rows[0].tot_climb;
          tot_climb_attempts_2 = rows[0].tot_climb_attempts;
          avg_climb_rating_2 = rows[0].avg_climb_rating;
          avg_climb_time_2 = rows[0].avg_climb_time;
          avg_mobility_rating_2 = rows[0].avg_mobility_rating;
          avg_defense_rating_2 = rows[0].avg_defense_rating;
          drive_type_2 = rows[0].drive_type;
          avg_contrib_kpa_2 = rows[0].avg_contrib_kpa;
          max_contrib_kpa_2 = rows[0].max_contrib_kpa;
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
          num_matches_3 = rows[0].num_matches;
          tot_auto_gears_scored_fdr_3 = rows[0].tot_auto_gears_scored_fdr;
          tot_auto_gears_scored_mid_3 = rows[0].tot_auto_gears_scored_mid;
          tot_auto_gears_scored_boi_3 = rows[0].tot_auto_gears_scored_boi;
          tot_auto_gears_scored_3 = rows[0].tot_auto_gears_scored;
          max_auto_gears_scored_3 = rows[0].max_auto_gears_scored;
          tot_auto_gears_attempts_3 = rows[0].tot_auto_gears_attempts;
          avg_auto_high_made_3 = rows[0].avg_auto_high_made;
          max_auto_high_made_3 = rows[0].max_auto_high_made;
          avg_auto_high_attempts_3 = rows[0].avg_auto_high_attempts;
          avg_auto_low_made_3 = rows[0].avg_auto_low_made;
          max_auto_low_made_3 = rows[0].max_auto_low_made;
          avg_auto_low_attempts_3 = rows[0].avg_auto_low_attempts;
          tot_baseline_cross_3 = rows[0].tot_baseline_cross;
          avg_auto_hopper_intake_3 = rows[0].avg_auto_hopper_intake;
          avg_auto_contrib_kpa_3 = rows[0].avg_auto_contrib_kpa;
          max_auto_contrib_kpa_3 = rows[0].max_auto_contrib_kpa;

          avg_tele_high_made_3 = rows[0].avg_tele_high_made;
          max_tele_high_made_3 = rows[0].avg_tele_high_made;
          avg_tele_high_attempts_3 = rows[0].avg_tele_high_attempts;
          avg_tele_low_made_3 = rows[0].avg_tele_low_made;
          max_tele_low_made_3 = rows[0].max_tele_low_made;
          avg_tele_low_attempts_3 = rows[0].avg_tele_low_attempts;
          avg_tele_gears_scored_3 = rows[0].avg_tele_gears_scored;
          max_tele_gears_scored_3 = rows[0].max_tele_gears_scored;
          avg_tele_gears_attempts_3 = rows[0].avg_tele_gears_attempts;
          avg_tele_floor_ball_intake_3 = rows[0].avg_tele_floor_ball_intake;
          avg_tele_floor_gear_intake_3 = rows[0].avg_tele_floor_gear_intake;
          avg_tele_hopper_intake_3 = rows[0].avg_tele_hopper_intake;
          avg_hp_gear_intake_3 = rows[0].avg_hp_gear_intake;
          avg_hp_gear_intake_miss_3 = rows[0].avg_hp_gear_intake_miss;
          avg_tele_gears_dropped_3 = rows[0].avg_tele_gears_dropped;
          tot_tele_gear_knockouts_3 = rows[0].tot_tele_gear_knockouts;
          tot_climb_3 = rows[0].tot_climb;
          tot_climb_attempts_3 = rows[0].tot_climb_attempts;
          avg_climb_rating_3 = rows[0].avg_climb_rating;
          avg_climb_time_3 = rows[0].avg_climb_time;
          avg_mobility_rating_3 = rows[0].avg_mobility_rating;
          avg_defense_rating_3 = rows[0].avg_defense_rating;
          drive_type_3 = rows[0].drive_type;
          avg_contrib_kpa_3 = rows[0].avg_contrib_kpa;
          max_contrib_kpa_3 = rows[0].max_contrib_kpa;
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
          num_matches_4 = rows[0].num_matches;
          tot_auto_gears_scored_fdr_4 = rows[0].tot_auto_gears_scored_fdr;
          tot_auto_gears_scored_mid_4 = rows[0].tot_auto_gears_scored_mid;
          tot_auto_gears_scored_boi_4 = rows[0].tot_auto_gears_scored_boi;
          tot_auto_gears_scored_4 = rows[0].tot_auto_gears_scored;
          max_auto_gears_scored_4 = rows[0].max_auto_gears_scored;
          tot_auto_gears_attempts_4 = rows[0].tot_auto_gears_attempts;
          avg_auto_high_made_4 = rows[0].avg_auto_high_made;
          max_auto_high_made_4 = rows[0].max_auto_high_made;
          avg_auto_high_attempts_4 = rows[0].avg_auto_high_attempts;
          avg_auto_low_made_4 = rows[0].avg_auto_low_made;
          max_auto_low_made_4 = rows[0].max_auto_low_made;
          avg_auto_low_attempts_4 = rows[0].avg_auto_low_attempts;
          tot_baseline_cross_4 = rows[0].tot_baseline_cross;
          avg_auto_hopper_intake_4 = rows[0].avg_auto_hopper_intake;
          avg_auto_contrib_kpa_4 = rows[0].avg_auto_contrib_kpa;
          max_auto_contrib_kpa_4 = rows[0].max_auto_contrib_kpa;

          avg_tele_high_made_4 = rows[0].avg_tele_high_made;
          max_tele_high_made_4 = rows[0].avg_tele_high_made;
          avg_tele_high_attempts_4 = rows[0].avg_tele_high_attempts;
          avg_tele_low_made_4 = rows[0].avg_tele_low_made;
          max_tele_low_made_4 = rows[0].max_tele_low_made;
          avg_tele_low_attempts_4 = rows[0].avg_tele_low_attempts;
          avg_tele_gears_scored_4 = rows[0].avg_tele_gears_scored;
          max_tele_gears_scored_4 = rows[0].max_tele_gears_scored;
          avg_tele_gears_attempts_4 = rows[0].avg_tele_gears_attempts;
          avg_tele_floor_ball_intake_4 = rows[0].avg_tele_floor_ball_intake;
          avg_tele_floor_gear_intake_4 = rows[0].avg_tele_floor_gear_intake;
          avg_tele_hopper_intake_4 = rows[0].avg_tele_hopper_intake;
          avg_hp_gear_intake_4 = rows[0].avg_hp_gear_intake;
          avg_hp_gear_intake_miss_4 = rows[0].avg_hp_gear_intake_miss;
          avg_tele_gears_dropped_4 = rows[0].avg_tele_gears_dropped;
          tot_tele_gear_knockouts_4 = rows[0].tot_tele_gear_knockouts;
          tot_climb_4 = rows[0].tot_climb;
          tot_climb_attempts_4 = rows[0].tot_climb_attempts;
          avg_climb_rating_4 = rows[0].avg_climb_rating;
          avg_climb_time_4 = rows[0].avg_climb_time;
          avg_mobility_rating_4 = rows[0].avg_mobility_rating;
          avg_defense_rating_4 = rows[0].avg_defense_rating;
          drive_type_4 = rows[0].drive_type;
          avg_contrib_kpa_4 = rows[0].avg_contrib_kpa;
          max_contrib_kpa_4 = rows[0].max_contrib_kpa;
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
          num_matches_5 = rows[0].num_matches;
          tot_auto_gears_scored_fdr_5 = rows[0].tot_auto_gears_scored_fdr;
          tot_auto_gears_scored_mid_5 = rows[0].tot_auto_gears_scored_mid;
          tot_auto_gears_scored_boi_5 = rows[0].tot_auto_gears_scored_boi;
          tot_auto_gears_scored_5 = rows[0].tot_auto_gears_scored;
          max_auto_gears_scored_5 = rows[0].max_auto_gears_scored;
          tot_auto_gears_attempts_5 = rows[0].tot_auto_gears_attempts;
          avg_auto_high_made_5 = rows[0].avg_auto_high_made;
          max_auto_high_made_5 = rows[0].max_auto_high_made;
          avg_auto_high_attempts_5 = rows[0].avg_auto_high_attempts;
          avg_auto_low_made_5 = rows[0].avg_auto_low_made;
          max_auto_low_made_5 = rows[0].max_auto_low_made;
          avg_auto_low_attempts_5 = rows[0].avg_auto_low_attempts;
          tot_baseline_cross_5 = rows[0].tot_baseline_cross;
          avg_auto_hopper_intake_5 = rows[0].avg_auto_hopper_intake;
          avg_auto_contrib_kpa_5 = rows[0].avg_auto_contrib_kpa;
          max_auto_contrib_kpa_5 = rows[0].max_auto_contrib_kpa;

          avg_tele_high_made_5 = rows[0].avg_tele_high_made;
          max_tele_high_made_5 = rows[0].avg_tele_high_made;
          avg_tele_high_attempts_5 = rows[0].avg_tele_high_attempts;
          avg_tele_low_made_5 = rows[0].avg_tele_low_made;
          max_tele_low_made_5 = rows[0].max_tele_low_made;
          avg_tele_low_attempts_5 = rows[0].avg_tele_low_attempts;
          avg_tele_gears_scored_5 = rows[0].avg_tele_gears_scored;
          max_tele_gears_scored_5 = rows[0].max_tele_gears_scored;
          avg_tele_gears_attempts_5 = rows[0].avg_tele_gears_attempts;
          avg_tele_floor_ball_intake_5 = rows[0].avg_tele_floor_ball_intake;
          avg_tele_floor_gear_intake_5 = rows[0].avg_tele_floor_gear_intake;
          avg_tele_hopper_intake_5 = rows[0].avg_tele_hopper_intake;
          avg_hp_gear_intake_5 = rows[0].avg_hp_gear_intake;
          avg_hp_gear_intake_miss_5 = rows[0].avg_hp_gear_intake_miss;
          avg_tele_gears_dropped_5 = rows[0].avg_tele_gears_dropped;
          tot_tele_gear_knockouts_5 = rows[0].tot_tele_gear_knockouts;
          tot_climb_5 = rows[0].tot_climb;
          tot_climb_attempts_5 = rows[0].tot_climb_attempts;
          avg_climb_rating_5 = rows[0].avg_climb_rating;
          avg_climb_time_5 = rows[0].avg_climb_time;
          avg_mobility_rating_5 = rows[0].avg_mobility_rating;
          avg_defense_rating_5 = rows[0].avg_defense_rating;
          drive_type_5 = rows[0].drive_type;
          avg_contrib_kpa_5 = rows[0].avg_contrib_kpa;
          max_contrib_kpa_5 = rows[0].max_contrib_kpa;
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
          num_matches_6 = rows[0].num_matches;
          tot_auto_gears_scored_fdr_6 = rows[0].tot_auto_gears_scored_fdr;
          tot_auto_gears_scored_mid_6 = rows[0].tot_auto_gears_scored_mid;
          tot_auto_gears_scored_boi_6 = rows[0].tot_auto_gears_scored_boi;
          tot_auto_gears_scored_6 = rows[0].tot_auto_gears_scored;
          max_auto_gears_scored_6 = rows[0].max_auto_gears_scored;
          tot_auto_gears_attempts_6 = rows[0].tot_auto_gears_attempts;
          avg_auto_high_made_6 = rows[0].avg_auto_high_made;
          max_auto_high_made_6 = rows[0].max_auto_high_made;
          avg_auto_high_attempts_6 = rows[0].avg_auto_high_attempts;
          avg_auto_low_made_6 = rows[0].avg_auto_low_made;
          max_auto_low_made_6 = rows[0].max_auto_low_made;
          avg_auto_low_attempts_6 = rows[0].avg_auto_low_attempts;
          tot_baseline_cross_6 = rows[0].tot_baseline_cross;
          avg_auto_hopper_intake_6 = rows[0].avg_auto_hopper_intake;
          avg_auto_contrib_kpa_6 = rows[0].avg_auto_contrib_kpa;
          max_auto_contrib_kpa_6 = rows[0].max_auto_contrib_kpa;

          avg_tele_high_made_6 = rows[0].avg_tele_high_made;
          max_tele_high_made_6 = rows[0].avg_tele_high_made;
          avg_tele_high_attempts_6 = rows[0].avg_tele_high_attempts;
          avg_tele_low_made_6 = rows[0].avg_tele_low_made;
          max_tele_low_made_6 = rows[0].max_tele_low_made;
          avg_tele_low_attempts_6 = rows[0].avg_tele_low_attempts;
          avg_tele_gears_scored_6 = rows[0].avg_tele_gears_scored;
          max_tele_gears_scored_6 = rows[0].max_tele_gears_scored;
          avg_tele_gears_attempts_6 = rows[0].avg_tele_gears_attempts;
          avg_tele_floor_ball_intake_6 = rows[0].avg_tele_floor_ball_intake;
          avg_tele_floor_gear_intake_6 = rows[0].avg_tele_floor_gear_intake;
          avg_tele_hopper_intake_6 = rows[0].avg_tele_hopper_intake;
          avg_hp_gear_intake_6 = rows[0].avg_hp_gear_intake;
          avg_hp_gear_intake_miss_6 = rows[0].avg_hp_gear_intake_miss;
          avg_tele_gears_dropped_6 = rows[0].avg_tele_gears_dropped;
          tot_tele_gear_knockouts_6 = rows[0].tot_tele_gear_knockouts;
          tot_climb_6 = rows[0].tot_climb;
          tot_climb_attempts_6 = rows[0].tot_climb_attempts;
          avg_climb_rating_6 = rows[0].avg_climb_rating;
          avg_climb_time_6 = rows[0].avg_climb_time;
          avg_mobility_rating_6 = rows[0].avg_mobility_rating;
          avg_defense_rating_6 = rows[0].avg_defense_rating;
          drive_type_6 = rows[0].drive_type;
          avg_contrib_kpa_6 = rows[0].avg_contrib_kpa;
          max_contrib_kpa_6 = rows[0].max_contrib_kpa;
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
          return a.time - b.time; })
        .map(function (v) {
          return v.name; });

        // console.log(files);

        var match_sql_1 = "SELECT match_num FROM matches WHERE team_num=" + team_num_1 + " ORDER BY match_num DESC LIMIT 1";
        connection.query(match_sql_1, (err, rows) => {
          // most_recent_match_1 = files[rows[0].match_num - 1] || "N/A";
          // console.log(rows[0] == undefined);
          if(rows[0] != undefined) {
            most_recent_match_1[0] = rows[0].match_num;
            most_recent_match_1[1] = files[rows[0].match_num] || "N/A";
          }
          else {
            most_recent_match_1[0] = "N/A";
            most_recent_match_1[1] = "N/A";
          }
        });

        var match_sql_2 = "SELECT match_num FROM matches WHERE team_num=" + team_num_2 + " ORDER BY match_num DESC LIMIT 1";
        connection.query(match_sql_2, (err, rows) => {
          // most_recent_match_2 = files[rows[0].match_num - 1] || "N/A";
          if(rows[0] != undefined) {
            most_recent_match_2[0] = rows[0].match_num;
            most_recent_match_2[1] = files[rows[0].match_num] || "N/A";
          }
          else {
            most_recent_match_2[0] = "N/A";
            most_recent_match_2[1] = "N/A";
          }
        });

        var match_sql_3 = "SELECT match_num FROM matches WHERE team_num=" + team_num_3 + " ORDER BY match_num DESC LIMIT 1";
        connection.query(match_sql_3, (err, rows) => {
          if(rows[0] != undefined) {
            most_recent_match_3[0] = rows[0].match_num;
            most_recent_match_3[1] = files[rows[0].match_num] || "N/A";
          }
          else {
            most_recent_match_3[0] = "N/A";
            most_recent_match_3[1] = "N/A";
          }
        });

        var match_sql_4 = "SELECT match_num FROM matches WHERE team_num=" + team_num_4 + " ORDER BY match_num DESC LIMIT 1";
        connection.query(match_sql_4, (err, rows) => {
          if(rows[0] != undefined) {
            most_recent_match_4[0] = rows[0].match_num;
            most_recent_match_4[1] = files[rows[0].match_num] || "N/A";
          }
          else {
            most_recent_match_4[0] = "N/A";
            most_recent_match_4[1] = "N/A";
          }
        });

        var match_sql_5 = "SELECT match_num FROM matches WHERE team_num=" + team_num_5 + " ORDER BY match_num DESC LIMIT 1";
        connection.query(match_sql_5, (err, rows) => {
          if(rows[0] != undefined) {
            most_recent_match_5[0] = rows[0].match_num;
            most_recent_match_5[1] = files[rows[0].match_num] || "N/A";
          }
          else {
            most_recent_match_5[0] = "N/A";
            most_recent_match_5[1] = "N/A";
          }
        });

        var match_sql_6 = "SELECT match_num FROM matches WHERE team_num=" + team_num_6 + " ORDER BY match_num DESC LIMIT 1";
        connection.query(match_sql_6, (err, rows) => {
          if(rows[0] != undefined) {
            most_recent_match_6[0] = rows[0].match_num;
            most_recent_match_6[1] = files[rows[0].match_num] || "N/A";
          }
          else {
            most_recent_match_6[0] = "N/A";
            most_recent_match_6[1] = "N/A";
          }
        });
      });

          // console.log(tot_auto_gears_scored_1);
      setTimeout(() => {
        var ppt_template = require("ppt-template");
        var Presentation = ppt_template.Presentation;

        var myPres = new Presentation();
        myPres.loadFile(__dirname + "/alliances/alliance_interface.pptx")
        .then(() => {
          var mainSlide = myPres.getSlide(1); // Index starts at 1 for some reason
          mainSlide.fill([
            {
              key: "team_num_1",
              value: team_num_2
            },
            {
              key: "match_num_1",
              value: most_recent_match_2[0]
            },
            {
              key: "team_num_2",
              value: team_num_3
            },
            {
              key: "match_num_2",
              value: most_recent_match_3[0]
            },
            {
              key: "team_num_3",
              value: team_num_4
            },
            {
              key: "match_num_3",
              value: most_recent_match_4[0]
            },
            {
              key: "team_num_4",
              value: team_num_5
            },
            {
              key: "match_num_4",
              value: most_recent_match_5[0]
            },
            {
              key: "team_num_5",
              value: team_num_6
            },
            {
              key: "match_num_5",
              value: most_recent_match_6[0]
            },
          ]);
          var sheetSlide = myPres.getSlide(2); // Index starts at 1 for some reason
          sheetSlide.fill([
            {
              key: "team_num_1",
              value: team_num_1
            },
            {
              key: "avg_auto_contrib_kpa_1",
              value: avg_auto_contrib_kpa_1
            },
            {
              key: "avg_contrib_kpa_1",
              value: avg_contrib_kpa_1
            },
            {
              key: "max_contrib_kpa_1",
              value: max_contrib_kpa_1
            },
            {
              key: "num_matches_1",
              value: num_matches_1
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
              key: "max_auto_high_made_1",
              value: max_auto_high_made_1
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
              key: "max_auto_low_made_1",
              value: max_auto_low_made_1
            },
            {
              key: "avg_auto_hopper_intake_1",
              value: avg_auto_hopper_intake_1
            },
            {
              key: "tot_auto_gears_scored_fdr_1",
              value: tot_auto_gears_scored_fdr_1
            },
            {
              key: "tot_auto_gears_scored_mid_1",
              value: tot_auto_gears_scored_mid_1
            },
            {
              key: "tot_auto_gears_scored_boi_1",
              value: tot_auto_gears_scored_boi_1
            },
            {
              key: "tot_auto_gears_scored_1",
              value: tot_auto_gears_scored_1
            },
            {
              key: "tot_auto_gears_attempts_1",
              value: tot_auto_gears_attempts_1
            },
            {
              key: "max_auto_gears_scored_1",
              value: max_auto_gears_scored_1
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
              key: "max_tele_high_made_1",
              value: max_tele_high_made_1
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
              key: "max_tele_low_made_1",
              value: max_tele_low_made_1
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
              key: "max_tele_gears_scored_1",
              value: max_tele_gears_scored_1
            },
            {
              key: "tot_tele_gear_knockouts_1",
              value: tot_tele_gear_knockouts_1
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
              key: "avg_tele_floor_gear_intake_1",
              value: avg_tele_floor_gear_intake_1
            },
            {
              key: "avg_hp_gear_intake_1",
              value: avg_hp_gear_intake_1
            },
            {
              key: "avg_hp_gear_intake_miss_1",
              value: avg_hp_gear_intake_miss_1
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
              key: "avg_defense_rating_1",
              value: avg_defense_rating_1
            },
            {
              key: "avg_mobility_rating_1",
              value: avg_mobility_rating_1
            },
            {
              key: "team_num_2",
              value: team_num_2
            },
            {
              key: "avg_auto_contrib_kpa_2",
              value: avg_auto_contrib_kpa_2
            },
            {
              key: "avg_contrib_kpa_2",
              value: avg_contrib_kpa_2
            },
            {
              key: "max_contrib_kpa_2",
              value: max_contrib_kpa_2
            },
            {
              key: "num_matches_2",
              value: num_matches_2
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
              key: "max_auto_high_made_2",
              value: max_auto_high_made_2
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
              key: "max_auto_low_made_2",
              value: max_auto_low_made_2
            },
            {
              key: "avg_auto_hopper_intake_2",
              value: avg_auto_hopper_intake_2
            },
            {
              key: "tot_auto_gears_scored_fdr_2",
              value: tot_auto_gears_scored_fdr_2
            },
            {
              key: "tot_auto_gears_scored_mid_2",
              value: tot_auto_gears_scored_mid_2
            },
            {
              key: "tot_auto_gears_scored_boi_2",
              value: tot_auto_gears_scored_boi_2
            },
            {
              key: "tot_auto_gears_scored_2",
              value: tot_auto_gears_scored_2
            },
            {
              key: "tot_auto_gears_attempts_2",
              value: tot_auto_gears_attempts_2
            },
            {
              key: "max_auto_gears_scored_2",
              value: max_auto_gears_scored_2
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
              key: "max_tele_high_made_2",
              value: max_tele_high_made_2
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
              key: "max_tele_low_made_2",
              value: max_tele_low_made_2
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
              key: "max_tele_gears_scored_2",
              value: max_tele_gears_scored_2
            },
            {
              key: "tot_tele_gear_knockouts_2",
              value: tot_tele_gear_knockouts_2
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
              key: "avg_tele_floor_gear_intake_2",
              value: avg_tele_floor_gear_intake_2
            },
            {
              key: "avg_hp_gear_intake_2",
              value: avg_hp_gear_intake_2
            },
            {
              key: "avg_hp_gear_intake_miss_2",
              value: avg_hp_gear_intake_miss_2
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
              key: "avg_defense_rating_2",
              value: avg_defense_rating_2
            },
            {
              key: "avg_mobility_rating_2",
              value: avg_mobility_rating_2
            },
            {
              key: "team_num_3",
              value: team_num_3
            },
            {
              key: "avg_auto_contrib_kpa_3",
              value: avg_auto_contrib_kpa_3
            },
            {
              key: "avg_contrib_kpa_3",
              value: avg_contrib_kpa_3
            },
            {
              key: "max_contrib_kpa_3",
              value: max_contrib_kpa_3
            },
            {
              key: "num_matches_3",
              value: num_matches_3
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
              key: "max_auto_high_made_3",
              value: max_auto_high_made_3
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
              key: "max_auto_low_made_3",
              value: max_auto_low_made_3
            },
            {
              key: "avg_auto_hopper_intake_3",
              value: avg_auto_hopper_intake_3
            },
            {
              key: "tot_auto_gears_scored_fdr_3",
              value: tot_auto_gears_scored_fdr_3
            },
            {
              key: "tot_auto_gears_scored_mid_3",
              value: tot_auto_gears_scored_mid_3
            },
            {
              key: "tot_auto_gears_scored_boi_3",
              value: tot_auto_gears_scored_boi_3
            },
            {
              key: "tot_auto_gears_scored_3",
              value: tot_auto_gears_scored_3
            },
            {
              key: "tot_auto_gears_attempts_3",
              value: tot_auto_gears_attempts_3
            },
            {
              key: "max_auto_gears_scored_3",
              value: max_auto_gears_scored_3
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
              key: "max_tele_high_made_3",
              value: max_tele_high_made_3
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
              key: "max_tele_low_made_3",
              value: max_tele_low_made_3
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
              key: "max_tele_gears_scored_3",
              value: max_tele_gears_scored_3
            },
            {
              key: "tot_tele_gear_knockouts_3",
              value: tot_tele_gear_knockouts_3
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
              key: "avg_tele_floor_gear_intake_3",
              value: avg_tele_floor_gear_intake_3
            },
            {
              key: "avg_hp_gear_intake_3",
              value: avg_hp_gear_intake_3
            },
            {
              key: "avg_hp_gear_intake_miss_3",
              value: avg_hp_gear_intake_miss_3
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
              key: "avg_defense_rating_3",
              value: avg_defense_rating_3
            },
            {
              key: "avg_mobility_rating_3",
              value: avg_mobility_rating_3
            },
            {
              key: "team_num_4",
              value: team_num_4
            },
            {
              key: "avg_auto_contrib_kpa_4",
              value: avg_auto_contrib_kpa_4
            },
            {
              key: "avg_contrib_kpa_4",
              value: avg_contrib_kpa_4
            },
            {
              key: "max_contrib_kpa_4",
              value: max_contrib_kpa_4
            },
            {
              key: "num_matches_4",
              value: num_matches_4
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
              key: "max_auto_high_made_4",
              value: max_auto_high_made_4
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
              key: "max_auto_low_made_4",
              value: max_auto_low_made_4
            },
            {
              key: "avg_auto_hopper_intake_4",
              value: avg_auto_hopper_intake_4
            },
            {
              key: "tot_auto_gears_scored_fdr_4",
              value: tot_auto_gears_scored_fdr_4
            },
            {
              key: "tot_auto_gears_scored_mid_4",
              value: tot_auto_gears_scored_mid_4
            },
            {
              key: "tot_auto_gears_scored_boi_4",
              value: tot_auto_gears_scored_boi_4
            },
            {
              key: "tot_auto_gears_scored_4",
              value: tot_auto_gears_scored_4
            },
            {
              key: "tot_auto_gears_attempts_4",
              value: tot_auto_gears_attempts_4
            },
            {
              key: "max_auto_gears_scored_4",
              value: max_auto_gears_scored_4
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
              key: "max_tele_high_made_4",
              value: max_tele_high_made_4
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
              key: "max_tele_low_made_4",
              value: max_tele_low_made_4
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
              key: "max_tele_gears_scored_4",
              value: max_tele_gears_scored_4
            },
            {
              key: "tot_tele_gear_knockouts_4",
              value: tot_tele_gear_knockouts_4
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
              key: "avg_tele_floor_gear_intake_4",
              value: avg_tele_floor_gear_intake_4
            },
            {
              key: "avg_hp_gear_intake_4",
              value: avg_hp_gear_intake_4
            },
            {
              key: "avg_hp_gear_intake_miss_4",
              value: avg_hp_gear_intake_miss_4
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
              key: "avg_defense_rating_4",
              value: avg_defense_rating_4
            },
            {
              key: "avg_mobility_rating_4",
              value: avg_mobility_rating_4
            },
            {
              key: "team_num_5",
              value: team_num_5
            },
            {
              key: "avg_auto_contrib_kpa_5",
              value: avg_auto_contrib_kpa_5
            },
            {
              key: "avg_contrib_kpa_5",
              value: avg_contrib_kpa_5
            },
            {
              key: "max_contrib_kpa_5",
              value: max_contrib_kpa_5
            },
            {
              key: "num_matches_5",
              value: num_matches_5
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
              key: "max_auto_high_made_5",
              value: max_auto_high_made_5
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
              key: "max_auto_low_made_5",
              value: max_auto_low_made_5
            },
            {
              key: "avg_auto_hopper_intake_5",
              value: avg_auto_hopper_intake_5
            },
            {
              key: "tot_auto_gears_scored_fdr_5",
              value: tot_auto_gears_scored_fdr_5
            },
            {
              key: "tot_auto_gears_scored_mid_5",
              value: tot_auto_gears_scored_mid_5
            },
            {
              key: "tot_auto_gears_scored_boi_5",
              value: tot_auto_gears_scored_boi_5
            },
            {
              key: "tot_auto_gears_scored_5",
              value: tot_auto_gears_scored_5
            },
            {
              key: "tot_auto_gears_attempts_5",
              value: tot_auto_gears_attempts_5
            },
            {
              key: "max_auto_gears_scored_5",
              value: max_auto_gears_scored_5
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
              key: "max_tele_high_made_5",
              value: max_tele_high_made_5
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
              key: "max_tele_low_made_5",
              value: max_tele_low_made_5
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
              key: "max_tele_gears_scored_5",
              value: max_tele_gears_scored_5
            },
            {
              key: "tot_tele_gear_knockouts_5",
              value: tot_tele_gear_knockouts_5
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
              key: "avg_tele_floor_gear_intake_5",
              value: avg_tele_floor_gear_intake_5
            },
            {
              key: "avg_hp_gear_intake_5",
              value: avg_hp_gear_intake_5
            },
            {
              key: "avg_hp_gear_intake_miss_5",
              value: avg_hp_gear_intake_miss_5
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
              key: "avg_defense_rating_5",
              value: avg_defense_rating_5
            },
            {
              key: "avg_mobility_rating_5",
              value: avg_mobility_rating_5
            },
            {
              key: "team_num_6",
              value: team_num_6
            },
            {
              key: "avg_auto_contrib_kpa_6",
              value: avg_auto_contrib_kpa_6
            },
            {
              key: "avg_contrib_kpa_6",
              value: avg_contrib_kpa_6
            },
            {
              key: "max_contrib_kpa_6",
              value: max_contrib_kpa_6
            },
            {
              key: "num_matches_6",
              value: num_matches_6
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
              key: "max_auto_high_made_6",
              value: max_auto_high_made_6
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
              key: "max_auto_low_made_6",
              value: max_auto_low_made_6
            },
            {
              key: "avg_auto_hopper_intake_6",
              value: avg_auto_hopper_intake_6
            },
            {
              key: "tot_auto_gears_scored_fdr_6",
              value: tot_auto_gears_scored_fdr_6
            },
            {
              key: "tot_auto_gears_scored_mid_6",
              value: tot_auto_gears_scored_mid_6
            },
            {
              key: "tot_auto_gears_scored_boi_6",
              value: tot_auto_gears_scored_boi_6
            },
            {
              key: "tot_auto_gears_scored_6",
              value: tot_auto_gears_scored_6
            },
            {
              key: "tot_auto_gears_attempts_6",
              value: tot_auto_gears_attempts_6
            },
            {
              key: "max_auto_gears_scored_6",
              value: max_auto_gears_scored_6
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
              key: "max_tele_high_made_6",
              value: max_tele_high_made_6
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
              key: "max_tele_low_made_6",
              value: max_tele_low_made_6
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
              key: "max_tele_gears_scored_6",
              value: max_tele_gears_scored_6
            },
            {
              key: "tot_tele_gear_knockouts_6",
              value: tot_tele_gear_knockouts_6
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
              key: "avg_tele_floor_gear_intake_6",
              value: avg_tele_floor_gear_intake_6
            },
            {
              key: "avg_hp_gear_intake_6",
              value: avg_hp_gear_intake_6
            },
            {
              key: "avg_hp_gear_intake_miss_6",
              value: avg_hp_gear_intake_miss_6
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
              key: "avg_defense_rating_6",
              value: avg_defense_rating_6
            },
            {
              key: "avg_mobility_rating_6",
              value: avg_mobility_rating_6
            }
          ]);
          var video1 = myPres.getSlide(3);
          video1.fill([
            {
              key: "match_link_1",
              value: most_recent_match_2[1]
            }
          ]);
          var video2 = myPres.getSlide(4);
          video2.fill([
            {
              key: "match_link_2",
              value: most_recent_match_3[1]
            }
          ]);
          var video3 = myPres.getSlide(5);
          video3.fill([
            {
              key: "match_link_3",
              value: most_recent_match_4[1]
            }
          ]);
          var video4 = myPres.getSlide(6);
          video4.fill([
            {
              key: "match_link_4",
              value: most_recent_match_5[1]
            }
          ]);
          var video5 = myPres.getSlide(7);
          video5.fill([
            {
              key: "match_link_5",
              value: most_recent_match_6[1]
            }
          ]);
          var slides = [mainSlide, sheetSlide, video1, video2, video3, video4, video5];
          return myPres.generate(slides);
        }).then((newPres) => {
          newPres.saveAs(__dirname + "/alliances/alliance_" + team_num_1 + "_" + team_num_2 + "_" + team_num_3 + "_"
                          + team_num_4 + "_" + team_num_5 + "_" + team_num_6 + ".pptx");

          res.render('pages/alliance', {
	    req: req,
            team_num_1: team_num_1,
            team_name_1: team_name_1,
            tot_auto_gears_scored_fdr_1: tot_auto_gears_scored_fdr_1,
            tot_auto_gears_scored_mid_1: tot_auto_gears_scored_mid_1,
            tot_auto_gears_scored_boi_1: tot_auto_gears_scored_boi_1,
            tot_auto_gears_scored_1: tot_auto_gears_scored_1,
            max_auto_gears_scored_1: max_auto_gears_scored_1,
            tot_auto_gears_attempts_1: tot_auto_gears_attempts_1,
            avg_auto_high_made_1: avg_auto_high_made_1,
            max_auto_high_made_1: max_auto_high_made_1,
            avg_auto_high_attempts_1: avg_auto_high_attempts_1,
            avg_auto_low_made_1: avg_auto_low_made_1,
            max_auto_low_made_1: max_auto_low_made_1,
            avg_auto_low_attempts_1: avg_auto_low_attempts_1,
            tot_baseline_cross_1: tot_baseline_cross_1,
            avg_auto_hopper_intake_1: avg_auto_hopper_intake_1,
            avg_auto_contrib_kpa_1: avg_auto_contrib_kpa_1,
            max_auto_contrib_kpa_1: max_auto_contrib_kpa_1,
            avg_tele_high_made_1: avg_tele_high_made_1,
            max_tele_high_made_1: max_tele_high_made_1,
            avg_tele_high_attempts_1: avg_tele_high_attempts_1,
            avg_tele_low_made_1: avg_tele_low_made_1,
            max_tele_low_made_1: max_tele_low_made_1,
            avg_tele_low_attempts_1: avg_tele_low_attempts_1,
            avg_tele_gears_scored_1: avg_tele_gears_scored_1,
            max_tele_gears_scored_1: max_tele_gears_scored_1,
            avg_tele_gears_attempts_1: avg_tele_gears_attempts_1,
            avg_tele_floor_ball_intake_1: avg_tele_floor_ball_intake_1,
            avg_tele_floor_gear_intake_1: avg_tele_floor_gear_intake_1,
            avg_tele_hopper_intake_1: avg_tele_hopper_intake_1,
            avg_hp_gear_intake_1: avg_hp_gear_intake_1,
            avg_hp_gear_intake_miss_1: avg_hp_gear_intake_miss_1,
            avg_tele_gears_dropped_1: avg_tele_gears_dropped_1,
            tot_tele_gear_knockouts_1: tot_tele_gear_knockouts_1,
            tot_climb_1: tot_climb_1,
            tot_climb_attempts_1: tot_climb_attempts_1,
            avg_climb_rating_1: avg_climb_rating_1,
            avg_climb_time_1: avg_climb_time_1,
            avg_mobility_rating_1: avg_mobility_rating_1,
            avg_defense_rating_1: avg_defense_rating_1,
            avg_contrib_kpa_1: avg_contrib_kpa_1,
            max_contrib_kpa_1: max_contrib_kpa_1,
            drive_type_1: drive_type_1,
            no_autos_1: no_autos_1,
            most_recent_match_1: most_recent_match_1,

            team_num_2: team_num_2,
            team_name_2: team_name_2,
            tot_auto_gears_scored_fdr_2: tot_auto_gears_scored_fdr_2,
            tot_auto_gears_scored_mid_2: tot_auto_gears_scored_mid_2,
            tot_auto_gears_scored_boi_2: tot_auto_gears_scored_boi_2,
            tot_auto_gears_scored_2: tot_auto_gears_scored_2,
            max_auto_gears_scored_2: max_auto_gears_scored_2,
            tot_auto_gears_attempts_2: tot_auto_gears_attempts_2,
            avg_auto_high_made_2: avg_auto_high_made_2,
            max_auto_high_made_2: max_auto_high_made_2,
            avg_auto_high_attempts_2: avg_auto_high_attempts_2,
            avg_auto_low_made_2: avg_auto_low_made_2,
            max_auto_low_made_2: max_auto_low_made_2,
            avg_auto_low_attempts_2: avg_auto_low_attempts_2,
            tot_baseline_cross_2: tot_baseline_cross_2,
            avg_auto_hopper_intake_2: avg_auto_hopper_intake_2,
            avg_auto_contrib_kpa_2: avg_auto_contrib_kpa_2,
            max_auto_contrib_kpa_2: max_auto_contrib_kpa_2,
            avg_tele_high_made_2: avg_tele_high_made_2,
            max_tele_high_made_2: max_tele_high_made_2,
            avg_tele_high_attempts_2: avg_tele_high_attempts_2,
            avg_tele_low_made_2: avg_tele_low_made_2,
            max_tele_low_made_2: max_tele_low_made_2,
            avg_tele_low_attempts_2: avg_tele_low_attempts_2,
            avg_tele_gears_scored_2: avg_tele_gears_scored_2,
            max_tele_gears_scored_2: max_tele_gears_scored_2,
            avg_tele_gears_attempts_2: avg_tele_gears_attempts_2,
            avg_tele_floor_ball_intake_2: avg_tele_floor_ball_intake_2,
            avg_tele_floor_gear_intake_2: avg_tele_floor_gear_intake_2,
            avg_tele_hopper_intake_2: avg_tele_hopper_intake_2,
            avg_hp_gear_intake_2: avg_hp_gear_intake_2,
            avg_hp_gear_intake_miss_2: avg_hp_gear_intake_miss_2,
            avg_tele_gears_dropped_2: avg_tele_gears_dropped_2,
            tot_tele_gear_knockouts_2: tot_tele_gear_knockouts_2,
            tot_climb_2: tot_climb_2,
            tot_climb_attempts_2: tot_climb_attempts_2,
            avg_climb_rating_2: avg_climb_rating_2,
            avg_climb_time_2: avg_climb_time_2,
            avg_mobility_rating_2: avg_mobility_rating_2,
            avg_defense_rating_2: avg_defense_rating_2,
            avg_contrib_kpa_2: avg_contrib_kpa_2,
            max_contrib_kpa_2: max_contrib_kpa_2,
            drive_type_2: drive_type_2,
            no_autos_2: no_autos_2,
            most_recent_match_2: most_recent_match_2,

            team_num_3: team_num_3,
            team_name_3: team_name_3,
            tot_auto_gears_scored_fdr_3: tot_auto_gears_scored_fdr_3,
            tot_auto_gears_scored_mid_3: tot_auto_gears_scored_mid_3,
            tot_auto_gears_scored_boi_3: tot_auto_gears_scored_boi_3,
            tot_auto_gears_scored_3: tot_auto_gears_scored_3,
            max_auto_gears_scored_3: max_auto_gears_scored_3,
            tot_auto_gears_attempts_3: tot_auto_gears_attempts_3,
            avg_auto_high_made_3: avg_auto_high_made_3,
            max_auto_high_made_3: max_auto_high_made_3,
            avg_auto_high_attempts_3: avg_auto_high_attempts_3,
            avg_auto_low_made_3: avg_auto_low_made_3,
            max_auto_low_made_3: max_auto_low_made_3,
            avg_auto_low_attempts_3: avg_auto_low_attempts_3,
            tot_baseline_cross_3: tot_baseline_cross_3,
            avg_auto_hopper_intake_3: avg_auto_hopper_intake_3,
            avg_auto_contrib_kpa_3: avg_auto_contrib_kpa_3,
            max_auto_contrib_kpa_3: max_auto_contrib_kpa_3,
            avg_tele_high_made_3: avg_tele_high_made_3,
            max_tele_high_made_3: max_tele_high_made_3,
            avg_tele_high_attempts_3: avg_tele_high_attempts_3,
            avg_tele_low_made_3: avg_tele_low_made_3,
            max_tele_low_made_3: max_tele_low_made_3,
            avg_tele_low_attempts_3: avg_tele_low_attempts_3,
            avg_tele_gears_scored_3: avg_tele_gears_scored_3,
            max_tele_gears_scored_3: max_tele_gears_scored_3,
            avg_tele_gears_attempts_3: avg_tele_gears_attempts_3,
            avg_tele_floor_ball_intake_3: avg_tele_floor_ball_intake_3,
            avg_tele_floor_gear_intake_3: avg_tele_floor_gear_intake_3,
            avg_tele_hopper_intake_3: avg_tele_hopper_intake_3,
            avg_hp_gear_intake_3: avg_hp_gear_intake_3,
            avg_hp_gear_intake_miss_3: avg_hp_gear_intake_miss_3,
            avg_tele_gears_dropped_3: avg_tele_gears_dropped_3,
            tot_tele_gear_knockouts_3: tot_tele_gear_knockouts_3,
            tot_climb_3: tot_climb_3,
            tot_climb_attempts_3: tot_climb_attempts_3,
            avg_climb_rating_3: avg_climb_rating_3,
            avg_climb_time_3: avg_climb_time_3,
            avg_mobility_rating_3: avg_mobility_rating_3,
            avg_defense_rating_3: avg_defense_rating_3,
            avg_contrib_kpa_3: avg_contrib_kpa_3,
            max_contrib_kpa_3: max_contrib_kpa_3,
            drive_type_3: drive_type_3,
            no_autos_3: no_autos_3,
            most_recent_match_3: most_recent_match_3,

            team_num_4: team_num_4,
            team_name_4: team_name_4,
            tot_auto_gears_scored_fdr_4: tot_auto_gears_scored_fdr_4,
            tot_auto_gears_scored_mid_4: tot_auto_gears_scored_mid_4,
            tot_auto_gears_scored_boi_4: tot_auto_gears_scored_boi_4,
            tot_auto_gears_scored_4: tot_auto_gears_scored_4,
            max_auto_gears_scored_4: max_auto_gears_scored_4,
            tot_auto_gears_attempts_4: tot_auto_gears_attempts_4,
            avg_auto_high_made_4: avg_auto_high_made_4,
            max_auto_high_made_4: max_auto_high_made_4,
            avg_auto_high_attempts_4: avg_auto_high_attempts_4,
            avg_auto_low_made_4: avg_auto_low_made_4,
            max_auto_low_made_4: max_auto_low_made_4,
            avg_auto_low_attempts_4: avg_auto_low_attempts_4,
            tot_baseline_cross_4: tot_baseline_cross_4,
            avg_auto_hopper_intake_4: avg_auto_hopper_intake_4,
            avg_auto_contrib_kpa_4: avg_auto_contrib_kpa_4,
            max_auto_contrib_kpa_4: max_auto_contrib_kpa_4,
            avg_tele_high_made_4: avg_tele_high_made_4,
            max_tele_high_made_4: max_tele_high_made_4,
            avg_tele_high_attempts_4: avg_tele_high_attempts_4,
            avg_tele_low_made_4: avg_tele_low_made_4,
            max_tele_low_made_4: max_tele_low_made_4,
            avg_tele_low_attempts_4: avg_tele_low_attempts_4,
            avg_tele_gears_scored_4: avg_tele_gears_scored_4,
            max_tele_gears_scored_4: max_tele_gears_scored_4,
            avg_tele_gears_attempts_4: avg_tele_gears_attempts_4,
            avg_tele_floor_ball_intake_4: avg_tele_floor_ball_intake_4,
            avg_tele_floor_gear_intake_4: avg_tele_floor_gear_intake_4,
            avg_tele_hopper_intake_4: avg_tele_hopper_intake_4,
            avg_hp_gear_intake_4: avg_hp_gear_intake_4,
            avg_hp_gear_intake_miss_4: avg_hp_gear_intake_miss_4,
            avg_tele_gears_dropped_4: avg_tele_gears_dropped_4,
            tot_tele_gear_knockouts_4: tot_tele_gear_knockouts_4,
            tot_climb_4: tot_climb_4,
            tot_climb_attempts_4: tot_climb_attempts_4,
            avg_climb_rating_4: avg_climb_rating_4,
            avg_climb_time_4: avg_climb_time_4,
            avg_mobility_rating_4: avg_mobility_rating_4,
            avg_defense_rating_4: avg_defense_rating_4,
            avg_contrib_kpa_4: avg_contrib_kpa_4,
            max_contrib_kpa_4: max_contrib_kpa_4,
            drive_type_4: drive_type_4,
            no_autos_4: no_autos_4,
            most_recent_match_4: most_recent_match_4,

            team_num_5: team_num_5,
            team_name_5: team_name_5,
            tot_auto_gears_scored_fdr_5: tot_auto_gears_scored_fdr_5,
            tot_auto_gears_scored_mid_5: tot_auto_gears_scored_mid_5,
            tot_auto_gears_scored_boi_5: tot_auto_gears_scored_boi_5,
            tot_auto_gears_scored_5: tot_auto_gears_scored_5,
            max_auto_gears_scored_5: max_auto_gears_scored_5,
            tot_auto_gears_attempts_5: tot_auto_gears_attempts_5,
            avg_auto_high_made_5: avg_auto_high_made_5,
            max_auto_high_made_5: max_auto_high_made_5,
            avg_auto_high_attempts_5: avg_auto_high_attempts_5,
            avg_auto_low_made_5: avg_auto_low_made_5,
            max_auto_low_made_5: max_auto_low_made_5,
            avg_auto_low_attempts_5: avg_auto_low_attempts_5,
            tot_baseline_cross_5: tot_baseline_cross_5,
            avg_auto_hopper_intake_5: avg_auto_hopper_intake_5,
            avg_auto_contrib_kpa_5: avg_auto_contrib_kpa_5,
            max_auto_contrib_kpa_5: max_auto_contrib_kpa_5,
            avg_tele_high_made_5: avg_tele_high_made_5,
            max_tele_high_made_5: max_tele_high_made_5,
            avg_tele_high_attempts_5: avg_tele_high_attempts_5,
            avg_tele_low_made_5: avg_tele_low_made_5,
            max_tele_low_made_5: max_tele_low_made_5,
            avg_tele_low_attempts_5: avg_tele_low_attempts_5,
            avg_tele_gears_scored_5: avg_tele_gears_scored_5,
            max_tele_gears_scored_5: max_tele_gears_scored_5,
            avg_tele_gears_attempts_5: avg_tele_gears_attempts_5,
            avg_tele_floor_ball_intake_5: avg_tele_floor_ball_intake_5,
            avg_tele_floor_gear_intake_5: avg_tele_floor_gear_intake_5,
            avg_tele_hopper_intake_5: avg_tele_hopper_intake_5,
            avg_hp_gear_intake_5: avg_hp_gear_intake_5,
            avg_hp_gear_intake_miss_5: avg_hp_gear_intake_miss_5,
            avg_tele_gears_dropped_5: avg_tele_gears_dropped_5,
            tot_tele_gear_knockouts_5: tot_tele_gear_knockouts_5,
            tot_climb_5: tot_climb_5,
            tot_climb_attempts_5: tot_climb_attempts_5,
            avg_climb_rating_5: avg_climb_rating_5,
            avg_climb_time_5: avg_climb_time_5,
            avg_mobility_rating_5: avg_mobility_rating_5,
            avg_defense_rating_5: avg_defense_rating_5,
            avg_contrib_kpa_5: avg_contrib_kpa_5,
            max_contrib_kpa_5: max_contrib_kpa_5,
            drive_type_5: drive_type_5,
            no_autos_5: no_autos_5,
            most_recent_match_5: most_recent_match_5,

            team_num_6: team_num_6,
            team_name_6: team_name_6,
            tot_auto_gears_scored_fdr_6: tot_auto_gears_scored_fdr_6,
            tot_auto_gears_scored_mid_6: tot_auto_gears_scored_mid_6,
            tot_auto_gears_scored_boi_6: tot_auto_gears_scored_boi_6,
            tot_auto_gears_scored_6: tot_auto_gears_scored_6,
            max_auto_gears_scored_6: max_auto_gears_scored_6,
            tot_auto_gears_attempts_6: tot_auto_gears_attempts_6,
            avg_auto_high_made_6: avg_auto_high_made_6,
            max_auto_high_made_6: max_auto_high_made_6,
            avg_auto_high_attempts_6: avg_auto_high_attempts_6,
            avg_auto_low_made_6: avg_auto_low_made_6,
            max_auto_low_made_6: max_auto_low_made_6,
            avg_auto_low_attempts_6: avg_auto_low_attempts_6,
            tot_baseline_cross_6: tot_baseline_cross_6,
            avg_auto_hopper_intake_6: avg_auto_hopper_intake_6,
            avg_auto_contrib_kpa_6: avg_auto_contrib_kpa_6,
            max_auto_contrib_kpa_6: max_auto_contrib_kpa_6,
            avg_tele_high_made_6: avg_tele_high_made_6,
            max_tele_high_made_6: max_tele_high_made_6,
            avg_tele_high_attempts_6: avg_tele_high_attempts_6,
            avg_tele_low_made_6: avg_tele_low_made_6,
            max_tele_low_made_6: max_tele_low_made_6,
            avg_tele_low_attempts_6: avg_tele_low_attempts_6,
            avg_tele_gears_scored_6: avg_tele_gears_scored_6,
            max_tele_gears_scored_6: max_tele_gears_scored_6,
            avg_tele_gears_attempts_6: avg_tele_gears_attempts_6,
            avg_tele_floor_ball_intake_6: avg_tele_floor_ball_intake_6,
            avg_tele_floor_gear_intake_6: avg_tele_floor_gear_intake_6,
            avg_tele_hopper_intake_6: avg_tele_hopper_intake_6,
            avg_hp_gear_intake_6: avg_hp_gear_intake_6,
            avg_hp_gear_intake_miss_6: avg_hp_gear_intake_miss_6,
            avg_tele_gears_dropped_6: avg_tele_gears_dropped_6,
            tot_tele_gear_knockouts_6: tot_tele_gear_knockouts_6,
            tot_climb_6: tot_climb_6,
            tot_climb_attempts_6: tot_climb_attempts_6,
            avg_climb_rating_6: avg_climb_rating_6,
            avg_climb_time_6: avg_climb_time_6,
            avg_mobility_rating_6: avg_mobility_rating_6,
            avg_defense_rating_6: avg_defense_rating_6,
            avg_contrib_kpa_6: avg_contrib_kpa_6,
            max_contrib_kpa_6: max_contrib_kpa_6,
            drive_type_6: drive_type_6,
            no_autos_6: no_autos_6,
            most_recent_match_6: most_recent_match_6
          });
        });
      }, 2500);
		// });
	});

  router.get("/alliance-ppt/:team_1,:team_2,:team_3,:team_4,:team_5,:team_6", ensureLogin.ensureLoggedIn('/login'), function(req, res) {
    var team_num_1 = req.params.team_1;
    var team_num_2 = req.params.team_2;
    var team_num_3 = req.params.team_3;
    var team_num_4 = req.params.team_4;
    var team_num_5 = req.params.team_5;
    var team_num_6 = req.params.team_6;
    res.download(__dirname + "/alliances/alliance_" + team_num_1 + "_" + team_num_2 + "_" + team_num_3 + "_"
                    + team_num_4 + "_" + team_num_5 + "_" + team_num_6 + ".pptx");
  });

  router.get('/match/:match_num', ensureLogin.ensureLoggedIn('/login'), function(req, res) {
    res.render('pages/match', { req: req });
  });

  router.get('/team/:team_num', ensureLogin.ensureLoggedIn('/login'), function(req,res) {
    // stdevGears(req.params.team_num);
    updateRanks();

    var team_num = Number(req.params.team_num);
    var team_name = "";
    var num_matches = 0;
    var next_team_num = 0;
    var previous_team_num = 0;
    var tot_auto_gears_scored = 0;
    var max_auto_gears_scored = 0;
    var tot_auto_gears_attempts = 0;
    var avg_auto_high_made = 0;
    var max_auto_high_made = 0;
    var avg_auto_high_attempts = 0;
    var avg_auto_low_made = 0;
    var max_auto_low_made = 0;
    var avg_auto_low_attempts = 0;
    var tot_baseline_cross = 0;
    var avg_auto_hopper_intake = 0;
    var avg_auto_contrib_kpa = 0;
    var max_auto_contrib_kpa = 0;

    var avg_tele_high_made = 0;
    var max_tele_high_made = 0;
    var avg_tele_high_attempts = 0;
    var avg_tele_low_made = 0;
    var max_tele_low_made = 0;
    var avg_tele_low_attempts = 0;
    var avg_tele_gears_scored = 0;
    var max_tele_gears_scored = 0;
    var avg_tele_gears_attempts = 0;
    var avg_tele_floor_ball_intake = 0;
    var avg_tele_floor_gear_intake = 0;
    var avg_tele_hopper_intake= 0;
    var avg_hp_gear_intake = 0;
    var avg_hp_gear_intake_miss = 0;
    var avg_tele_gears_dropped = 0;
    var tot_tele_gear_knockouts = 0;
    var tot_climb = 0;
    var tot_climb_attempts = 0;
    var avg_climb_rating = 0;
    var avg_climb_time = 0;
    var avg_mobility_rating = 0;
    var avg_defense_rating = 0;
    var drive_type = "";
    var avg_contrib_kpa = 0;
    var max_contrib_kpa = 0;

    var no_autos = 0;
    var trend_labels = "";
    var tele_gears_trend = "";
    var auto_gears_trend = "";
    var tele_high_goal_trend = "";
    var auto_high_goal_trend = "";
    var climb_trend = "";
    var tele_gear_ranked = 0;
    var auto_gear_ranked = 0;
    var climb_ranked = 0;
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
      tot_auto_gears_scored_fdr = rows[0].tot_auto_gears_scored_fdr;
      tot_auto_gears_scored_mid = rows[0].tot_auto_gears_scored_mid;
      tot_auto_gears_scored_boi = rows[0].tot_auto_gears_scored_boi;
      tot_auto_gears_scored = rows[0].tot_auto_gears_scored;
      max_auto_gears_scored = rows[0].max_auto_gears_scored;
      tot_auto_gears_attempts = rows[0].tot_auto_gears_attempts;
      avg_auto_high_made = rows[0].avg_auto_high_made;
      max_auto_high_made = rows[0].max_auto_high_made;
      avg_auto_high_attempts = rows[0].avg_auto_high_attempts;
      avg_auto_low_made = rows[0].avg_auto_low_made;
      max_auto_low_made = rows[0].max_auto_low_made;
      avg_auto_low_attempts = rows[0].avg_auto_low_attempts;
      tot_baseline_cross = rows[0].tot_baseline_cross;
      avg_auto_hopper_intake = rows[0].avg_auto_hopper_intake;
      avg_auto_contrib_kpa = rows[0].avg_auto_contrib_kpa;
      max_auto_contrib_kpa = rows[0].max_auto_contrib_kpa;

      avg_tele_high_made = rows[0].avg_tele_high_made;
      max_tele_high_made = rows[0].max_tele_high_made;
      avg_tele_high_attempts = rows[0].avg_tele_high_attempts;
      avg_tele_low_made = rows[0].avg_tele_low_made;
      max_tele_low_made = rows[0].max_tele_low_made;
      avg_tele_low_attempts = rows[0].avg_tele_low_attempts;
      avg_tele_gears_scored = rows[0].avg_tele_gears_scored;
      max_tele_gears_scored = rows[0].max_tele_gears_scored;
      avg_tele_gears_attempts = rows[0].avg_tele_gears_attempts;
      avg_tele_floor_ball_intake = rows[0].avg_tele_floor_ball_intake;
      avg_tele_floor_gear_intake = rows[0].avg_tele_floor_gear_intake;
      avg_tele_hopper_intake = rows[0].avg_tele_hopper_intake;
      avg_hp_gear_intake = rows[0].avg_hp_gear_intake;
      avg_hp_gear_intake_miss = rows[0].avg_hp_gear_intake_miss;
      avg_tele_gears_dropped = rows[0].avg_tele_gears_dropped;
      tot_tele_gear_knockouts = rows[0].tot_tele_gear_knockouts;
      tot_climb = rows[0].tot_climb;
      tot_climb_attempts = rows[0].tot_climb_attempts;
      avg_climb_rating = rows[0].avg_climb_rating;
      avg_climb_time = rows[0].avg_climb_time;
      avg_mobility_rating = rows[0].avg_mobility_rating;
      avg_defense_rating = rows[0].avg_defense_rating;
      drive_type = rows[0].drive_type;
      avg_contrib_kpa = rows[0].avg_contrib_kpa;
      max_contrib_kpa = rows[0].max_contrib_kpa;
    });

    var no_auto_sql = "SELECT * FROM matches WHERE team_num='"+ team_num +"'";
    connection.query(no_auto_sql, function(err, rows, fields) {
      for(var x in rows)
      {
        if(rows[x].auto_high_made == 0 && rows[x].auto_high_missed == 0 && rows[x].auto_low_made == 0
          && rows[x].auto_low_missed == 0 && rows[x].baseline_cross == 0 && rows[x].auto_hopper_intake == 0
          && rows[x].auto_gears_scored == 0 && rows[x].auto_gears_missed == 0)
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
        climb_trend += rows[x].climb_rating + ", ";
      }
      // console.log(high_goal_trend);
      // console.log(gears_trend);

    });

    var dir = __dirname + "\\public\\videos";
    var files = null;

/*    fs.readdir(dir, function(err, files) {
      if(err) { console.log(err); return; }
      files = files.map(function (fileName) {
        return {
          name: fileName,
          time: fs.statSync(dir + '/' + fileName).mtime.getTime()
        };
      })
      .sort(function (a, b) {
        // return a.time - b.time; })
        // console.log(b.name.substring(4,8));
        // console.log(a.name.substring(4,8));
        return Number(Number(a.name.substring(4,8)) - Number(b.name.substring(4,8))); })
      .map(function (v) {
        return v.name; });*/

      // console.log(files);

      var match_sql = "SELECT match_num FROM matches WHERE team_num = " + team_num;
      connection.query(match_sql, function(err, rows, fields) {
        /*for(var x in rows) {
          // console.log(x % 2 === 0);// + ", " + x % 2 === 1 + ", " + x + 1 >= rows.size + ", " + rows.size + ", " + x);
          // console.log(x % 2 === 1);
          // console.log((Number(x) + 1) >= rows.length);
          // console.log(rows.length);
          // console.log(x);
          if(x % 2 === 0) {
            // console.log("first in a row");
            videos += "<div class=\"row\">";
          }
          videos += "<div class=\"col-lg-6\"><video width=\"480\" height=\"360\" controls><source src=\"../videos/" + files[rows[x].match_num] + "\" type=\"video/mp4\"/></video><h4>Match " + rows[x].match_num + "</h4></div>";
          if(x % 2 === 1 || (Number(x) + 1) >= rows.length) {
            // console.log("last in a row");
            videos += "</div>";
          }
        }*/

        var tele_gear_ranked = tele_gear_rank[team_num];
        var auto_gear_ranked = auto_gear_rank[team_num];
        var climb_ranked = climb_rank[team_num];

        // console.log(videos);
        res.render('pages/team', {
	  req: req,
          team_num: team_num,
          team_name: team_name,
          previous_team_num: previous_team_num,
          next_team_num: next_team_num,
          tot_auto_gears_scored_fdr: tot_auto_gears_scored_fdr,
          tot_auto_gears_scored_mid: tot_auto_gears_scored_mid,
          tot_auto_gears_scored_boi: tot_auto_gears_scored_boi,
          tot_auto_gears_scored: tot_auto_gears_scored,
          max_auto_gears_scored: max_auto_gears_scored,
          tot_auto_gears_attempts: tot_auto_gears_attempts,
          avg_auto_high_made: avg_auto_high_made,
          max_auto_high_made: max_auto_high_made,
          avg_auto_high_attempts: avg_auto_high_attempts,
          avg_auto_low_made: avg_auto_low_made,
          max_auto_low_made: max_auto_low_made,
          avg_auto_low_attempts: avg_auto_low_attempts,
          tot_baseline_cross: tot_baseline_cross,
          avg_auto_hopper_intake: avg_auto_hopper_intake,
          avg_auto_contrib_kpa: avg_auto_contrib_kpa,
          max_auto_contrib_kpa: max_auto_contrib_kpa,

          avg_tele_high_made: avg_tele_high_made,
          max_tele_high_made: max_tele_high_made,
          avg_tele_high_attempts: avg_tele_high_attempts,
          avg_tele_low_made: avg_tele_low_made,
          max_tele_low_made: max_tele_low_made,
          avg_tele_low_attempts: avg_tele_low_attempts,
          avg_tele_gears_scored: avg_tele_gears_scored,
          max_tele_gears_scored: max_tele_gears_scored,
          avg_tele_gears_attempts: avg_tele_gears_attempts,
          avg_tele_floor_ball_intake: avg_tele_floor_ball_intake,
          avg_tele_floor_gear_intake: avg_tele_floor_gear_intake,
          avg_tele_hopper_intake: avg_tele_hopper_intake,
          avg_hp_gear_intake: avg_hp_gear_intake,
          avg_hp_gear_intake_miss: avg_hp_gear_intake_miss,
          avg_tele_gears_dropped: avg_tele_gears_dropped,
          tot_tele_gear_knockouts: tot_tele_gear_knockouts,
          tot_climb: tot_climb,
          tot_climb_attempts: tot_climb_attempts,
          avg_climb_rating: avg_climb_rating,
          avg_climb_time: avg_climb_time,
          avg_mobility_rating: avg_mobility_rating,
          avg_defense_rating: avg_defense_rating,
          avg_contrib_kpa: avg_contrib_kpa,
          max_contrib_kpa: max_contrib_kpa,
          drive_type: drive_type,
          no_autos: no_autos,
          trend_labels: trend_labels,
          tele_gears_trend: tele_gears_trend,
          auto_gears_trend: auto_gears_trend,
          tele_high_goal_trend: tele_high_goal_trend,
          auto_high_goal_trend: auto_high_goal_trend,
          climb_trend: climb_trend,
          tele_gear_ranked: tele_gear_ranked,
          auto_gear_ranked: auto_gear_ranked,
          climb_ranked: climb_ranked,
          videos: videos
        });
      });
    });
  //});

  router.get('/data-entry', reqAdmin(), function(req, res) {
    var display_entry = "";
    if(most_recent == -1)
      display_entry = '<div class="alert alert-danger" role="alert"><p><b>Oh snap</b>, looks like this is a duplicate entry. Data not queried.</p></div>';
    else if(most_recent != -1 && most_recent != 0)
      display_entry = "<div class=\"alert alert-success\" role=\"alert\"><p>Data for <b>"+ most_recent +"</b> has been <b>successfully</b> entered. <b>" + num_matches + " teams</b> have been entered for <b>match #" + most_recent_match + ".</b></p></div>";


    res.render('pages/data_entry', {
      req: req,
      message: display_entry
    });
  });

  router.post('/parse-data', reqAdmin(), function(req, res) {
    var team_num = Number(req.body.team_num);
    var match_num = Number(req.body.match_num);

    var auto_high_made = Number(req.body.auto_high_made);
    var auto_high_missed = Number(req.body.auto_high_missed);
    var auto_low_made = Number(req.body.auto_low_made);
    var auto_low_missed = Number(req.body.auto_low_missed);
    var baseline_cross = Number(req.body.baseline_cross);
    var auto_hopper_intake = Number(req.body.auto_hopper_intake);
    var auto_gears_scored = Number(req.body.auto_gears_scored);
    var auto_gears_missed = Number(req.body.auto_gears_missed);
    var auto_gear_location = req.body.auto_gear_location;
    var tele_high_made = Number(req.body.tele_high_made);
    var tele_high_missed = Number(req.body.tele_high_missed);
    var tele_low_made = Number(req.body.tele_low_made);
    var tele_low_missed = Number(req.body.tele_low_missed);
    var tele_floor_ball_intake = Number(req.body.tele_floor_ball_intake);
    var tele_hopper_intake = Number(req.body.tele_hopper_intake);
    var tele_gears_scored = Number(req.body.tele_gears_scored);
    var tele_gears_missed = Number(req.body.tele_gears_missed);
    var tele_floor_gear_intake = Number(req.body.tele_floor_gear_intake);
    var hp_gear_intake = Number(req.body.hp_gear_intake);
    var hp_gear_intake_miss = Number(req.body.hp_gear_intake_miss);
    var tele_gears_dropped = Number(req.body.tele_gears_dropped);
    var tele_gear_knockouts = Number(req.body.tele_gear_knockouts);
    var climb_rating = Number(req.body.climb_rating);
    var climb_time = Number(req.body.climb_time);
    var mobility_rating = Number(req.body.mobility_rating);
    var defense_rating = Number(req.body.defense_rating);

    var auto_kpa = auto_high_made + 1/3 * auto_low_made;
    var tot_kpa = auto_kpa + 1/3 * tele_high_made + 1/9 * tele_low_made;

    var matches_sql_v2 = "INSERT INTO `matches` (`match_num`, `team_num`, `auto_high_made`, `auto_high_missed`, " +
      "`auto_low_made`, `auto_low_missed`, `baseline_cross`, `auto_hopper_intake`, " +
      "`auto_gears_scored`, `auto_gears_missed`, `auto_gear_location`, `tele_high_made`, `tele_high_missed`, " +
      "`tele_low_made`, `tele_low_missed`, `tele_floor_ball_intake`, `tele_hopper_intake`, `tele_gears_scored`, " +
      "`tele_gears_missed`, `tele_floor_gear_intake`, `hp_gear_intake`, `hp_gear_intake_miss`, `tele_gears_dropped`, " +
      "`tele_gear_knockouts`, `climb_rating`, `climb_time`, `mobility_rating`, `defense_rating`, " +
      "`auto_contrib_kpa`, `contrib_kpa`) VALUES (" + match_num + ", " + team_num + ", " + auto_high_made + ", " + auto_high_missed +
      ", " + auto_low_made + ", " + auto_low_missed + ", " + baseline_cross + ", " + auto_hopper_intake + ", " + auto_gears_scored +
      ", " + auto_gears_missed + ", \"" + auto_gear_location + "\", " + tele_high_made + ", " + tele_high_missed + ", " + tele_low_made +
      ", " + tele_low_missed + ", " + tele_floor_ball_intake + ", " + tele_hopper_intake + ", " + tele_gears_scored +
      ", " + tele_gears_missed + ", " + tele_floor_gear_intake + ", " + hp_gear_intake + ", " + hp_gear_intake_miss +
      ", " + tele_gears_dropped + ", " + tele_gear_knockouts + ", " + climb_rating + ", " + climb_time + ", " + mobility_rating +
      ", " + defense_rating + ", " + auto_kpa + ", " + tot_kpa + ");"
    connection.query("SELECT * FROM matches WHERE match_num=" + match_num, function(err, rows) {
      num_matches = rows.length + 1 || 1;
      connection.query(matches_sql_v2, function(err) {
        if(err)
        {
          most_recent = -1;
          most_recent_match = -1;
          updateTeams(team_num);
          console.log(err);
        }
        else
        {
          most_recent = team_num;
          most_recent_match = match_num;
          updateTeams(team_num);
        }
        res.redirect('/data-entry');
      });
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

  function stdevGears(team_num)
  {
    var stdev1 = 0;
    var stdev2 = 0;
    var mean = 0;
    var dev1 = [];
    var dev2 = [];
    var stdev_sql = "SELECT STD(tele_gears_scored) AS \"stdev\" FROM matches WHERE team_num=" + team_num;
    connection.query(stdev_sql, function(err, rows) {
      stdev1 = rows[0].stdev;
    });
    var avg_sql = "SELECT AVG(tele_gears_scored) AS \"avg_gears\" FROM matches WHERE team_num=" + team_num;
    connection.query(avg_sql, function(err, rows) {
      mean = rows[0].avg_gears;
    });
    var matches_sql = "SELECT tele_gears_scored FROM matches WHERE team_num=" + team_num;
    connection.query(matches_sql, function(err, rows) {
      for(var x in rows)
      {
        dev1[x] = Math.abs(mean - rows[x].tele_gears_scored);
        dev2[x] = Math.abs(stdev1 - dev1[x]);
        stdev2 += (dev2[x] * dev2[x]);
        // console.log(dev1[x]);
        // console.log(dev2[x]);
      }
      stdev2 /= rows.length;
      stdev2 = Math.sqrt(stdev2);
      console.log(stdev1);
      console.log(stdev2);
    });
  }

  function updateRanks()
  {
    var tele_gear_sql = "SELECT * FROM teams ORDER BY avg_tele_gears_scored DESC";
    connection.query(tele_gear_sql, function(err, rows) {
      for(var x in rows)
      {
        // console.log(x);
        tele_gear_rank[rows[x].team_num] = Number(x) + 1;
      }
      // console.log(tele_gear_rank[3008]);
    });

    var auto_gear_sql = "SELECT * FROM teams ORDER BY tot_auto_gears_scored DESC";
    connection.query(auto_gear_sql, function(err, rows) {
      for(var x in rows)
      {
        // console.log(x);
        auto_gear_rank[rows[x].team_num] = Number(x) + 1;
      }
      // console.log(tele_gear_rank[118]);
    });

    var climb_sql = "SELECT * FROM teams ORDER BY avg_climb_rating DESC";
    connection.query(climb_sql, function(err, rows) {
      for(var x in rows)
      {
        // console.log(x);
        climb_rank[rows[x].team_num] = Number(x) + 1;
      }
      // console.log(tele_gear_rank[118]);
    });
  }

  function updateTeams(team_num)
  {
    //  console.log("updating data into teams for team: " + team_num);
      var team_sql = "UPDATE teams SET num_matches=(SELECT COUNT(*) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_gears_scored_fdr=(SELECT AVG(auto_gears_scored) FROM matches WHERE auto_gear_location=\"FDR\" AND team_num=" + team_num + "), " +
      "tot_auto_gears_scored_fdr=(SELECT SUM(auto_gears_scored) FROM matches WHERE auto_gear_location=\"FDR\" AND team_num=" + team_num + "), " +

      "tot_auto_gears_scored_mid=(SELECT AVG(auto_gears_scored) FROM matches WHERE auto_gear_location=\"MID\" AND team_num=" + team_num + "), " +
      "tot_auto_gears_scored_mid=(SELECT SUM(auto_gears_scored) FROM matches WHERE auto_gear_location=\"MID\" AND team_num=" + team_num + "), " +

      "tot_auto_gears_scored_boi=(SELECT AVG(auto_gears_scored) FROM matches WHERE auto_gear_location=\"BOI\" AND team_num=" + team_num + "), " +
      "tot_auto_gears_scored_boi=(SELECT SUM(auto_gears_scored) FROM matches WHERE auto_gear_location=\"BOI\" AND team_num=" + team_num + "), " +

      "perc_auto_gears_scored=100*(SELECT SUM(auto_gears_scored)/(SUM(auto_gears_missed)+SUM(auto_gears_scored)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_gears_scored=(SELECT SUM(auto_gears_scored) FROM matches WHERE team_num=" + team_num + "), " +
      "max_auto_gears_scored=(SELECT auto_gears_scored FROM matches WHERE team_num=" + team_num + " ORDER BY auto_gears_scored DESC LIMIT 1), " +
      "tot_auto_gears_attempts=(SELECT SUM(auto_gears_scored)+SUM(auto_gears_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_auto_gears_scored=(SELECT AVG(auto_gears_scored) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_auto_gears_attempts=(SELECT AVG(auto_gears_scored+auto_gears_missed) FROM matches WHERE team_num=" + team_num + "), " +

      "perc_auto_high_made=100*(SELECT SUM(auto_high_made)/(SUM(auto_high_missed)+SUM(auto_high_made)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_high_made=(SELECT SUM(auto_high_made) FROM matches WHERE team_num=" + team_num + "), " +
      "max_auto_high_made=(SELECT auto_high_made FROM matches WHERE team_num=" + team_num + " ORDER BY auto_high_made DESC LIMIT 1), " +
      "tot_auto_high_attempts=(SELECT SUM(auto_high_made)+SUM(auto_high_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_auto_high_made=(SELECT AVG(auto_high_made) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_auto_high_attempts=(SELECT AVG(auto_high_made+auto_high_missed) FROM matches WHERE team_num=" + team_num + "), " +
      // "std_auto_high_made=(SELECT STD(auto_high_made) FROM matches WHERE team_num=" + team_num + "), " +
      // "cst_auto_high_made=avg_auto_high_made/std_auto_high_made, " +

      "perc_auto_low_made=100*(SELECT SUM(auto_low_made)/(SUM(auto_low_missed)+SUM(auto_low_made)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_low_made=(SELECT SUM(auto_low_made) FROM matches WHERE team_num=" + team_num + "), " +
      "max_auto_low_made=(SELECT auto_low_made FROM matches WHERE team_num=" + team_num + " ORDER BY auto_low_made DESC LIMIT 1), " +
      "tot_auto_low_attempts=(SELECT SUM(auto_low_made)+SUM(auto_low_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_auto_low_made=(SELECT AVG(auto_low_made) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_auto_low_attempts=(SELECT AVG(auto_low_made+auto_low_missed) FROM matches WHERE team_num=" + team_num + "), " +

      "tot_baseline_cross=(SELECT SUM(baseline_cross) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_auto_hopper_intake=(SELECT AVG(auto_hopper_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_auto_hopper_intake=(SELECT SUM(auto_hopper_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "perc_tele_high_made=100*(SELECT SUM(tele_high_made)/(SUM(tele_high_missed)+SUM(tele_high_made)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_high_made=(SELECT SUM(tele_high_made) FROM matches WHERE team_num=" + team_num + "), " +
      "max_tele_high_made=(SELECT tele_high_made FROM matches WHERE team_num=" + team_num + " ORDER BY tele_high_made DESC LIMIT 1), " +
      "tot_tele_high_attempts=(SELECT SUM(tele_high_made)+SUM(tele_high_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_high_made=(SELECT AVG(tele_high_made) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_high_attempts=(SELECT AVG(tele_high_made+tele_high_missed) FROM matches WHERE team_num=" + team_num + "), " +
      // "std_tele_high_made=(SELECT STD(tele_high_made) FROM matches WHERE team_num=" + team_num + "), " +
      // "cst_tele_high_made=avg_tele_high_made/std_tele_high_made, " +

      "perc_tele_low_made=100*(SELECT SUM(tele_low_made)/(SUM(tele_low_missed)+SUM(tele_low_made)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_low_made=(SELECT SUM(tele_low_made) FROM matches WHERE team_num=" + team_num + "), " +
      "max_tele_low_made=(SELECT tele_low_made FROM matches WHERE team_num=" + team_num + " ORDER BY tele_low_made DESC LIMIT 1), " +
      "tot_tele_low_attempts=(SELECT SUM(tele_low_made)+SUM(tele_low_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_low_made=(SELECT AVG(tele_low_made) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_low_attempts=(SELECT AVG(tele_low_made+tele_low_missed) FROM matches WHERE team_num=" + team_num + "), " +

      "perc_tele_gears_scored=100*(SELECT SUM(tele_gears_scored)/(SUM(tele_gears_missed)+SUM(tele_gears_scored)) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_gears_scored=(SELECT SUM(tele_gears_scored) FROM matches WHERE team_num=" + team_num + "), " +
      "max_tele_gears_scored=(SELECT tele_gears_scored FROM matches WHERE team_num=" + team_num + " ORDER BY tele_gears_scored DESC LIMIT 1), " +
      "tot_tele_gears_attempts=(SELECT SUM(tele_gears_scored)+SUM(tele_gears_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_gears_scored=(SELECT AVG(tele_gears_scored) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_tele_gears_attempts=(SELECT AVG(tele_gears_scored+tele_gears_missed) FROM matches WHERE team_num=" + team_num + "), " +
      "std_tele_gears_scored=(SELECT STD(tele_gears_scored) FROM matches WHERE team_num=" + team_num + "), " +
      "cst_tele_gears_scored=avg_tele_gears_scored/std_tele_gears_scored, " +

      "avg_tele_floor_ball_intake=(SELECT AVG(tele_floor_ball_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_floor_ball_intake=(SELECT SUM(tele_floor_ball_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_tele_hopper_intake=(SELECT AVG(tele_hopper_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_hopper_intake=(SELECT SUM(tele_hopper_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_tele_floor_gear_intake=(SELECT AVG(tele_floor_gear_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_floor_gear_intake=(SELECT SUM(tele_floor_gear_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_hp_gear_intake=(SELECT AVG(hp_gear_intake) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_hp_gear_intake=(SELECT SUM(hp_gear_intake) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_hp_gear_intake_miss=(SELECT AVG(hp_gear_intake_miss) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_hp_gear_intake_miss=(SELECT SUM(hp_gear_intake_miss) FROM matches WHERE team_num=" + team_num + "), " +

      "avg_tele_gears_dropped=(SELECT AVG(tele_gears_dropped) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_gears_dropped=(SELECT SUM(tele_gears_dropped) FROM matches WHERE team_num=" + team_num + "), " +

      "tot_tele_gear_knockouts=(SELECT AVG(tele_gear_knockouts) FROM matches WHERE team_num=" + team_num + "), " +
      "tot_tele_gear_knockouts=(SELECT SUM(tele_gear_knockouts) FROM matches WHERE team_num=" + team_num + "), " +

      "perc_climb=100*((SELECT COUNT(*) FROM matches WHERE climb_rating=5 AND team_num=" + team_num + ")/(SELECT COUNT(*) FROM matches WHERE climb_rating<>0 AND team_num=" + team_num + ")), " +
      "tot_climb=(SELECT COUNT(*) FROM matches WHERE climb_rating=5 AND team_num=" + team_num + "), " +
      "tot_climb_attempts=(SELECT COUNT(*) FROM matches WHERE climb_rating<>0 AND team_num=" + team_num + "), " +

      "avg_climb_rating=(SELECT AVG(climb_rating) FROM matches WHERE climb_rating<>0 AND team_num=" + team_num + "), " +
      "avg_climb_time=(SELECT AVG(climb_time) FROM matches WHERE climb_rating<>0 AND team_num=" + team_num + "), " +

      "avg_mobility_rating=(SELECT AVG(mobility_rating) FROM matches WHERE team_num=" + team_num + "), " +
      "avg_defense_rating=(SELECT AVG(defense_rating) FROM matches WHERE team_num=" + team_num + " AND defense_rating<>0), " +

      "avg_auto_contrib_kpa=(SELECT AVG(auto_contrib_kpa) FROM matches WHERE team_num=" + team_num + "), "  +
      "max_auto_contrib_kpa=(SELECT auto_contrib_kpa FROM matches WHERE team_num=" + team_num + " ORDER BY auto_contrib_kpa DESC LIMIT 1), " +
      "avg_contrib_kpa=(SELECT AVG(contrib_kpa) FROM matches WHERE team_num=" + team_num + "), " +
      "max_contrib_kpa=(SELECT contrib_kpa FROM matches WHERE team_num=" + team_num + " ORDER BY contrib_kpa DESC LIMIT 1) " +

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
