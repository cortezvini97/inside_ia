<?php

namespace App\DataFixtures;

use App\Entity\Conversations;
use App\Repository\UserRepository;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ConversationFixture extends Fixture
{

    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository){
        $this->userRepository = $userRepository;
    }

    public function load(ObjectManager $manager)
    {

        $user = $this->userRepository->findOneBy(["id"=>1]);

        $date = new \DateTime('2024-11-07');

        $conversation = new Conversations();
        $conversation
        ->setTitulo("Como Posso de Ajudar ?")
        ->setModel("GPT-3.5")
        ->setDate($date)
        ->setUser($user);

        $manager->persist($conversation);
        $manager->flush();

    }
}