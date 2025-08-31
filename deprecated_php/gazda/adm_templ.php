<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<title><?=$pagetitle;?></title>
		<link rel="stylesheet" type="text/css" href="/gazda/css/admin.css">
		<link rel="stylesheet" type="text/css" href="/gazda/css/styles.css">
		<link rel="stylesheet" type="text/css" href="/gazda/css/ui-lightness/jquery-ui-1.10.3.custom.css">
		<link rel="stylesheet" type="text/css" href="/gazda/css/tpicker.css">
		<link rel="stylesheet" type="text/css" href="/gazda/css/dropzone.css">
		<link href='http://fonts.googleapis.com/css?family=PT+Sans:400,700&subset=latin,cyrillic' rel='stylesheet' type='text/css'>

		<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
		<link rel="shortcut icon" href="/gazda/img/favicon.ico" type="image/x-icon"/>	
		<script language='javascript' type="text/javascript"  src='js/ajaxupload.js'></script>
		<script language='javascript' type="text/javascript"  src='js/adm_default.js'></script>
		<script language='javascript' type="text/javascript"  src='adm_js.php'></script>
		<script language='javascript' type="text/javascript"  src='js/popups.js'></script>
		<script language='javascript' type="text/javascript"  src='ckeditor/ckeditor.js'></script>
		

		<script type="text/javascript" src="/gazda/js/ajax.js"></script>
		<script type="text/javascript" src="/gazda/js/ajax-dynamic-list-keydown.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js"></script>
		<script language='javascript' type="text/javascript"  src='js/jquery-ui-1.10.3.custom.min.js'></script>
		<script language='javascript' type="text/javascript"  src='js/timepicker.js'></script>
		<script language='javascript' type="text/javascript"  src='js/jquery.ui.datepicker-ua.js'></script>
		<script language='javascript' type="text/javascript"  src='js/dropzone.js'></script>
		<script type="text/javascript" src="/gazda/js/initjs.js"></script>


	</head>

	<body>
		<div class="brd" style='padding-bottom:50px;padding-top:10px;'>
			
			<div style='position:relative;width:100%;'>
			<a href="/" style="width:80px;position:absolute;height:80px;left:0;display:block;top:0px;" target="_blank"><img src="/gazda/img/zlogo.gif"></a>

				<div style='margin-left:100px;'>
					<?=$var_menu1;?>
				
					<?=$var_menu2;?>
				</div>
			</div>
			
			<? echo errors(); echo oks();?>

			<?=$var_center;?>
			
		</div>
	</body>
</html>
