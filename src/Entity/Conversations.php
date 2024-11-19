<?php

namespace App\Entity;

use App\Repository\ConversationsRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use JsonSerializable;
use Symfony\Bridge\Doctrine\Types\UuidType;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: ConversationsRepository::class)]
class Conversations implements JsonSerializable
{
    #[ORM\Id]
    #[ORM\Column(type: UuidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.uuid_generator')]
    private ?Uuid $id;

    #[ORM\ManyToOne(inversedBy: 'conversations')]
    private ?User $user = null;

    #[ORM\Column(type: Types::TEXT, nullable:true)]
    private ?string $titulo = null;

    #[ORM\Column(length: 60)]
    private ?string $model = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $date = null;

    /**
     * @var Collection<int, Messages>
     */
    #[ORM\OneToMany(targetEntity: Messages::class, mappedBy: 'Conversation')]
    private Collection $messages;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $prompt = null;

    #[ORM\Column]
    private ?bool $execute_prompt = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $file_prompt = null;

    public function __construct()
    {
        $this->messages = new ArrayCollection();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getTitulo(): ?string
    {
        return $this->titulo;
    }

    public function setTitulo(string $titulo): static
    {
        $this->titulo = $titulo;

        return $this;
    }

    public function getModel(): ?string
    {
        return $this->model;
    }

    public function setModel(string $model): static
    {
        $this->model = $model;

        return $this;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): static
    {
        $this->date = $date;
        return $this;
    }

     /**
     * @return Collection<int, Messages>
     */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(Messages $message): static
    {
        if (!$this->messages->contains($message)) {
            $this->messages->add($message);
            $message->setConversation($this);
        }

        return $this;
    }

    public function removeMessage(Messages $message): static
    {
        if ($this->messages->removeElement($message)) {
            // set the owning side to null (unless already changed)
            if ($message->getConversation() === $this) {
                $message->setConversation(null);
            }
        }

        return $this;
    }

    public function getPrompt(): ?string
    {
        return $this->prompt;
    }

    public function setPrompt(string $prompt): static
    {
        $this->prompt = $prompt;

        return $this;
    }

    public function isExecutePrompt(): ?bool
    {
        return $this->execute_prompt;
    }

    public function setExecutePrompt(bool $execute_prompt): static
    {
        $this->execute_prompt = $execute_prompt;
        return $this;
    }

    public function getFilePrompt(): ?string
    {
        return $this->file_prompt;
    }

    public function setFilePrompt(?string $file_prompt): static
    {
        $this->file_prompt = $file_prompt;

        return $this;
    }

    public function jsonSerialize(): mixed
    {
        return [
            "id"=>$this->getId(),
            "user_id"=>$this->getUser()->getId(),
            "titulo"=>$this->getTitulo(),
            "model"=>$this->getModel(),
            "date"=>$this->getDate()->format("Y-m-d"),
            "messages"=>$this->getMessages()->getValues(),
            "prompt"=>$this->getPrompt(),
            "execute_prompt"=>$this->isExecutePrompt(),
            "file_prompt"=>$this->getFilePrompt(),
        ];
    }
}
