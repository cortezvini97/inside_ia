<?php

function csrf_field(){
    $services = $GLOBALS['services'];
    if(!isset($services["security.csrf.token_manager"]))
    {
        throw new LogicException("Not found installed Symfony/Security.");
    }
    $security = $services['security.csrf.token_manager'];
    $token = $security->getToken('authenticate')->getValue();
    return '<input type="hidden" name="_csrf_token" value="'.$token.'">';
}