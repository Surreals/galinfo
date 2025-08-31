<?	/**
	*	main routes calculated from $_SERVER['REQUEST_URI']
	*/
	require_once('stuff.php');
	$rewrite=explode('?',$_SERVER['REQUEST_URI']);
	if (isset($rewrite[0])) routeRewrite($rewrite[0]);

	function routeRewrite($url){
		global $par,$depot;
		$pars = explode ("/",$url);
		if ($pars[1]=='editor' && isset($_COOKIE['ediID'])) {
			array_shift($pars);
			array_shift($pars);
			array_unshift($pars,"");
		}
		$par['lng']="ua";
		$depot['vars']['ogimage']="<meta property=\"og:image\" content=\"http://".$_SERVER['HTTP_HOST']."/im/logo.png\" />";
		rewriteNewsSection($pars);
		/*common cookie*/
		require_once("checkcookie.php");
		/* limit page number */
		if (isset($par['pg']) && $par['pg'] >=100) $par['pg'] = 100;
		if (@$par['ns']=='home') $depot['vars']['homerefresh']="<meta http-equiv=\"refresh\" content=\"600\">";
	}

	function rewriteNewsSection($pars){
		global $par,$depot;

		$rubrics = getRubricsIds();
		$types		=explode(",","news,articles,dossier,blogs,photo,video,photo-video");
		if (!isset($pars[2]) && !$pars[1]) $par['ns']='home';

		else {
			
			/*		/RUBRIC/ARTTICLETYPE/	*/

			if (in_array($pars[1],$rubrics)) {
				$par['rubric_id']=$pars[1];
				if (!@$pars[2]) {
					$par['ns']='home';
					return;
				}

				$par['ns']='listall';
				if (in_array($pars[2],$types)) {
				
					$par['articletype']=$pars[2];
					if (@$par[3]) return early404();

					return;
				} else return early404();
			}


			/*		/ARTTICLETYPE/	*/

			 else if (in_array($pars[1],$types)) {

				$par['articletype']=$pars[1];

				if (!@$pars[2])  return;

				preg_match('/^(.+)\.html$/',$pars[2],$mtch);
				
				if (isset($mtch[1])) $par['newsid']=$mtch[1]; else return early404();

				if (@$par[3]) return early404();

				return;

			}
			
			$par['pphtm']="homepage";

			switch ($pars[1]){

				case "news"	 :	
				case "print" :
				case "articles" :
				case "photoreport":	

					if (@$pars[2]=='all') {
						$par['ns'] = 'listall';
						$depot['vars']['bodyclass']=" class=\"cat_page\"";
					}
					else {
						if ($pars[1] =="news")	{
							$par['ns']='read';
							if (!@$pars[2]) return early404();
						}
						else if ($pars[1] =="print")	{
							$par['ns']=$par['pphtm']="print";
							$depot['enviro']['if-cachehtml']=0;
						}
						else if ($pars[1] =="photoreport")	{
							$par['ns']="photoreport";
							$depot['vars']['bodyclass']=" class=\"photos\"";
						}
						else if ($pars[1] =="articles")	{
							$par['ns']="articles";
						}

						if (isset($pars[4])) return early404();

						if (isset($pars[3])) {
							$par['newsid']=$pars[3];
							$depot['vars']['bodyclass']=" class=\"cat_page\"";
						}
					
					}
					break;

				case "blogs":	

					$par['articletype'] = "blogs";
					if (@$pars[2]) {
						$par['newsid']=$pars[2];
						if (@$pars[3]) return early404();
					}
					break;


				case "bloggers"	:
					
					$par['articletype']="blogs";
					if (!@$pars[2] || (@$pars[3])) return early404();
					$par['blogger_id']=$pars[2];
					break;


				case "chat"	:	
					
					$par['articletype'] = "chat";
					if (@$pars[2]) {
						$par['chid']=$pars[2];
						if (@$pars[3]) return early404();
					}
					break;


				case "myaccount" :	

					$par['pphtm']=$pars[1];
					if (@$pars[2]) $par['action']=$pars[2];
					@$depot['vars']['morejs'][]='<script src="/js/fuploads.js"></script>';
					if (@$pars[3]) return  early404();
					break;


				case "announce" :	

					$par['articletype'] = "announces";
					if (@$pars[2]) return early404();
					break;

				
				case "archive"	:
					
					$par['pphtm']=$pars[1];
					array_shift($pars);
					array_shift($pars);
					$par['ns']=implode("/",$pars);
					
					/*if (@$pars[2]) $par['ayear']=@$pars[2];

					if (@$pars[3]) {
						$par['amonth']=@$pars[3];
						$par['ns']		='here';
					}

					if (@$pars[4]) $par['aday']=@$pars[4];
					if (@$pars[5]) $par['asection']=@$pars[5];
					if (@$pars[6]) $par['asectionid']=@$pars[6];
				
	
					$depot['enviro']['if-cachehtml']=0;

					if (@$pars[7]) return early404();*/
					break;


				case "tags"	: 	

					if (!@$pars[2]) early404();
					$par['filterNews']="tags";
					$par['filter_id']=urldecode($pars[2]);
					break;

				case "region"	:	
				case "rubric"	:
				case "theme"	:	
					if (!@$pars[2]) return early404();

					if (@$par[3]=='all') {
						$par['ns']="listall";
						if (@$pars[4]) return early404();
					} else {
						$par['ns']=$pars[1];
					}
					//$depot['vars']['bodyclass']=" class=\"cat_page\"";
					//$par[$pars[1]."_id"]=$pars[2];

					$par['filterNews']=$pars[1];
					$par['filter_id']=urldecode($pars[2]);

					break;

				case "video" :	
					
					if (@$pars[3]) return early404();
					$par['ns']='video';
				
				case "announceprint":
					
					$par['pphtm']	="print";
					$par['ns']		="announce";
					if (!@$pars[3])  return early404();
					
					$par['date']=$pars[3];
					if (@$pars[4]) {
						$par['date']=$pars[4];	
						$par['cityid']=$pars[3];
					}
					
					if (@$pars[5]) return early404();
					$depot['vars']['bodyclass']=" class=\"anons\"";
					break;
			
			
				case "gallery"	:
				case "poll"		:
					
					if (@$pars[3]) return early404();
					$par['ns']		=implode("/",$pars);
					$par['pphtm']=$pars[1];
					$par['gid']=$pars[2];
					break;

				case "search"	:
					
					if (@$pars[3]) return early404();
					$par['ns']="search";
					break;

				case "topthemes" :	

					if (!@$pars[2] || @$pars[3]) return  early404();
					$par['ns']="filter";
					$par['filterNews']	= $pars[1];
					$par['filter_id']	= $pars[2];
					break;

				case "rss" :
					
					$par['pphtm']='rsschannel';
					if (@$pars[3]=='export.rss') {
						$par['ns']='all';
						if (@$pars[4]) return  __LINE__;//early404();
					}
					else if (@$pars[3]=='yandexml.rss') {
						$par['ns']='all';
						if (@$pars[4]) return  __LINE__;//early404();
					}
					else if (@$pars[3]=='mailru.rss') {
						$par['ns']='all';
						if (@$pars[4]) return  __LINE__;//early404();
					}

					else if (@$pars[3]=='rambler.rss') {
						$par['ns']='all';
						if (@$pars[4]) return  __LINE__;//early404();
					}
					else if (in_array(@$pars[3],array('region','rubric','theme'))) {
						if (!@$pars[4]) return  __LINE__;//early404();
						$par['ns']=@$pars[3];
						preg_match('/(\w+)\.rss$/',$pars[4],$mtch);
						if ($mtch[1]) return  __LINE__;//early404();
						$var=$pars[3]."_id";
						$$var=$mtch[1];
					} else  if (!@$pars[3]) {
						$par['pphtm']='rss';
						$par['ns']='home';
					}
					else return  __LINE__;//early404();

					break;


				case "go" :		
					
					if (!@$pars[2] || @$pars[3]) return  early404();
					$par['pphtm']='go';
					$par['pphtmsu']	= $pars[2];
					break;
									
				default	:	
									
					array_shift($pars);
					$par['pphtm']="/".implode("/",$pars);

					//print_r($par['pphtm']);die("<br>No worries. Just debugging ....");/**/

					//die($par['pphtm']);
					//if (@$pars[3]) return early404();
					break;	
			}
		}
	}

	
	function early404(){
		header("HTTP/1.x 404 Not Found");	
		require_once('404.php');
		die();
	}

	function getRubricsIds(){
		$sql_str="
			SELECT param 
			FROM ".CATS." 
			WHERE  isvis = 1
			AND cattype = 1
			ORDER BY orderid
		";

		$sql_run  = sqlquery($sql_str);
		$params = array();
		while ($res = conn_fetch_row($sql_run)) {
			$params[] = $res[0];
		}
		return $params;
	}