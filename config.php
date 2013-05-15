<?php

$username = "";
$password = "";
$database = "";

$connection = mysql_connect("localhost", $username, $password) or die(mysql_error());
mysql_select_db($database);
?>
