<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;


    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // $product = new Product();
        // $manager->persist($product);
        
        

        $user = new User();
        $user->setUsername("Cortez")->setRoles([]);

        $hashedPassword = $this->passwordHasher->hashPassword(
            $user,
            '123456' // Substitua 'senhaSegura' pela senha que você deseja usar
        );

        $user->setPassword($hashedPassword);
        $manager->persist($user);
        $manager->flush();


        
    }
}
