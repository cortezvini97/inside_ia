<?php

namespace App\Controller;

use App\Entity\Conversations;
use App\Entity\Messages;
use App\Repository\ConversationsRepository;
use DateTime;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ApiController extends AbstractController
{


    private ConversationsRepository $conversationsRepository;
    private EntityManagerInterface $manager;

    public function __construct(ConversationsRepository $conversationsRepository, EntityManagerInterface $manager)
    {
        $this->conversationsRepository = $conversationsRepository;
        $this->manager = $manager;
    }

    #[Route(path:"/api/")]
    public function index():Response{
        $this->denyAccessUnlessGranted("IS_AUTHENTICATED_FULLY");
        $user = $this->getUser();
        return $this->json($user);
    }

    #[Route(path: "/api/conversations", methods:["POST"])]
    public function createConversation(Request $request):Response{
        $this->denyAccessUnlessGranted("IS_AUTHENTICATED_FULLY");
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        $conversation = new Conversations();
        $conversation->setDate(new DateTime())
        ->setUser($user)
        ->setTitulo("Novo Chat")
        ->setPrompt($data["prompt"])
        ->setModel($data["model"])
        ->setExecutePrompt(false);
        
        $this->manager->persist($conversation);
        $this->manager->flush();

        $dir = $this->getParameter("upload_folder").DIRECTORY_SEPARATOR.$conversation->getId()->toString();
        mkdir($dir);

        if($data["file"] != null){
            $fileData = $data['file'];
            if (preg_match('/^data:(.*?);base64,(.*)$/', $fileData, $matches)) {
                $mimeType = $matches[1];  // Exemplo: image/jpeg, text/plain, etc.
                $base64Data = $matches[2]; // Dados codificados em base64

                $fileContent = base64_decode($base64Data);

                if ($fileContent === false) {
                    return $this->json(['error' => 'Falha ao decodificar o arquivo'], 400);
                }

                $extension = explode('/', $mimeType)[1];

                if ($extension == 'jpeg'){
                    $extension = 'jpg';
                }

                $filename = uniqid() . '.' . $extension;
                $filePath = $dir .DIRECTORY_SEPARATOR. $filename;

                file_put_contents($filePath, $fileContent);

                $conversation->setFilePrompt($mimeType.";".$filename);
                $this->manager->persist($conversation);
                $this->manager->flush();
                
            } else {
                return $this->json(['error' => 'Formato inválido'], 400);
            }
        }

        return $this->json($conversation);
    }

    #[Route(path: "/api/sendMsg", methods:["POST"])]
    public function sendMsg(Request $request): Response{
        $this->denyAccessUnlessGranted("IS_AUTHENTICATED_FULLY");
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $id = $data["conversation_id"];

        $conversation = $this->conversationsRepository->findOneBy([
            "id"=>$id,
            "user"=>$user
        ]);

        $data_post = [
            "conversation_id"=>$conversation->getId()->toString(),
            "model"=>$conversation->getModel(),
            "userprompt"=>$conversation->getPrompt(),
            "history"=>$conversation->getMessages()->getValues(),
            "file"=>$conversation->getFilePrompt()
        ];


        return $this->json($data_post);
    }


    #[Route(path: "/api/saveMsg", name: "saveMsg", methods:["POST"])]
    public function saveMsg(Request $request):Response{
        $this->denyAccessUnlessGranted("IS_AUTHENTICATED_FULLY");
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $id = $data["conversation_id"];
        $result = $data["result"];

        $conversation = $this->conversationsRepository->findOneBy([
            "id"=>$id,
            "user"=>$user
        ]);

        $humman_msg = new Messages();
        $humman_msg->setType("Humman")->setMsg($result["input"])->setConversation($conversation);
        if($result["file"] != null){
            $humman_msg->setFile($result["file"]);
        }
        $this->manager->persist($humman_msg);
        $this->manager->flush();
        $IA_msg = new Messages();
        $IA_msg->setType("IA")->setMsg($result["output"])->setConversation($conversation);
        $this->manager->persist($IA_msg);
        $this->manager->flush();
        $conversation->setExecutePrompt(true)->setDate(new DateTime());
        if(isset($result["title"])){
            $conversation->setTitulo($result["title"]);
        }
        $this->manager->persist($conversation);
        $this->manager->flush();


        $conservation_updated = $this->conversationsRepository->findOneBy([
            "id"=>$id,
            "user"=>$user
        ]);


        $conservation_updated->addMessage($humman_msg)->addMessage($IA_msg);


        return $this->json($conservation_updated);
        
    }


    #[Route(path: "/api/uploadFileConversation", name: "uploadFileConversation", methods:["POST"])]
    public function uploadFileConversation(Request $request): Response{
        $this->denyAccessUnlessGranted("IS_AUTHENTICATED_FULLY");
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);
        $id = $data["conversation_id"];
        $file = $data["file"];

        $conversation = $this->conversationsRepository->findOneBy([
            "id"=>$id,
            "user"=>$user
        ]);

    

        if($conversation == null){
            return $this->json(["error" => "Conversation not found"], 404);
        }

        if ($file == null){
            return $this->json(["error" => "File not found"], 404);
        }

        $dir = $this->getParameter("upload_folder").DIRECTORY_SEPARATOR.$conversation->getId()->toString();
        if (preg_match('/^data:(.*?);base64,(.*)$/', $file, $matches)) {
            $mimeType = $matches[1];  // Exemplo: image/jpeg, text/plain, etc.
            $base64Data = $matches[2]; // Dados codificados em base64

            $fileContent = base64_decode($base64Data);

            if ($fileContent === false) {
                return $this->json(['error' => 'Falha ao decodificar o arquivo'], 400);
            }

            $extension = explode('/', $mimeType)[1];

            if ($extension == 'jpeg'){
                $extension = 'jpg';
            }

            $filename = uniqid() . '.' . $extension;
            $filePath = $dir .DIRECTORY_SEPARATOR. $filename;

            file_put_contents($filePath, $fileContent);

            return $this->json(["file_data" =>$mimeType.";".$filename], 200);

        }
    }

    #[Route(path:"/api/sendMsgByConversation")]
    public function sendMsgByConversation(Request $request):Response
    {
        $this->denyAccessUnlessGranted("IS_AUTHENTICATED_FULLY");
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $id = $data["conversation_id"];
        $prompt = $data["prompt"];
        $file = $data["file"];

        $conversation = $this->conversationsRepository->findOneBy([
            "id"=>$id,
            "user"=>$user
        ]);

        $data_post = [
            "conversation_id"=>$conversation->getId()->toString(),
            "model"=>$conversation->getModel(),
            "userprompt"=>$prompt,
            "history"=>$conversation->getMessages()->getValues(),
            "file"=>$file
        ];


        return $this->json($data_post);
    }
}