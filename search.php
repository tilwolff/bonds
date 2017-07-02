<?php
// Keine Aktion spezifiziert
header('Content-Type: text/plain');
$isin=$_GET['isin'];

if(strlen($isin) <> 12) {
	echo 'Invalid request';
}else{

        $file = fopen("ea_csv_170630.csv","r");
        $i=1;
        while(! feof($file))
        {
                $line=fgets($file);
                if($i==1 || substr( $line , 0 , 12 )==$isin) echo $line;
                $i++;
        }       

        fclose($file);
}
?> 
