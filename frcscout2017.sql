-- phpMyAdmin SQL Dump
-- version 4.5.1
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Jan 26, 2017 at 05:12 AM
-- Server version: 10.1.10-MariaDB
-- PHP Version: 5.5.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `frcscout2017`
--

-- --------------------------------------------------------

--
-- Table structure for table `matches`
--

CREATE TABLE `matches` (
  `match_num` int(11) NOT NULL,
  `team_num` int(11) NOT NULL,
  `auto_high_made` int(11) NOT NULL,
  `auto_high_missed` int(11) NOT NULL,
  `auto_low_made` int(11) NOT NULL,
  `auto_low_missed` int(11) NOT NULL,
  `baseline_cross` int(11) NOT NULL,
  `auto_hopper_intake` int(11) NOT NULL,
  `auto_floor_gear_intake` int(11) NOT NULL,
  `auto_floor_ball_intake` int(11) NOT NULL,
  `auto_gears_scored` int(11) NOT NULL,
  `auto_gears_missed` int(11) NOT NULL,
  `tele_high_made` int(11) NOT NULL,
  `tele_high_missed` int(11) NOT NULL,
  `tele_low_made` int(11) NOT NULL,
  `tele_low_missed` int(11) NOT NULL,
  `num_cycles` int(11) NOT NULL,
  `tele_floor_ball_intake` int(11) NOT NULL,
  `hp_ball_intake` int(11) NOT NULL,
  `tele_hopper_intake` int(11) NOT NULL,
  `tele_gears_scored` int(11) NOT NULL,
  `tele_gears_missed` int(11) NOT NULL,
  `tele_floor_gear_intake` int(11) NOT NULL,
  `hp_gear_intake` int(11) NOT NULL,
  `fouls` int(11) NOT NULL,
  `dead` int(11) NOT NULL,
  `climb` int(11) NOT NULL,
  `failed_climb` int(11) NOT NULL,
  `auto_contrib_kpa` decimal(11,3) NOT NULL,
  `contrib_kpa` decimal(11,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `matches`
--

INSERT INTO `matches` (`match_num`, `team_num`, `auto_high_made`, `auto_high_missed`, `auto_low_made`, `auto_low_missed`, `baseline_cross`, `auto_hopper_intake`, `auto_floor_gear_intake`, `auto_floor_ball_intake`, `auto_gears_scored`, `auto_gears_missed`, `tele_high_made`, `tele_high_missed`, `tele_low_made`, `tele_low_missed`, `num_cycles`, `tele_floor_ball_intake`, `hp_ball_intake`, `tele_hopper_intake`, `tele_gears_scored`, `tele_gears_missed`, `tele_floor_gear_intake`, `hp_gear_intake`, `fouls`, `dead`, `climb`, `failed_climb`, `auto_contrib_kpa`, `contrib_kpa`) VALUES
(1, 118, 40, 0, 0, 0, 1, 50, 0, 0, 1, 0, 240, 0, 0, 0, 6, 150, 0, 100, 6, 0, 6, 0, 0, 0, 1, 0, '40.000', '120.000'),
(2, 118, 0, 0, 0, 0, 1, 40, 1, 0, 0, 0, 300, 0, 0, 0, 7, 250, 0, 50, 7, 0, 0, 0, 0, 0, 1, 0, '0.000', '100.000'),
(3, 118, 60, 0, 0, 0, 1, 50, 0, 0, 0, 0, 200, 0, 0, 0, 5, 0, 100, 100, 5, 0, 0, 0, 0, 0, 0, 0, '60.000', '126.667'),
(6, 118, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '0.000', '0.000'),
(10, 118, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '10.000', '10.000'),
(11, 118, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '0.000', '0.000');

-- --------------------------------------------------------

--
-- Table structure for table `teams`
--

CREATE TABLE `teams` (
  `team_num` int(11) NOT NULL,
  `team_name` varchar(255) NOT NULL,
  `num_matches` int(11) NOT NULL,
  `avg_auto_gears_scored` decimal(11,3) NOT NULL,
  `perc_auto_gears_scored` decimal(11,3) NOT NULL,
  `tot_auto_gears_scored` decimal(11,3) NOT NULL,
  `avg_auto_gears_attempts` decimal(11,3) NOT NULL,
  `tot_auto_gears_attempts` decimal(11,3) NOT NULL,
  `avg_auto_high_made` decimal(11,3) NOT NULL,
  `perc_auto_high_made` decimal(11,3) NOT NULL,
  `tot_auto_high_made` decimal(11,3) NOT NULL,
  `avg_auto_high_attempts` decimal(11,3) NOT NULL,
  `tot_auto_high_attempts` decimal(11,3) NOT NULL,
  `avg_auto_low_made` decimal(11,3) NOT NULL,
  `perc_auto_low_made` decimal(11,3) NOT NULL,
  `tot_auto_low_made` decimal(11,3) NOT NULL,
  `avg_auto_low_attempts` decimal(11,3) NOT NULL,
  `tot_auto_low_attempts` decimal(11,3) NOT NULL,
  `tot_baseline_cross` decimal(11,3) NOT NULL,
  `avg_auto_hopper_intake` decimal(11,3) NOT NULL,
  `tot_auto_hopper_intake` decimal(11,3) NOT NULL,
  `avg_auto_floor_gear_intake` decimal(11,3) NOT NULL,
  `tot_auto_floor_gear_intake` decimal(11,3) NOT NULL,
  `avg_auto_floor_ball_intake` decimal(11,3) NOT NULL,
  `tot_auto_floor_ball_intake` decimal(11,3) NOT NULL,
  `avg_num_cycles` decimal(11,3) NOT NULL,
  `avg_cycle_time` decimal(11,3) NOT NULL,
  `avg_tele_high_made` decimal(11,3) NOT NULL,
  `perc_tele_high_made` decimal(11,3) NOT NULL,
  `tot_tele_high_made` decimal(11,3) NOT NULL,
  `avg_tele_high_attempts` decimal(11,3) NOT NULL,
  `tot_tele_high_attempts` decimal(11,3) NOT NULL,
  `avg_tele_high_made_per_cycle` decimal(11,3) NOT NULL,
  `avg_tele_low_made` decimal(11,3) NOT NULL,
  `perc_tele_low_made` decimal(11,3) NOT NULL,
  `tot_tele_low_made` decimal(11,3) NOT NULL,
  `avg_tele_low_attempts` decimal(11,3) NOT NULL,
  `tot_tele_low_attempts` decimal(11,3) NOT NULL,
  `avg_tele_low_made_per_cycle` decimal(11,3) NOT NULL,
  `avg_tele_gears_scored` decimal(11,3) NOT NULL,
  `perc_tele_gears_scored` decimal(11,3) NOT NULL,
  `tot_tele_gears_scored` decimal(11,3) NOT NULL,
  `avg_tele_gears_attempts` decimal(11,3) NOT NULL,
  `tot_tele_gears_attempts` decimal(11,3) NOT NULL,
  `avg_tele_gears_scored_per_cycle` decimal(11,3) NOT NULL,
  `avg_tele_floor_ball_intake` decimal(11,3) NOT NULL,
  `tot_tele_floor_ball_intake` decimal(11,3) NOT NULL,
  `avg_tele_hopper_intake` decimal(11,3) NOT NULL,
  `tot_tele_hopper_intake` decimal(11,3) NOT NULL,
  `avg_tele_floor_gear_intake` decimal(11,3) NOT NULL,
  `tot_tele_floor_gear_intake` decimal(11,3) NOT NULL,
  `avg_hp_ball_intake` decimal(11,3) NOT NULL,
  `tot_hp_ball_intake` decimal(11,3) NOT NULL,
  `avg_hp_gear_intake` decimal(11,3) NOT NULL,
  `tot_hp_gear_intake` decimal(11,3) NOT NULL,
  `perc_climb` decimal(11,3) NOT NULL,
  `tot_climb` decimal(11,3) NOT NULL,
  `tot_climb_attempts` decimal(11,3) NOT NULL,
  `tot_fouls` decimal(11,3) NOT NULL,
  `tot_deads` decimal(11,3) NOT NULL,
  `avg_auto_contrib_kpa` decimal(11,3) NOT NULL,
  `avg_contrib_kpa` decimal(11,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `teams`
--

INSERT INTO `teams` (`team_num`, `team_name`, `num_matches`, `avg_auto_gears_scored`, `perc_auto_gears_scored`, `tot_auto_gears_scored`, `avg_auto_gears_attempts`, `tot_auto_gears_attempts`, `avg_auto_high_made`, `perc_auto_high_made`, `tot_auto_high_made`, `avg_auto_high_attempts`, `tot_auto_high_attempts`, `avg_auto_low_made`, `perc_auto_low_made`, `tot_auto_low_made`, `avg_auto_low_attempts`, `tot_auto_low_attempts`, `tot_baseline_cross`, `avg_auto_hopper_intake`, `tot_auto_hopper_intake`, `avg_auto_floor_gear_intake`, `tot_auto_floor_gear_intake`, `avg_auto_floor_ball_intake`, `tot_auto_floor_ball_intake`, `avg_num_cycles`, `avg_cycle_time`, `avg_tele_high_made`, `perc_tele_high_made`, `tot_tele_high_made`, `avg_tele_high_attempts`, `tot_tele_high_attempts`, `avg_tele_high_made_per_cycle`, `avg_tele_low_made`, `perc_tele_low_made`, `tot_tele_low_made`, `avg_tele_low_attempts`, `tot_tele_low_attempts`, `avg_tele_low_made_per_cycle`, `avg_tele_gears_scored`, `perc_tele_gears_scored`, `tot_tele_gears_scored`, `avg_tele_gears_attempts`, `tot_tele_gears_attempts`, `avg_tele_gears_scored_per_cycle`, `avg_tele_floor_ball_intake`, `tot_tele_floor_ball_intake`, `avg_tele_hopper_intake`, `tot_tele_hopper_intake`, `avg_tele_floor_gear_intake`, `tot_tele_floor_gear_intake`, `avg_hp_ball_intake`, `tot_hp_ball_intake`, `avg_hp_gear_intake`, `tot_hp_gear_intake`, `perc_climb`, `tot_climb`, `tot_climb_attempts`, `tot_fouls`, `tot_deads`, `avg_auto_contrib_kpa`, `avg_contrib_kpa`) VALUES
(118, 'Robonauts', 6, '0.167', '100.000', '1.000', '0.167', '1.000', '18.333', '100.000', '110.000', '18.333', '110.000', '0.000', '0.000', '0.000', '0.000', '0.000', '4.000', '23.333', '140.000', '0.167', '1.000', '0.000', '0.000', '3.000', '45.000', '123.333', '100.000', '740.000', '123.333', '740.000', '41.111', '0.000', '0.000', '0.000', '0.000', '0.000', '0.000', '3.000', '100.000', '18.000', '3.000', '18.000', '1.000', '66.667', '400.000', '41.667', '250.000', '1.000', '6.000', '16.667', '100.000', '0.000', '0.000', '100.000', '2.000', '2.000', '0.000', '0.000', '18.333', '59.445');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`match_num`,`team_num`);

--
-- Indexes for table `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`team_num`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
