<?php

/**
 * @author  <github.com/tarampampam>
 * @weblog  http://blog.kplus.pro/
 * @project https://github.com/tarampampam/jquery.textmistake
 *
 * @version 0.1
 *
 * @licensy Licensed under the MIT, license text: http://goo.gl/JsVjCF
 */

### Settings ###################################################################

//error_reporting(0); // Errors output must be disabled by default

define('MailFrom', 'info@galinfo.com.ua');
define('MailTo',   'info@galinfo.com.ua');
define('CAPTCHA_SECRET',   '6LeBk30UAAAAANyBBz2MXyvL3Ml5r7Vsdf53_z8X');
define('RemoveHTML', true);

################################################################################

function validateEmail($email) { // http://stackoverflow.com/a/46181/2252921
    return (preg_match('/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)'.
    '|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])'.
    '|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/', $email) === 1) ? true : false;
}

function exitWithMessage($msg, $code = 0){
    die(json_encode(array('msg' => $msg, 'code' => $code)));
}

function secureClear($text) {
    return htmlspecialchars(strip_tags($text));
}

header('Content-Type: application/json');

// If empty POST - we will die
if(empty($_POST)) {
    header("HTTP/1.0 503 Service Unavailable");
    exitWithMessage('Direct access not allowed');
} elseif(isset($_POST['message']) and is_array($_POST['message'])
    and !empty($_POST['message'])) {


    $post_data = http_build_query(
        array(
            'secret' => CAPTCHA_SECRET,
            'response' => $_POST['message']['token'],
            'remoteip' => $_SERVER['REMOTE_ADDR']
        )
    );
    $opts = array('http' =>
        array(
            'method'  => 'POST',
            'header'  => 'Content-type: application/x-www-form-urlencoded',
            'content' => $post_data
        )
    );
    $context  = stream_context_create($opts);
    $response = file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
    $result = json_decode($response);
    if (!$result->success) {
        exitWithMessage('Gah! CAPTCHA verification failed. Please email me directly at: jstark at jonathanstark dot com');
    }






    $message = $_POST['message'];
    $mailTo = (string) '';
    $mailFrom = (string) '';

    // Check mail destination
    if(defined('MailTo') and validateEmail(MailTo))
        $mailTo = MailTo;
    elseif(!empty($message['to'][0]['email'])
        and validateEmail($message['to'][0]['email']))
        $mailTo = $message['to'][0]['email'];
    if(empty($mailTo))
        exitWithMessage('Empty or invalid email address for sending');

    // Check mail sender
    if(defined('MailFrom') and validateEmail(MailFrom))
        $mailFrom = MailFrom;
    elseif(!empty($message['from_email'])
        and validateEmail($message['from_email']))
        $mailFrom = $message['from_email'];
    if(empty($mailFrom))
        exitWithMessage('Empty or invalid email sender');

    // Remove html (if needed)
    if(defined('RemoveHTML') and RemoveHTML) {
        $message['subject'] = secureClear($message['subject']);
        $message['html'] = str_replace(
            array('<strong>', '</strong>', '<b>', '</b>'),
        '##', $message['html']);
        $message['html'] = secureClear($message['html']);
    }

    // Check subject
    if (empty($message['subject'])) exitWithMessage('Empty subject');

    // Check mail body
    if (empty($message['html'])) exitWithMessage('Empty or invalid mail body');

    // Prepare sendmail headers
    $headers = "MIME-Version: 1.0\r\n".
        "Content-Type: text/".((defined('RemoveHTML') and RemoveHTML) ?
        "plain" : "html")."; charset=\"utf-8\"\r\n";

    $headers .= "From: ".$mailFrom."\r\n".
                "Reply-To: ".$mailFrom."\r\n".
                "Return-Path: ".$mailFrom."\r\n";

    // And sending mail
    if(!mail($mailTo, $message['subject'],
             $message['html'],
             $headers)) {
        exitWithMessage('Sendmail server error :(');
    } exitWithMessage('Your message was sent successfully', 1);
}
