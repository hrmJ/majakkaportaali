DROP DATABASE if EXISTS majakkaportaali;
CREATE DATABASE majakkaportaali;
USE majakkaportaali;


--
-- Table structure for table `seasons`
--

DROP TABLE IF EXISTS `seasons`;
CREATE TABLE `seasons` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `startdate` date DEFAULT NULL,
  `enddate` date DEFAULT NULL,
  `theme` varchar(100) DEFAULT NULL,
  `comments` text,
  `name` varchar(100) DEFAULT NULL,
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
