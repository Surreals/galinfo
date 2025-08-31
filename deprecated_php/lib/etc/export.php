<?php

function downloadExport($sql,$filename,$delimiter =';'){
    $qry=conn_sql_query($sql) or die(conn_error());
    if(conn_sql_num_rows($qry) > 0){
        $file = fopen('php://output','w');
        for ($i=0;$i<conn_sql_num_rows($qry);$i++){
            $res=conn_fetch_assoc($qry);
            fputcsv($file,btw($res),$delimiter);
        }
        fclose($file);
        header('Content-Type: application/csv');
        header('Content-Disposition: attachment; filename="'.$filename.'";');
        exit();
    }
}
function btw($b1) {
    $b1 = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $b1);
    $b1 = str_replace(array("\r\n", "\r", "\n", "\t", '  ', '    ', '    '), '', $b1);
    return $b1;
}
?>