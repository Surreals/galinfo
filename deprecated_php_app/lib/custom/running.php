<?
$depot['vars']['mod_result']=get_running();


function get_running(){
	global $par,$lxs,$depot,$enviro;

	$ttop="";
	$sql1="
			SELECT		subnews.id,
						subnews.ndate,
						subnews.ntype,
						subnews.urlkey,
						".NEWSHEAD.".nheader

			FROM		(
							SELECT	id,ndate,ntime,ntype,urlkey
							FROM	".NEWS." USE KEY (udate,running) 
							WHERE 	lang = \"".sqller($depot['vars']['langid'])."\" 
							AND approved = 1 AND running=1
							ORDER BY	udate DESC 
							LIMIT ".$depot['enviro']['qty_news_run']."
						) AS subnews
				
			LEFT JOIN	".NEWSHEAD."
			USING		(id)";



	$datas='';
	$hrefs='';
	/*$sql_run=sqlquery($sql1);*/

	$sql=sqlquery_cached($sql1,120,1);
	$i=0;
	foreach ($sql as $res){
		/*$res=conn_fetch_assoc($sql_run);*/
		$res["nheader"]=str_replace(array("\r","\n"),'',trim($res["nheader"]));


		$datas.='str_array['.$i.']="'.addslashes($res['nheader']).'";';
		$hrefs.='href_array['.$i.']="'.articleLink($res).'";';
		$i++;
	}

	

	$ttop.="

			<div id=\"running\">
				<span>
				<a class=\"but\" href='' onClick='return nextRun();' style='margin-right:20px;'><img src='/im/run-play.gif'></a>
				<a href='' id=\"runner\"> ... </a>
				</span>
			</div>
			<script>
				var objRun=document.getElementById('runner');
				objRun.onmouseover = function ()	{return pauseRun();}
				objRun.onmouseout = function ()		{return nextRun();}
				".$datas.$hrefs."
				run_list(str_array);
			</script>
	";

	return  $ttop;

}
