<?
global $fh_sql;

require_once('access.php');

require_once('dbstuff.php');

inTime("connectDB","qrytime");


if ($depot['vars']['imadmin']) {
	 $filename=$_SERVER['DOCUMENT_ROOT']."/var/mysql_log.txt";
	$depot['fh_sql']=fopen($filename,'w');
}

initEnviro();

function connectDB(){
	global $depot, $conn;

    if(isset($depot['DBhost']) && isset($depot['DBdatabase']) && isset($depot['DBusername']) && isset($depot['DBpassword'])){
        $dsn = 'mysql:host='.$depot['DBhost'].';dbname='.$depot['DBdatabase'];
        $user = $depot['DBusername'];
        $password = $depot['DBpassword'];
    }else{
		if ($_SERVER["REMOTE_ADDR"] != '91.201.235.87') return;
        die(dsb());
    }

    try {
        $conn = new PDO($dsn, $user, $password);
//        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_SILENT);
        $conn->exec('set names utf8');
        $conn->exec('set SESSION group_concat_max_len=280000');

    } catch (PDOException $e) {
		if ($_SERVER["REMOTE_ADDR"] != '91.201.235.87') return;
        die(dsb($e));
    }

//	$conn = @mysql_connect($depot['DBhost'],$depot['DBusername'],$depot['DBpassword'])  or die(dsb());
//	mysql_select_db($depot['DBdatabase'],$conn);
//	conn_sql_query('set names utf8');
//	conn_sql_query('set SESSION group_concat_max_len=280000');

}

/**
 * Return PDO sql query result
 * @param $sql
 * @return mixed
 * mysql_query
 */
function conn_sql_query($sql){
    global $conn;

    try {
        $result = $conn->query($sql);
        return $result;
    } catch (PDOException $e) {
		if ($_SERVER["REMOTE_ADDR"] != '178.210.132.156') return;
        var_dump($e);die;
    }

}

/**
 * Return count of SQL result records
 * @param PDOStatement $sql
 * @return bool|int
 * mysql_num_rows
 */
function conn_sql_num_rows(PDOStatement $sql){

    try {
        return $sql->rowCount();
    } catch (PDOException $e) {
		if ($_SERVER["REMOTE_ADDR"] != '91.201.235.87') return;
        var_dump($e);die;
    }

}

/**
 * Return PDO result ASSOC array
 * @param PDOStatement $sql
 * @return mixed
 * mysql_fetch_assoc
 */
function conn_fetch_assoc(PDOStatement $sql){

    try {
        $result = $sql->fetch(PDO::FETCH_ASSOC);
        return $result;
    } catch (PDOException $e) {
		if ($_SERVER["REMOTE_ADDR"] != '91.201.235.87') return;
        var_dump($e);die;
    }

}

/**
 * Return PDO result array
 * @param PDOStatement $sql
 * @param $result_type
 * @return mixed
 * mysql_fetch_row
 */
function conn_fetch_row(PDOStatement $sql){

    try {
        $result = $sql->fetch(PDO::FETCH_NUM);
        return $result;
    } catch (PDOException $e) {
		if ($_SERVER["REMOTE_ADDR"] != '91.201.235.87') return;
        var_dump($e);die;
    }

}

/**
 * Return PDO result array
 * @param PDOStatement $sql
 * @param $result_type
 * @return mixed
 * mysql_fetch_array
 */
function conn_fetch_array(PDOStatement $sql, $result_type = ''){

    if($result_type && $result_type == 'MYSQL_ASSOC'){
        $result_type = PDO::FETCH_ASSOC;
    }

    if(!$result_type){
        $result_type = PDO::FETCH_BOTH;
    }

    try {
        $result = $sql->fetch($result_type);
        return $result;
    } catch (PDOException $e) {
		if ($_SERVER["REMOTE_ADDR"] != '91.201.235.87') return;
        var_dump($e);die;
    }

}

/**
 * mysql_error
 * @return mixed
 */
function conn_error(){
    global $conn;
	$errors = $conn->errorInfo();
	if (isset($errors[0]) && $errors[0] == 0) {
		return false;
	}
	if ($_SERVER["REMOTE_ADDR"] != '91.201.235.87') return;
    return print_r($conn->errorInfo());
}

/**
 * @param $sql
 * @return bool|int
 * mysql_affected_rows
 */
function conn_affected_rows($sql = null){

    if(!$sql || !($sql instanceof PDOStatement)){
        return 0;
    }

    try {
        $result = $sql->rowCount();
        return $result;
    } catch (PDOException $e) {
		if ($_SERVER["REMOTE_ADDR"] != '91.201.235.87') return;
        var_dump($e);die;
    }

}

/**
 * @return mixed
 * mysql_insert_id
 */
function conn_insert_id(){
    global $conn;

    return $conn->lastInsertId();
}

/**
 * @param $string
 * @return mixed
 * mysql_real_escape_string
 */
function conn_real_escape_string($string){
    global $conn;

    $result = $conn->quote(trim($string));
    return stripQuotes($result);
}

function stripQuotes($text) {
    $unquoted = preg_replace('/^(\'(.*)\'|"(.*)")$/', '$2$3', $text);
    return $unquoted;
}