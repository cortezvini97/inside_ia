<?php

function route(string $name, $params = []) {
    $services = $GLOBALS['services'];
    $routes = $services["router"];
    $route = "";
    if(count($params) > 0)
    {
        $route = $routes->generate($name, $params);
    }else {
        $route = $routes->generate($name);
    }
    return $route;
};