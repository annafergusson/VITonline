
  <?php
 	header("Access-Control-Allow-Origin: *");
 	$url = $_GET["fn"];

	 
	$aContext = array(

		'http' => array(

			'proxy' => 'tcp://squid.auckland.ac.nz:3128',

			'request_fulluri' => true,

		),

	);

	$cxContext = stream_context_create($aContext);




	// Validate url

	$url_no_space = filter_var($url, FILTER_SANITIZE_URL);
	if (!filter_var($url_no_space, FILTER_VALIDATE_URL) === false) {
		echo file_get_contents(preg_replace("/[^\x20-\x7E]/", "", $url_no_space),False, $cxContext);
		// echo file_get_contents(preg_replace("/[^\x20-\x7E]/", "", $url_no_space));
	} else {
		echo("$url is not a valid URL"); 
	}
 /*
 	header("Access-Control-Allow-Origin: *");
 	$url = $_GET["fn"];

	 
	$aContext = array(

		'http' => array(

			'proxy' => 'tcp://squid.auckland.ac.nz:3128',

			'request_fulluri' => true,

		),

	);

	$cxContext = stream_context_create($aContext);




	// Validate url

	if (!filter_var($url_no_space, FILTER_VALIDATE_URL) === false) {

		echo file_get_contents(preg_replace("/[^\x20-\x7E]/", "", $url),False, $cxContext);

		//echo "hello";

	} else {

		echo("$url is not a valid URL"); 
	}
 	// // Remove all illegal characters from a url
	// $url_no_space = filter_var($url, FILTER_SANITIZE_URL);

	// // Validate url
	// if (!filter_var($url_no_space, FILTER_VALIDATE_URL) === false) {
	// 	//echo $url;
	// 	echo file_get_contents(preg_replace("/[^\x20-\x7E]/", "", $url));
	// 	//echo "hello";
	// } else {
	// 	echo("$url is not a valid URL");
	// }
	*/
?>