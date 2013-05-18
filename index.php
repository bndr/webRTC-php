<?php

function generate_uid($length = 25)
{
    $letters = "abcdefghjklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";

    $for_shuffle = str_split($letters);
    shuffle($for_shuffle);
    $letters = implode("", $for_shuffle);
    $password = '';

    for ($i = 0; $i < $length; $i++) {
        $password .= $letters[(mt_rand() % strlen($letters))];
    }
    return $password;
}

$uid = isset($_GET['uid']) ? $_GET['uid'] : generate_uid();
?>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="X-UA-Compatible" content="chrome=1"/>
    <link rel="stylesheet" href="bootstrap/css/bootstrap.css"/>
    <link rel="stylesheet" href="styles.css"/>
</head>

<body>
<div class="container">
    <div class="row main">
        <div class="span8">
            <h3>Your session id: <a href="?uid=<?= $uid ?>">#<?= $uid ?></a></h3>
        </div>
        <div class="span8">
            <div class="alert alert-success">
                Status: <span id="status_text">Waiting for other person...</span>
            </div>
        </div>
        <div id="chat_wrap" class="span8 chat_box">

        </div>

    </div>
    <div class="row">
        <div class="span8">
            <div class="input-chat">
                <input id="chat_val" placeholder="Your message..." value=""/>
                <button onclick="sendMessage();" class="input-chat-button"><i class="icon-upload"></i></button>
            </div>
        </div>
    </div>
</div>

</body>
<script>
    var uid = "<?= (isset($_GET['uid']) ? $_GET['uid'] : $uid) ?>";
    var isCaller = <?= (isset($_GET['uid']) ? "false" : "true") ?>;
</script>
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
<script src="crypt.js"></script>
<script src="adapter.js"></script>
<!-- For Crossbrowser RTCPeerconnection. Helps a lot. -->
<script src="chat.js"></script>
<!-- Main js file. -->
</html>
