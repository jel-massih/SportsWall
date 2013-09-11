<?php

$rawurl = "";

if (isset($_POST['payload'])) {
	$payload = json_decode(stripslashes($_POST['payload']));

	$url = $payload->repository->url;
	global $rawurl;
	$rawurl = str_replace("https://", "https://raw.", $url);
	$rawurl = $rawurl."/master/SportsWall_Site/";
	
	foreach($payload->commits as $commit) {
		$added = $commit->added;
		$removed = $commit->removed;
		$changed = $commit->modified;
		
		foreach($added as $add) {
			addFile($add);
		}
		foreach($changed as $change) {
			addFile($change);
		}
		foreach($removed as $remove) {
			removeFile($remove);
		}
	}
}

function addFile($path) {
	global $rawurl;
	
	if(stripos($path, "Node_Server/") != false){return;}
	$path = str_replace("SportsWall_Site/", "", $path);
	if(!file_exists(dirname($path))) {
    	mkdir(dirname($path), 0777, true);
	}
	debug("Saving: ".$rawurl.$path." to ".$path);
	file_put_contents($path, fopen($rawurl.$path, 'r'));
}

function removeFile($path) {
	if(file_exists($path)) {
		unlink($path);
	}
}

function debug($txt) {
	file_put_contents("log.txt",$txt."\n", FILE_APPEND | LOCK_EX);
}
?>