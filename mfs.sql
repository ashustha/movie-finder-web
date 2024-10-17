-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 26, 2024 at 12:20 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mfs`
--

-- --------------------------------------------------------

--
-- Table structure for table `banned_users`
--

CREATE TABLE `banned_users` (
  `user_id` int(11) NOT NULL,
  `banned_user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `banned_users`
--

INSERT INTO `banned_users` (`user_id`, `banned_user_id`) VALUES
(42, 51),
(42, 52),
(51, 52),
(52, 51);

-- --------------------------------------------------------

--
-- Table structure for table `custom_user_movie_ratings`
--

CREATE TABLE `custom_user_movie_ratings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `movie_id` int(11) NOT NULL,
  `custom_rating` decimal(3,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_user_movie_ratings`
--

INSERT INTO `custom_user_movie_ratings` (`id`, `user_id`, `movie_id`, `custom_rating`) VALUES
(350, 51, 4, 5.00),
(351, 51, 5, 5.00),
(352, 52, 4, 2.17),
(354, 52, 5, 1.00),
(358, 51, 6, 5.00),
(361, 52, 6, 0.00),
(405, 42, 4, 2.00),
(407, 42, 5, 0.00),
(416, 42, 6, 0.00),
(455, 44, 4, 2.88),
(457, 44, 5, 3.00),
(458, 44, 6, 5.00),
(465, 44, 9, 5.00),
(472, 52, 12, 5.00);

-- --------------------------------------------------------

--
-- Table structure for table `directors`
--

CREATE TABLE `directors` (
  `director_id` int(11) NOT NULL,
  `director_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `directors`
--

INSERT INTO `directors` (`director_id`, `director_name`) VALUES
(2, 'Christopher Nolan'),
(3, 'Frank Darabont'),
(4, 'Francis Ford Coppola'),
(5, 'Quentin Tarantino');

-- --------------------------------------------------------

--
-- Table structure for table `genres`
--

CREATE TABLE `genres` (
  `genre_id` int(11) NOT NULL,
  `genre_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `genres`
--

INSERT INTO `genres` (`genre_id`, `genre_name`) VALUES
(1, 'Horror'),
(2, 'Action'),
(3, 'Comedy'),
(4, 'Drama'),
(5, 'Crime'),
(6, 'Animation'),
(7, 'Fantasy'),
(8, 'Mystery'),
(9, 'War'),
(10, 'Science Fiction'),
(11, 'Romance');

-- --------------------------------------------------------

--
-- Table structure for table `movies`
--

CREATE TABLE `movies` (
  `movie_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `director_id` int(11) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `budget` decimal(10,2) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `country_of_origin` varchar(255) DEFAULT NULL,
  `opening_week` decimal(10,2) DEFAULT NULL,
  `box_office_collection` decimal(15,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `poster` varchar(255) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `average_rating` decimal(3,2) DEFAULT 0.00,
  `trailer` varchar(255) DEFAULT NULL,
  `marked_for_deletion` tinyint(1) DEFAULT 0,
  `deletion_date` date DEFAULT NULL
) ;

--
-- Dumping data for table `movies`
--

INSERT INTO `movies` (`movie_id`, `title`, `director_id`, `year`, `duration`, `budget`, `release_date`, `country_of_origin`, `opening_week`, `box_office_collection`, `description`, `poster`, `banner`, `average_rating`, `trailer`, `marked_for_deletion`, `deletion_date`) VALUES
(4, 'Inception', 4, 2010, 148, 99999999.99, '2010-07-16', 'USA', 62785337.00, 829895144.00, 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 'https://i.ibb.co/hKWwGmx/inception-min.jpg', 'https://i.ibb.co/44ysgN2/Inception-Banne.jpg', 2.88, 'https://www.youtube.com/embed/YoHD9XEInc0', 0, NULL),
(5, 'The Dark Knight', 2, 2008, 152, 99999999.99, '2008-07-18', 'USA', 99999999.99, 1005456758.00, 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 'https://i.ibb.co/YTNcSdv/dark-Knight-poster-min.jpg', 'https://i.ibb.co/gtxV7sx/dark-Knight-banner-min.png', 3.00, 'https://www.youtube.com/embed/EXeTwQWrcwY', 0, NULL),
(6, 'Interstellar', 2, 2014, 169, 99999999.99, '2014-11-07', 'USA', 47510360.00, 677471540.00, 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', 'https://i.ibb.co/1XQZ7x1/interstellar-min.jpg', 'https://i.ibb.co/cY10YSJ/interstellar-banner-min.jpg', 5.00, 'https://www.youtube.com/embed/Lm8p5rlrSkY', 0, NULL),
(7, 'Fight Club', 3, 1999, 139, 63000000.00, '1999-10-15', 'USA', 11035485.00, 100853753.00, 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.', 'https://i.ibb.co/XtMwnSP/fight-Club-poster-min.jpg', 'https://i.ibb.co/WkrdBQ8/fight-Club-banner-min.jpg', 0.00, 'https://www.youtube.com/embed/O1nDozs-LxI', 0, NULL),
(8, 'The Godfather', 4, 1972, 175, 6000000.00, '1972-03-24', 'USA', NULL, 245066411.00, 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', 'https://i.ibb.co/gDCQF0x/the-God-Father-poster-min.jpg', 'https://i.ibb.co/dkYn8cX/godfather-banner.jpg', 0.00, 'https://www.youtube.com/embed/UaVTIH8mujA', 0, NULL),
(9, 'Forrest Gump', 4, 1994, 142, 55000000.00, '1994-07-06', 'USA', 24450602.00, 678226967.00, 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.', 'https://i.ibb.co/fqYJ9Cf/forrest-Gump-poster-min.jpg', 'https://i.ibb.co/Pz2LXkG/forest-Gump-banner-min.jpg', 5.00, 'https://www.youtube.com/embed/XHhAG-YLdk8', 0, NULL),
(10, 'The Lord of the Rings: The Return of the King', 2, 2003, 201, 94000000.00, '2003-12-17', 'New Zealand', 72629713.00, 1142219401.00, 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.', 'https://i.ibb.co/1MH8sfM/lord-Of-The-Rings-poster-min.jpg', 'https://i.ibb.co/NNmVCyB/the-Silence-OFThe-Lambs-banner-min.jpg', 0.00, 'https://www.youtube.com/embed/W6Mm8Sbe__o', 0, NULL),
(12, 'Deadpool', 4, 2016, 108, 58000000.00, '2016-02-12', 'USA', 99999999.99, 783112979.00, 'A wisecracking mercenary gets experimented on and becomes immortal but ugly, and sets out to track down the man who ruined his looks.', 'https://i.ibb.co/YfpFJ0R/deadpool-poster-min.png', 'https://i.ibb.co/yFbChxq/deadpool-banner.webp', 5.00, 'https://www.youtube.com/embed/Sy8nPI85Ih4', 0, NULL),
(13, 'Shaun of the Dead', 4, 2004, 99, 6000000.00, '2004-09-24', 'UK', 3330781.00, 30039392.00, 'A man\'s uneventful life is disrupted by the zombie apocalypse.', 'https://i.ibb.co/tQ3sx4v/shaun-Of-The-Dead-poster-min.jpg', 'https://i.ibb.co/VDsQkcq/shaun-Of-The-Dead-banner-min.jpg', 0.00, 'https://www.youtube.com/embed/LIfcaZ4pC-4', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `movie_genres`
--

CREATE TABLE `movie_genres` (
  `movie_id` int(11) NOT NULL,
  `genre_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movie_genres`
--

INSERT INTO `movie_genres` (`movie_id`, `genre_id`) VALUES
(4, 2),
(4, 4),
(4, 5),
(5, 2),
(6, 2),
(7, 2),
(7, 5),
(8, 5),
(9, 3),
(10, 2),
(12, 2),
(12, 3),
(12, 5),
(13, 2),
(13, 3);

-- --------------------------------------------------------

--
-- Table structure for table `movie_reviews`
--

CREATE TABLE `movie_reviews` (
  `review_id` int(11) NOT NULL,
  `movie_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `written_review` text DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movie_reviews`
--

INSERT INTO `movie_reviews` (`review_id`, `movie_id`, `user_id`, `rating`, `written_review`, `username`) VALUES
(130, 4, 51, 5.00, 'Good movie', NULL),
(131, 5, 51, 5.00, 'Good movie', NULL),
(132, 4, 52, 1.00, 'what', NULL),
(133, 6, 51, 5.00, 'awesome', NULL),
(134, 5, 52, 1.00, 'yo', NULL),
(135, 4, 42, 2.00, 'hhh', NULL),
(136, 4, 44, 3.50, 'What is this nonsense', NULL),
(137, 9, 44, 5.00, 'Good', NULL),
(138, 12, 52, 5.00, 'Fantastic movie', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `movie_stars`
--

CREATE TABLE `movie_stars` (
  `movie_id` int(11) NOT NULL,
  `star_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movie_stars`
--

INSERT INTO `movie_stars` (`movie_id`, `star_id`) VALUES
(4, 1),
(4, 2),
(5, 1),
(5, 11),
(6, 4),
(6, 5),
(7, 10),
(8, 3),
(9, 14),
(10, 5),
(12, 5),
(12, 10),
(13, 6);

-- --------------------------------------------------------

--
-- Table structure for table `movie_writers`
--

CREATE TABLE `movie_writers` (
  `movie_id` int(11) NOT NULL,
  `writer_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `movie_writers`
--

INSERT INTO `movie_writers` (`movie_id`, `writer_id`) VALUES
(4, 7),
(5, 3),
(6, 11),
(7, 2),
(8, 2),
(9, 10),
(10, 9),
(12, 4),
(13, 1);

-- --------------------------------------------------------

--
-- Table structure for table `news`
--

CREATE TABLE `news` (
  `id` int(11) NOT NULL,
  `image` varchar(100) NOT NULL,
  `title` varchar(30) NOT NULL,
  `paragraph` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `news`
--

INSERT INTO `news` (`id`, `image`, `title`, `paragraph`) VALUES
(6, '/uploads/image-1727264417615-349465652.jpg', 'cool', 'cool'),
(7, '/uploads/image-1727322227123-279395597.jpg', 'news', 'ggrgg');

-- --------------------------------------------------------

--
-- Table structure for table `stars`
--

CREATE TABLE `stars` (
  `star_id` int(11) NOT NULL,
  `star_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stars`
--

INSERT INTO `stars` (`star_id`, `star_name`) VALUES
(1, 'Keanu Reeves'),
(2, 'Laurence Fishburne'),
(3, 'Carrie-Anne Moss'),
(4, 'Leonardo DiCaprio'),
(5, 'Joseph Gordon-Levitt'),
(6, 'Ellen Page'),
(7, 'Tom Hanks'),
(8, 'Morgan Freeman'),
(9, 'Al Pacino'),
(10, 'Robert De Niro'),
(11, 'Brad Pitt'),
(12, 'Tom Cruise'),
(13, 'Denzel Washington'),
(14, 'Matt Damon'),
(15, 'Johnny Depp');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `joined_date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `email`, `full_name`, `password`, `is_admin`, `joined_date`) VALUES
(1, 'ashu.stha08@gmial.com', 'Ashutosh Shrestha', '$2b$10$tIrKdiiVdM0vFG1IzcFjpOCvVspYSzLtB0zffJ7IMCbZwnVRAE3hK', 0, '2024-06-01 20:27:27'),
(2, 'test@gmail.com', 'Test person', '$2b$10$D1NVgkKcRL/NDvgpGTdO5uZ4275dnC7c4BW/qEgTy3yFLU4hYNZRG', 0, '2024-06-11 20:27:27'),
(3, 'test2@gmail.com', 'Test person', '$2b$10$OnMOZiYm0YjqvGpqIrTUCOnV4nHaSAwl1jIqVL7xy9O5IloUHhom6', 0, '2024-05-01 20:27:27'),
(4, 'test3@gmail.com', 'Test person', '$2b$10$BBaYgkO0MeqOPmZkxplgu..516gR1lYloRjGbRew7zLT/QJaKAmDO', 0, '2024-07-23 20:27:27'),
(5, 'hero@gmail.com', 'Ashutosh Shrestha', '$2b$10$ect/p/nQIvbKLGOny//pieU0XB8Ud5xgmtR1Jv5YjrA4p0DoNwHwm', 0, '2024-06-01 20:27:27'),
(6, 'nykojubysy@mailinator.com', 'Warren Osborn', '$2b$10$/2ggMznfXnjNRJ5aYsYbQOTKhzQy8LIfJXDgyth7qvpym4OyA7bN6', 0, '2024-07-23 20:27:27'),
(7, 'nyzo@mailinator.com', 'Zeph Simpson', '$2b$10$5WZZ4LreItVxG7MmrHs/su.Al4QzcKaiD6202zf2dx3ik1wLwGqh.', 0, '2024-07-23 20:27:27'),
(8, 'laju@mailinator.com', 'Nell Middleton', '$2b$10$3CaE7ANvgWHbMDT1EJmg3uFdj2YtRz/woaNJcWfP0iJytq8BtxZqu', 0, '2024-07-23 20:27:27'),
(9, 'facy@mailinator.com', 'Jack Keller', '$2b$10$Z.mqxzlGGuPL1hRDnlq5guCU0rkp3Kvr4BGm1FwUV.eK6hVu7QIzG', 0, '2024-05-02 20:27:27'),
(10, 'zivyw@mailinator.com', 'Ivor Graham', '$2b$10$5ZbKECMYTbFxdE3/BUgH8OdADeb4txtQbY/JOQa4CtiM7YctPb5he', 0, '2024-07-23 20:27:27'),
(11, 'xeripe@mailinator.com', 'Audrey Meyer', '$2b$10$jhGBx9G.8.tO17FourNo6OkTVIewsR7LNco3NcohJDL9ODsEmowdG', 0, '2024-07-23 20:27:27'),
(12, 'ryrozo@mailinator.com', 'Kendall Douglas', '$2b$10$wkkd3SsF/n.tobJic8gcC.8PhHfGkwzhOGrySpERowwVmLHvxPkRq', 0, '2024-07-23 20:27:27'),
(13, 'tyqudel@mailinator.com', 'Ruby Bass', '$2b$10$eTMF12U0CfAwYH8sJlJhKu654CEkO/5zT9wOsK8hurHFK0SRMr2dG', 0, '2024-07-23 20:27:27'),
(14, 'ashu.stha08@gmail.com', 'Ashutosh Shrestha', '$2b$10$dXgBRfxUQySor8RkKiWxu.ZCBR/pKjScROdeRSOnph.ZNJyLrc2xC', 0, '2024-07-23 20:27:27'),
(15, 'judyma@mailinator.com', 'Emerson Jones', '$2b$10$X6fd//x2dccz7Kgc17gz9eo7akbxg0vE2NF462YqF46c0JKFBYKrS', 0, '2024-07-23 20:27:27'),
(16, 'zefofewe@mailinator.com', 'Chanda Vega', '$2b$10$u1Q0c4AGBxpXCCVAFDnsMu6hIp4Oj.Boi5cImPCl9fyex4yA4bAFa', 0, '2024-07-23 20:27:27'),
(17, 'ketacoza@mailinator.com', 'Reed Kaufman', '$2b$10$Mj1DESEVLpvgLXIC5qYXBeGOVyPY53Mo7h/Q.JLUedsShBQLstzJO', 0, '2024-07-23 20:27:27'),
(18, 'tofynop@mailinator.com', 'Carol Simon', '$2b$10$msvnSrVXi03Op.3QBK.aO.2lRFYegihnGdhTDI3aVKN2QVjqLlwvW', 0, '2024-07-23 20:27:27'),
(19, 'qatihozero@mailinator.com', 'Hayfa Schultz', '$2b$10$gtMfliqWdW5RGS1pRphBnudcOG4H42erglDANKAKA92ZgbLaEbGAy', 0, '2024-07-23 20:27:27'),
(20, 'cipacu@mailinator.com', 'Eleanor Collier', '$2b$10$q3IAKFQAxinukUakHCg71eanE0srRP3p.O.0XUv4TcnfzClsfSMPy', 0, '2024-07-23 20:27:27'),
(21, 'jekone@mailinator.com', 'Camden Hubbard', '$2b$10$t2ATaPuAfOsO3LWpX2e8ye6OjzjkmrcDp6OHJ.Oi0PCIPNNGnEBA2', 0, '2024-06-03 20:27:27'),
(22, 'hepij@mailinator.com', 'Rhea Sanford', '$2b$10$hoidfglv54aibaYy5o8pe.0kbbz6OCNm57u.zKbJ/z4zQp8Cr6Ko.', 0, '2024-07-23 20:27:27'),
(23, 'zahe@mailinator.com', 'Reece Waller', '$2b$10$HShNPm93Hl3ikNdTWSv7c.oPbtXPA9AF3iYtQ9ROjPOJ1o3q.Rb3m', 0, '2024-07-23 20:27:27'),
(24, 'sasuqex@mailinator.com', 'Louis Randall', '$2b$10$v8BTnlYExUUnn4gpli5fHu16ndNaXIPjOMRSeE.oVk/cOnXbgItny', 0, '2024-07-23 20:27:27'),
(25, 'quwykixa@mailinator.com', 'Daryl Booker', '$2b$10$QW0tl6R9uHUTbqeuT21jxe7k9Oq.avI9hWnkLfnIyKdvIz3F1J68y', 0, '2024-07-23 20:27:27'),
(26, 'lexor@mailinator.com', 'Davis Mccoy', '$2b$10$091VBpdj1po7vazuPotZY.Qfm9liRhToj9Rzdb6twq2pxE6heMnSW', 0, '2024-07-23 20:27:27'),
(27, 'hewepi@mailinator.com', 'Kim Hale', '$2b$10$T./nUx22scPU/yjdas1unulju7pSFM15JNgdZ.ub4Tr/ZU3gLqLYS', 0, '2024-06-06 20:27:27'),
(28, 'byzenyloz@mailinator.com', 'Miriam Ruiz', '$2b$10$eIaH9lVVkw.28H/X4BSoT.7W7BgBQmB1jlHb4BRnoOV3t/VChLKyi', 0, '2024-07-23 20:27:27'),
(29, 'salimututo@mailinator.com', 'Aquila Reynolds', '$2b$10$725mCaqZ9FhfGljF9wjbv.OttfhxJBGakdzSPSeioRhPZYbFO6V4y', 0, '2024-06-04 20:27:27'),
(30, 'qabuvukir@mailinator.com', 'Lyle Yang', '$2b$10$9Ae79CMY98TQqlZFa0OHeOBma4lq6l6WQ6AOTIQ//SYtwmjBru1Gy', 0, '2024-07-23 20:27:27'),
(31, 'turasip@mailinator.com', 'Lillith Vance', '$2b$10$YauXZcV5W2.stgM/h6J3O.MBrE.QFrePHs8eiwdXTboUeMReFSbcu', 0, '2024-07-23 20:27:27'),
(32, 'wixyhoret@mailinator.com', 'September Berger', '$2b$10$aIjd5k7lVoivaa8LA7qyo.PpVn3cuZXAp7kvqifKcHeJQwx4lHuVK', 0, '2024-06-03 20:27:27'),
(33, 'susmita@mailinator.com', 'Zephr Decker', '$2b$10$19vemxYyYoAqjqszbqJtbeCFbweeAFch.RqawyZSLpF/yQZ4AIr8q', 0, '2024-07-23 20:27:27'),
(34, 'ashu.stha01@gmail.com', 'Ashutosh Shrestha', '$2b$10$Byw/HvnPoJEql3XO2cHARejMeD2RTyD0dWkErisA/bxSzAjjQLSq.', 0, '2024-06-04 20:27:27'),
(35, 'ashu@gmail.com', 'ashu ashu', '$2b$10$DYE9mXLcOJNgUIr8A6iCM.idgYjPXeXh/ZI2efg0XdacqbfzaJ.qO', 0, '2024-07-23 20:27:27'),
(36, 'mojuk@mailinator.com', 'Merritt Macias', '$2b$10$7PNjaZ1QDKg66fpfFm29W.l2zB1dXE17cinRrgX7O3/rgcdR5xn46', 0, '2024-07-23 20:27:27'),
(37, 'lymu@mailinator.com', 'Oprah Hopkins', '$2b$10$GV5zt2KIvVR3UA1gemgcK.gW43NaCvas0EFVMfnDBGRmz8hk84jXG', 0, '2024-07-23 20:27:27'),
(38, 'nyne@mailinator.com', 'Amethyst Perry', '$2b$10$/ao2QbCsx91AuMfg1DGCJu30/MIlN3/g7GBnHRGKx5mpVO1cGxvmu', 0, '2024-07-23 20:27:27'),
(39, 'xyquxaja@mailinator.com', 'Emmanuel Hudson', '$2b$10$19Hef4XtiHF4xC9QpcnkEuQc7uhp7otU4gvEqmRJ60K9FDH9mfccW', 0, '2024-07-23 20:27:27'),
(40, 'tilojolube@mailinator.com', 'Alexander Gilbert', '$2b$10$D7Gat97JiDHVl95jEyFexOH1R7tMsktS6oROEP3MGOzT9p9lgbz5O', 0, '2024-07-23 20:27:27'),
(41, 'test34@gmail.com', 'test test test', '$2b$10$wmO9Y0Mz5mllNUOXx8F07ebFiCd.YpxV5A2CNnIZi7zpIj0rVzZ8y', 0, '2024-07-23 20:27:27'),
(42, 'ashu.stha007@gmail.com', 'Ashutosh Shrestha', '$2b$10$65jcMk8Rc87NkqujBfjoPOeR9Ro7fE0hoqdFXNqC7eZy6gHY4AHjW', 1, '2024-07-23 20:27:27'),
(43, 'ashu009@gmail.com', 'Ashu Stha', '$2b$10$JwVmgRd4FqGpXqZf6OhOme.0IErjFL7BOmwSFQg8O6MYUD.apfRFi', 0, '2024-07-23 20:27:27'),
(44, 'ashu008@gmail.com', 'Ashu Stha', '$2b$10$kuTqJEuOz9PrII72URqZv.8.hv/XpeS6mj8CmjcPAiPKEJthZwVnq', 0, '2024-07-23 20:27:27'),
(45, 'ashu.stha09@gmail.com', 'Ashutosh Shrestha', '$2b$10$LM04p01/bw2D.cu4FLvH7.wgxCxuUT0rG30MddsepunmEpDyDxHXq', 0, '2024-07-23 20:27:27'),
(46, 'micalozuv@mailinator.com', 'Amery Daugherty', '$2b$10$3cdkT8fIK9mJSU74tiWyG.zeJOcFcE9bGQ.8tqXPfdwPGFtcSRwTW', 0, '2024-08-09 01:19:47'),
(47, 'gowiditocu@mailinator.com', 'Wade English', '$2b$10$MgwTH31MQE3mZ7NbYaVtROfkjCiC75ucU0hibx99EB9Rni.6PifNG', 0, '2024-08-09 01:21:00'),
(48, 'sonam.t007@gmail.com', 'Soanm Tamang', '$2b$10$b7mSYAacdvywlV5FCf7jqu2IAFeljUL8rOJKdrQnAhY2N/tQyXDwS', 0, '2024-08-18 18:42:20'),
(49, 'bijyxowam@mailinator.com', 'Deacon Carson', '$2b$10$4Rpm4T/hcTzYEDtlwkcd5uAYu3y0jdceefNB4B2eiBrNELytcOm5C', 0, '2024-08-22 20:00:20'),
(50, 'ashu.stha009@gmail.com', 'Ashutosh Shrestha1', '$2b$10$AdTi9OXfQTmWjf4x6Ov2M.QNJkK6YIr1H2vsokeiRzP4sprDj9dKC', 0, '2024-09-09 22:46:06'),
(51, 'hajmola@gmail.com', 'Hajmola P', '$2b$10$sKqPSPUOSeV6Ekh/tN/UnOEuSD/LkKIM8jCNSHmQi2.fCysHPJk5i', 0, '2024-09-19 19:14:04'),
(52, 'Vicks@gmail.com', 'Vicks V', '$2b$10$/0HX9jdMWMPegguobT1AdOR62vuqMUijbBqQ32fe5Jg/vpWn6Qrh2', 0, '2024-09-19 19:15:33'),
(53, 'sihe@gmail.com', 'Sydney Institute Of Higher Education', '$2b$10$jB4H9PdYo7.wsoJ.oOrVjOd02s756tO24cmIrZvrbCnadECPbo21i', 1, '2024-09-26 20:18:19');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `user_id` int(11) NOT NULL,
  `movie_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`user_id`, `movie_id`) VALUES
(42, 4),
(42, 5),
(42, 7),
(42, 8),
(42, 9),
(42, 12),
(44, 3),
(44, 4),
(44, 5),
(44, 6),
(44, 12),
(47, 5),
(47, 6),
(48, 5),
(48, 6),
(48, 9),
(48, 12),
(50, 4),
(50, 5),
(50, 6),
(51, 4),
(52, 4),
(52, 5),
(52, 6);

-- --------------------------------------------------------

--
-- Table structure for table `wishlist_statuses`
--

CREATE TABLE `wishlist_statuses` (
  `user_id` int(11) NOT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlist_statuses`
--

INSERT INTO `wishlist_statuses` (`user_id`, `is_public`) VALUES
(42, 1),
(43, 0),
(45, 0),
(48, 1),
(49, 0),
(50, 0),
(51, 0),
(52, 0),
(53, 0);

-- --------------------------------------------------------

--
-- Table structure for table `writers`
--

CREATE TABLE `writers` (
  `writer_id` int(11) NOT NULL,
  `writer_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `writers`
--

INSERT INTO `writers` (`writer_id`, `writer_name`) VALUES
(1, 'Lana Wachowski'),
(2, 'Lilly Wachowski'),
(3, 'Christopher Nolan'),
(4, 'Frank Darabont'),
(5, 'Francis Ford Coppola'),
(6, 'Quentin Tarantino'),
(7, 'Aaron Sorkin'),
(8, 'Woody Allen'),
(9, 'Ethan Coen'),
(10, 'Joel Coen'),
(11, 'Paul Thomas Anderson'),
(12, 'Martin Scorsese'),
(13, 'Steven Spielberg'),
(14, 'David Fincher'),
(15, 'Spike Lee');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `banned_users`
--
ALTER TABLE `banned_users`
  ADD PRIMARY KEY (`user_id`,`banned_user_id`),
  ADD KEY `banned_user_id` (`banned_user_id`);

--
-- Indexes for table `custom_user_movie_ratings`
--
ALTER TABLE `custom_user_movie_ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_movie` (`user_id`,`movie_id`),
  ADD KEY `movie_id` (`movie_id`);

--
-- Indexes for table `directors`
--
ALTER TABLE `directors`
  ADD PRIMARY KEY (`director_id`);

--
-- Indexes for table `genres`
--
ALTER TABLE `genres`
  ADD PRIMARY KEY (`genre_id`);

--
-- Indexes for table `movies`
--
ALTER TABLE `movies`
  ADD PRIMARY KEY (`movie_id`),
  ADD KEY `fk_director` (`director_id`);

--
-- Indexes for table `movie_genres`
--
ALTER TABLE `movie_genres`
  ADD PRIMARY KEY (`movie_id`,`genre_id`),
  ADD KEY `genre_id` (`genre_id`);

--
-- Indexes for table `movie_reviews`
--
ALTER TABLE `movie_reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `movie_id` (`movie_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `movie_stars`
--
ALTER TABLE `movie_stars`
  ADD PRIMARY KEY (`movie_id`,`star_id`),
  ADD KEY `star_id` (`star_id`);

--
-- Indexes for table `movie_writers`
--
ALTER TABLE `movie_writers`
  ADD PRIMARY KEY (`movie_id`,`writer_id`),
  ADD KEY `writer_id` (`writer_id`);

--
-- Indexes for table `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stars`
--
ALTER TABLE `stars`
  ADD PRIMARY KEY (`star_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`user_id`,`movie_id`),
  ADD UNIQUE KEY `unique_user_movie` (`user_id`,`movie_id`);

--
-- Indexes for table `wishlist_statuses`
--
ALTER TABLE `wishlist_statuses`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `writers`
--
ALTER TABLE `writers`
  ADD PRIMARY KEY (`writer_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `custom_user_movie_ratings`
--
ALTER TABLE `custom_user_movie_ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=473;

--
-- AUTO_INCREMENT for table `directors`
--
ALTER TABLE `directors`
  MODIFY `director_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `genres`
--
ALTER TABLE `genres`
  MODIFY `genre_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `movies`
--
ALTER TABLE `movies`
  MODIFY `movie_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `movie_reviews`
--
ALTER TABLE `movie_reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT for table `news`
--
ALTER TABLE `news`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `stars`
--
ALTER TABLE `stars`
  MODIFY `star_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `writers`
--
ALTER TABLE `writers`
  MODIFY `writer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `banned_users`
--
ALTER TABLE `banned_users`
  ADD CONSTRAINT `banned_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `banned_users_ibfk_2` FOREIGN KEY (`banned_user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `custom_user_movie_ratings`
--
ALTER TABLE `custom_user_movie_ratings`
  ADD CONSTRAINT `custom_user_movie_ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `custom_user_movie_ratings_ibfk_2` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`);

--
-- Constraints for table `movies`
--
ALTER TABLE `movies`
  ADD CONSTRAINT `fk_director` FOREIGN KEY (`director_id`) REFERENCES `directors` (`director_id`);

--
-- Constraints for table `movie_genres`
--
ALTER TABLE `movie_genres`
  ADD CONSTRAINT `movie_genres_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movie_genres_ibfk_2` FOREIGN KEY (`genre_id`) REFERENCES `genres` (`genre_id`);

--
-- Constraints for table `movie_reviews`
--
ALTER TABLE `movie_reviews`
  ADD CONSTRAINT `movie_reviews_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`),
  ADD CONSTRAINT `movie_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `movie_stars`
--
ALTER TABLE `movie_stars`
  ADD CONSTRAINT `movie_stars_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movie_stars_ibfk_2` FOREIGN KEY (`star_id`) REFERENCES `stars` (`star_id`);

--
-- Constraints for table `movie_writers`
--
ALTER TABLE `movie_writers`
  ADD CONSTRAINT `movie_writers_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `movie_writers_ibfk_2` FOREIGN KEY (`writer_id`) REFERENCES `writers` (`writer_id`);

--
-- Constraints for table `wishlist_statuses`
--
ALTER TABLE `wishlist_statuses`
  ADD CONSTRAINT `wishlist_statuses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
