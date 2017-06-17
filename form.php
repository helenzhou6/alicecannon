<?php
require __DIR__ . '/vendor/autoload.php';
use Postmark\PostmarkClient;
use Postmark\Models\PostmarkException;

$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();
$pm_key = getenv('POSTMARK_API_KEY');

$data = [];
$name = $_POST['name'];
$subject = "New Alice Cannon message from " . $name;
$email = $_POST['email'];
$body = "Message from " . $name . " (" . $email . "): " . $_POST['message'];
$client = new PostmarkClient($pm_key);

try {
	$sendResult = $client->sendEmail("mail@jayfreestone.com", "mail+test@jayfreestone.com", $subject, $body);
	$data['success'] = true;
	$data['message'] = 'Sent successfully. Thanks for getting in touch!';
} catch(PostmarkException $ex) {
	$data['success'] = false;
	$data['message'] = 'There has been a problem with your submission.';
}

// If we're AJAX'ing, send back JSON
if (isset($_POST['ajax'])) {
	echo json_encode($data);
} else {
	// Otherwise redirect
	header("location:index.php?form-sent=" . $data['success'] . "#contact-section");
}
