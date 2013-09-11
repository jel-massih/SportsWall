<?php

$rawurl = "";

if (isset($_POST['payload'])) {
	$payload = json_decode(stripslashes($_POST['payload']));
	
	$url = $payload->repository->url;
	$rawurl = str_replace("https://", "https://raw.", $url);
	$rawurl = $rawurl."/";
	foreach($payload->commits as $commit) {
		debug($commit->message);
		$added = $commit->added;
		$removed = $commit->removed;
		$changed = $commit->modified;
		
		foreach($added as $add) {
			debug("ADD: ".$add);
			addFile($add);
		}
		foreach($changed as $change) {
			debug("Change: ".$change);
			addFile($change);
		}
		foreach($removed as $remove) {
			debug("REM: ".$add);
			removeFile($remove);
		}
	}
}

function addFile($path) {
	if(stripos($path, "Node_Server/")) {return;}
	$path = str_replace("SportsWall_Site/", "", $path);
	if(!file_exists(dirname($path))) {
    	mkdir(dirname($path), 0777, true);
	}
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