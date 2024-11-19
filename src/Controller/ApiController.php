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

    #[Route(path:"/api/sendMsgByConversation")]
    public function sendMsgByConversation(Request $request):Response
    {
        $this->denyAccessUnlessGranted("IS_AUTHENTICATED_FULLY");
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $id = $data["conversation_id"];
        $prompt = $data["prompt"];

        $conversation = $this->conversationsRepository->findOneBy([
            "id"=>$id,
            "user"=>$user
        ]);

        $data_post = [
            "conversation_id"=>$conversation->getId()->toString(),
            "model"=>$conversation->getModel(),
            "userprompt"=>$prompt,
            "history"=>$conversation->getMessages()->getValues()
        ];


        return $this->json($data_post);

        /*$data_post_send = json_encode($data_post);

        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => 'http://localhost:5000/chat',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS =>$data_post_send,
            CURLOPT_HTTPHEADER => array(
              'Content-Type: application/json',
              'Cookie: PHPSESSID=1b16k3qo4u4lac49d0pa0rv4ed'
            ),
        ));
          
        $response = curl_exec($curl);

        if(!$response)
        {
            return $this->json(["msg"=>"Ocorreu um erro"]);
        }
          
        curl_close($curl);
        $result = json_decode($response, true);


        $humman_msg = new Messages();
        $humman_msg->setType("Humman")->setMsg($result["input"])->setConversation($conversation);
        $this->manager->persist($humman_msg);
        $this->manager->flush();
        $IA_msg = new Messages();
        $IA_msg->setType("IA")->setMsg($result["output"])->setConversation($conversation);
        $this->manager->persist($IA_msg);
        $this->manager->flush();
        $conversation->setExecutePrompt(true)->setDate(new DateTime());
        $this->manager->persist($conversation);
        $this->manager->flush();

        $conservation_updated = $this->conversationsRepository->findOneBy([
            "id"=>$id,
            "user"=>$user
        ]);


        $conservation_updated->addMessage($humman_msg)->addMessage($IA_msg);


        return $this->json($conservation_updated);*/
    }
}