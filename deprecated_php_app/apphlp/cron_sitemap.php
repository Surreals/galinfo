<?php


foreach (explode(",","conf,conn,core,forms,initstart,stuff,sitemap_generator") as $m){
    require_once(dirname(__FILE__)."/../lib/etc/$m.php");
}


generateActualSitemap();