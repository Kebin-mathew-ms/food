CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'DONOR', 'NGO', 'VOLUNTEER') NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
    `profile_image` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `email_verified` BOOLEAN NOT NULL DEFAULT false,
    `last_login` DATETIME(3) NULL,
    `verification_token` VARCHAR(191) NULL,
    `verification_token_expiry` DATETIME(3) NULL,
    `reset_token` VARCHAR(191) NULL,
    `reset_token_expiry` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `uq_users_email`(`email`),
    UNIQUE INDEX `uq_users_phone`(`phone`),
    UNIQUE INDEX `uq_users_verification_token`(`verification_token`),
    UNIQUE INDEX `uq_users_reset_token`(`reset_token`),
    INDEX `idx_users_status`(`status`),
    INDEX `idx_users_role`(`role`),
    INDEX `idx_users_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `food_donations` (
    `id` VARCHAR(191) NOT NULL,
    `donor_id` VARCHAR(191) NOT NULL,
    `food_name` VARCHAR(191) NOT NULL,
    `food_category` VARCHAR(191) NOT NULL,
    `food_type` ENUM('VEG', 'NON_VEG', 'VEGAN', 'OTHER') NOT NULL,
    `description` TEXT NULL,
    `quantity` DOUBLE NOT NULL,
    `quantity_unit` VARCHAR(191) NOT NULL,
    `number_of_people` INTEGER NULL,
    `prepared_at` DATETIME(3) NOT NULL,
    `expiry_time` DATETIME(3) NOT NULL,
    `pickup_address` VARCHAR(191) NOT NULL,
    `pickup_city` VARCHAR(191) NULL,
    `pickup_state` VARCHAR(191) NULL,
    `pickup_country` VARCHAR(191) NULL,
    `pickup_latitude` DOUBLE NULL,
    `pickup_longitude` DOUBLE NULL,
    `postal_code` VARCHAR(191) NULL,
    `pickup_time` DATETIME(3) NULL,
    `pickup_contact_name` VARCHAR(191) NULL,
    `pickup_contact_phone` VARCHAR(191) NULL,
    `max_pickup_delay` INTEGER NULL,
    `special_instructions` TEXT NULL,
    `status` ENUM('AVAILABLE', 'REQUESTED', 'APPROVED', 'PICKED_UP', 'DELIVERED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'AVAILABLE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    INDEX `idx_food_donations_donor_id`(`donor_id`),
    INDEX `idx_food_donations_status`(`status`),
    INDEX `idx_food_donations_food_category`(`food_category`),
    INDEX `idx_food_donations_food_type`(`food_type`),
    INDEX `idx_food_donations_created_at`(`created_at`),
    INDEX `idx_food_donations_expiry_time`(`expiry_time`),
    INDEX `idx_food_donations_coordinates`(`pickup_latitude`, `pickup_longitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `donation_images` (
    `id` VARCHAR(191) NOT NULL,
    `donation_id` VARCHAR(191) NOT NULL,
    `image_url` VARCHAR(191) NOT NULL,
    `public_id` VARCHAR(191) NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    INDEX `idx_donation_images_donation_id`(`donation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ngos` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `organization_name` VARCHAR(191) NOT NULL,
    `registration_number` VARCHAR(191) NOT NULL,
    `license_document` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `uq_ngos_user_id`(`user_id`),
    UNIQUE INDEX `uq_ngos_registration_number`(`registration_number`),
    INDEX `idx_ngos_verified`(`verified`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `volunteers` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `vehicle_type` VARCHAR(191) NULL,
    `vehicle_number` VARCHAR(191) NULL,
    `availability` BOOLEAN NOT NULL DEFAULT true,
    `current_latitude` DOUBLE NULL,
    `current_longitude` DOUBLE NULL,
    `is_online` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `uq_volunteers_user_id`(`user_id`),
    INDEX `idx_volunteers_is_online`(`is_online`),
    INDEX `idx_volunteers_coordinates`(`current_latitude`, `current_longitude`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `donation_requests` (
    `id` VARCHAR(191) NOT NULL,
    `donation_id` VARCHAR(191) NOT NULL,
    `ngo_id` VARCHAR(191) NOT NULL,
    `request_status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `requested_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approved_at` DATETIME(3) NULL,
    `rejected_at` DATETIME(3) NULL,
    `remarks` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    INDEX `idx_donation_requests_donation_id`(`donation_id`),
    INDEX `idx_donation_requests_ngo_id`(`ngo_id`),
    INDEX `idx_donation_requests_request_status`(`request_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `deliveries` (
    `id` VARCHAR(191) NOT NULL,
    `donation_request_id` VARCHAR(191) NOT NULL,
    `volunteer_id` VARCHAR(191) NULL,
    `pickup_time` DATETIME(3) NULL,
    `delivery_time` DATETIME(3) NULL,
    `completion_time` DATETIME(3) NULL,
    `delivery_status` ENUM('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED') NOT NULL DEFAULT 'ASSIGNED',
    `pickup_photo` VARCHAR(191) NULL,
    `delivery_photo` VARCHAR(191) NULL,
    `proof_signature` VARCHAR(191) NULL,
    `delivery_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `uq_deliveries_donation_request_id`(`donation_request_id`),
    INDEX `idx_deliveries_volunteer_id`(`volunteer_id`),
    INDEX `idx_deliveries_delivery_status`(`delivery_status`),
    INDEX `idx_deliveries_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('SYSTEM', 'EMAIL', 'WARNING', 'SUCCESS', 'INFO') NOT NULL DEFAULT 'INFO',
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    INDEX `idx_notifications_user_id`(`user_id`),
    INDEX `idx_notifications_is_read`(`is_read`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `complaints` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `admin_response` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    INDEX `idx_complaints_user_id`(`user_id`),
    INDEX `idx_complaints_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `feedback` (
    `id` VARCHAR(191) NOT NULL,
    `delivery_id` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `review` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `uq_feedback_delivery_id`(`delivery_id`),
    INDEX `idx_feedback_rating`(`rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `table_name` VARCHAR(191) NOT NULL,
    `record_id` VARCHAR(191) NOT NULL,
    `old_values` TEXT NULL,
    `new_values` TEXT NULL,
    `ip_address` VARCHAR(191) NULL,
    `user_agent` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    INDEX `idx_audit_logs_user_id`(`user_id`),
    INDEX `idx_audit_logs_table_name`(`table_name`),
    INDEX `idx_audit_logs_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `system_settings` (
    `id` VARCHAR(191) NOT NULL,
    `setting_key` VARCHAR(191) NOT NULL,
    `setting_value` TEXT NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `uq_system_settings_setting_key`(`setting_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `refresh_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `is_revoked` BOOLEAN NOT NULL DEFAULT false,
    `device_info` TEXT NULL,
    `ip_address` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NULL,
    `updated_by` VARCHAR(191) NULL,

    UNIQUE INDEX `uq_refresh_tokens_token`(`token`),
    INDEX `idx_refresh_tokens_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `food_donations` ADD CONSTRAINT `food_donations_donor_id_fkey` FOREIGN KEY (`donor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `donation_images` ADD CONSTRAINT `donation_images_donation_id_fkey` FOREIGN KEY (`donation_id`) REFERENCES `food_donations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ngos` ADD CONSTRAINT `ngos_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `volunteers` ADD CONSTRAINT `volunteers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `donation_requests` ADD CONSTRAINT `donation_requests_donation_id_fkey` FOREIGN KEY (`donation_id`) REFERENCES `food_donations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `donation_requests` ADD CONSTRAINT `donation_requests_ngo_id_fkey` FOREIGN KEY (`ngo_id`) REFERENCES `ngos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_donation_request_id_fkey` FOREIGN KEY (`donation_request_id`) REFERENCES `donation_requests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_volunteer_id_fkey` FOREIGN KEY (`volunteer_id`) REFERENCES `volunteers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `complaints` ADD CONSTRAINT `complaints_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `feedback` ADD CONSTRAINT `feedback_delivery_id_fkey` FOREIGN KEY (`delivery_id`) REFERENCES `deliveries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

