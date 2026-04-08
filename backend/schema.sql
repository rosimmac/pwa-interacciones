DROP DATABASE IF EXISTS pwa_interacciones;
CREATE DATABASE pwa_interacciones CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pwa_interacciones;

CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    rol ENUM('user','read-only','admin') NOT NULL
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

INSERT INTO usuario (nombre, email, password, rol) VALUES
('Ana Torres', 'ana@example.com', '$2b$10$bzpWYAFKQZVJEnYzDG3VC.ygVDzHeuCDDgicHE5KYoRF.AoQS4LZ.', 'user'),
('Luis Pérez', 'luis@example.com', '$2b$10$bzpWYAFKQZVJEnYzDG3VC.ygVDzHeuCDDgicHE5KYoRF.AoQS4LZ.', 'user'),
('Mario Díaz', 'mario@example.com', '$2b$10$bzpWYAFKQZVJEnYzDG3VC.ygVDzHeuCDDgicHE5KYoRF.AoQS4LZ.', 'read-only'),
('Elena Ruiz', 'elena@example.com', '$2b$10$bzpWYAFKQZVJEnYzDG3VC.ygVDzHeuCDDgicHE5KYoRF.AoQS4LZ.', 'admin'),
('Carlos López', 'carlos@example.com', '$2b$10$bzpWYAFKQZVJEnYzDG3VC.ygVDzHeuCDDgicHE5KYoRF.AoQS4LZ.', 'user');

INSERT INTO cliente (nombre, fecha_creacion, id_usuario) VALUES
('Cliente A', '2024-01-10', 1),
('Cliente B', '2024-02-15', 1),
('Cliente C', '2024-03-20', 2),
('Cliente D', '2024-04-12', 2),
('Cliente E', '2024-05-01', 5);

INSERT INTO tipo_interaccion (nombre) VALUES
('Consulta'),
('Reunion'),
('Antecedente');

INSERT INTO estado_interaccion (nombre) VALUES
('Creada'),
('Editada'),
('Eliminada');

INSERT INTO interaccion (fecha, descripcion, id_cliente, id_usuario, id_tipo, id_estado) VALUES
('2024-06-01 10:00:00', 'Primera consulta con Cliente A', 1, 1, 1, 1),
('2024-06-02 09:30:00', 'Reunión inicial con el cliente', 1, 1, 2, 2),
('2024-06-05 15:15:00', 'Consulta de seguimiento', 2, 1, 1, 3),
('2024-06-10 11:00:00', 'Antecedente importante del cliente', 3, 2, 3, 1),
('2024-06-12 16:40:00', 'Reunión para revisar antecedentes', 3, 2, 2, 2),
('2024-06-15 12:00:00', 'Consulta sobre contrato', 4, 2, 1, 1),
('2024-06-18 09:45:00', 'Reunión técnica', 5, 5, 2, 3);

INSERT INTO registro_accesos (fecha, tipo, id_usuario) VALUES
('2024-06-01 08:00:00', 'login', 1),
('2024-06-01 08:05:00', 'login', 2),
('2024-06-02 09:00:00', 'login', 3),
('2024-06-03 10:30:00', 'logout', 1),
('2024-06-05 14:20:00', 'login', 4),
('2024-06-06 07:55:00', 'login', 5);

CREATE USER IF NOT EXISTS 'app_admin'@'%' IDENTIFIED BY 'Admin123!';
CREATE USER IF NOT EXISTS 'app_user'@'%' IDENTIFIED BY 'User123!';
GRANT ALL PRIVILEGES ON pwa_interacciones.* TO 'app_admin'@'%';
GRANT SELECT, INSERT, UPDATE ON pwa_interacciones.* TO 'app_user'@'%';
FLUSH PRIVILEGES;