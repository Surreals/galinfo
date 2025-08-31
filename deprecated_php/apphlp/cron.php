<?php
$time_start = microtime(true);
$twittered_count = 0;


foreach (explode(",","conf,conn,core,forms,initstart,stuff") as $m){
    require_once(dirname(__FILE__)."/../lib/etc/$m.php");
}



$articles_q = sqlquery("SELECT * FROM ".NEWS."
                        LEFT JOIN ".NEWSHEAD." USING(id)
                        WHERE
                        twitter_status = \"wait\" and
                        approved = 1 AND
                        CONCAT(ndate,' ',ntime)<=NOW()");

if(mysql_num_rows($articles_q)>0){
    require_once(dirname(__FILE__)."/../lib/third_party/twitter/codebird.php");
    \Codebird\Codebird::setConsumerKey($depot['enviro']['twitter_api_key'], $depot['enviro']['twitter_api_s_key']);
    $cb = \Codebird\Codebird::getInstance();
    $cb->setToken($depot['enviro']['twitter_access_token'],$depot['enviro']['twitter_access_s']);



    while($article =  mysql_fetch_assoc($articles_q)){
        twitArticle($article,$cb);
    }

}



$time_end = microtime(true);
$execution_time = ($time_end - $time_start)/60;
echo 'Published to twitter: '.$twittered_count.'<br/>';
echo 'Total Execution Time: '.$execution_time.' Mins <br/>';


function twitArticle($article,$cb){
    global $depot, $twittered_count;

    $twit_images = [];
    if($article['images']){
        $images=get_selected_images($article['images']);

        if($images){
            $image = "http://".$depot['vars']['domain'].'/media/gallery/full/'.$images[0]['filename'];
            try {
                $reply = $cb->media_upload([
                    'media' => $image
                ]);
                if($reply->httpstatus=='200'){
                    $twit_images[]=$reply->media_id_string;
                }

            } catch (Exception $e) {
                //?
            }
        }
    }


    $twit = [
        'status' => $article['nheader'].' '.articleLink($article,true),
    ];

    if($twit_images){
        $twit['media_ids'] = implode(',',$twit_images);
    }

    try{
        $reply = $cb->statuses_update($twit);
        if($reply->httpstatus!='200'){
            $errors = [];
            foreach($reply->errors as $error){
                $errors[] = $error->message;
            }
            $errors = $errors?' ('.implode(' | ',$errors).')':'';
            echo 'Error['.$article['id'].']: Twitter,',  $errors, "<br/>";
        }else{
            $twittered_count++;
            sqlquery("UPDATE ".NEWS." SET twitter_status='published' WHERE id=".$article['id']);
        }

    }catch(Exception $e){
        echo 'Error: ',  $e->getMessage(), "<br/>";
    }

}

