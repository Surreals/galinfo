<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ru">
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8"/>
    <title>Аутентифікация через ВК</title>
</head>
<body>
    <?php
    $client_id = '4951296'; // ID приложения
    $client_secret = 'slXn68DVnxATdCMYH83B'; // Защищённый ключ
    $redirect_uri = 'http://'.$_SERVER["HTTP_HOST"].'/apphlp/oauth/vkoauth/index.php'; // Адрес сайта

    $url = 'http://oauth.vk.com/authorize';

    $params = array(
        'client_id'     => $client_id,
        'redirect_uri'  => $redirect_uri,
        'response_type' => 'code'
    );

    echo $link = '<p><a href="' . $url . '?' . urldecode(http_build_query($params)) . '">Аутентифікация через ВК</a></p>';

	if (isset($_GET['code'])) {
		$result = false;
		$params = array(
			'client_id' => $client_id,
			'client_secret' => $client_secret,
			'code' => $_GET['code'],
			'redirect_uri' => $redirect_uri
		);

		$token = json_decode(getpage('https://oauth.vk.com/access_token' . '?' . urldecode(http_build_query($params))), true);

		if (isset($token['access_token'])) {
			$params = array(
				'uids'         => $token['user_id'],
				'fields'       => 'uid,email,first_name,last_name,screen_name,sex,bdate,photo_big',
				'access_token' => $token['access_token']
			);

			$userInfo = json_decode(getpage('https://api.vk.com/method/users.get' . '?' . urldecode(http_build_query($params))), true);
			if (isset($userInfo['response'][0]['uid'])) {
				$userInfo = $userInfo['response'][0];
				$result = true;
			}
		}

		if ($result) {

			print_r($userInfo);
			/*echo "Социальный ID пользователя: " . $userInfo['uid'] . '<br />';
			echo "Имя пользователя: " . $userInfo['first_name'] . '<br />';
			echo "Ссылка на профиль пользователя: " . $userInfo['screen_name'] . '<br />';
			echo "Пол пользователя: " . $userInfo['sex'] . '<br />';
			echo "День Рождения: " . $userInfo['bdate'] . '<br />';
			echo '<img src="' . $userInfo['photo_big'] . '" />'; echo "<br />";*/
		}
	}


	function getpage($path){
		$c = curl_init();
		curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($c, CURLOPT_FOLLOWLOCATION, true);
		curl_setopt($c, CURLOPT_USERAGENT, "Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.7.8) Gecko/20050516 Firefox/1.0.4");
		curl_setopt($c, CURLOPT_HEADER, false);
		curl_setopt($c, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($c, CURLOPT_URL, $path);
		$e = curl_exec($c);
		curl_close($c);
		return $e;
	}
?>
</body>
</html>