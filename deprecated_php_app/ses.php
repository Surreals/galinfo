<?
session_start();
$_SESSION["de"]="lviv";
//echo session_id();
//session_destroy();
//echo session_cache_expire();

$numbers = range(0,9);
$cletters=range("A","Z");
$sletters=range("a","z");
$numbers=array_merge($numbers,$cletters,$sletters);
mt_srand ((float)microtime());

//foreach ($numbers as $v) echo $v;
$s=count($numbers)-1;
echo "$s<br>";
for($i=0;$i<32;$i++){
   	echo $numbers[rand(0,$s)];
}

echo "<h1>".date('H:i:s m-d-Y',time())."</h1>";

foreach ($_SERVER as $ke=>$va) echo "$ke=.................. $va<br>";
echo phpinfo();
?>

