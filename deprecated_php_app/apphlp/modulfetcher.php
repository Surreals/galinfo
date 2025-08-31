<?php


if(!defined("LIBRARY_IS_LOAD")){
	define("LIBRARY_IS_LOAD",1);
	define("DefaultExt","php");
	$INC_DIRS=array(".","./","./lib",".../lib","./adm",".../adm",".../tls","./../tls","./../lib","./../adm","./js");

	function absolute_path($path, $cur_path){
		$path=strtr(trim($path),"\\","/");
		$Apaths=explode("/",$path);
		if ($cur_path==="") $search=getcwd(); else $search=$cur_path;
		foreach($Apaths as $k=>$v)
		if($v!="."){
			if(!$k && (strlen($v)>1&&$v[1]===":"||$v===""))$search=$v;
			elseif($v===".."){
				if(strlen($search)>1 && $search[1]===":") continue;
				$p=dirname($search);
				if($p==="/"||$p==="\\"||$p===".") $search=""; else $search=$p;
			}
			elseif($v!=="") $search=$search."/$v";
		}
		return ($search!==""?$search:"/");
	}

	function urltopath($path) {
		$URL=dirname("$SCRIPT_NAME");
		$cURL=absolute_path(trim($path),$URL);
		return getenv("DOCUMENT_ROOT").$cURL;
	}

	function absoluteinclude() {
		static $DIR="";
		global $INC_DIRS;
		if ($DIR!==$INC_DIRS){
			for($i=0;$i<count($INC_DIRS);$i++){
				$value=&$INC_DIRS[$i];
				if($value[0]==="."&&(strlen($value)==1 ||$value[1]==='\\'||$value==='/')) continue;
				$value=absolute_path($value,"");
			}
			$DIR=$INC_DIRS;
		}
	}


	function LLoad($library){
		global $INC_DIRS;
		static $DIR,$last=0;

		absoluteinclude();
		$l=$last;
		do{
			$dir=$INC_DIRS[$last];
			if(@is_file($f="$dir/$library.".DefaultExt)){
				$cwd=getcwd();
				chdir(dirname($f));
				foreach($GLOBALS as $k=>$v) global $$k;
				$res=require_once($f);
				absoluteinclude();
				chdir($cwd);
				return $res;
			}
			$last=($last+1)%count($INC_DIRS);
		} while ($last!=$l);
		die ("Library $library not found at ".join("; ",$INC_DIRS));
		//header('Location: /err404.php');
	}

	error_reporting(E_ALL);
}

function getmcrotime(){ 
    list($usec, $sec) = explode(" ",microtime()); 
    return ((float)$usec + (float)$sec); 
} 
?>