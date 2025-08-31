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

foreach ($_SERVER as $ke=>$va) echo "$ke=.................. $va<br>";
//$text="Dear 4 4 <br><br> You've received this letter.... Bla, Bla, Bla... Jarrod, here is the zone of your responsibility - i mean content. Just watch each page and try to compose some content for it. To activate your account on DNTrader simply click the link below. http://dnt/confirmuser.php?user=jgjr4TaYKd90n0S4IercGvnDpvkpICoT Regards, DNTrader.com Team";

//if (mail("roman@sky.lviv.ua","REQUEST",$text,"Content-Type: text/html; charset='windows-1251'\n")) {echo "<span class='bd'>Запрос принят<br><br></span>";} else echo "Щось не так.......";
phpinfo();
?>

