DROP DATABASE IF EXISTS railway;
CREATE DATABASE railway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE railway;
SET NAMES utf8mb4;

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    rol ENUM('user','read-only','admin') NOT NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expiry DATETIME NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE tipo_interaccion (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE estado_interaccion (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE interaccion (
    id_interaccion INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL,
    descripcion TEXT,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    id_tipo INT NOT NULL,
    id_estado INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_tipo) REFERENCES tipo_interaccion(id_tipo),
    FOREIGN KEY (id_estado) REFERENCES estado_interaccion(id_estado)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE registro_accesos (
    id_acceso INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATETIME NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
-- USUARIOS (contraseña: Pass1234.)
-- ─────────────────────────────────────────────
INSERT INTO usuario (nombre, email, password, rol) VALUES
('Ana Torres',    'ana@example.com',          '$2b$10$03DUitWsZbQVAKkfb6ycUeiTN53OAndkMblZy1fVJ241oMRd7sXka', 'user'),
('Luis Pérez',    'luis@example.com',         '$2b$10$03DUitWsZbQVAKkfb6ycUeiTN53OAndkMblZy1fVJ241oMRd7sXka', 'user'),
('Mario Díaz',    'lectura@example.com',      '$2b$10$03DUitWsZbQVAKkfb6ycUeiTN53OAndkMblZy1fVJ241oMRd7sXka', 'read-only'),
('Rosa Martín',   'rosamartn98@gmail.com',    '$2b$10$03DUitWsZbQVAKkfb6ycUeiTN53OAndkMblZy1fVJ241oMRd7sXka', 'admin'),
('Carlos López',  'carlos@example.com',       '$2b$10$03DUitWsZbQVAKkfb6ycUeiTN53OAndkMblZy1fVJ241oMRd7sXka', 'user');

-- ─────────────────────────────────────────────
-- CLIENTES — 6 por usuario (30 en total)
-- ─────────────────────────────────────────────
INSERT INTO cliente (nombre, fecha_creacion, id_usuario) VALUES
-- Ana (id 1)
('Empresa Alfa',      '2026-01-05 09:00:00', 1),
('Empresa Beta',      '2026-01-12 10:00:00', 1),
('Empresa Gamma',     '2026-01-20 11:00:00', 1),
('Empresa Delta',     '2026-02-03 09:30:00', 1),
('Empresa Épsilon',   '2026-02-14 10:30:00', 1),
('Empresa Zeta',      '2026-02-25 11:30:00', 1),
-- Luis (id 2)
('Industrias Norte',  '2026-01-07 09:00:00', 2),
('Industrias Sur',    '2026-01-15 10:00:00', 2),
('Industrias Este',   '2026-01-22 11:00:00', 2),
('Industrias Oeste',  '2026-02-05 09:30:00', 2),
('Industrias Centro', '2026-02-18 10:30:00', 2),
('Industrias Costa',  '2026-02-28 11:30:00', 2),
-- Mario (id 3)
('Grupo Ábaco',       '2026-01-08 09:00:00', 3),
('Grupo Bravo',       '2026-01-16 10:00:00', 3),
('Grupo Celta',       '2026-01-24 11:00:00', 3),
('Grupo Duna',        '2026-02-06 09:30:00', 3),
('Grupo Élite',       '2026-02-19 10:30:00', 3),
('Grupo Faro',        '2026-03-01 11:30:00', 3),
-- Rosa (id 4)
('Soluciones A',      '2026-01-09 09:00:00', 4),
('Soluciones B',      '2026-01-17 10:00:00', 4),
('Soluciones C',      '2026-01-25 11:00:00', 4),
('Soluciones D',      '2026-02-07 09:30:00', 4),
('Soluciones E',      '2026-02-20 10:30:00', 4),
('Soluciones F',      '2026-03-02 11:30:00', 4),
-- Carlos (id 5)
('Consultora Uno',    '2026-01-10 09:00:00', 5),
('Consultora Dos',    '2026-01-18 10:00:00', 5),
('Consultora Tres',   '2026-01-26 11:00:00', 5),
('Consultora Cuatro', '2026-02-08 09:30:00', 5),
('Consultora Cinco',  '2026-02-21 10:30:00', 5),
('Consultora Seis',   '2026-03-03 11:30:00', 5);

-- ─────────────────────────────────────────────
-- TIPOS Y ESTADOS
-- ─────────────────────────────────────────────
INSERT INTO tipo_interaccion (nombre) VALUES
('Consulta'),
('Reunion'),
('Antecedente');

INSERT INTO estado_interaccion (nombre) VALUES
('Creada'),
('Editada'),
('Eliminada');

-- ─────────────────────────────────────────────
-- INTERACCIONES — 6 por usuario (2 consultas, 2 reuniones, 2 antecedentes)
-- id_cliente referencia los clientes de cada usuario
-- ─────────────────────────────────────────────
INSERT INTO interaccion (fecha, descripcion, id_cliente, id_usuario, id_tipo, id_estado) VALUES
-- Ana (id 1) — clientes 1-6
('2026-02-10 09:00:00', 'Consulta inicial sobre contrato',         1, 1, 1, 1),
('2026-02-15 10:30:00', 'Consulta de seguimiento trimestral',      2, 1, 1, 1),
('2026-02-20 11:00:00', 'Reunión de presentación de propuesta',    3, 1, 2, 1),
('2026-03-01 12:00:00', 'Reunión de revisión de objetivos',        4, 1, 2, 2),
('2026-03-10 09:30:00', 'Antecedente: historial de incidencias',   5, 1, 3, 1),
('2026-03-18 10:00:00', 'Antecedente: contrato anterior 2025',     6, 1, 3, 1),
-- Luis (id 2) — clientes 7-12
('2026-02-11 09:00:00', 'Consulta sobre condiciones de entrega',   7,  2, 1, 1),
('2026-02-16 10:30:00', 'Consulta técnica sobre producto',         8,  2, 1, 2),
('2026-02-21 11:00:00', 'Reunión de cierre de acuerdo',            9,  2, 2, 1),
('2026-03-02 12:00:00', 'Reunión de planificación Q2',             10, 2, 2, 1),
('2026-03-11 09:30:00', 'Antecedente: reclamación pendiente',      11, 2, 3, 1),
('2026-03-19 10:00:00', 'Antecedente: auditoría interna 2025',     12, 2, 3, 2),
-- Mario (id 3) — clientes 13-18
('2026-02-12 09:00:00', 'Consulta sobre normativa vigente',        13, 3, 1, 1),
('2026-02-17 10:30:00', 'Consulta de viabilidad del proyecto',     14, 3, 1, 1),
('2026-02-22 11:00:00', 'Reunión de arranque de proyecto',         15, 3, 2, 1),
('2026-03-03 12:00:00', 'Reunión de seguimiento mensual',          16, 3, 2, 2),
('2026-03-12 09:30:00', 'Antecedente: documentación previa',       17, 3, 3, 1),
('2026-03-20 10:00:00', 'Antecedente: informe de riesgos 2025',    18, 3, 3, 1),
-- Rosa (id 4) — clientes 19-24
('2026-02-13 09:00:00', 'Consulta sobre acceso al sistema',        19, 4, 1, 1),
('2026-02-18 10:30:00', 'Consulta de integración con API',         20, 4, 1, 2),
('2026-02-23 11:00:00', 'Reunión de demo con cliente',             21, 4, 2, 1),
('2026-03-04 12:00:00', 'Reunión de formación al equipo',          22, 4, 2, 1),
('2026-03-13 09:30:00', 'Antecedente: soporte técnico previo',     23, 4, 3, 2),
('2026-03-21 10:00:00', 'Antecedente: migración de datos 2025',    24, 4, 3, 1),
-- Carlos (id 5) — clientes 25-30
('2026-02-14 09:00:00', 'Consulta sobre presupuesto anual',        25, 5, 1, 1),
('2026-02-19 10:30:00', 'Consulta de ampliación de servicios',     26, 5, 1, 1),
('2026-02-24 11:00:00', 'Reunión de negociación de contrato',      27, 5, 2, 2),
('2026-03-05 12:00:00', 'Reunión de evaluación de resultados',     28, 5, 2, 1),
('2026-03-14 09:30:00', 'Antecedente: historial de pagos',         29, 5, 3, 1),
('2026-03-22 10:00:00', 'Antecedente: litigio resuelto 2024',      30, 5, 3, 1);

-- ─────────────────────────────────────────────
-- REGISTRO DE ACCESOS
-- ─────────────────────────────────────────────
INSERT INTO registro_accesos (fecha, tipo, id_usuario) VALUES
('2026-02-10 08:00:00', 'login',  1),
('2026-02-10 08:05:00', 'login',  2),
('2026-02-11 09:00:00', 'login',  3),
('2026-02-12 10:30:00', 'logout', 1),
('2026-02-13 14:20:00', 'login',  4),
('2026-02-14 07:55:00', 'login',  5);

CREATE USER IF NOT EXISTS 'app_admin'@'%' IDENTIFIED BY 'Admin123!';
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'User123!';
GRANT ALL PRIVILEGES ON railway.* TO 'app_admin'@'%';
GRANT SELECT, INSERT, UPDATE ON railway.* TO 'app_user'@'%';
FLUSH PRIVILEGES;