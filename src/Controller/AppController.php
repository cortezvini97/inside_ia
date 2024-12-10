<?php

namespace App\Controller;

use App\Repository\ConversationsRepository;
use App\Repository\MessagesRepository;
use Cortez\SymfonyHybridViews\Controllers\RenderViewsController;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\HttpFoundation\Request;

class AppController extends RenderViewsController{

    private ConversationsRepository $conversationsRepository;
    private MessagesRepository $messagesRepository;
    private EntityManagerInterface $manager;

    public function __construct(ConversationsRepository $conversationsRepository, MessagesRepository $messagesRepository, EntityManagerInterface $manager)
    {
        $this->conversationsRepository = $conversationsRepository;
        $this->messagesRepository = $messagesRepository;
        $this->manager = $manager;
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


    #[Route(path:"/chat/titleedit/{id}", name:"app_chat_title_edit", methods:["POST"])]
    public function editChatTitle(string $id, Request $request):Response{
        $this->denyAccessUnlessGranted("IS_AUTHENTICATED_FULLY");
        $conversation = $this->conversationsRepository->findOneBy([
            "id"=>$id
        ]);

        $data = json_decode($request->getContent(), true);
        $titulo = $data["titulo"];

        $conversation->setTitulo($titulo);

        $this->manager->persist($conversation);
        $this->manager->flush();
        return $this->json(["msg"=>"success"]);
    }

    #[Route(path:"/chat/delete/{id}",  name:"app_chat_delete")]
    public function deleteChat(string $id):Response
    {
        $this->denyAccessUnlessGranted("IS_AUTHENTICATED_FULLY");

        $conversation = $this->conversationsRepository->findOneBy(["id"=>$id]);

        $messages = $this->messagesRepository->findBy([
            "Conversation"=>$conversation
        ]);

        foreach($messages as $message){
            $this->manager->remove($message);
            $this->manager->flush();
        }

        $dir = $this->getParameter("upload_folder").DIRECTORY_SEPARATOR.$conversation->getId()->toString();

        $filesystem = new Filesystem();
        if (is_dir($dir)) {
            try {
                $filesystem->remove($dir);
            } catch (IOExceptionInterface $exception) {
                throw new \Exception("Error deleting directory at " . $exception->getPath());
            }
        }

        $this->manager->remove($conversation);
        $this->manager->flush();

        return $this->redirectToRoute("app_home");
       
    }
}