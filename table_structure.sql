DROP DATABASE if EXISTS majakkaportaali;
CREATE DATABASE majakkaportaali; USE majakkaportaali; 
--
-- Table structure for table `seasons`
--

DROP TABLE IF EXISTS `seasons`;
CREATE TABLE `seasons` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `startdate` date DEFAULT NULL,
  `enddate` date DEFAULT NULL,
  `theme` varchar(100) DEFAULT NULL,
  `name` varchar(200) DEFAULT NULL,
  `comments` text, `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;


--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `services` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `servicedate` date DEFAULT NULL,
  `theme` varchar(200) DEFAULT NULL,
  `info` varchar(9999) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 COLLATE utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
--

DROP TABLE IF EXISTS `responsibilities_meta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `responsibilities_meta` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `responsibility` varchar(100) DEFAULT NULL,
  `description` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
/*!40101 SET character_set_client = @saved_cs_client */;




--
-- Table structure for table `vastuut`
--

DROP TABLE IF EXISTS `responsibilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `responsibilities` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `service_id` int(10) unsigned NOT NULL,
  `responsibility` varchar(100) DEFAULT NULL,
  `responsible` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `service_index` (`service_id`),
  CONSTRAINT `vastuut_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `servicesongs`
--

CREATE TABLE servicesongs (
  id bigint unsigned NOT NULL AUTO_INCREMENT,
  service_id int(10) unsigned NOT NULL,
  song_title varchar(200) DEFAULT '',
  verses varchar(200) DEFAULT '',
  is_instrumental varchar(10) DEFAULT 'no',
  song_id int(19),
  songtype varchar(100) NOT NULL,
  position int(19), -- kuinka mones samantyyppinen
  PRIMARY KEY (id),
  KEY service_index (service_id),
  CONSTRAINT servicesongs_ibfk_1 FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
);


--
-- Table structure for table `songdata`
--

CREATE TABLE songdata (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  title varchar(300) DEFAULT NULL,
  composer varchar(300) DEFAULT NULL,
  lyrics varchar(300) DEFAULT NULL,
  version_description varchar(300) DEFAULT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;


--
-- Table structure for table `versedata`
--

CREATE TABLE versedata (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  song_id int(10) unsigned NOT NULL,
  verse varchar(999) DEFAULT NULL,
  versetype varchar(99) DEFAULT 'verse',
  PRIMARY KEY (id),
  KEY `song_index` (`song_id`),
  FOREIGN KEY (`song_id`) REFERENCES `songdata` (`id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;


--
-- 
-- Liturgiset tekstit 
--

CREATE TABLE ltextdata (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  title varchar(300) UNIQUE,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;


--
-- Liturgiset tekstit pilkottuna "säkeistöiksi"
--

CREATE TABLE ltextversedata (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  ltext_id int(10) unsigned NOT NULL,
  verse varchar(999) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY `ltext_index` (`ltext_id`),
  FOREIGN KEY (`ltext_id`) REFERENCES `ltextdata` (`id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;




--
-- Table structure for table `serviceverses`. Messuissa käytettävät
-- raamatunkohdat.
--

CREATE TABLE serviceverses (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  service_id int(10) unsigned NOT NULL,
  segment_name varchar(200) DEFAULT '',
  testament varchar(200) DEFAULT '',
  startbook varchar(200) DEFAULT '',
  endbook varchar(200) DEFAULT '',
  startchapter int(2),
  endchapter int(2),
  startverse int(3),
  endverse int(3),
  PRIMARY KEY (id),
  KEY service_index (service_id),
  CONSTRAINT serviceverses_ibfk_1 FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
);



/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comments` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `service_id` int(10) unsigned NOT NULL,
  `reply_to` int(10) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `commentator` varchar(100) DEFAULT NULL,
  `theme` varchar(100) DEFAULT NULL,
  `comment_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `service_index` (`service_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table biblesegment
--

CREATE TABLE biblesegments (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `start_book` varchar(100) DEFAULT NULL,
  `start_chap` int(10) DEFAULT NULL,
  `start_verse` int(10) DEFAULT NULL,
  `end_book` varchar(100) DEFAULT NULL,
  `end_chap` int(10) DEFAULT NULL,
  `end_verse` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;



--
-- Table structure for table songsegment
--

CREATE TABLE songsegments (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `songdescription` TEXT DEFAULT NULL,
  `restrictedto` TEXT DEFAULT NULL,
  `singlename` varchar(100) DEFAULT NULL,
  `is_multi` boolean DEFAULT false
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;


--
-- Table structure for table infosegment
-- 

CREATE TABLE infosegments (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `maintext` varchar(9999) DEFAULT NULL,
  `header` varchar(300) DEFAULT NULL,
  `genheader` varchar(300) DEFAULT NULL,
  `subgenheader` varchar(300) DEFAULT NULL,
  `imgname` varchar(300) DEFAULT NULL,
  `imgposition` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;


--
-- 

CREATE TABLE liturgicalsegments (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `text_title` varchar(9999) DEFAULT NULL,
  `use_as_header` boolean default false,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;



--
-- Table structure for table headers
-- Nämä  ovat diaesitykseen mahdollisesit tulostettavia 
-- ylätunnisteita
-- 

CREATE TABLE headers (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `template_name` varchar(100) DEFAULT NULL,
  `maintext` varchar(9999) DEFAULT NULL,
  `imgname` varchar(300) DEFAULT NULL,
  `imgposition` varchar(300) DEFAULT NULL,
  `is_aside` boolean DEFAULT false,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;

--
-- Table structure for table presentation_structure``
--

CREATE TABLE presentation_structure (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  `service_id` int(10) DEFAULT NULL,
  slot_name varchar(300) DEFAULT NULL,
  slot_number int(3) DEFAULT NULL,
  slot_type varchar(300) DEFAULT NULL,
  id_in_type_table varchar(300) DEFAULT NULL,
  addedclass varchar(300) DEFAULT NULL,
  header_id int(10) DEFAULT NULL,
  content_id int(10) unsigned NOT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;


--
-- Table structure for table presentation_structure``
-- Messukohtaiset rakenteet
--

CREATE TABLE service_specific_presentation_structure (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  `service_id` int(10) unsigned NOT NULL,
  slot_name varchar(300) DEFAULT NULL,
  slot_number int(3) DEFAULT NULL,
  slot_type varchar(300) DEFAULT NULL,
  id_in_type_table varchar(300) DEFAULT NULL,
  content_id int(10) unsigned NOT NULL,
  addedclass varchar(300) DEFAULT NULL,
  header_id int(10) DEFAULT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;



--
-- infodiat messuihin
--

CREATE TABLE infos (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  `service_id` int(10) unsigned NOT NULL,
  slot_name varchar(300) DEFAULT NULL,
  content_id int(10) unsigned NOT NULL,
  addedclass varchar(300) DEFAULT '.Infodia',
  header_id int(10) DEFAULT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;


--
-- muita kuin messuja olevat tapahtumat
--

CREATE TABLE events (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(300) DEFAULT NULL,
  place_and_time varchar(300) DEFAULT NULL,
  description varchar(5000) DEFAULT NULL,
  event_date date DEFAULT NULL,
  has_songs boolean DEFAULT false,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;



--
-- Table structure for table presentation_content``
--

CREATE TABLE presentation_content (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `slot_id` int(10) unsigned NOT NULL,
  `content_type` varchar(100) DEFAULT NULL,
  `new_slide` varchar(100) DEFAULT NULL,
  `content` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `service_index` (`slot_id`),
  CONSTRAINT `presentation_content_ibfk_1` FOREIGN KEY (`slot_id`) REFERENCES `presentation_structure` (`id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;



--
-- Laulujen tägit
--

CREATE TABLE songtags (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  song_id int(10) unsigned NOT NULL,
  tag varchar(200) DEFAULT '',
  PRIMARY KEY (id),
  KEY `song_index` (`song_id`),
  FOREIGN KEY (`song_id`) REFERENCES `songdata` (`id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;


--
-- Kolehtikohteet
--


CREATE TABLE offering_targets (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(100) DEFAULT NULL,
  description varchar(9999) DEFAULT NULL,
  PRIMARY KEY (id)
);



--- kolehtitavoitteet


CREATE TABLE offering_goals (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  target_id int(10) unsigned NOT NULL,
  name varchar(100) DEFAULT NULL,
  description varchar(9999) DEFAULT NULL,
  amount decimal(60,2) DEFAULT 0,
  is_default boolean DEFAULT false,
  PRIMARY KEY (id),
  KEY `target_index` (`target_id`),
  FOREIGN KEY (`target_id`) REFERENCES `offering_targets` (`id`) ON DELETE CASCADE
);


-- Yksittäisissä messuissa kerätyt kolehdit: mille ja kuinka paljon

CREATE TABLE collected_offerings (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  target_id int(10) unsigned NOT NULL,
  service_id int(10) unsigned NOT NULL,
  amount decimal(60,2) DEFAULT 0,
  PRIMARY KEY (id),
  KEY `target_index` (`target_id`),
  FOREIGN KEY (`target_id`) REFERENCES `offering_goals` (`id`) ON DELETE CASCADE,
  KEY `service_index` (`service_id`),
  FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
);


--- Pienryhmien tiedot


CREATE TABLE users (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  username varchar(20) UNIQUE,
  password CHAR(32),
  PRIMARY KEY (id)
);


-- INSERT INTO users (username, password) VALUES ('testikäyttäjä', MD5('testisalasanaSALT')

--- Pienryhmien tiedot


CREATE TABLE smallgroups (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(100) DEFAULT NULL,
  description varchar(9999) DEFAULT NULL,
  resp_name varchar(100) DEFAULT NULL,
  day varchar(100) DEFAULT NULL,
  time_and_place varchar(400) DEFAULT NULL,
  is_active boolean DEFAULT false,
  PRIMARY KEY (id)
);
