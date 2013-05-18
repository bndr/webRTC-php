<?php
/**
 * This was a webRTC experiment with PHP.
 * It can successfuly make calls between windows, and computers on the same network.
 * The code is not elegant, I know that, but it was more of a proof of concept.
 * @author Vadim Kr.
 * @copyright (c) 2013 bndr
 * @license http://creativecommons.org/licenses/by-sa/3.0/legalcode
 */
header('Content-type: application/json');
include('config.php');

/**
 * All the GET AND POST REQUESTS
 */
if (isset($_GET['getanswer'])) {
    
	$result = getData($_GET['uid'], 'answer');
    die(json_encode(array('type' => (isset($result[0]) ? $result[0]['type'] : null), 'sdp' => (isset($result[0]) ? $result[0]['data'] : null))));
    
} else if (isset($_GET['getoffer'])) {
    
    $result = getData($_GET['uid'], 'offer');
    die(json_encode(array('type' => (isset($result[0]) ? $result[0]['type'] : null), 'sdp' => (isset($result[0]) ? $result[0]['data'] : null),'status' => (isset($result[0]) ? 1 : 0))));
    
} else if (isset($_GET['candidate'])) {

    $result = getData($_GET['uid'], 'candidate', $_GET['from']);
    die(json_encode($result));
    
} else if ($_POST) {
    
    $json = json_decode($_POST['data'], true);
    $type = $_REQUEST['type'];
    insertData($_GET['uid'], $_POST['data'], $type);
}

/**
 * Insert data into database
 * @param string $uid
 * @param string $data
 * @param string $type
 */
function insertData($uid, $data, $type) {

    $from = isset($_GET['owner']) ? 'caller' : 'calee';
    $query = "INSERT INTO chats SET type='" . mysql_real_escape_string($type) . "', data='" . mysql_real_escape_string($data) . "',`uid`='" . $uid . "', `from`='" . mysql_real_escape_string($from) . "'";
    $execute = mysql_query($query) or die(mysql_error());
}
/**
 * Get data from database, base on the request
 * @param string $uid
 * @param string $type
 * @param string $from
 * @return array
 */
function getData($uid, $type, $from = FALSE) {

    $query = "SELECT * FROM chats WHERE uid='" . mysql_real_escape_string($uid) . "' AND type='" . $type . "' AND usable='1' ";
    if ($from)
        $query .= "AND `from`='" . mysql_real_escape_string($from) . "'";

    $result = mysql_query($query) or die(mysql_error());
    $output = array();
    while ($data = mysql_fetch_array($result)) {
        array_push($output, $data);
    }
    removeData($uid,$type);
    return $output;
}

function removeData($uid,$type) {
	$query = "UPDATE chats SET usable='0' WHERE uid='" . mysql_real_escape_string($uid) . "' AND type='" .$type . "'";
	$result = mysql_query($query) or die(mysql_error());
}
?>
