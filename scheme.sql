
--
-- Table structure for table `chats`
--

CREATE TABLE IF NOT EXISTS `chats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` varchar(245) NOT NULL,
  `type` varchar(245) NOT NULL,
  `data` text NOT NULL,
  `from` varchar(22) NOT NULL,
  `usable` int(2) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `uid` (`uid`),
  KEY `from` (`from`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1294 ;

