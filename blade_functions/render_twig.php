<?php


function renderTwig(string $file_twig, $params = []){
    $twig = $GLOBALS['services']['twig'];
    return $twig->render($file_twig, $params);
}