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
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  service_id int(10) unsigned NOT NULL,
  song_title varchar(200) NOT NULL,
  songtype varchar(100) DEFAULT NULL,
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
  verses text DEFAULT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;


--
-- Table structure for table `liturgicalsongs`
--

CREATE TABLE liturgicalsongs (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  title varchar(300) DEFAULT NULL,
  titleseparator varchar(300) DEFAULT NULL,
  role varchar(300) DEFAULT NULL,
  composer varchar(300) DEFAULT NULL,
  lyrics varchar(300) DEFAULT NULL,
  verses text DEFAULT NULL,
  PRIMARY KEY (id)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;



DROP TABLE IF EXISTS `comments`;
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
-- Table structure for table songsegment
--

CREATE TABLE songsegments (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `songdescription` TEXT DEFAULT NULL,
  `restrictedto` TEXT DEFAULT NULL,
  `singlename` varchar(100) DEFAULT NULL,
  `multiname` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;


--
-- Table structure for table infosegment
--

CREATE TABLE infosegments (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `maintext` varchar(100) DEFAULT NULL,
  `header` varchar(300) DEFAULT NULL,
  `genheader` varchar(300) DEFAULT NULL,
  `subgenheader` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8  COLLATE utf8_general_ci;


--
-- Table structure for table presentation_structure``
--

CREATE TABLE presentation_structure (
  id int(10) unsigned NOT NULL AUTO_INCREMENT,
  slot_name varchar(300) DEFAULT NULL,
  slot_number int(3) DEFAULT NULL,
  slot_type varchar(300) DEFAULT NULL,
  id_in_type_table varchar(300) DEFAULT NULL,
  content_id int(10) unsigned NOT NULL,
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


