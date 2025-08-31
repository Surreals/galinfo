<?
$depot['mod_result']=get_photorep();


function get_photorep(){
	global $par,$lxs,$errors,$oks,$gerrors,$depot;
	$ttop="";
	$images_qty=8;
	$trim_words=10;


	$sql1="
			SELECT		subnews.id,
						subnews.ndate,
						subnews.images, 
						subnews.urlkey,
						".NEWSB.".nheader,
						subnews.nweight

			FROM		(
							SELECT	id,ndate,ntime,nweight,images,urlkey
							FROM	".NEWS." 
							WHERE lang = \"".$depot['langs'][$par['lng']]['id']."\" 
							AND approved = 1 AND ntype=3
							ORDER BY	ndate DESC,ntime DESC 
							LIMIT 20
						) AS subnews
				
			LEFT JOIN	".NEWSB."
			USING		(id)
			ORDER BY RAND() 
			LIMIT ".$images_qty;


	
	$sql=sqlquery_cached($sql1,2);
	if (!count($sql)) return;



	$arr=array('nheader'=>$lxs['he_photorep']);
	foreach ($sql as $res){

		$images=get_selected_images($res['images'],$depot['lang']);
		if (count($images)) {
			$image="<img src='/gallery/tmb/".$images[0]['filename']."'>";
		} else {
			$image="<img src='/im/noimage.gif'>";
		}

		$teaser_bulk=getfromsql($res['nheader'],$par['lng']);
		$teser_arr=explode(" ",$teaser_bulk);
		if (count($teser_arr)>$trim_words){
			$trim=array_slice($teser_arr,0,$trim_words);
			$teaser=implode(" ",$trim)."...";
		} else {
			$teaser=$teaser_bulk;
		}


		list($year,$month,$date)=explode('-',$res['ndate']);
		$link="/".$par['lng']."/news/".$year."/".$month."/".$date."/".$res['id'];
		$arr['photolist'][]=array(
									'link'=>	$link,
									'teaser'=>	$teaser,
									'image'=>	$image
		);
	}

	return  parse_local($arr,'_photorep');

}