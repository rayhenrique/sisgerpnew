-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 16/01/2026 às 20:05
-- Versão do servidor: 8.0.36-28
-- Versão do PHP: 8.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `sisgerp`
--
CREATE DATABASE IF NOT EXISTS `sisgerp` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `sisgerp`;

-- --------------------------------------------------------

--
-- Estrutura para tabela `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model_id` bigint UNSIGNED NOT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ;

--
-- Despejando dados para a tabela `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `model_type`, `model_id`, `old_values`, `new_values`, `created_at`, `updated_at`) VALUES
(1, 1, 'delete', 'App\\Models\\Category', 2, '{\"id\": 2, \"code\": \"dsfsdfsddsf\", \"name\": \"sdfsdfsdfsfdfdsfds\", \"type\": \"bloco\", \"active\": 1, \"parent_id\": 1, \"created_at\": \"2025-08-26 20:30:09\", \"updated_at\": \"2025-08-26 20:30:09\", \"description\": \"dsfsdfsdfsdfsd\"}', '[]', '2025-08-26 20:30:13', '2025-08-26 20:30:13'),
(2, 1, 'delete', 'App\\Models\\Category', 1, '{\"id\": 1, \"code\": \"sdfsdf\", \"name\": \"vxdfds\", \"type\": \"fonte\", \"active\": 1, \"parent_id\": null, \"created_at\": \"2025-08-26 20:29:57\", \"updated_at\": \"2025-08-26 20:29:57\", \"description\": \"sdfsdfdsfsd\"}', '[]', '2025-08-26 20:30:16', '2025-08-26 20:30:16'),
(3, 1, 'delete', 'App\\Models\\Category', 6, '{\"id\": 6, \"code\": null, \"name\": \"dfgdfhfghdfghgfj\", \"type\": \"acao\", \"active\": 1, \"parent_id\": 5, \"created_at\": \"2025-08-27 09:49:44\", \"updated_at\": \"2025-08-27 09:49:44\", \"description\": null}', '[]', '2025-08-27 09:50:04', '2025-08-27 09:50:04'),
(4, 1, 'delete', 'App\\Models\\Category', 5, '{\"id\": 5, \"code\": null, \"name\": \"thdgfhgfjhgfj\", \"type\": \"grupo\", \"active\": 1, \"parent_id\": 4, \"created_at\": \"2025-08-27 09:49:32\", \"updated_at\": \"2025-08-27 09:49:32\", \"description\": null}', '[]', '2025-08-27 09:50:11', '2025-08-27 09:50:11'),
(5, 1, 'delete', 'App\\Models\\Category', 4, '{\"id\": 4, \"code\": null, \"name\": \"dghsgdfhdgfhgfhdf\", \"type\": \"bloco\", \"active\": 1, \"parent_id\": 3, \"created_at\": \"2025-08-27 09:49:19\", \"updated_at\": \"2025-08-27 09:49:19\", \"description\": null}', '[]', '2025-08-27 09:50:15', '2025-08-27 09:50:15'),
(6, 1, 'delete', 'App\\Models\\Category', 3, '{\"id\": 3, \"code\": \"dsfdsf\", \"name\": \"dfsf\", \"type\": \"fonte\", \"active\": 1, \"parent_id\": null, \"created_at\": \"2025-08-27 09:49:09\", \"updated_at\": \"2025-08-27 09:49:09\", \"description\": null}', '[]', '2025-08-27 09:50:17', '2025-08-27 09:50:17'),
(7, 2, 'edit', 'App\\Models\\Revenue', 16, '{\"id\": 16, \"date\": \"2025-01-01T03:00:00.000000Z\", \"amount\": \"647119.74\", \"acao_id\": 11, \"bloco_id\": 8, \"fonte_id\": 7, \"grupo_id\": 9, \"created_at\": \"2025-08-28T00:39:12.000000Z\", \"updated_at\": \"2025-08-28T00:39:12.000000Z\", \"description\": \"Saldo de exercício 2024\", \"observation\": null}', '{\"amount\": \"64719.74\", \"updated_at\": \"2025-08-27 21:39:48\"}', '2025-08-27 21:39:48', '2025-08-27 21:39:48'),
(8, 2, 'edit', 'App\\Models\\Revenue', 16, '{\"id\": 16, \"date\": \"2025-01-01T03:00:00.000000Z\", \"amount\": \"64719.74\", \"acao_id\": 11, \"bloco_id\": 8, \"fonte_id\": 7, \"grupo_id\": 9, \"created_at\": \"2025-08-28T00:39:12.000000Z\", \"updated_at\": \"2025-08-28T00:39:48.000000Z\", \"description\": \"Saldo de exercício 2024\", \"observation\": null}', '{\"date\": \"2025-01-03 00:00:00\", \"updated_at\": \"2025-08-27 21:40:37\"}', '2025-08-27 21:40:37', '2025-08-27 21:40:37'),
(9, 2, 'edit', 'App\\Models\\Category', 14, '{\"id\": 14, \"code\": null, \"name\": \"INCREMENTO TEMPORÁRIO AO CUSTEIO DOS SERVIÇOS DE ASSISTÊNCIA HOSPITALAR E AMBULATORIAL PARA CUMPRIMENTO DAS METAS - NACIONAL\", \"type\": \"acao\", \"active\": 1, \"parent_id\": 12, \"created_at\": \"2025-08-31T23:15:41.000000Z\", \"updated_at\": \"2025-08-31T23:15:41.000000Z\", \"description\": null}', '{\"updated_at\": \"2025-08-31 20:16:03\", \"description\": \"Emenda Individual\"}', '2025-08-31 20:16:03', '2025-08-31 20:16:03'),
(10, 2, 'edit', 'App\\Models\\Category', 15, '{\"id\": 15, \"code\": null, \"name\": \"ATENÇÃO PRIMÁRIA\", \"type\": \"bloco\", \"active\": 1, \"parent_id\": 7, \"created_at\": \"2025-08-31T23:16:22.000000Z\", \"updated_at\": \"2025-08-31T23:16:22.000000Z\", \"description\": null}', '{\"type\": \"grupo\", \"parent_id\": \"8\", \"updated_at\": \"2025-08-31 20:18:30\"}', '2025-08-31 20:18:30', '2025-08-31 20:18:30'),
(11, 2, 'edit', 'App\\Models\\Revenue', 17, '{\"id\": 17, \"date\": \"2025-01-13T03:00:00.000000Z\", \"amount\": \"162059.88\", \"acao_id\": 13, \"bloco_id\": 8, \"fonte_id\": 7, \"grupo_id\": 12, \"created_at\": \"2025-08-31T23:24:06.000000Z\", \"updated_at\": \"2025-08-31T23:24:06.000000Z\", \"description\": \"01/12 em 2025\", \"observation\": null}', '{\"amount\": \"160071.53\", \"updated_at\": \"2025-08-31 20:25:12\"}', '2025-08-31 20:25:12', '2025-08-31 20:25:12'),
(12, 2, 'edit', 'App\\Models\\Category', 28, '{\"id\": 28, \"code\": null, \"name\": \"APOIO AOS ESTADOS, DISTRITO FEDERAL E MUNICÍPIOS PARA A VIGILÂNCIA EM SAÚDE\", \"type\": \"acao\", \"active\": 1, \"parent_id\": 27, \"created_at\": \"2025-08-31T23:22:45.000000Z\", \"updated_at\": \"2025-08-31T23:22:45.000000Z\", \"description\": null}', '{\"name\": \"INCENTIVO FINANCEIRO AOS MUNICÍPIOS PARA A VIGILÂNCIA EM SAÚDE - DESPESAS DIVERSAS\", \"updated_at\": \"2025-08-31 22:03:35\"}', '2025-08-31 22:03:35', '2025-08-31 22:03:35'),
(13, 2, 'delete', 'App\\Models\\Revenue', 94, '{\"id\": 94, \"date\": \"2025-07-14\", \"amount\": \"10477.95\", \"acao_id\": 20, \"bloco_id\": 8, \"fonte_id\": 7, \"grupo_id\": 15, \"created_at\": \"2025-08-31 21:36:51\", \"updated_at\": \"2025-08-31 21:36:51\", \"description\": \"07/12 em 2025\", \"observation\": null}', '[]', '2025-08-31 22:17:47', '2025-08-31 22:17:47'),
(14, 1, 'delete', 'App\\Models\\Expense', 5, '{\"id\": 5, \"date\": \"2025-10-25\", \"amount\": \"1500.00\", \"acao_id\": 10, \"bloco_id\": 8, \"fonte_id\": 7, \"grupo_id\": 9, \"created_at\": \"2025-10-25 17:09:57\", \"updated_at\": \"2025-10-25 17:09:57\", \"description\": \"weerwel,lewewrlkwrelk\", \"observation\": \"fdafsdf\", \"expense_classification_id\": 3}', '[]', '2025-10-25 17:14:00', '2025-10-25 17:14:00'),
(15, 1, 'delete', 'App\\Models\\Revenue', 141, '{\"id\": 141, \"date\": \"2025-10-25\", \"amount\": \"10000.00\", \"acao_id\": 10, \"bloco_id\": 8, \"fonte_id\": 7, \"grupo_id\": 9, \"created_at\": \"2025-10-25 17:09:26\", \"updated_at\": \"2025-10-25 17:09:26\", \"description\": \"teste rerer\", \"observation\": \"fwdefwdf\"}', '[]', '2025-10-25 17:14:11', '2025-10-25 17:14:11'),
(16, 1, 'restore', 'Backup', 0, '{\"auto_backup\":\"backup_sisgerp_20251028_230826.sql.gz\"}', '{\"filename\":\"backup_sisgerp_20251028_230809.sql.gz\",\"action\":\"Backup restaurado\"}', '2025-10-29 02:08:27', '2025-10-29 02:08:27'),
(17, 1, 'delete', 'App\\Models\\Expense', 6, '{\"id\":6,\"description\":\"teste\",\"amount\":\"1000.00\",\"date\":\"2025-10-27T00:00:00.000000Z\",\"fonte_id\":7,\"bloco_id\":8,\"grupo_id\":12,\"acao_id\":13,\"expense_classification_id\":3,\"observation\":\"teste\",\"created_at\":\"2025-10-27T14:23:01.000000Z\",\"updated_at\":\"2025-10-27T14:23:01.000000Z\"}', NULL, '2025-10-29 02:09:20', '2025-10-29 02:09:20'),
(18, 1, 'download', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_230826.sql.gz\",\"action\":\"Backup baixado\"}', '2025-10-29 02:28:42', '2025-10-29 02:28:42'),
(19, 1, 'upload', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_upload_20251028_232905.gz\",\"original_name\":\"backup_sisgerp_20251028_230826.sql.gz\",\"action\":\"Backup enviado\"}', '2025-10-29 02:29:05', '2025-10-29 02:29:05'),
(20, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_210817.sql\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:10:23', '2025-10-29 03:10:23'),
(21, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_210805.sql\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:10:30', '2025-10-29 03:10:30'),
(22, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_202847.sql\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:10:35', '2025-10-29 03:10:35'),
(23, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_211346.sql\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:10:39', '2025-10-29 03:10:39'),
(24, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_211234.sql\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:10:51', '2025-10-29 03:10:51'),
(25, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_230826.sql.gz\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:10:57', '2025-10-29 03:10:57'),
(26, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_230809.sql.gz\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:11:03', '2025-10-29 03:11:03'),
(27, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_upload_20251028_213429.sql\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:11:08', '2025-10-29 03:11:08'),
(28, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_213356.sql.gz\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:11:13', '2025-10-29 03:11:13'),
(29, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_upload_20251028_211953.sql\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:11:17', '2025-10-29 03:11:17'),
(30, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_213403.sql.gz\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:11:22', '2025-10-29 03:11:22'),
(31, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_210845.sql\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:11:27', '2025-10-29 03:11:27'),
(32, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_050828.sql\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:11:31', '2025-10-29 03:11:31'),
(33, 1, 'delete', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251028_050131.sql\",\"action\":\"Backup exclu\\u00eddo\"}', '2025-10-29 03:11:35', '2025-10-29 03:11:35'),
(34, 1, 'restore', 'Backup', 0, '{\"auto_backup\":\"backup_sisgerp_20251029_012625.sql.gz\"}', '{\"filename\":\"backup_sisgerp_upload_20251029_012617.sql\",\"action\":\"Backup restaurado\"}', '2025-10-29 01:26:26', '2025-10-29 01:26:26'),
(35, 1, 'create', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251029_132319.sql.gz\",\"action\":\"Backup criado\"}', '2025-10-29 13:23:20', '2025-10-29 13:23:20'),
(36, 2, 'update', 'App\\Models\\Category', 7, '{\"id\":7,\"name\":\"Transfer\\u00eancias Fundo a Fundo de Recursos do SUS provenientes do Governo Federal \\u2013 Bloco de Manuten\\u00e7\\u00e3o das A\\u00e7\\u00f5es e Servi\\u00e7os P\\u00fablicos de Sa\\u00fade\",\"code\":\"600\",\"type\":\"fonte\",\"parent_id\":null,\"active\":true,\"description\":null,\"created_at\":\"2025-08-27T21:10:54.000000Z\",\"updated_at\":\"2025-08-27T21:10:54.000000Z\",\"deleted_at\":null}', '{\"name\":\"Recurso Federal de Custeio\",\"updated_at\":\"2025-10-30 00:13:12\"}', '2025-10-30 00:13:12', '2025-10-30 00:13:12'),
(37, 2, 'create', 'App\\Models\\Category', 31, NULL, '{\"name\":\"Recurso Federal de Investimento\",\"code\":\"601\",\"type\":\"fonte\",\"description\":null,\"active\":true,\"updated_at\":\"2025-10-30T00:16:01.000000Z\",\"created_at\":\"2025-10-30T00:16:01.000000Z\",\"id\":31}', '2025-10-30 00:16:01', '2025-10-30 00:16:01'),
(38, 2, 'update', 'App\\Models\\ExpenseClassification', 3, '{\"id\":3,\"name\":\"Combust\\u00edvel\",\"code\":null,\"description\":null,\"active\":true,\"created_at\":\"2025-10-23T11:59:49.000000Z\",\"updated_at\":\"2025-10-23T11:59:49.000000Z\"}', '{\"name\":\"Combust\\u00edvel e Lubrificantes Automotivos\",\"code\":\"33903004\",\"updated_at\":\"2025-10-30 00:22:22\"}', '2025-10-30 00:22:22', '2025-10-30 00:22:22'),
(39, 2, 'update', 'App\\Models\\ExpenseClassification', 4, '{\"id\":4,\"name\":\"G\\u00eaneros Aliment\\u00edcios\",\"code\":null,\"description\":null,\"active\":true,\"created_at\":\"2025-10-23T12:00:35.000000Z\",\"updated_at\":\"2025-10-23T12:00:35.000000Z\"}', '{\"name\":\"G\\u00eaneros de Alimenta\\u00e7\\u00e3o\",\"code\":\"33903006\",\"updated_at\":\"2025-10-30 00:22:52\"}', '2025-10-30 00:22:52', '2025-10-30 00:22:52'),
(40, 2, 'create', 'App\\Models\\ExpenseClassification', 5, NULL, '{\"name\":\"Material de Expediente\",\"code\":\"33903013\",\"description\":null,\"active\":true,\"updated_at\":\"2025-10-30T00:23:39.000000Z\",\"created_at\":\"2025-10-30T00:23:39.000000Z\",\"id\":5}', '2025-10-30 00:23:39', '2025-10-30 00:23:39'),
(41, 2, 'create', 'App\\Models\\ExpenseClassification', 6, NULL, '{\"name\":\"Material Hospitalar, Odont., Lab., Ambul. e para uso em Cl\\u00ednica\",\"code\":\"33903015\",\"description\":null,\"active\":true,\"updated_at\":\"2025-10-30T00:24:30.000000Z\",\"created_at\":\"2025-10-30T00:24:30.000000Z\",\"id\":6}', '2025-10-30 00:24:30', '2025-10-30 00:24:30'),
(42, 2, 'create', 'App\\Models\\ExpenseClassification', 7, NULL, '{\"name\":\"Material para Limpeza e Higiene\",\"code\":\"33903017\",\"description\":null,\"active\":true,\"updated_at\":\"2025-10-30T00:24:49.000000Z\",\"created_at\":\"2025-10-30T00:24:49.000000Z\",\"id\":7}', '2025-10-30 00:24:49', '2025-10-30 00:24:49'),
(43, 2, 'create', 'App\\Models\\ExpenseClassification', 8, NULL, '{\"name\":\"Material para Manuten\\u00e7\\u00e3o de Bens M\\u00f3veis e Equipamentos\",\"code\":\"33903020\",\"description\":null,\"active\":true,\"updated_at\":\"2025-10-30T00:26:45.000000Z\",\"created_at\":\"2025-10-30T00:26:45.000000Z\",\"id\":8}', '2025-10-30 00:26:45', '2025-10-30 00:26:45'),
(44, 2, 'update', 'App\\Models\\ExpenseClassification', 1, '{\"id\":1,\"name\":\"Medicamentos\",\"code\":null,\"description\":null,\"active\":true,\"created_at\":\"2025-08-27T21:33:15.000000Z\",\"updated_at\":\"2025-08-27T21:33:15.000000Z\"}', '{\"code\":\"33903040\",\"updated_at\":\"2025-10-30 00:30:35\"}', '2025-10-30 00:30:35', '2025-10-30 00:30:35'),
(45, 2, 'create', 'App\\Models\\ExpenseClassification', 9, NULL, '{\"name\":\"Loca\\u00e7\\u00e3o de Ve\\u00edculos para Transporte de Pessoas\",\"code\":\"33903305\",\"description\":null,\"active\":true,\"updated_at\":\"2025-10-30T00:31:48.000000Z\",\"created_at\":\"2025-10-30T00:31:48.000000Z\",\"id\":9}', '2025-10-30 00:31:48', '2025-10-30 00:31:48'),
(46, 2, 'create', 'App\\Models\\ExpenseClassification', 10, NULL, '{\"name\":\"Servi\\u00e7os de \\u00c1gua e Esgoto\",\"code\":\"33903929\",\"description\":null,\"active\":true,\"updated_at\":\"2025-10-30T00:33:50.000000Z\",\"created_at\":\"2025-10-30T00:33:50.000000Z\",\"id\":10}', '2025-10-30 00:33:50', '2025-10-30 00:33:50'),
(47, 2, 'create', 'App\\Models\\ExpenseClassification', 11, NULL, '{\"name\":\"Servi\\u00e7os M\\u00e9dico e Odontol\\u00f3gico\",\"code\":\"33903977\",\"description\":null,\"active\":true,\"updated_at\":\"2025-10-30T00:35:00.000000Z\",\"created_at\":\"2025-10-30T00:35:00.000000Z\",\"id\":11}', '2025-10-30 00:35:00', '2025-10-30 00:35:00'),
(48, 2, 'create', 'App\\Models\\Expense', 7, NULL, '{\"description\":\"MJ SERVI\\u00c7OS M\\u00c9DICOS\",\"amount\":\"123456.00\",\"date\":\"2025-10-08T00:00:00.000000Z\",\"fonte_id\":\"7\",\"bloco_id\":\"8\",\"grupo_id\":\"12\",\"acao_id\":\"14\",\"expense_classification_id\":\"11\",\"observation\":\"Referente aos servi\\u00e7os de plant\\u00e3o do m\\u00eas de setembro\\/2025\",\"updated_at\":\"2025-10-30T00:49:11.000000Z\",\"created_at\":\"2025-10-30T00:49:11.000000Z\",\"id\":7}', '2025-10-30 00:49:11', '2025-10-30 00:49:11'),
(49, 2, 'update', 'App\\Models\\Category', 14, '{\"id\":14,\"name\":\"INCREMENTO TEMPOR\\u00c1RIO AO CUSTEIO DOS SERVI\\u00c7OS DE ASSIST\\u00caNCIA HOSPITALAR E AMBULATORIAL PARA CUMPRIMENTO DAS METAS - NACIONAL\",\"code\":null,\"type\":\"acao\",\"parent_id\":12,\"active\":true,\"description\":\"Emenda Individual\",\"created_at\":\"2025-08-31T20:15:41.000000Z\",\"updated_at\":\"2025-08-31T20:16:03.000000Z\",\"deleted_at\":null}', '{\"name\":\"INCREMENTO MAC - EMENDA INDIVIDUAL FERNANDO FARIAS\",\"description\":null,\"updated_at\":\"2025-10-30 00:54:46\"}', '2025-10-30 00:54:46', '2025-10-30 00:54:46'),
(50, 2, 'create', 'App\\Models\\Category', 32, NULL, '{\"name\":\"INCREMENTO MAC - EMENDA BANCADA DE ALAGOAS\",\"code\":null,\"type\":\"acao\",\"parent_id\":\"12\",\"description\":null,\"active\":true,\"updated_at\":\"2025-10-30T00:56:43.000000Z\",\"created_at\":\"2025-10-30T00:56:43.000000Z\",\"id\":32}', '2025-10-30 00:56:43', '2025-10-30 00:56:43'),
(51, 2, 'create', 'App\\Models\\Revenue', 142, NULL, '{\"description\":\"PARCELA \\u00daNICA\",\"amount\":\"1333662.00\",\"date\":\"2025-10-21T00:00:00.000000Z\",\"fonte_id\":\"7\",\"bloco_id\":\"8\",\"grupo_id\":\"12\",\"acao_id\":\"32\",\"observation\":\"\",\"updated_at\":\"2025-10-30T00:58:47.000000Z\",\"created_at\":\"2025-10-30T00:58:47.000000Z\",\"id\":142,\"formatted_amount\":\"R$ 1.333.662,00\",\"formatted_date\":\"21\\/10\\/2025\"}', '2025-10-30 00:58:47', '2025-10-30 00:58:47'),
(52, 1, 'create', 'App\\Models\\CitySetting', 1, NULL, '{\"city_name\":\"Cidade Exemplo\",\"city_hall_name\":\"Prefeitura Exemplo\",\"address\":\"Rua Exemplo\",\"ibge_code\":\"0000000\",\"state\":\"AL\",\"zip_code\":\"00000000\",\"phone\":\"(00) 0000-00000\",\"email\":\"exemplo@prefeitura.com\",\"mayor_name\":\"Prefeito Exemplo\",\"updated_at\":\"2025-10-30T02:11:06.000000Z\",\"created_at\":\"2025-10-30T02:11:06.000000Z\",\"id\":1}', '2025-10-29 23:11:06', '2025-10-29 23:11:06'),
(53, 2, 'create', 'App\\Models\\ExpenseClassification', 12, NULL, '{\"name\":\"Agu\\u00e1 Mineral\",\"code\":null,\"description\":null,\"active\":true,\"updated_at\":\"2025-10-30T12:34:20.000000Z\",\"created_at\":\"2025-10-30T12:34:20.000000Z\",\"id\":12}', '2025-10-30 09:34:20', '2025-10-30 09:34:20'),
(54, 2, 'create', 'App\\Models\\Revenue', 143, NULL, '{\"description\":\"Parcela 12 FB\",\"amount\":\"120000.00\",\"date\":\"2025-10-30T03:00:00.000000Z\",\"fonte_id\":\"7\",\"bloco_id\":\"8\",\"grupo_id\":\"9\",\"acao_id\":\"11\",\"observation\":\"\",\"updated_at\":\"2025-10-30T12:35:36.000000Z\",\"created_at\":\"2025-10-30T12:35:36.000000Z\",\"id\":143,\"formatted_amount\":\"R$ 120.000,00\",\"formatted_date\":\"30\\/10\\/2025\"}', '2025-10-30 09:35:36', '2025-10-30 09:35:36'),
(55, 2, 'create', 'App\\Models\\Expense', 8, NULL, '{\"description\":\"PEDIDO 03 CONISUL MEDICAMENTOS\",\"amount\":\"200000.00\",\"date\":\"2025-10-30T03:00:00.000000Z\",\"fonte_id\":\"7\",\"bloco_id\":\"8\",\"grupo_id\":\"9\",\"acao_id\":\"11\",\"expense_classification_id\":\"1\",\"observation\":\"\",\"updated_at\":\"2025-10-30T12:36:49.000000Z\",\"created_at\":\"2025-10-30T12:36:49.000000Z\",\"id\":8}', '2025-10-30 09:36:49', '2025-10-30 09:36:49'),
(56, 2, 'create', 'App\\Models\\Expense', 9, NULL, '{\"description\":\"AUTO POSTO S\\u00c3O JO\\u00c3O BATISTA\",\"amount\":\"88000.00\",\"date\":\"2025-10-29T03:00:00.000000Z\",\"fonte_id\":\"7\",\"bloco_id\":\"8\",\"grupo_id\":\"12\",\"acao_id\":\"14\",\"expense_classification_id\":\"3\",\"observation\":\"\",\"updated_at\":\"2025-10-30T12:43:50.000000Z\",\"created_at\":\"2025-10-30T12:43:50.000000Z\",\"id\":9}', '2025-10-30 09:43:50', '2025-10-30 09:43:50'),
(57, 1, 'download', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_upload_20251028_223530.sql\",\"action\":\"Backup baixado\"}', '2025-11-11 10:53:56', '2025-11-11 10:53:56'),
(58, 1, 'create', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251112_120853.sql.gz\",\"action\":\"Backup criado\"}', '2025-11-12 12:08:53', '2025-11-12 12:08:53'),
(59, 1, 'download', 'Backup', 0, NULL, '{\"filename\":\"backup_sisgerp_20251112_120853.sql.gz\",\"action\":\"Backup baixado\"}', '2025-11-12 13:00:36', '2025-11-12 13:00:36'),
(60, 2, 'create', 'App\\Models\\ExpenseClassification', 13, NULL, '{\"name\":\"Agu\\u00e1 Mineral\",\"code\":null,\"description\":null,\"active\":true,\"updated_at\":\"2025-11-26T17:26:14.000000Z\",\"created_at\":\"2025-11-26T17:26:14.000000Z\",\"id\":13}', '2025-11-26 14:26:14', '2025-11-26 14:26:14'),
(61, 2, 'create', 'App\\Models\\Revenue', 144, NULL, '{\"description\":\"FARMACIA BASICA FEDERAL\",\"amount\":\"1000000.00\",\"date\":\"2025-12-09T03:00:00.000000Z\",\"fonte_id\":\"7\",\"bloco_id\":\"8\",\"grupo_id\":\"9\",\"acao_id\":\"10\",\"observation\":\"\",\"updated_at\":\"2025-12-09T15:26:36.000000Z\",\"created_at\":\"2025-12-09T15:26:36.000000Z\",\"id\":144,\"formatted_amount\":\"R$ 1.000.000,00\",\"formatted_date\":\"09\\/12\\/2025\"}', '2025-12-09 12:26:36', '2025-12-09 12:26:36'),
(62, 2, 'create', 'App\\Models\\Expense', 10, NULL, '{\"description\":\"PEDIDO 04 CONISUL\",\"amount\":\"500000.00\",\"date\":\"2025-12-09T03:00:00.000000Z\",\"fonte_id\":\"7\",\"bloco_id\":\"8\",\"grupo_id\":\"9\",\"acao_id\":\"10\",\"expense_classification_id\":\"1\",\"observation\":\"\",\"updated_at\":\"2025-12-09T15:28:31.000000Z\",\"created_at\":\"2025-12-09T15:28:31.000000Z\",\"id\":10}', '2025-12-09 12:28:31', '2025-12-09 12:28:31');

-- --------------------------------------------------------

--
-- Estrutura para tabela `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `categories`
--

CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'fonte, bloco, grupo, acao',
  `parent_id` bigint UNSIGNED DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `categories`
--

INSERT INTO `categories` (`id`, `name`, `code`, `type`, `parent_id`, `active`, `description`, `created_at`, `updated_at`, `deleted_at`) VALUES
(7, 'Recurso Federal de Custeio', '600', 'fonte', NULL, 1, NULL, '2025-08-27 21:10:54', '2025-10-30 00:13:12', NULL),
(8, 'Manutenção das Ações e Serviços Públicos de Saúde', NULL, 'bloco', 7, 1, NULL, '2025-08-27 21:12:00', '2025-08-27 21:12:00', NULL),
(9, 'ASSISTÊNCIA FARMACÊUTICA', NULL, 'grupo', 8, 1, NULL, '2025-08-27 21:13:40', '2025-08-27 21:13:40', NULL),
(10, 'RECURSOS FINANC. A TRANSFERIR AS SECRETARIAS DE SAUDE MUN. EST. E DO DF PARA A QUALIF. DA ASSIST. FARMACEUTICA - QUALIFAR-SUS', NULL, 'acao', 9, 1, NULL, '2025-08-27 21:14:42', '2025-08-27 21:14:42', NULL),
(11, 'RECURSOS FINANCEIROS A TRANSFERIR PARA AQUISICAO PELAS SECRETARIAS DE SAUDE DOS ESTADOS, MUNICIPIOS E DO DISTRITO FEDERAL', NULL, 'acao', 9, 1, NULL, '2025-08-27 21:15:02', '2025-08-27 21:15:02', NULL),
(12, 'ATENÇÃO DE MÉDIA E ALTA COMPLEXIDADE AMBULATORIAL E HOSPITALAR', NULL, 'grupo', 8, 1, NULL, '2025-08-31 20:15:00', '2025-08-31 20:15:00', NULL),
(13, 'ATENÇÃO À SAÚDE DA POPULAÇÃO PARA PROCEDIMENTOS NO MAC', NULL, 'acao', 12, 1, NULL, '2025-08-31 20:15:22', '2025-08-31 20:15:22', NULL),
(14, 'INCREMENTO MAC - EMENDA INDIVIDUAL FERNANDO FARIAS', NULL, 'acao', 12, 1, NULL, '2025-08-31 20:15:41', '2025-10-30 00:54:46', NULL),
(15, 'ATENÇÃO PRIMÁRIA', NULL, 'grupo', 8, 1, NULL, '2025-08-31 20:16:22', '2025-08-31 20:18:30', NULL),
(16, 'INCENTIVO FINANCEIRO PARA ATENÇÃO À SAÚDE BUCAL', NULL, 'acao', 15, 1, NULL, '2025-08-31 20:18:56', '2025-08-31 20:18:56', NULL),
(17, 'AGENTES COMUNITÁRIOS DE SAÚDE', NULL, 'acao', 15, 1, NULL, '2025-08-31 20:19:09', '2025-08-31 20:19:09', NULL),
(18, 'IMPLEMENTAÇÃO DA SEGURANÇA ALIMENTAR E NUTRICIONAL NA SAÚDE', NULL, 'acao', 15, 1, NULL, '2025-08-31 20:19:23', '2025-08-31 20:19:23', NULL),
(19, 'APOIO À MANUTENÇÃO DOS POLOS DE ACADEMIA DA SAÚDE', NULL, 'acao', 15, 1, NULL, '2025-08-31 20:19:36', '2025-08-31 20:19:36', NULL),
(20, 'INCENTIVO FINANCEIRO DA APS - COMPONENTE PER CAPITA DE BASE POPULACIONAL', NULL, 'acao', 15, 1, NULL, '2025-08-31 20:20:17', '2025-08-31 20:20:17', NULL),
(21, 'EMENDA - INCREMENTO TEMPORÁRIO AO CUSTEIO DOS SERVIÇOS DE ATENÇÃO PRIMÁRIA EM SAÚDE', NULL, 'acao', 15, 1, NULL, '2025-08-31 20:20:32', '2025-08-31 20:20:32', NULL),
(22, 'INCENTIVO FINANCEIRO DA APS - EQUIPES DE SAÚDE DA FAMÍLIA/ESF E EQUIPES DE ATENÇÃO PRIMÁRIA/EAP', NULL, 'acao', 15, 1, NULL, '2025-08-31 20:20:45', '2025-08-31 20:20:45', NULL),
(23, 'INCENTIVO FINANCEIRO DA APS - EQUIPES MULTIPROFISSIONAIS - EMULTI', NULL, 'acao', 15, 1, NULL, '2025-08-31 20:20:58', '2025-08-31 20:20:58', NULL),
(24, 'INCENTIVO FINANCEIRO DA APS - DEMAIS PROGRAMAS, SERVIÇOS E EQUIPES DA ATENÇÃO PRIMÁRIA À SAÚDE', NULL, 'acao', 15, 1, NULL, '2025-08-31 20:21:13', '2025-08-31 20:21:13', NULL),
(25, 'GESTÃO DO SUS', NULL, 'grupo', 8, 1, NULL, '2025-08-31 20:21:35', '2025-08-31 20:21:35', NULL),
(26, 'ASSISTÊNCIA FINANCEIRA COMPLEMENTAR AOS MUNICÍPIOS PARA O PAGAMENTO DO PISO SALARIAL DOS PROFISSIONAIS DA ENFERMAGEM', NULL, 'acao', 25, 1, NULL, '2025-08-31 20:22:13', '2025-08-31 20:22:13', NULL),
(27, 'VIGILÂNCIA EM SAÚDE', NULL, 'grupo', 8, 1, NULL, '2025-08-31 20:22:32', '2025-08-31 20:22:32', NULL),
(28, 'INCENTIVO FINANCEIRO AOS MUNICÍPIOS PARA A VIGILÂNCIA EM SAÚDE - DESPESAS DIVERSAS', NULL, 'acao', 27, 1, NULL, '2025-08-31 20:22:45', '2025-08-31 22:03:35', NULL),
(29, 'TRANSFERÊNCIA AOS ENTES FEDERATIVOS PARA O PAGAMENTO DOS VENCIMENTOS DOS AGENTES DE COMBATE ÀS ENDEMIAS', NULL, 'acao', 27, 1, NULL, '2025-08-31 20:23:00', '2025-08-31 20:23:00', NULL),
(30, 'INCENTIVO FINANCEIRO AOS ESTADOS, DISTRITO FEDERAL E MUNICÍPIOS PARA EXECUÇÃO DE AÇÕES DE VIGILÂNCIA SANITÁRIA', NULL, 'acao', 27, 1, NULL, '2025-08-31 20:23:10', '2025-08-31 20:23:10', NULL),
(31, 'Recurso Federal de Investimento', '601', 'fonte', NULL, 1, NULL, '2025-10-30 00:16:01', '2025-10-30 00:16:01', NULL),
(32, 'INCREMENTO MAC - EMENDA BANCADA DE ALAGOAS', NULL, 'acao', 12, 1, NULL, '2025-10-30 00:56:43', '2025-10-30 00:56:43', NULL);

-- --------------------------------------------------------

--
-- Estrutura para tabela `city_settings`
--

CREATE TABLE `city_settings` (
  `id` bigint UNSIGNED NOT NULL,
  `city_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city_hall_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ibge_code` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `zip_code` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mayor_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `city_settings`
--

INSERT INTO `city_settings` (`id`, `city_name`, `city_hall_name`, `address`, `ibge_code`, `state`, `zip_code`, `phone`, `email`, `mayor_name`, `created_at`, `updated_at`) VALUES
(1, 'Cidade Exemplo', 'Prefeitura Exemplo', 'Rua Exemplo', '0000000', 'AL', '00000000', '(00) 0000-00000', 'exemplo@prefeitura.com', 'Prefeito Exemplo', '2025-10-29 23:11:06', '2025-10-29 23:11:06');

-- --------------------------------------------------------

--
-- Estrutura para tabela `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint UNSIGNED NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `date` date NOT NULL,
  `fonte_id` bigint UNSIGNED NOT NULL,
  `bloco_id` bigint UNSIGNED NOT NULL,
  `grupo_id` bigint UNSIGNED NOT NULL,
  `acao_id` bigint UNSIGNED NOT NULL,
  `expense_classification_id` bigint UNSIGNED NOT NULL,
  `observation` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `expenses`
--

INSERT INTO `expenses` (`id`, `description`, `amount`, `date`, `fonte_id`, `bloco_id`, `grupo_id`, `acao_id`, `expense_classification_id`, `observation`, `created_at`, `updated_at`) VALUES
(1, 'CONISUL', 91622.32, '2025-04-01', 7, 8, 9, 11, 1, 'Pedido...', '2025-08-27 21:35:24', '2025-08-27 21:35:24'),
(2, 'CONISUL', 30559.88, '2025-08-11', 7, 8, 9, 11, 1, 'Pedido...', '2025-08-27 21:35:54', '2025-08-27 21:35:54'),
(3, 'MEDICAH', 21860.49, '2025-03-21', 7, 8, 9, 11, 1, NULL, '2025-08-27 21:36:29', '2025-08-27 21:36:29'),
(4, 'Prefeitura', 265.51, '2025-03-21', 7, 8, 9, 11, 2, 'Referente ao imposto retido.', '2025-08-27 21:37:38', '2025-08-27 21:37:38'),
(7, 'MJ SERVIÇOS MÉDICOS', 123456.00, '2025-10-08', 7, 8, 12, 14, 11, 'Referente aos serviços de plantão do mês de setembro/2025', '2025-10-30 00:49:11', '2025-10-30 00:49:11'),
(8, 'PEDIDO 03 CONISUL MEDICAMENTOS', 200000.00, '2025-10-30', 7, 8, 9, 11, 1, '', '2025-10-30 09:36:49', '2025-10-30 09:36:49'),
(9, 'AUTO POSTO SÃO JOÃO BATISTA', 88000.00, '2025-10-29', 7, 8, 12, 14, 3, '', '2025-10-30 09:43:50', '2025-10-30 09:43:50'),
(10, 'PEDIDO 04 CONISUL', 500000.00, '2025-12-09', 7, 8, 9, 10, 1, '', '2025-12-09 12:28:31', '2025-12-09 12:28:31');

-- --------------------------------------------------------

--
-- Estrutura para tabela `expense_classifications`
--

CREATE TABLE `expense_classifications` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `expense_classifications`
--

INSERT INTO `expense_classifications` (`id`, `name`, `code`, `description`, `active`, `created_at`, `updated_at`) VALUES
(1, 'Medicamentos', '33903040', NULL, 1, '2025-08-27 21:33:15', '2025-10-30 00:30:35'),
(2, 'Imposto retido', NULL, NULL, 1, '2025-08-27 21:36:50', '2025-08-27 21:36:50'),
(3, 'Combustível e Lubrificantes Automotivos', '33903004', NULL, 1, '2025-10-23 11:59:49', '2025-10-30 00:22:22'),
(4, 'Gêneros de Alimentação', '33903006', NULL, 1, '2025-10-23 12:00:35', '2025-10-30 00:22:52'),
(5, 'Material de Expediente', '33903013', NULL, 1, '2025-10-30 00:23:39', '2025-10-30 00:23:39'),
(6, 'Material Hospitalar, Odont., Lab., Ambul. e para uso em Clínica', '33903015', NULL, 1, '2025-10-30 00:24:30', '2025-10-30 00:24:30'),
(7, 'Material para Limpeza e Higiene', '33903017', NULL, 1, '2025-10-30 00:24:49', '2025-10-30 00:24:49'),
(8, 'Material para Manutenção de Bens Móveis e Equipamentos', '33903020', NULL, 1, '2025-10-30 00:26:45', '2025-10-30 00:26:45'),
(9, 'Locação de Veículos para Transporte de Pessoas', '33903305', NULL, 1, '2025-10-30 00:31:48', '2025-10-30 00:31:48'),
(10, 'Serviços de Água e Esgoto', '33903929', NULL, 1, '2025-10-30 00:33:50', '2025-10-30 00:33:50'),
(11, 'Serviços Médico e Odontológico', '33903977', NULL, 1, '2025-10-30 00:35:00', '2025-10-30 00:35:00'),
(12, 'Aguá Mineral', NULL, NULL, 1, '2025-10-30 09:34:20', '2025-10-30 09:34:20'),
(13, 'Aguá Mineral', NULL, NULL, 1, '2025-11-26 14:26:14', '2025-11-26 14:26:14');

-- --------------------------------------------------------

--
-- Estrutura para tabela `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(6, '0001_01_01_000000_create_users_table', 1),
(7, '0001_01_01_000001_create_cache_table', 1),
(8, '0001_01_01_000002_create_jobs_table', 1),
(9, '2024_03_15_000000_create_city_settings_table', 1),
(10, '2024_03_15_000001_add_role_to_users_table', 1),
(11, '2025_01_18_044623_create_categories_table', 1),
(12, '2025_01_18_051350_create_expense_classifications_table', 1),
(13, '2025_01_18_052212_create_revenues_table', 1),
(14, '2025_01_18_054041_create_expenses_table', 1),
(15, '2025_01_18_063605_create_audit_logs_table', 1),
(16, '2025_10_02_163612_add_optimized_indexes_to_tables', 2),
(17, '0001_01_01_000003_create_sessions_table', 3),
(18, '0001_01_01_000004_create_password_reset_tokens_table', 3);

-- --------------------------------------------------------

--
-- Estrutura para tabela `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `revenues`
--

CREATE TABLE `revenues` (
  `id` bigint UNSIGNED NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `date` date NOT NULL,
  `fonte_id` bigint UNSIGNED NOT NULL,
  `bloco_id` bigint UNSIGNED NOT NULL,
  `grupo_id` bigint UNSIGNED NOT NULL,
  `acao_id` bigint UNSIGNED NOT NULL,
  `observation` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `revenues`
--

INSERT INTO `revenues` (`id`, `description`, `amount`, `date`, `fonte_id`, `bloco_id`, `grupo_id`, `acao_id`, `observation`, `created_at`, `updated_at`) VALUES
(1, 'Única em 2025', 6000.00, '2025-05-06', 7, 8, 9, 10, NULL, '2025-08-27 21:16:44', '2025-08-27 21:16:44'),
(2, '01/12 em 2025', 13451.75, '2025-01-16', 7, 8, 9, 11, NULL, '2025-08-27 21:18:02', '2025-08-27 21:18:02'),
(3, '02/12 em 2025', 13451.75, '2025-02-17', 7, 8, 9, 11, NULL, '2025-08-27 21:18:35', '2025-08-27 21:18:35'),
(4, '03/12 em 2025', 13451.75, '2025-03-13', 7, 8, 9, 11, NULL, '2025-08-27 21:19:00', '2025-08-27 21:19:00'),
(5, '04/12 em 2025', 13451.75, '2025-04-09', 7, 8, 9, 11, NULL, '2025-08-27 21:19:25', '2025-08-27 21:19:25'),
(6, '05/12 em 2025', 13451.75, '2025-05-19', 7, 8, 9, 11, NULL, '2025-08-27 21:19:53', '2025-08-27 21:19:53'),
(7, '06/12 em 2025', 13451.75, '2025-06-25', 7, 8, 9, 11, NULL, '2025-08-27 21:20:15', '2025-08-27 21:20:15'),
(8, '07/12 em 2025', 15176.40, '2025-07-30', 7, 8, 9, 11, NULL, '2025-08-27 21:20:44', '2025-08-27 21:20:44'),
(9, 'JAN de 2025', 1724.65, '2025-08-15', 7, 8, 9, 11, 'Receita retroativa', '2025-08-27 21:22:03', '2025-08-27 21:22:03'),
(10, 'FEV de 2025', 1724.65, '2025-08-15', 7, 8, 9, 11, 'Receita Retroativa', '2025-08-27 21:22:51', '2025-08-27 21:22:51'),
(11, 'ABR de 2025', 1724.65, '2025-08-15', 7, 8, 9, 11, 'Receita retroativa', '2025-08-27 21:23:25', '2025-08-27 21:23:25'),
(12, 'MAI de 2025', 1724.65, '2025-08-15', 7, 8, 9, 11, 'Receita retroativa', '2025-08-27 21:23:59', '2025-08-27 21:23:59'),
(13, 'JUN de 202', 1724.65, '2025-08-15', 7, 8, 9, 11, 'Receita retroativa', '2025-08-27 21:24:30', '2025-08-27 21:24:30'),
(14, 'MAR de 2025', 1724.65, '2025-08-15', 7, 8, 9, 11, 'Receita retroativa', '2025-08-27 21:25:08', '2025-08-27 21:25:08'),
(15, '08/12 em 2025', 15176.40, '2025-08-18', 7, 8, 9, 11, NULL, '2025-08-27 21:25:31', '2025-08-27 21:25:31'),
(16, 'Saldo de exercício 2024', 64719.74, '2025-01-03', 7, 8, 9, 11, NULL, '2025-08-27 21:39:12', '2025-08-27 21:40:37'),
(17, '01/12 em 2025', 160071.53, '2025-01-13', 7, 8, 12, 13, NULL, '2025-08-31 20:24:06', '2025-08-31 20:25:12'),
(18, '02/12 em 2025', 159475.02, '2025-02-07', 7, 8, 12, 13, NULL, '2025-08-31 20:24:39', '2025-08-31 20:24:39'),
(19, '03/12 em 2025', 159475.02, '2025-03-07', 7, 8, 12, 13, NULL, '2025-08-31 20:25:41', '2025-08-31 20:25:41'),
(20, '04/12 em 2025', 159475.02, '2025-04-02', 7, 8, 12, 13, NULL, '2025-08-31 20:26:14', '2025-08-31 20:26:14'),
(21, '05/12 em 2025', 159475.02, '2025-05-07', 7, 8, 12, 13, NULL, '2025-08-31 20:26:41', '2025-08-31 20:26:41'),
(22, '06/12 em 2025', 159475.02, '2025-06-04', 7, 8, 12, 13, NULL, '2025-08-31 20:27:05', '2025-08-31 20:27:05'),
(23, '07/12 em 2025', 159475.02, '2025-07-07', 7, 8, 12, 13, NULL, '2025-08-31 20:27:27', '2025-08-31 20:27:27'),
(24, '08/12 em 2025', 159475.02, '2025-08-05', 7, 8, 12, 13, NULL, '2025-08-31 20:27:50', '2025-08-31 20:27:50'),
(25, 'Única em 2025', 1000000.00, '2025-07-17', 7, 8, 12, 14, 'Emenda individual', '2025-08-31 20:28:31', '2025-08-31 20:28:31'),
(26, 'Única em 2024', 22041.04, '2025-01-23', 7, 8, 15, 16, NULL, '2025-08-31 20:29:31', '2025-08-31 20:29:31'),
(27, 'DEZ de 2024', 3000.00, '2025-01-16', 7, 8, 15, 19, NULL, '2025-08-31 20:30:33', '2025-08-31 20:30:33'),
(28, 'JAN de 2025', 3000.00, '2025-03-26', 7, 8, 15, 19, NULL, '2025-08-31 20:31:23', '2025-08-31 20:31:23'),
(29, 'FEV de 2025', 3000.00, '2025-04-01', 7, 8, 15, 19, NULL, '2025-08-31 20:37:31', '2025-08-31 20:37:31'),
(30, '04/12 em 2025', 3000.00, '2025-05-15', 7, 8, 15, 19, NULL, '2025-08-31 20:38:12', '2025-08-31 20:38:12'),
(31, '05/12 em 2025', 3000.00, '2025-05-15', 7, 8, 15, 19, NULL, '2025-08-31 20:38:35', '2025-08-31 20:38:35'),
(32, '06/12 em 2025', 3000.00, '2025-07-25', 7, 8, 15, 19, NULL, '2025-08-31 20:39:00', '2025-08-31 20:39:00'),
(33, '07/12 em 2025', 3000.00, '2025-07-25', 7, 8, 15, 19, NULL, '2025-08-31 20:39:42', '2025-08-31 20:39:42'),
(34, '08/12 em 2025', 3000.00, '2025-08-20', 7, 8, 15, 19, NULL, '2025-08-31 20:40:05', '2025-08-31 20:40:05'),
(35, 'Única em 2024', 25720.20, '2025-05-02', 7, 8, 15, 18, NULL, '2025-08-31 20:40:48', '2025-08-31 20:40:48'),
(36, '01/12 em 2025', 145728.00, '2025-01-14', 7, 8, 15, 17, NULL, '2025-08-31 20:41:24', '2025-08-31 20:41:24'),
(37, '02/12 em 2025', 145728.00, '2025-02-12', 7, 8, 15, 17, NULL, '2025-08-31 20:41:47', '2025-08-31 20:41:47'),
(38, '03/12 em 2025', 145728.00, '2025-03-12', 7, 8, 15, 17, NULL, '2025-08-31 20:42:09', '2025-08-31 20:42:09'),
(39, '04/12 em 2025', 145728.00, '2025-04-09', 7, 8, 15, 17, NULL, '2025-08-31 20:42:34', '2025-08-31 20:42:34'),
(40, '05/12 em 2025', 145728.00, '2025-05-09', 7, 8, 15, 17, NULL, '2025-08-31 20:42:59', '2025-08-31 20:42:59'),
(41, '06/12 em 2025', 145728.00, '2025-06-12', 7, 8, 15, 17, NULL, '2025-08-31 20:43:27', '2025-08-31 20:43:27'),
(42, '07/12 em 2025', 145728.00, '2025-07-15', 7, 8, 15, 17, NULL, '2025-08-31 20:43:52', '2025-08-31 20:43:52'),
(43, '08/12 em 2025', 145728.00, '2025-08-12', 7, 8, 15, 17, NULL, '2025-08-31 20:44:18', '2025-08-31 20:44:18'),
(44, '01/12 em 2025', 70209.04, '2025-01-14', 7, 8, 15, 16, 'Saúde Bucal - eSB 40h + Componente de Qualidade', '2025-08-31 20:54:01', '2025-08-31 20:54:01'),
(45, '01/12 em 2025', 28543.56, '2025-02-03', 7, 8, 15, 16, 'CEO', '2025-08-31 20:54:36', '2025-08-31 20:54:36'),
(46, '01/12 em 2025', 11250.00, '2025-02-03', 7, 8, 15, 16, 'LRPD', '2025-08-31 20:55:09', '2025-08-31 20:55:09'),
(47, '02/12 em 2025', 81459.04, '2025-02-12', 7, 8, 15, 16, 'Saúde Bucal - eSB 40h + Componente de Qualidade + LRPD', '2025-08-31 20:56:03', '2025-08-31 20:56:03'),
(48, '02/12 em 2025', 28543.56, '2025-02-12', 7, 8, 15, 16, 'CEO', '2025-08-31 20:56:52', '2025-08-31 20:56:52'),
(49, '03/12 em 2025', 28543.56, '2025-03-12', 7, 8, 15, 16, 'CEO', '2025-08-31 20:58:07', '2025-08-31 20:58:07'),
(50, '03/12 em 2025', 81459.04, '2025-03-12', 7, 8, 15, 16, 'Saúde Bucal - eSB 40h + Componente de Qualidade + LRPD', '2025-08-31 20:58:41', '2025-08-31 20:58:41'),
(51, '04/12 em 2025', 81459.04, '2025-04-09', 7, 8, 15, 16, 'Saúde Bucal - eSB 40h + Componente de Qualidade + LRPD', '2025-08-31 20:59:13', '2025-08-31 20:59:13'),
(52, '04/12 em 2025', 28543.56, '2025-04-09', 7, 8, 15, 16, 'CEO', '2025-08-31 20:59:40', '2025-08-31 20:59:40'),
(53, '05/12 em 2025', 81459.04, '2025-05-09', 7, 8, 15, 16, 'Saúde Bucal - eSB 40h + Componente de Qualidade + LRPD', '2025-08-31 21:00:32', '2025-08-31 21:00:32'),
(54, '05/12 em 2025', 28543.56, '2025-05-09', 7, 8, 15, 16, 'CEO', '2025-08-31 21:01:04', '2025-08-31 21:01:04'),
(55, '06/12 em 2025', 28543.56, '2025-06-12', 7, 8, 15, 16, 'CEO', '2025-08-31 21:03:38', '2025-08-31 21:03:38'),
(56, '06/12 em 2025', 81459.04, '2025-06-12', 7, 8, 15, 16, 'Saúde Bucal - eSB 40h + Componente de Qualidade + LRPD', '2025-08-31 21:04:31', '2025-08-31 21:04:31'),
(57, '07/12 em 2025', 81459.04, '2025-07-14', 7, 8, 15, 16, 'Saúde Bucal - eSB 40h + Componente de Qualidade + LRPD', '2025-08-31 21:04:59', '2025-08-31 21:04:59'),
(58, '07/12 em 2025', 28543.56, '2025-07-16', 7, 8, 15, 16, 'CEO', '2025-08-31 21:05:37', '2025-08-31 21:05:37'),
(59, '08/12 em 2025', 28543.56, '2025-08-12', 7, 8, 15, 16, 'CEO', '2025-08-31 21:06:30', '2025-08-31 21:06:30'),
(60, '08/12 em 2025', 81459.04, '2025-08-12', 7, 8, 15, 16, 'Saúde Bucal - eSB 40h + Componente de Qualidade + LRPD', '2025-08-31 21:08:15', '2025-08-31 21:08:15'),
(61, '01/12 em 2025', 31000.00, '2025-01-14', 7, 8, 15, 23, NULL, '2025-08-31 21:09:11', '2025-08-31 21:09:11'),
(62, 'Única em 2025', 3656.25, '2025-01-23', 7, 8, 15, 23, NULL, '2025-08-31 21:10:02', '2025-08-31 21:10:02'),
(63, '02/12 em 2025', 31000.00, '2025-02-12', 7, 8, 15, 23, NULL, '2025-08-31 21:10:25', '2025-08-31 21:10:25'),
(64, '03/12 em 2025', 28500.00, '2025-03-12', 7, 8, 15, 23, NULL, '2025-08-31 21:10:57', '2025-08-31 21:10:57'),
(65, '04/12 em 2025', 28500.00, '2025-04-11', 7, 8, 15, 23, NULL, '2025-08-31 21:11:24', '2025-08-31 21:11:24'),
(66, '05/12 em 2025', 28500.00, '2025-05-09', 7, 8, 15, 23, NULL, '2025-08-31 21:11:50', '2025-08-31 21:11:50'),
(67, '06/12 em 2025', 28500.00, '2025-06-12', 7, 8, 15, 23, NULL, '2025-08-31 21:12:15', '2025-08-31 21:12:15'),
(68, '07/12 em 2025', 28500.00, '2025-07-14', 7, 8, 15, 23, NULL, '2025-08-31 21:12:37', '2025-08-31 21:12:37'),
(69, '08/12 em 2025', 28500.00, '2025-08-12', 7, 8, 15, 23, NULL, '2025-08-31 21:13:02', '2025-08-31 21:13:02'),
(70, '01/12 em 2025', 4650.00, '2025-01-14', 7, 8, 15, 24, 'ACS contratados', '2025-08-31 21:19:20', '2025-08-31 21:19:20'),
(71, '01/12 em 2025', 4500.00, '2025-02-03', 7, 8, 15, 24, 'Incentivo de Atividade Física', '2025-08-31 21:19:52', '2025-08-31 21:19:52'),
(72, '02/12 em 2025', 4650.00, '2025-02-12', 7, 8, 15, 24, 'ACS contratado', '2025-08-31 21:20:35', '2025-08-31 21:20:35'),
(73, '02/12 em 2025', 3000.00, '2025-02-26', 7, 8, 15, 24, 'Incentivo de Atividade Física', '2025-08-31 21:21:00', '2025-08-31 21:21:00'),
(74, '03/12 em 2025', 4650.00, '2025-03-12', 7, 8, 15, 24, 'ACS contratado', '2025-08-31 21:21:34', '2025-08-31 21:21:34'),
(75, '04/12 em 2025', 4650.00, '2025-04-09', 7, 8, 15, 24, 'ACS contratado', '2025-08-31 21:22:05', '2025-08-31 21:22:05'),
(76, '05/12 em 2025', 4650.00, '2025-05-09', 7, 8, 15, 24, 'ACS contratado', '2025-08-31 21:22:39', '2025-08-31 21:22:39'),
(77, '05/12 em 2025', 4500.00, '2025-05-16', 7, 8, 15, 24, 'Incentivo de Atividade Física', '2025-08-31 21:23:16', '2025-08-31 21:23:16'),
(78, '04/12 em 2025', 3000.00, '2025-05-22', 7, 8, 15, 24, 'Incentivo de Atividade Física', '2025-08-31 21:24:24', '2025-08-31 21:24:24'),
(79, '06/12 em 2025', 4650.00, '2025-06-16', 7, 8, 15, 24, 'ACS contratado', '2025-08-31 21:24:59', '2025-08-31 21:24:59'),
(80, '06/12 em 2025', 5500.00, '2025-06-20', 7, 8, 15, 24, 'Incentivo de Atividade Física', '2025-08-31 21:25:28', '2025-08-31 21:25:28'),
(81, '07/12 em 2025', 4650.00, '2025-07-16', 7, 8, 15, 24, 'ACS contratado', '2025-08-31 21:26:04', '2025-08-31 21:26:04'),
(82, '07/12 em 2025', 4500.00, '2025-07-16', 7, 8, 15, 24, 'Incentivo de Atividade Física', '2025-08-31 21:26:33', '2025-08-31 21:26:33'),
(83, '08/12 em 2025', 4650.00, '2025-08-12', 7, 8, 15, 24, 'ACS contratado', '2025-08-31 21:27:08', '2025-08-31 21:27:08'),
(84, '08/12 em 2025', 3000.00, '2025-08-12', 7, 8, 15, 24, 'Incentivo de Atividade Física', '2025-08-31 21:27:40', '2025-08-31 21:27:40'),
(85, 'Única em 2025', 24938.23, '2025-07-30', 7, 8, 15, 24, 'PSE', '2025-08-31 21:29:02', '2025-08-31 21:29:02'),
(86, 'Única em 2025', 500000.00, '2025-05-12', 7, 8, 15, 24, 'Indicação por emenda parlamentar', '2025-08-31 21:31:50', '2025-08-31 21:31:50'),
(87, '04/12 em 2025', 10477.95, '2025-04-09', 7, 8, 15, 20, NULL, '2025-08-31 21:33:19', '2025-08-31 21:33:19'),
(88, '01/12 em 2025', 10477.95, '2025-04-14', 7, 8, 15, 20, NULL, '2025-08-31 21:33:49', '2025-08-31 21:33:49'),
(89, '05/12 em 2025', 10477.95, '2025-05-09', 7, 8, 15, 20, NULL, '2025-08-31 21:34:15', '2025-08-31 21:34:15'),
(90, '02/12 em 2025', 10477.95, '2025-05-22', 7, 8, 15, 20, NULL, '2025-08-31 21:34:41', '2025-08-31 21:34:41'),
(91, '03/12 em 2025', 10477.95, '2025-05-29', 7, 8, 15, 20, NULL, '2025-08-31 21:35:22', '2025-08-31 21:35:22'),
(92, '06/12 em 2025', 10477.95, '2025-06-12', 7, 8, 15, 20, NULL, '2025-08-31 21:35:48', '2025-08-31 21:35:48'),
(93, '07/12 em 2025', 10477.95, '2025-07-14', 7, 8, 15, 20, NULL, '2025-08-31 21:36:15', '2025-08-31 21:36:15'),
(95, '08/12 em 2025', 10477.95, '2025-08-12', 7, 8, 15, 20, NULL, '2025-08-31 21:37:14', '2025-08-31 21:37:14'),
(96, '01/12 em 2025', 199227.00, '2025-01-14', 7, 8, 15, 22, NULL, '2025-08-31 21:38:14', '2025-08-31 21:38:14'),
(97, 'Única em 2025', 48000.00, '2025-01-23', 7, 8, 15, 22, NULL, '2025-08-31 21:38:41', '2025-08-31 21:38:41'),
(98, '02/12 em 2025', 199227.00, '2025-02-12', 7, 8, 15, 22, NULL, '2025-08-31 21:39:04', '2025-08-31 21:39:04'),
(99, '04/12 em 2025', 199227.00, '2025-04-09', 7, 8, 15, 22, NULL, '2025-08-31 21:39:48', '2025-08-31 21:39:48'),
(100, '03/12 em 2025', 199227.00, '2025-03-12', 7, 8, 15, 22, NULL, '2025-08-31 21:40:47', '2025-08-31 21:40:47'),
(101, '05/12 em 2025', 199227.00, '2025-05-09', 7, 8, 15, 22, NULL, '2025-08-31 21:41:19', '2025-08-31 21:41:19'),
(102, '06/12 em 2025', 199227.00, '2025-06-16', 7, 8, 15, 22, NULL, '2025-08-31 21:41:46', '2025-08-31 21:41:46'),
(103, '07/12 em 2025', 209942.00, '2025-07-14', 7, 8, 15, 22, NULL, '2025-08-31 21:42:14', '2025-08-31 21:42:14'),
(104, '08/12 em 2025', 209942.00, '2025-08-12', 7, 8, 15, 22, NULL, '2025-08-31 21:42:38', '2025-08-31 21:42:38'),
(105, 'Única em 2025', 284968.00, '2025-03-10', 7, 8, 15, 21, 'Emenda individual', '2025-08-31 21:43:30', '2025-08-31 21:43:30'),
(106, '12 em 2024', 78960.67, '2025-01-02', 7, 8, 25, 26, NULL, '2025-08-31 21:46:42', '2025-08-31 21:46:42'),
(107, '1 em 2025', 78960.67, '2025-01-31', 7, 8, 25, 26, NULL, '2025-08-31 21:47:18', '2025-08-31 21:47:18'),
(108, '2 em 2025', 73798.53, '2025-02-28', 7, 8, 25, 26, NULL, '2025-08-31 21:47:56', '2025-08-31 21:47:56'),
(109, '3 em 2025', 73140.55, '2025-04-01', 7, 8, 25, 26, NULL, '2025-08-31 21:48:22', '2025-08-31 21:48:22'),
(110, '4 em 2025', 73709.68, '2025-04-30', 7, 8, 25, 26, NULL, '2025-08-31 21:48:55', '2025-08-31 21:48:55'),
(111, '5 em 2025', 75855.50, '2025-05-30', 7, 8, 25, 26, NULL, '2025-08-31 21:49:24', '2025-08-31 21:49:24'),
(112, '6 em 2025', 75855.50, '2025-07-01', 7, 8, 25, 26, NULL, '2025-08-31 21:49:57', '2025-08-31 21:49:57'),
(113, '7 em 2025', 75855.50, '2025-07-29', 7, 8, 25, 26, NULL, '2025-08-31 21:50:27', '2025-08-31 21:50:27'),
(114, '8 em 2025', 75855.50, '2025-08-28', 7, 8, 25, 26, NULL, '2025-08-31 21:51:02', '2025-08-31 21:51:02'),
(115, '01/12 em 2025', 1089.00, '2025-06-16', 7, 8, 27, 30, NULL, '2025-08-31 21:58:06', '2025-08-31 21:58:06'),
(116, '02/12 em 2025', 1089.00, '2025-07-01', 7, 8, 27, 30, NULL, '2025-08-31 21:58:33', '2025-08-31 21:58:33'),
(117, '06/12 em 2025', 1089.00, '2025-07-09', 7, 8, 27, 30, NULL, '2025-08-31 21:59:00', '2025-08-31 21:59:00'),
(118, '03/12 em 2025', 1089.00, '2025-07-09', 7, 8, 27, 30, NULL, '2025-08-31 21:59:24', '2025-08-31 21:59:24'),
(119, '05/12 em 2025', 1089.00, '2025-07-09', 7, 8, 27, 30, NULL, '2025-08-31 21:59:47', '2025-08-31 21:59:47'),
(120, '04/12 em 2025', 1089.00, '2025-07-09', 7, 8, 27, 30, NULL, '2025-08-31 22:00:11', '2025-08-31 22:00:11'),
(121, '07/12 em 2025', 1089.00, '2025-08-04', 7, 8, 27, 30, NULL, '2025-08-31 22:01:06', '2025-08-31 22:01:06'),
(122, '08/12 em 2025', 1089.00, '2025-08-07', 7, 8, 27, 30, NULL, '2025-08-31 22:01:28', '2025-08-31 22:01:28'),
(123, '12/12 em 2024', 115.15, '2025-01-13', 7, 8, 27, 28, NULL, '2025-08-31 22:02:55', '2025-08-31 22:02:55'),
(124, '01/12 em 2025', 5835.41, '2025-01-24', 7, 8, 27, 28, NULL, '2025-08-31 22:04:17', '2025-08-31 22:04:17'),
(125, '02/12 em 2025', 5835.41, '2025-02-06', 7, 8, 27, 28, NULL, '2025-08-31 22:04:50', '2025-08-31 22:04:50'),
(126, '03/12 em 2025', 5835.41, '2025-03-06', 7, 8, 27, 28, NULL, '2025-08-31 22:05:13', '2025-08-31 22:05:13'),
(127, 'Única em 2025', 16206.78, '2025-04-01', 7, 8, 27, 28, 'Incentivo financeiro de custeio, de caráter excepcional e temporário, para o desenvolvimento da estratégia de vacinação nas escolas e de ações para atualização da caderneta de vacinação das crianças e adolescentes menores de quinze anos', '2025-08-31 22:06:33', '2025-08-31 22:06:33'),
(128, '04/12 em 2025', 5835.41, '2025-04-07', 7, 8, 27, 28, NULL, '2025-08-31 22:07:06', '2025-08-31 22:07:06'),
(129, '05/12 em 2025', 5835.41, '2025-05-16', 7, 8, 27, 28, NULL, '2025-08-31 22:07:25', '2025-08-31 22:07:25'),
(130, '06/12 em 2025', 5835.41, '2025-06-09', 7, 8, 27, 28, NULL, '2025-08-31 22:07:46', '2025-08-31 22:07:46'),
(131, '07/12 em 2025', 5835.41, '2025-07-02', 7, 8, 27, 28, NULL, '2025-08-31 22:08:15', '2025-08-31 22:08:15'),
(132, '08/12 em 2025', 5835.41, '2025-08-04', 7, 8, 27, 28, NULL, '2025-08-31 22:08:35', '2025-08-31 22:08:35'),
(133, '01/12 em 2025', 21252.00, '2025-01-24', 7, 8, 27, 29, NULL, '2025-08-31 22:09:33', '2025-08-31 22:09:33'),
(134, '02/12 em 2025', 21252.00, '2025-02-06', 7, 8, 27, 29, NULL, '2025-08-31 22:09:55', '2025-08-31 22:09:55'),
(135, '03/12 em 2025', 21252.00, '2025-03-07', 7, 8, 27, 29, NULL, '2025-08-31 22:10:14', '2025-08-31 22:10:14'),
(136, '04/12 em 2025', 21252.00, '2025-04-02', 7, 8, 27, 29, NULL, '2025-08-31 22:10:33', '2025-08-31 22:10:33'),
(137, '05/12 em 2025', 21252.00, '2025-05-16', 7, 8, 27, 29, NULL, '2025-08-31 22:11:11', '2025-08-31 22:11:11'),
(138, '06/12 em 2025', 21252.00, '2025-06-09', 7, 8, 27, 29, NULL, '2025-08-31 22:12:00', '2025-08-31 22:12:00'),
(139, '07/12 em 2025', 21252.00, '2025-07-02', 7, 8, 27, 29, NULL, '2025-08-31 22:12:25', '2025-08-31 22:12:25'),
(140, '08/12 em 2025', 21252.00, '2025-08-04', 7, 8, 27, 29, NULL, '2025-08-31 22:12:45', '2025-08-31 22:12:45'),
(142, 'PARCELA ÚNICA', 1333662.00, '2025-10-21', 7, 8, 12, 32, '', '2025-10-30 00:58:47', '2025-10-30 00:58:47'),
(143, 'Parcela 12 FB', 120000.00, '2025-10-30', 7, 8, 9, 11, '', '2025-10-30 09:35:36', '2025-10-30 09:35:36'),
(144, 'FARMACIA BASICA FEDERAL', 1000000.00, '2025-12-09', 7, 8, 9, 10, '', '2025-12-09 12:26:36', '2025-12-09 12:26:36');

-- --------------------------------------------------------

--
-- Estrutura para tabela `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('0h7TTvtycHBe66ArNFf5DLROp8q2cJO5r7ZdaDWO', NULL, '44.251.94.206', 'Mozilla/5.0 (compatible; wpbot/1.4; +https://forms.gle/ajBaxygz9jSR8p8G9)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidXVac0FhUkhPN3c5Y3JaeGt2dW05NThXVzFpUXVhTGhSZHBzQzgyMSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768420705),
('0j2OXyy86eOwpLZehv7Bk83yXG6l9hawSCsrpkiQ', NULL, '51.68.236.68', 'Mozilla/5.0 (compatible; MJ12bot/v2.0.4; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSElFWVlHTlF2a1A5c3RMcEIwNmNJREN4eElqUEZhcU9zeEE1UEpEMCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768177146),
('0jGTpZvjGkvIaSe7l1NqX6Te2RclBHZ3Bc6Ts65k', NULL, '162.142.125.42', 'Mozilla/5.0 (compatible; CensysInspect/1.1; +https://about.censys.io/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSWJMTWZXQ3U4OWZFcHBzUHgzcUFiQUtLZWZXajBrcWxmNjJmb3FuVCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768043863),
('1UYIsTRrNmnazlPfLFIAedoNvYnZ6AgxmJdQ2CIV', NULL, '5.133.192.187', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibGsxRmJkVGpxemJhdVhkUk5wNlptNzRPUHV6UGZKUmdTMnFoSlBBQSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767734132),
('2hv4GhXpoXhkPUjruGWOrh8iBAVE0GD3KFCcwk2B', NULL, '69.160.160.52', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Nicecrawler/1.1; +http://www.nicecrawler.com/) Chrome/90.0.4430.97 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYTlBVENxeFkya2RwVWZDb3Z4Q1kyZG1MOGlEcGl0WEJPUkZTQm1rWSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768384107),
('2yiYPszGlDROc5lLqvfeHYnhF6VZfaflf0bH0Nq7', NULL, '104.23.239.123', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoickt3cUtFd283dlBVWkdvcU93bWowT0d2QUU0WlZFMjlSYWI1MVZGViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768387409),
('3GMMRjWPXMaWb1aVEeGH3CiQ9HB2zfPJ4Dxe82Qn', NULL, '93.158.91.247', 'Mozilla/5.0 (Linux; U; Android 13; sk-sk; Xiaomi 11T Pro Build/TKQ1.220829.002) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/112.0.5615.136 Mobile Safari/537.36 XiaoMi/MiuiBrowser/14.4.0-g', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUDZMZkYxd05aOFdXRGdUM1E0dHoxdjRONnU5UEFGS2sxbm9kdGJKUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768213648),
('3KgGcTxAi1LUrMY7glAc6BQL8VLxotGzgq4XV4gM', NULL, '54.39.203.101', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicnR4ZlRyWjUxQXVBMnQ0U2hJZ2l4VWJHTENZRFZxNktBb3ROZGpnRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767830757),
('3XyqbFPNx3wpCkd8PqT3mhMQ9pVHucqnCE5xivpK', NULL, '51.68.111.244', 'Mozilla/5.0 (compatible; MJ12bot/v2.0.4; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQmg3N1Nzc0VpaFd0eW90OExoWEZjM1VYR09vRGtFaWJ6WnJyV0drTCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767881118),
('5ghFxXXTccCRecUDUNmhnv0ogL8ITmStAdIJayei', NULL, '93.158.90.143', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.2 Mobile/15E148 Safari/604', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQW9WUUZtZHFtdFZPZVJ6MzZUdmtPM3VaSTRROTQxMmNDTFpoZjlIUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1767931523),
('5uz6IY7I3orjxLv5n8BlKn1XgPEMNIr1m2lqzscE', NULL, '143.198.7.28', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNTl1aFZYRncwQWJmT3dZenNTelpnOG1uR29xN3lJM0xvS3JVR1FoSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768507974),
('71YxFy43j1hs5H4p2ho5XhUAKCcLdJNZMb09SiNy', NULL, '3.237.42.129', 'okhttp/5.3.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiemV4QUpCdzdNOGY5ejZTNzI3cnpxSGNsSWh6VURrVmJETHk4MlpzZCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768027997),
('77moGb4Of9nm2xDWZCBuASCzOthMCXxQKf0kHG5n', NULL, '157.245.116.137', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSkdPSFZhUk5ad1BMeXQxUUVtN1BtYU40TnlwalJqNDFoanBJN1YzcyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768328696),
('7A0Mf4K9KJZv8Ds6QIEkZmY51knOwyrxkJloiMx4', NULL, '91.231.89.97', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:134.0) Gecko/20100101 Firefox/134.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiM2FzRG9ZNDhLNjI2YUY0dTBNTUV3ZE4wYjd2dTlJVTVkRkdKcm52biI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768553400),
('7qGe7ERZdrwtF2SrSXhH0D0vs7L4EV62cqXZjYL0', NULL, '45.79.163.134', 'Mozilla/5.0 (compatible; SaaSBrowserBot/1.0; +https://saasbrowser.com/bot)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibEdKc3ZVUnc4YTd5UGVEWnBLWEVlbERMN1JOZGUzWWt0R3ZnQk1YRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768217838),
('8SoMW9eA5Dm2j7oPJcY38UyWZm3j0Yi77uAJh9Hf', NULL, '93.158.91.249', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Viewer/99.9.8853.8', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVUFCell1djFRcnZDb2x2UnlrRHJUcWt2WjFkQ3ZXUEVGSG9heUZmayI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1767687903),
('9XTQiJ5KjAHqglLvk6lqSj0mpiHis3DVM43itSDD', NULL, '216.73.216.170', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVmh6YXkyQ0JxMU4wbGQ2ckxLZU1PRWpIMVdicGt6eWFYVDB4bVk2RSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768445620),
('Abzf97YcBALRDcqT3rANgAj84LzusT4dunIl4CNF', NULL, '93.158.90.69', 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.3', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidzlZQjI3WXdlWGY4MkJPUmk4UUgyQjd0N0I2MEMxdHNYdFdvOWlNeCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768174487),
('aD7HlRiET6sqz5HsOVbQzxtaCVLDnpS6cp5sHO9X', NULL, '142.44.220.32', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZkt2Rk9LWDRYcXRXUmF6SGVzbndPcmZJaXJmdkhSS1M3Y3h0Nm9SeCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768158739),
('AdnzxEblAViSRv76qf49WBjePqN4r6Oddv5CiSIL', NULL, '93.158.91.244', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.3', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidmU2RGpFamdVaXhrTXljV29ERzhxREZOWUdJUXliOEN6M1NpY2NaRyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1767977961),
('agPJ5KRXV6yKQS8su5MIaQpT3Gzp8UlnoHRRlRRH', NULL, '181.214.165.96', 'Mozilla/5.0 (X11; Linux x86_64; rv:103.0) Gecko/20100101 Firefox/103.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVFhnT05tc0JYMHpUYlZLZmxMU091M05pYzhJUzhubUN2eENFRUpPZiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768366519),
('AgPyQRwEW9rIkqKYsy9vaiQmmKjbnu68sEK374ze', NULL, '104.218.55.248', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZVEydnBheEVoY2lZMGNBZkJwQlN6aUZMUzBNNTNPaTRXVlNPdXFlRSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767812725),
('AJPOPZZaqrUGLD4urTxc57Ul4HKgn8LcZmTbju8v', NULL, '185.12.250.104', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoid0xzY1BycmsweUYzOVltczE0cDI4WUdJR0hqRzRmbk1aODFWaVAybSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1767734132),
('AssIf0dLl3L4im1qjOu4K1cL1d2ghQxitZcwasMT', NULL, '51.68.111.218', 'Mozilla/5.0 (compatible; MJ12bot/v2.0.4; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWmJCSVZRalo1Q3cweldyWkNpM3FseG9pYWx3RkJHSkdzWXllY2VTYSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768554082),
('AuI9xG4NIlHtreEphJzdmaHIxwPQdVyzudOblW4j', 1, '189.89.61.50', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoibTNMR2dLY0I4UjNxMFBOY2JldnI1dG1idUJUbExMRTdacldSVEpjSCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6Mjk6Imh0dHBzOi8vc2lzZ2VycC5jb20vZGFzaGJvYXJkIjtzOjU6InJvdXRlIjtzOjk6ImRhc2hib2FyZCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjE7fQ==', 1768584554),
('aWSdfY4XffM4aX9kE35Yce7rliqOXYV3euUvYbL7', NULL, '51.68.111.204', 'Mozilla/5.0 (compatible; MJ12bot/v2.0.4; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiM2JsUUhBVllvclNSZWJ1YTFLdnBJeWF3Z2lTQ090aUhaMWF3YWxLUCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768496337),
('B2iUawCmjdnXCgt9pvcJ1JhYlfR7YRwybE2yMDiB', NULL, '3.87.61.71', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/138.0.7204.23 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWDJES1R5ajVDZUxHMEtKQ3NaSGQwTW5WcmdHYXJnVlBrNVk4cU9tTSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768028015),
('BgBALDJmPEvNttyrd2GNfdg4bG9Q8Lxci6tPpZlS', NULL, '192.178.6.1', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieGs0T0FUV1lKSnBBVU40a3VFY2ZFdjNIT3RKV1h0YzUwRU8wODgzbiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767982666),
('BoLvT5FZX2tWd2esCpeB7Iqs4rzEkKunaqYU6yoI', NULL, '54.39.89.141', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN2NWZ2ZMcDJBb1FOQ0o0QUF5b1VyV2ZzS21mVm9vOTVxYmxRUldzTiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768232119),
('bQRoH8Fyg9N4TzlLb5twfFtewUAjitGTBIC9yJgd', NULL, '66.249.72.36', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZnRZWVZUWVI1OFZ0QjJYTlF4YUNmanRDdHU3TDA2SG1hMUs1TzJPdyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768586895),
('bs8tl9mmwa16LBXXaFwmBBaj3V39jxddDo8m5SVt', NULL, '192.178.6.10', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUkNCN3JacFhRWk54YVZTWlVIOTlLaVVDbGxJQzNXaDh4WDliTk9iNSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767982665),
('c6v6oAYaUkuCw2fcC2a3rdQw5NTVbf6obOcw5rtU', NULL, '40.77.167.23', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiR0NvSDRxR2JYUUtXcDFtaXZDQ2hoYkZWcDVqQ3lLVnFvMUpmN1NoUyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768232080),
('c9A5OxldDZETfHRm9AfVqIgxIYg4wArSKQzOt056', NULL, '162.142.125.41', 'Mozilla/5.0 (compatible; CensysInspect/1.1; +https://about.censys.io/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZGRyNEsxMmVKRTRoRXdXVEJXTTI3TWtsNVhpOUl3cUxnVTFFN0x2TiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768210399),
('cE81MdNpd8dWmAn8O6h4QU64EPkRzphsWGM9a1wn', NULL, '43.135.142.7', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSHRyUWNzNGFnNk1yVHN0cFkycjByVnROa0E5TTVPaTNBN002R2FUSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767658838),
('CMUe6Q5aQNpDEFPV0vy41Tz230q0VOcjrqjiKYvs', NULL, '93.158.92.13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.3', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNmxkUnhMOHFBWVBVT2hKMWRYM1VQcjRhaWg2amhDMFZqTEJyQXJHZyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767977962),
('CoAno2ZZMFJAEdjRDQgrNVPajN4WPJV5DcbZExs1', NULL, '44.213.118.28', 'python-requests/2.32.5', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiTDMzZFJ5Nmg5cHZjbzkxWWxYaGE3UlZ5bWJqWVJJa3ljbTYyTkprRSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767763724),
('cpy2FIhr1Fkh6l1WonAK90N8GThypksZwf5m61EZ', NULL, '66.249.72.36', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN2ZSNDQ2dG5XUHBLUEsxbmNSZW1mcUMxZjJGZ1hUeGZPVXFPc1B4bCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768586894),
('CrxXDkcEIHyqXkbfgkH02hD5LN8RY4RSjwsRN3PC', NULL, '51.75.162.143', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRERsOWlRN3BMb1RreUpqOWg3SjM3RE92ZTZQbE9WU0JiQjlBYWZGaiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768206734),
('cxcY519krT9E6AU2jed82SKGk8VtZHEglWZKVBRY', NULL, '147.182.153.3', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYUJtSDAwTEhSeGtXUzNDaXZQY2pYc3pwM3JZanl1SG5Rb2pnUUlLcCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768163887),
('dBRHpcAmMJCU9v7t4wBT3CIpVCw5VKt5aIxKeDkj', NULL, '93.158.70.111', 'Mozilla/5.0 (Android 14; Mobile; rv:123.0) Gecko/123.0 Firefox/123', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibjhnQlFqbmxvYTltMkdKc2YyV05JTXZzNHJhU1pUakYyRXo5RjhZSCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768450020),
('dLSmVZ55q3PNMe6gr3CgRquwniMxxB0FSKa7De3E', NULL, '192.36.109.127', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.2 Mobile/15E148 Safari/604', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNGdpbjJqVWNrNmlNR3ZSSUxKZFZscHRlOG93eFE2dng1eE4xdXRPMCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767647471),
('Ea11ZlgvQh4lQWO1pPdKnF8A0HTgIe4bT7ZpZMVQ', NULL, '82.223.68.204', 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiOFJpTzZtUlBQd2prTld6QmQ0bnQ5eUtLc2lhMjJsYVhhQlduWmp3diI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1768026975),
('eBLwFbjyrwqKGWVHRldFYRySRgCL40TWCmcrnM50', NULL, '51.222.168.77', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieWVNdU5SU3J1V040WGhLbENqaTNqeGJXVTRRU2daVG53M2hYYld6QiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768557382),
('EeoWoCtOhDKxqxitOKuO1TkGJIVqnAL46eFkBnen', NULL, '34.242.170.68', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQ0ZmczNDbmtLbmxMZnpnQ3lqT1FvQnRpWEVhS2t4UEpKNzJoQ0s3MCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767630207),
('eIllk9kstbbOeeUarIkJtjTp1eNjiZ2JiXJXPAUT', NULL, '74.7.243.216', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.3; +https://openai.com/gptbot)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiS0lBWnVvRDh5bUQ2ZWN3bnZYdmd0aDJTQ2pSZW8wYVNYeUNibUlKMSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767961443),
('ESXXdjCHgMLDN5Gg9RQVaqSV3fshIio5ABM6LFeJ', NULL, '52.167.144.202', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV0puVXVnUnBmcm9PZURnU25xbmF2dTZneEF5UVp4UkRCVFVJWnU4biI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768586070),
('Ev4wQJ1tHbnhiOrFxMPQUa93crozTOFWAO2nWW3h', NULL, '5.9.94.125', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVlhtN09rT290OGV4bTVpM3RSQTFjdmFGSnNsVFBPc29hbjVPWEEwWiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767985663),
('ezFBjSnYw9Lod10jnXIw0GCQzjVsAhIk002JVTWG', NULL, '192.178.6.1', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiM0hLTmFsOUJuSWJzVVRJbWtkSXUzNWZGS3kwM05pV2oxazlGc2d0ViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767982668),
('ezhIEfLhkz78x1ZEXTjd0TB8V0iGlGmBgMzh8Zmu', NULL, '5.9.94.125', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYWRtSE83MWFReEFhWXF1Y0lvS3ZkSnV6eFU2dzdYblhxS05TeWE2NCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767985664),
('EZoiSq2POibvhhF58scVlG9PIClNGg9PdEAhavWG', NULL, '167.71.64.44', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiektCSGpjYlZBeEFtMzdMdHlOMktwWlNUdGkwZUM0NXZvdnRtTGR4MyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767637141),
('F6fPfIy55hdE0hZoB2wCOvD0KLL4fkAMnwWHNAIi', NULL, '51.75.162.143', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT3g1OXlrVmxvNEdyaGJiR0NPaWVGdEplRHR1dWFuVU1ybm5rVE5HaSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768206735),
('F6yUZJ5Fvlw4I7ubp0W4tSKkl70mGb5njcCkX6Ax', NULL, '199.244.88.219', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQlRQM0ZxM1F0cjBTbnBMeXE1WDNWbERwQ2paZ0QyOVQyaVhOT3FvTCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767873192),
('fgKQ9yzoAvrzhnPy1a9Mc8nPQtyjLNTjckY48cV4', NULL, '34.242.170.68', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTk5laXF6OWt5WWU5UEE0aDJWVEdZOEVaaVB5cWQxZjFHb2k5b3RVbyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767630208),
('fjpXNATF3TlxYSWYVccc6f3scJnLAcAzsyzREf69', NULL, '60.188.57.0', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWU82V3hERlEzREt4clNMR1kzRHFMVklUYzR6N3hzWEsxeWZJQ0Y4YyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767630006),
('fjrgGG9C72IAQl5uZZPY63bZJz4EPDcZ4CFCEMUd', NULL, '43.157.188.74', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUHdxbDQ0VmJNQTlydWhkSkhISUJsMHg4ZGdCWE0xcjdac1JnbDBxbiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767666709),
('fwlVAmDlamAci2JhjwxTPmnkvch0oiN0JaoQVvAz', NULL, '66.249.72.36', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.192 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMU5vckpQWmQyYmIwclhxM3dBeWVwODhWRHduYWdFclpXbjU5TkRLQiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768586838),
('g7OAaXVGQ5XQQvVvKCOtSuQXqs6an9DtruVuXbXg', NULL, '15.204.161.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicTFLM3VGQzRzYXdSanJNUEFRSUR2YkhidTdvYlhoMmRjT09jdzZiQiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768240500),
('gyGEtNTOAaKrHpP3HxN1TbTDxPpLS7inIZv7iyQD', NULL, '40.77.167.4', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVTNRbEpPOGI1RklQeGhad1lhaHRKalByQnVDN3VSSXdzM2ZVR254diI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1767649068),
('hcfsUp0szqWO0HtiyEssHnSaObyMcytOH0AwIOws', NULL, '49.51.195.195', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWGZOUTBxMDdmOVBLbVhkbUFmSHdyaEZkWnZEUThiNVp3aHdXV1AwUCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767644191),
('hI1seG8xkiXTCxz9ewpg5ZxodYEy50TFVwtBhM5d', NULL, '106.119.167.146', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiR1RpRkM5ZlBiTklqc016bmQ3VHp6WHd6V2NWMklyeFd3YVZHbnJ5aSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767651905),
('hJESUPiXDGG8EVZ8InudICILmrNYVYk1faQALh3l', NULL, '149.56.30.69', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.34', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidUd3STJoclFvUkxqU2pick1saFo3N3hXSnREbGdaUkhjR1pqZUJkQSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768423396),
('hp65tmmdfRg1kYEcOwKqVcdpLH8SPRvXjNiDJnaE', NULL, '34.242.170.68', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiRzJaZ1dYSGFxMFVteVlsSVN2UGtSS0xGc3lSNVJndm4wYVltSjBIRSI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767630206),
('HPanUCmPHQSkpOXx8QUmAyy7lr8oPWdUDmrbK1AY', NULL, '54.37.252.59', 'Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiclRCYXRmWm03dFlVVXMwcWZVRmx2aHE5bkhhaEVmc1JQNjdMVkhnYiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768395621),
('IAvrUBbF9IHbmbmRQO6VPRvtMrCiwzDqRJFMTGH1', NULL, '54.39.6.205', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV05kU0wzOThYVHFJcFhHd2RBeVo4SVE2dTNuY25VOWVjOUVrMHVGNCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767990671),
('IIpeJkHoUcsilRb1YwJUMiWndkGLrMtSVdJdkrvO', NULL, '170.80.177.83', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibnRueDl6c1lSNEVSWjEzREZzRERNUUx3MTJGNFl1eGxpMUJXQXZoUSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768571812),
('ikOnx1sy0xDYDw6ZKvd9pLCgn4FGTpcn2BTovlTU', NULL, '51.68.111.244', 'Mozilla/5.0 (compatible; MJ12bot/v2.0.4; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiM2ZnVzNndXdqcHBCbUc1akxvQjZib01EMlJJaUo5T0dVUE5selJKYSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767881116),
('ioaVXtaC6dnP96jULfwgPqPtjK3z7lcedQfBcieX', NULL, '66.249.77.233', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieWI4dGgzZ3B0N1ByM1hzdzNNT0ttU2s2NmgxUkVPZUZYaUtZV1FjSCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768241425),
('IXGY8bWbSgYUODZMu2NkvfRrqaZqQZ7qwFLEW326', NULL, '5.133.192.87', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUFNmUFoyT01vTVNKQjVUSWJoNUowZUFuU0ZwWm9NWXZnbzQ1RkdmeiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767740337),
('j1cjdHZhHNdiEGxwS6lr8HulxzJTs0aKeXDh5Zjx', NULL, '198.235.24.145', '', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidFM0dzJibFRtM0ZnZWdkdmpERW5DaE5NTmo2RG1vTDhBUGJoV2dmYiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767640746),
('jBg4sfYqd1kBZidzSiaYKTp9Esd5jsC8sW2zBCF3', NULL, '93.123.109.182', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQUFDOVI4Y2lFWllEMFY5cVU5U1hnV2Ixa096VUNwRkpibHhCVHZ2QSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767802001),
('JBMidpJDMJju2DCpKUVtz0e74kMpFrQPXLt7Io9L', NULL, '47.82.15.128', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYzlrNmdyNUNZSVlaNmtKbm9nb2lhQ0daaGd2SFNscjJGNUc5NGtOUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768334836),
('jxB277rFWIycJ9eCwOR4EAc0JAMC9ZjIdLu5Wwpg', NULL, '146.190.245.115', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQkJpSDY5NXkwMUV3TWlvV3RHdVJocVQxOFVOVjNyUFJma3dDeXR5dSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767990375),
('kA2d6jcyladA1HXvlfXwfp6rdAQtWtoVrX0rh8R3', NULL, '93.158.127.79', 'Mozilla/5.0 (Android 14; Mobile; rv:123.0) Gecko/123.0 Firefox/123', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieFBNcmRCVWJPR3Rxa0I4c2ZGRHlEeTRyVU5jMm5SeWJCYzJzd2JVZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768450021),
('KFEefNgMqTMGU6q9EYthG9N3awRn5J25ceOmrAGt', NULL, '149.56.30.69', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.5481.178 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOW1HVGFWbzZocXBGQ3hGNzBKYlZ6elc4bVg4RXpObHk5NVFvdmxCRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768375495),
('kNqPMTSx24svHhAfS7XUP4kFA0vTEwaiVIQOrQj8', NULL, '34.242.170.68', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiOUMwSDRRYm5HZTVQNWFMbDR4TVYxNEJGVW9RamM2Y1k3VmVNTkN3ciI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767630207),
('l2uooGO8dShXyimLFWuDJ0favxiPHpU1TSjd9oK2', NULL, '192.36.109.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Agency/93.8.2357.5', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRUVKQjE3RHBlbWRoaW5NTmNJcnR0UFJvTHVvdktSblp3Nlo1aE1sSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768397983),
('lGLrA89GHKK1HhOBdIwHbcoE9ycRdFeCViF3gk1C', NULL, '34.242.170.68', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMnk1azlBWDQ4RUNCcUp5cmNJTkxBN1RyaWcxeGJxcWVoNmMzbUxvUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767630208),
('LpbgiNv5xujWkMQoiE3A9YEv7RXMifeeBIiyso66', NULL, '157.230.215.79', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.4 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOWFyYlZQV21TWTNZMWh6dTZwamR2VlBtaGVUc3NyZXdJWWEzOUpiayI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767828306),
('LQGNscUiTlMcv0vup7dWNIQVhcBjL8XLySUavMho', NULL, '138.199.142.70', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiU3NNZ2hxOEpBRE1hdWNaYnhqb0hjV3JwQlh2MzFGSm9rdktRVXlRRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767756286),
('lVFRRD4Pi0whgCAuNiEPmG9N3lvdnItgdXCYuO2G', NULL, '93.158.91.235', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Viewer/99.9.8853.8', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidFk0eFlBOVFiN2YzYmtsQ0pkUHZySUg3VEtmY2xadGRoWkVvNFJkUCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767687903),
('m9jVQTBHg7oWKSIuhApW3dqIuxymXiovYDGXzdXL', NULL, '54.39.136.214', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieFBYSWd3ZjVucXNNaXZPVzdValJYZWtJaVF0Zm43M0FCdWFpa3piRyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768470702),
('MM4Btllq4WPzWVaSHqpKf4vLAfX5Xu7iRxdyKBRc', NULL, '192.178.6.10', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRU9LMlVxMGdkdEZYV3NYTWxPTEl5dWRJcG1pVlJQYWY2TFI3cmhtZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767982667),
('mMnWq6pztYd9lcKLkBdaQ4BaTyPm2JxexMfRNp7q', NULL, '34.242.170.68', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoibkpqTGZGMEE4NU1ZT29JSkl3d3REcWEyV3ppMWd6RElPWUY2d0EySCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767630207),
('MTJ6Prcfm3F0QZT0VfvlzQrMjcJz9GUYkjEC8DUr', NULL, '74.7.242.14', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.3; +https://openai.com/gptbot)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVFEwWjRPdTVUcTVOQnZIRzlmMURMdnRrRkp2ZjZsb01MZ0VyZE1RaiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767757673),
('mwiqkrQdIqcsQwRwnLZToUKPXf7sdbVFZqj8EPBp', NULL, '51.68.111.218', 'Mozilla/5.0 (compatible; MJ12bot/v2.0.4; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUGduczlhSzJ3V1BHSnY3b3NoSFNQTVN4d2RjRlRsRkJXZDFMY29wWCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768554083),
('N263P8zHc7MrJcke3NdfX29hWwZjHVa4lrVzIVLz', NULL, '54.39.203.129', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRFVGbXF1dVRTUVdiOXNBVzhUbEtiVnlTZ245WkRxaXNwUUN6TkF0QyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767910186),
('NheXFfAHGwfeocH9sUpTVIbbMOzlM03MAKHGpjbG', NULL, '69.160.160.52', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/80.0.3987.132 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQjRzTkdidWlWZzIxaVd1M1A2U3BBZlR6aVE4Z2k1R2lnbER5SW8wNCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768384114),
('NwCy04HqGOYztIjSDcfy0KelmRFx7fcnajAyqLwv', NULL, '43.157.43.147', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVkxGOHBJNXJmbWFQWWcwNXR6UlZ2U05xMkdYTkNGZHN6SWJEcEFmUSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767637210),
('O55pGKwORV8fiWAXHO1sJPL2AVXzeePVa3VyEzrT', NULL, '192.178.6.10', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.169 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieU9rOUpYQ0h3cG1CQWlMVGhNdGJDNlhhUnJRZUpBaDNTUmJ3TEo3WSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767982656),
('OcR3FPpObjn8SlKZlDetLo878e0DHRYlABYiX52C', NULL, '43.130.34.74', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMVdLY3YxempQcllweFJnNXlMT3pONFpDWDhPd1N4cEx1eENpdUp6RyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767682249),
('OQwfsY1LumLDE54nL08gpqOxlDPol9QisaWdLSH2', NULL, '142.44.233.109', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWElBTzNLTzFwbDBZZ2QzamV2TjR0bkRVZWhQNTB0b3lDZHp5WHJJWiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768073615),
('oUhRU3eoktpdwhVUWtPRba6PUHMkodUmWU1AM4PE', NULL, '51.68.111.204', 'Mozilla/5.0 (compatible; MJ12bot/v2.0.4; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiU0w2QXRFTGY0Mmx5OWtFbE1Oc08zc2xISWhoQ3ZRaGNFTWFXc0x6QyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767763614),
('piqpWWLCjk63BaJfERYPdLoxFwcw3v4MeQwhbB27', NULL, '216.73.216.170', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYkhjRlFkdG1nbllHV29kWXlzVW04elNIb3ppd3B0TzllQ0h5bk9lRSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768439033),
('PnBOF9f5kGkq6RsDTK0J7WjzW1ydV6U0DkbV8dg6', NULL, '93.158.91.254', 'Mozilla/5.0 (Linux; U; Android 13; sk-sk; Xiaomi 11T Pro Build/TKQ1.220829.002) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/112.0.5615.136 Mobile Safari/537.36 XiaoMi/MiuiBrowser/14.4.0-g', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOUpubXA1aVU3VDRHWW1sUUxCUWthSUh1MkpERGpqdDd3N3NsUUFxWCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768213647),
('qD3v3a654EdDUHsNNUBHFkmcdHk3I748wXaLTT7d', NULL, '34.242.170.68', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36', 'YToyOntzOjY6Il90b2tlbiI7czo0MDoiMnR1cVdwMmNGOHZWSzM3eFRUdmp5R2g1TzNpWDI2RklCUXJQYmdoQiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1767630207),
('qJAAXTdf2lFqdnl8loWANY9PS7P5YJpXIKTNvng8', NULL, '40.77.167.158', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiazEwNXd5WUZKZWdralFFWUx4d0J4TGdya2dwTWY2Szg2VTJvVUFETSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767886553),
('qnA8uovfvYjHKGZ0uNHqoxeG8AYtxf4VjioGaWyC', NULL, '51.68.111.204', 'Mozilla/5.0 (compatible; MJ12bot/v2.0.4; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQzBwQkdPUXR3UXdvb3h4MkpyMUZiOUFBdTNYUVBYREdTb3VJMkpsOCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767763612),
('qTWBvQzOat8aKPCTsPNruDzaHjsPoo5gLTm1tgpc', NULL, '93.158.92.13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Viewer/99.9.8853.8', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTDlUOFFOc3ZRcHpzTmZWS0ZzRHlIbVl4SjVzZVc5UlpHbHpWNFRXVCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767687904),
('r6QbJmcfmPLZbAeGogBBFCOc9Q2Yn7i5qbC9xwEQ', NULL, '198.13.158.128', 'Mozilla/5.0 (compatible; IndustryFetcher/3.0)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOEN1NDZBZ2FHVUJhdVhkeTU5Qm1lS29rSGZEUVpZcVJyRHgzRG1SUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768323491),
('r7VdAz85VlvuNmxPyGNNVifV9Mwz773vhGth84mr', NULL, '170.62.100.244', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicGJ0bW93WG9BREp0NllwMWJOb25PSWJsR08yUU13bzZ2Z0NtYWFveSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768551176),
('rAD6dYINKaSvuvra2VJVZnhrB3SI49bqOBjrqV1I', NULL, '91.98.178.15', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRmk1T2VyYWI3MWllT1YyYmJKVFNiUW9yZWV3alRRSGx6TEExUEtxRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767753131),
('rCCIAxgMXr29F59b3N6GACCyBuAJSZ080EsYp39m', NULL, '104.223.85.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZE1QZlluMFhaQlpZRHZCeldGaDBiMHlaTDJsMERZZXdBQVNzT3lTeSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767945701),
('RhUkPa9AiQoNZ7YBgyW5KQqQEiroRFBlficg88Io', NULL, '93.158.90.151', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.2 Mobile/15E148 Safari/604', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiazY3V1VTMUNnVUlpMEhrYjhLU0pRcmVaSGpKQ3FybVdlc2JnR3FYRSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767931522),
('RqKizf0C2pC4uYyONWjiv0Y6uZaBd1ktsfJwXEfK', NULL, '15.204.161.7', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVnZYY25MU1NZeU1NbndNR0Z0SUc2YlJ0NkZiZkhwQklqcDdPTmJ4TCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768237984),
('S2XJCq2Xrlqfk1YW3F0lWfYYqITbE9Cb4Hkw6GFE', NULL, '51.161.65.138', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSm1SN2RncU9pTnZnbkJCUHJtUTd4SjhBdFIyMEpHcGtoUjAzTkxobyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768390253),
('S75kln9lMxJDcAAVsWWMiuHsT8nzRlU09M8RGixj', NULL, '192.36.109.90', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Agency/93.8.2357.5', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoielMyY2lLVXh2Wk1oUmR3TmFnNDhhZjl0dkVnZnI0T0ZZNHFFNm43VCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768397982),
('SDooUT1tQT1zwOLrYiaLyZUSG5PNBPHWlf1BGPmt', NULL, '66.249.77.233', 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.169 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWEZ0VmptUmlJdGNYcUlrM0FxRGRDekFydlBPMkxJMWc2MmNBbURaRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768241413),
('sqXYumVF4wvjyXki8UD9pEVxvO0XiEzX2bhccGUr', NULL, '5.133.192.203', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTVJQZkxlQmZCZ1RDS2llOVc0a2tZWUFGcEppYUhkeHplRjNyRXRXaCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767734131),
('sY0dTxEoPTdPllOBJ9g3Dk51XX9c3rCYbwKTHEU0', NULL, '180.75.241.26', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV3lVSzE5VDVscTdyWXlHTGhiR2ZLb1g0N0xnbDBwb3lJM3J3MnpqSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768571814);
INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('T6zSkjmd6JcE70ZUVT3EH8EiGPNg3Ct13asbX5pR', NULL, '68.183.202.24', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSDFNR2JVcEU1dnFOY25ZQ2pnWDQ3aG50bnJZcnQydmhSckphb28yUCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768587478),
('tHb360DcZlpIn6p36JYZb11GN5h2qZjDqGPk3Dlt', NULL, '93.158.91.235', 'Mozilla/5.0 (Linux; U; Android 13; sk-sk; Xiaomi 11T Pro Build/TKQ1.220829.002) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/112.0.5615.136 Mobile Safari/537.36 XiaoMi/MiuiBrowser/14.4.0-g', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoid0pBZk5kdVVOR2txZ2d6OWNKcDI4UEhkRWF0Q0lyNnFoVDd4OTZNUyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768213646),
('tOniN4A9GJ4Q1yaleluydJOPuvifDvTIDjV96kuF', NULL, '69.160.160.52', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiY0NJZHhOa1hieGtTYjFDOWROVm9vSVlzaHRvck1MQWxEM3djOVdGUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768384119),
('Tsx4kTqcCKlLnbNzle57BDOmKQ3uMHGMMH56Rn7r', NULL, '104.223.85.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSUhubkJ3T1EyT21heFBMVmhwNjdyVzdnMDdDVnVsQ3QzTXlwZ3ZBNSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767945701),
('um0qBzi1A3aiaiZTVVYaKX6rQOItqB8wcS2JBwZ7', NULL, '51.68.111.204', 'Mozilla/5.0 (compatible; MJ12bot/v2.0.4; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVGRaYXBONE9HTG51SW5LaDJucTNPejNMMzRBeFp1ellwZjRCWjNoQiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768496335),
('UWZumTQSKQ7bfzmYHy2bGIA8b7fXNltp5FYHtEIJ', NULL, '192.36.109.117', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Agency/93.8.2357.5', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRVgwNjNITlZzNWZOOWtPVjNxbGNDeFlIMmVVemM2NDBKM29rMUVjZiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768397983),
('VA29aVyanE3sdTJDGpfGxMHrIsPYgSC6GslDG0Ks', NULL, '109.172.93.99', 'Mozilla/5.0 (X11; Linux x86_64) Chrome/19.0.1084.9 Safari/536.5', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRUlHVEdidkF1Qnozak1tNmNqcjA2WGVFZHRRaTJTRWlENnR4bVhNcCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768188308),
('vBpBtMFpUhnVcLxntwudth7hYM1ShHtXdjmw99H4', NULL, '15.235.96.141', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNUZPWWV3Q0d1Tm9UblVlUHJWS29WMGk2VENJeGxhR1J4b3BvU2lsUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767752103),
('vhC7v2WWl3nzXWJBrJmViBrKnqZugHLDKJueAZfQ', NULL, '34.127.78.175', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4240.193 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaWtzTWF4TFZqVGl1eU4zdDZ5VTUyTEdodUJQVnFrNmJpQWtBUXR0SiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767857857),
('vJunWrFnWisYuLWtg7zWXR8p1NELjhgYvfD62RXW', NULL, '51.68.236.68', 'Mozilla/5.0 (compatible; MJ12bot/v2.0.4; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQWZ5ZEFCQXFnQmlSbndyYWZ2SVBLWElyZjJISk8zZHQ5Rko0ejdyTSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768177144),
('vW5yVuRoZm7FiAWUC71qDPR7a6yzEOyN6cuSEhAE', NULL, '69.160.160.52', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRkZOeGJwMm5XUUhnTjc0cEdDWmpBSk1SdXFKWW5neDNkMTlnU1dUSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768384121),
('w22wX4k8x0haFwkcWPD8sHAN0ocIjc879eYXdpaP', NULL, '8.160.38.193', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOUQ2YnVIaTBUT2RlS2dSOHBybFR0eklENHdyNXFWaW9LdURJc2ZyTyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjU6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9naW4iO3M6NToicm91dGUiO3M6NToibG9naW4iO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1768522268),
('Wbt69LNUNDU5EyoQXJoZDP8GLqQGoq2P26ssbVLo', NULL, '54.39.210.153', 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMEdnbjBCa1h5aWs5SFNlM3BuR0p6TUtnSkFSOUxIRGtacWhmc1pqdyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768316340),
('x56ble7LOhEjQjeJGfKBP8XXe7wumR2zCPitpbG7', NULL, '66.249.77.233', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibzYxb0dvbFYydjZrZDY5bFFxNlVzM2FwV2JMOG5FU0VDa3I4YXdrZCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768241425),
('x6npTaP5ARVSD9J8jXiXX2rwO6JymFq0AZgdrrL5', NULL, '123.187.240.242', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWm5TOHJYS0pYaDI2bGVrb09kY0k4S1R2dkk1R3RJSjZkbUZqTThDWiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767673469),
('xjyxYMMAMmKabl5oJAdiEoy5eHYbfc0ZI8rvvMom', NULL, '150.109.46.88', 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoia2dSTXhZVDRUYVNJTnB5UDdTOEt5Nzk1aWs1OVByVlJ0NEJGN2ZWciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767689652),
('xuaQNOXNAMgDzjsh9wTIfXVyBzRIF79DhQapqOB7', NULL, '93.158.91.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.3', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTUdEMDlJaFZoMklFZ0ZNaXhtT0lxU25iaTJEckpoZGNBdlRBU2pNSSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767977961),
('xVkUh4SeiRE6yfteUoaHVy9xq74H8tASsElZXtQz', 1, '45.234.46.109', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', 'YTo0OntzOjY6Il90b2tlbiI7czo0MDoiNEJJaXpwMkZaVUZDbjFvR090UUJ6QzU2emZDZTBNT2JBSDJrd2pmcCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzQ6Imh0dHBzOi8vc2lzZ2VycC5jb20vbG9ncy1hdWRpdG9yaWEiO3M6NToicm91dGUiO3M6MTY6ImF1ZGl0LWxvZ3MuaW5kZXgiO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX1zOjUwOiJsb2dpbl93ZWJfNTliYTM2YWRkYzJiMmY5NDAxNTgwZjAxNGM3ZjU4ZWE0ZTMwOTg5ZCI7aToxO30=', 1767635079),
('xx73U6tJQ5I26JcyApEroQsyyb5T5dYGaeU8S49c', NULL, '93.158.70.111', 'Mozilla/5.0 (Android 14; Mobile; rv:123.0) Gecko/123.0 Firefox/123', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZFpHMngwWnNRSGVOcW5IaldEazV6YmhCYW15Q1JSTGFNTjVFYTN5bSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768450022),
('XxihwLZpcpPQmB8ufqmNRvOdp6Ts3WNK2pS7p5Wo', NULL, '51.68.111.242', 'Mozilla/5.0 (compatible; MJ12bot/v2.0.4; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVzM0cE5rZDNSY1pCekZmOXVBbHJ6RWpyTGdDZmhnUTlUQzdZcldDaSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768292415),
('Y13kAepHucA53Q7sKrxniQu8fKhfe7tZSwxHh4HP', NULL, '18.201.113.87', 'Mozilla/5.0 (compatible; NetcraftSurveyAgent/1.0; +info@netcraft.com)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWkY2amFCU3hKVWFSdzhxUTZXdXVuNjNyN3pFeUpMbVZ5b3JUS1E0YyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767968353),
('yMsGTQrcscb2SvWBidKsKpxNdGp7kLZIxJ8Vfgoz', NULL, '167.94.138.174', 'Mozilla/5.0 (compatible; CensysInspect/1.1; +https://about.censys.io/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRVFMNDZDUVNia3VZaHpZZTYzUEJPaTZ3c0xVb2hKb3hRTVEyODhLTyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768229085),
('yYHByMoa8IzsuFUHkEQojIoJJmN099gnPo9HIywO', NULL, '34.242.170.68', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTFNvSzk1RkxPS3pNd3NZQWpCSUZQc0dPOVdLYWlMVjRaR3VlYUVNeCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767630208),
('yyJgaX7I0mlysABCaCmLHopTeMjc4DioXeOVKa9y', NULL, '51.68.111.242', 'Mozilla/5.0 (compatible; MJ12bot/v2.0.4; http://mj12bot.com/)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTFAxbWg5OTdIYWxuMXVEN0hMWkNraWFTbkNDN01nbHlYUHdVczBoWiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768292413),
('z1cM2OgkP5p6g20K9tQudmSGcRvLpcUHKUHs9qzn', NULL, '157.173.122.176', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 Edg/91.0.864.54', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaExITVAwVlZZTmcwNUU4Z3p4WkhQakZPUjBpcGV0VXRqYUZpSkZ2eSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1768245681),
('zjbvv8TeZG1HuTZKyC7BurvCZBOr1d8zDPAC7zdd', NULL, '93.158.90.137', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.2 Mobile/15E148 Safari/604', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNlVESzdqSDNDSlEwMFRFcnlqbXpzbnphQllzbjd3TVQ3bTROQVlHYiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk6Imh0dHBzOi8vc2lzZ2VycC5jb20iO3M6NToicm91dGUiO3M6NDoiaG9tZSI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1767931524);

-- --------------------------------------------------------

--
-- Estrutura para tabela `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `type` enum('revenue','expense') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `expense_classification_id` bigint UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role` enum('admin','operator') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'operator',
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `role`, `active`) VALUES
(1, 'Ray Henrique', 'rayhenrique@gmail.com', NULL, '$2y$12$uxOVi94YnI6oUjeefspO7u1Lu5a0VUjnSzi.RQUBJ2sGmJ1NFbalS', 'J1I7E6e8YU1MB6i0vJH7aGVCxpXqBpKnBVye42vOhT2ooaegcKU0fHZnNAgE', '2025-08-26 20:05:56', '2025-10-25 17:31:07', 'admin', 1),
(2, 'Marcos Faustino', 'marcosfsilva@gmail.com', NULL, '$2y$12$UHVpfab9jX7jv.esF8epi.L2JcRx5bSEiZj6XySPO.wMvQTovaqC6', 'qCn6W0zchjrJfBpH3UMU2TxgKvwDpemt9MDsmIskb2jK1Rp8jU6lk7zF6X9z', '2025-08-26 20:25:39', '2025-10-29 10:34:16', 'admin', 1);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_foreign` (`user_id`),
  ADD KEY `audit_logs_model_type_model_id_index` (`model_type`,`model_id`);

--
-- Índices de tabela `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Índices de tabela `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Índices de tabela `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categories_type_index` (`type`),
  ADD KEY `categories_parent_id_index` (`parent_id`),
  ADD KEY `idx_categories_type_active` (`type`,`active`),
  ADD KEY `idx_categories_parent_active` (`parent_id`,`active`),
  ADD KEY `idx_categories_code_type` (`code`,`type`);

--
-- Índices de tabela `city_settings`
--
ALTER TABLE `city_settings`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `expenses_bloco_id_foreign` (`bloco_id`),
  ADD KEY `expenses_grupo_id_foreign` (`grupo_id`),
  ADD KEY `expenses_acao_id_foreign` (`acao_id`),
  ADD KEY `expenses_date_index` (`date`),
  ADD KEY `expenses_fonte_id_bloco_id_grupo_id_acao_id_index` (`fonte_id`,`bloco_id`,`grupo_id`,`acao_id`),
  ADD KEY `expenses_expense_classification_id_index` (`expense_classification_id`),
  ADD KEY `idx_expenses_acao_date` (`acao_id`,`date`),
  ADD KEY `idx_expenses_date_amount` (`date`,`amount`),
  ADD KEY `idx_expenses_created_acao` (`created_at`,`acao_id`),
  ADD KEY `idx_expenses_classification_date` (`expense_classification_id`,`date`);

--
-- Índices de tabela `expense_classifications`
--
ALTER TABLE `expense_classifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `expense_classifications_code_unique` (`code`),
  ADD KEY `idx_expense_classifications_code_active` (`code`,`active`),
  ADD KEY `idx_expense_classifications_name_active` (`name`,`active`);

--
-- Índices de tabela `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Índices de tabela `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Índices de tabela `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Índices de tabela `revenues`
--
ALTER TABLE `revenues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `revenues_bloco_id_foreign` (`bloco_id`),
  ADD KEY `revenues_grupo_id_foreign` (`grupo_id`),
  ADD KEY `revenues_acao_id_foreign` (`acao_id`),
  ADD KEY `revenues_date_index` (`date`),
  ADD KEY `revenues_fonte_id_bloco_id_grupo_id_acao_id_index` (`fonte_id`,`bloco_id`,`grupo_id`,`acao_id`),
  ADD KEY `idx_revenues_acao_date` (`acao_id`,`date`),
  ADD KEY `idx_revenues_date_amount` (`date`,`amount`),
  ADD KEY `idx_revenues_created_acao` (`created_at`,`acao_id`);

--
-- Índices de tabela `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Índices de tabela `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de tabela `city_settings`
--
ALTER TABLE `city_settings`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de tabela `expense_classifications`
--
ALTER TABLE `expense_classifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de tabela `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de tabela `revenues`
--
ALTER TABLE `revenues`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=145;

--
-- AUTO_INCREMENT de tabela `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_acao_id_foreign` FOREIGN KEY (`acao_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `expenses_bloco_id_foreign` FOREIGN KEY (`bloco_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `expenses_expense_classification_id_foreign` FOREIGN KEY (`expense_classification_id`) REFERENCES `expense_classifications` (`id`),
  ADD CONSTRAINT `expenses_fonte_id_foreign` FOREIGN KEY (`fonte_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `expenses_grupo_id_foreign` FOREIGN KEY (`grupo_id`) REFERENCES `categories` (`id`);

--
-- Restrições para tabelas `revenues`
--
ALTER TABLE `revenues`
  ADD CONSTRAINT `revenues_acao_id_foreign` FOREIGN KEY (`acao_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `revenues_bloco_id_foreign` FOREIGN KEY (`bloco_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `revenues_fonte_id_foreign` FOREIGN KEY (`fonte_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `revenues_grupo_id_foreign` FOREIGN KEY (`grupo_id`) REFERENCES `categories` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
