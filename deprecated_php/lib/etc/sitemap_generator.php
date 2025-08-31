<?php 

		function generateSitemap($date = false){
			//return;
			generateAllNews($date);
			generateActualSitemap();
			generateMainSitemap();
		}
		
		function generateMainSitemap(){
			global $depot;
			$base = "https://".$depot['vars']['domain'];
			$sitemaps = glob(dirname(__FILE__)."/../../sitemap/sitemap_*.xml");
			
			$sitemapindex  = new SimpleXMLElement('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></sitemapindex>');
			
			foreach($sitemaps as $item){
				$pathinfo = pathinfo($item);
				
				$file = $pathinfo['filename'].'.'.$pathinfo['extension'];
				
				$datemodify = getSitemapModify($file);
				
				
				
				$sitemap = $sitemapindex->addChild('sitemap');
				$sitemap->addChild('loc',$base.'/sitemap/'.$pathinfo['filename'].'.'.$pathinfo['extension']);
				$date = date('Y-m-d\TH:i:s\Z', strtotime($datemodify));
				$sitemap->addChild('lastmod',$date);
			}
			 
			 
			 
			$dom = new DOMDocument('1.0','UTF-8');
			$dom->preserveWhiteSpace = false;
			$dom->formatOutput = true;
			$dom_xml = dom_import_simplexml($sitemapindex);
			$dom_xml = $dom->importNode($dom_xml, true);
			$dom_xml = $dom->appendChild($dom_xml);
			
			$dom->save(dirname(__FILE__)."/../../sitemap/main_sitemap.xml");
		}
		
		
		
		
		function generateActualSitemap(){
			
			$date_modify = getSitemapModify('sitemap_actual.xml');
			$check = getLastNews($date_modify);

			if($check === true || $date_modify === null){

				$qry = requestByActual();
				createXml($qry,null,'actual');
				$qry = requestByYear(date('Y'));
				createXml($qry,date('Y'));

                if ( date('z') === '0' ) {
                    $date = new DateTime('-1 day');
                    $year = $date->format('Y');
                    $qry = requestByYear($year);
                    createXml($qry,date('Y'));
                }

			}
			
			generateMainSitemap();
		}

		function generateAllNews($date = false){
			if(!$date){
				$date = "";
				$first_news = conn_fetch_assoc(conn_sql_query("SELECT MIN(ndate) as min_date FROM ".NEWS." WHERE ndate AND approved = 1"));
				$date = $first_news['min_date'];
			}
			
			$check = false;


			
			do{ 
				/* робимо запит */
				$qry = requestByYear($date);
				
				/*із вибутих данних формуємо файл xml*/
				createXml($qry,$date);
				
				/*додаємо 1 рік*/
				$date = date('Y-m-d', strtotime('+1 year', strtotime($date)));
				
				/*перевіряємо чи є новини у цьому році*/
				$check_date = conn_fetch_assoc(conn_sql_query("SELECT id FROM ".NEWS." WHERE DATE_FORMAT(ndate,'%Y') = '".date('Y',strtotime($date))."' AND approved = 1 LIMIT 0,1"));
				$check = $check_date['id'] ? true : false;
				
			}while($check === true);
		}

		function createXml($data,$date,$end = null){
			global $depot;
			$base = "https://".$depot['vars']['domain'];
			
			$urlset = new SimpleXMLElement('<urlset xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');

			while($row = conn_fetch_assoc($data)){

				$url = $urlset->addChild('url');
				$url->addChild('loc',articleLink($row));
				
				/* image */
				
				if ($row['images'] != '') {
					$images = get_selected_images($row['images'], 1);
					if (isset($images[0])) {
						$image = $url->addChild('image:image:image');
						$image->addChild('image:image:loc', $base.'/media/gallery/intxt/'.$images[0]['filename']);
					}
				}
				/*changefreq*/
				$url->addChild('changefreq','hourly');
				
				
				/*news:new*/
				$news = $url->addChild("news:news:news");
				$news_publication = $news->addChild("news:news:publication");
				$news_publication->addChild("news:news:name",'Гал-Інфо');
				$news_publication->addChild("news:news:language",'uk');
				$news->addChild("news:news:publication_date", date("Y-m-d\TH:i:s\Z",strtotime($row['ndate'] . ' ' .$row['ntime'])));
				$news->addChild("news:news:title",htmlspecialchars($row['nheader']));
				
				$keywords = getNewsTags($row['id']);
				if(!empty($keywords)){
					$news->addChild("news:news:keywords",$keywords[0]);
				}
			}
			
			$dom = new DOMDocument('1.0','UTF-8');
			$dom->preserveWhiteSpace = false;
			$dom->formatOutput = true;
			$dom_xml = dom_import_simplexml($urlset);
			$dom_xml = $dom->importNode($dom_xml, true);
			$dom_xml = $dom->appendChild($dom_xml);
			
			$end = $end !== null ? $end : date('Y',strtotime($date));
			
			$name = 'sitemap_'.$end.'.xml';
			
			if ($dom->save(dirname(__FILE__)."/../../sitemap/".$name)) {
				updateDateMofify($name);
			}
		}
		
		
		
		function requestByYear($date){
			
			$qry=conn_sql_query("SELECT * FROM  ".NEWS." n LEFT JOIN ".NEWSHEAD." as nh ON nh.id = n.id LEFT JOIN ".NEWSB." nb ON n.id = nb.id  WHERE DATE_FORMAT(n.ndate,'%Y') = '".date('Y',strtotime($date))."' AND CONCAT(n.ndate,' ',n.ntime) <= NOW() AND n.approved = 1 ORDER BY n.ndate ASC") or die(conn_error());
			
			return $qry;
		}

		function requestByActual(){


            $date = new DateTime('-7 days');

			$qry=conn_sql_query("SELECT * FROM  ".NEWS." n LEFT JOIN ".NEWSHEAD." as nh ON nh.id = n.id LEFT JOIN ".NEWSB." nb ON n.id = nb.id  WHERE n.ndate >= '".$date->format('Y-m-d')."' AND CONCAT(n.ndate,' ',n.ntime) <= NOW() AND n.approved = 1 ORDER BY n.ndate ASC") or die(conn_error());
			
			return $qry;
		}
		
		
		function getNewsTags($id){
			$sql_tags="SELECT GROUP_CONCAT(".TAGS.".tag separator ',') as tag FROM ".TAGMAP." LEFT JOIN  ".TAGS." ON tagid = id WHERE newsid = ".$id." GROUP BY 'newsid'";
			$tags = conn_sql_query($sql_tags);
			if($tags) return conn_fetch_row($tags); else return null;
		}
		
		
		function updateDateMofify($name){
			conn_sql_query("DELETE FROM a_sitemap WHERE sitemap = '".$name."'");
			conn_sql_query("INSERT INTO a_sitemap (sitemap,date_modify) VALUES ('".$name."',NOW())");
		}
		
		function getSitemapModify($name){
			$res =  conn_fetch_row(conn_sql_query("SELECT date_modify FROM a_sitemap WHERE sitemap = '".$name."'"));
			
			return $res[0];
		}
		
		function getLastNews($date){
			$res = conn_sql_query("SELECT id FROM ".NEWS." WHERE CONCAT(ndate,' ',ntime) >= '".$date."'");
			return (!empty($res)) ? true : false;
		}


?>