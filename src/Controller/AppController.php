<?php

namespace App\Controller;

use Cortez\SymfonyHybridViews\Controllers\RenderViewsController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AppController extends RenderViewsController{
    public function __construct()
    {
        
    }

    #[Route(path:"/",  name:"app_home")]
    public function index():Response
    {
        $this->denyAccessUnlessGranted("IS_AUTHENTICATED_FULLY");
        return  $this->view("index");
    }

    #[Route(path:"/chat/{id}",  name:"app_chat")]
    public function chat(string $id):Response
    {
        $this->denyAccessUnlessGranted("IS_AUTHENTICATED_FULLY");
        return  $this->view("index");
    }
}