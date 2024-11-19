<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241106142552 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE conversations (id BINARY(16) NOT NULL, titulo VARCHAR(60) NOT NULL, model VARCHAR(60) NOT NULL, date DATE NOT NULL, user_id INT DEFAULT NULL, INDEX IDX_C2521BF1A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE messages (id BINARY(16) NOT NULL, type VARCHAR(60) NOT NULL, msg LONGTEXT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE conversations ADD CONSTRAINT FK_C2521BF1A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE conversations DROP FOREIGN KEY FK_C2521BF1A76ED395');
        $this->addSql('DROP TABLE conversations');
        $this->addSql('DROP TABLE messages');
    }
}
