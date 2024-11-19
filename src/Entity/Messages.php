<?php

namespace App\Entity;

use App\Repository\MessagesRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use JsonSerializable;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: MessagesRepository::class)]
class Messages implements JsonSerializable
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id;

    #[ORM\Column(length: 60)]
    private ?string $type = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $msg = null;

    #[ORM\ManyToOne(inversedBy: 'messages')]
    private ?Conversations $Conversation = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $file = null;

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

        return $this;
    }

    public function getMsg(): ?string
    {
        return $this->msg;
    }

    public function setMsg(string $msg): static
    {
        $this->msg = $msg;

        return $this;
    }

    public function getConversation(): ?Conversations
    {
        return $this->Conversation;
    }

    public function setConversation(?Conversations $Conversation): static
    {
        $this->Conversation = $Conversation;

        return $this;
    }

    public function getFile(): ?string
    {
        return $this->file;
    }

    public function setFile(?string $file): static
    {
        $this->file = $file;

        return $this;
    }

    public function jsonSerialize(): mixed
    {
        return [
            "id"=>$this->getId(),
            "conversation_id"=>$this->getConversation()->getId(),
            "type"=>$this->getType(),
            "msg"=>$this->getMsg(),
            "file"=>$this->getFile()
        ];
    }
}
