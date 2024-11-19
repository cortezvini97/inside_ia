<?php

function load($name, $type) {
    return renderTwig('encore.twig', [
        "name"=>$name,
        "type"=>$type
    ]);
};