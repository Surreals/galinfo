<?

$depot['vars']['mod_result'] = getMediaBox();

function getMediaBox() {
    $query = "
		SELECT 
				" . MEDIABOX . ".*,
				" . PICS . ".filename

		FROM " . MEDIABOX . "
		LEFT JOIN " . PICS . "
		ON " . MEDIABOX . ".imageid = " . PICS . ".id
		ORDER BY " . MEDIABOX . ".id DESC
	";

    $sql_run = sqlquery($query);
    $counter = 1;
    while ($res = mysql_fetch_assoc($sql_run)) {
        if ($counter <= 5) {
            if (!isset($data)) {
                $data = array(
                    'mainimage' => "/media/gallery/intxt/" . getImagePath($res['filename']) . $res['filename'],
                    'mainimagelink' => "/media/gallery/full/" . getImagePath($res['filename']) . $res['filename'],
                    'maintitle' => htmlspecialchars($res['title'])
                );
            } else {
                $data['item'][] = array(
                    'image' => "/media/gallery/intxt/" . getImagePath($res['filename']) . $res['filename'],
                    'imagelink' => "/media/gallery/full/" . getImagePath($res['filename']) . $res['filename'],
                    'title' => htmlspecialchars($res['title'])
                );
            }
        } else {
            $data['hiddenitem'][] = array(
                'imagelink' => "/media/gallery/full/" . getImagePath($res['filename']) . $res['filename'],
                'title' => htmlspecialchars($res['title'])
            );
        }
        $counter++;
    }
    return parse_local($data, 'mediabox', 1);
}
