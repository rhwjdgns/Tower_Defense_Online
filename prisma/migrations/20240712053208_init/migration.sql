-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `password` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserInfo` (
    `userId` INTEGER NOT NULL,
    `highscore` VARCHAR(45) NULL,
    `win` VARCHAR(45) NULL,
    `lose` VARCHAR(45) NULL,

    UNIQUE INDEX `UserInfo_userId_key`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameResultLog` (
    `game_id` INTEGER NOT NULL AUTO_INCREMENT,
    `player_1` INTEGER NOT NULL,
    `player_1_score` INTEGER NOT NULL,
    `start_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `player_2` INTEGER NULL,
    `win` INTEGER NULL,
    `end_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `player_2_score` INTEGER NULL,

    PRIMARY KEY (`game_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserInfo` ADD CONSTRAINT `UserInfo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameResultLog` ADD CONSTRAINT `GameResultLog_player_1_fkey` FOREIGN KEY (`player_1`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameResultLog` ADD CONSTRAINT `GameResultLog_player_2_fkey` FOREIGN KEY (`player_2`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
