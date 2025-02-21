<?php
require "./ModulKu.php";
$ModulKu = new ModulKu;

if(isset($_POST['id'])){
    echo get_name(trim($_POST['id']));
} else {
    echo "No ID provided.";
}

function get_name($char_id){
    global $ModulKu;
    $info = get_token_and_cookie();
    $headers = headers();
    $headers[] = 'Cookie: UUID='.$info['cookies']['UUID'].'; shopcode=midasbuy; country=id;';

    $req = $ModulKu->cURL("https://www.midasbuy.com/interface/getCharac?ctoken=".$info['token']."&appid=1450015065&openid=".$char_id);
    
    $decode = json_decode($req[1], true);
    return isset($decode['info']['charac_name']) ? "Name: " . $decode['info']['charac_name'] : "ID Not found.";
}
?>
