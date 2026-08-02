-- Jardín Fantasy — MySQL Schema
-- Run: mysql -u root -p < server/schema.sql

CREATE DATABASE IF NOT EXISTS jardin_fantasy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jardin_fantasy;

-- Banner (single row)
CREATE TABLE IF NOT EXISTS banner (
  id INT PRIMARY KEY DEFAULT 1,
  imagenUrl VARCHAR(500),
  imagenesUrl JSON,
  slogan VARCHAR(255)
) ENGINE=InnoDB;

-- Redes Sociales (single row)
CREATE TABLE IF NOT EXISTS redes_sociales (
  id INT PRIMARY KEY DEFAULT 1,
  facebook VARCHAR(255),
  instagram VARCHAR(255),
  whatsapp VARCHAR(255)
) ENGINE=InnoDB;

-- Nosotros (single row)
CREATE TABLE IF NOT EXISTS nosotros (
  id INT PRIMARY KEY DEFAULT 1,
  descripcion TEXT,
  mision TEXT,
  vision TEXT,
  slogan VARCHAR(255),
  direccion VARCHAR(255),
  telefonos JSON,
  valores JSON
) ENGINE=InnoDB;

-- Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(100),
  fotos JSON
) ENGINE=InnoDB;

-- Menús
CREATE TABLE IF NOT EXISTS menus (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL DEFAULT 'tradicional',
  numTiempos INT DEFAULT NULL,
  conCategorias TINYINT(1) DEFAULT 0,
  items JSON,
  salseados JSON,
  fotos JSON
) ENGINE=InnoDB;

-- Paquetes Sociales
CREATE TABLE IF NOT EXISTS paquetes_sociales (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  horas INT DEFAULT 6,
  servicios JSON,
  menus JSON,
  fotos JSON,
  orden INT DEFAULT 0
) ENGINE=InnoDB;

-- Paquetes Infantiles
CREATE TABLE IF NOT EXISTS paquetes_infantiles (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  horas INT DEFAULT 6,
  tipoServicio VARCHAR(100),
  servicios JSON,
  menus JSON,
  fotos JSON,
  orden INT DEFAULT 0
) ENGINE=InnoDB;

-- Shows
CREATE TABLE IF NOT EXISTS shows (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10,2) DEFAULT 0,
  duracion VARCHAR(50),
  descripcion TEXT,
  fotos JSON,
  videoUrl VARCHAR(500) DEFAULT ''
) ENGINE=InnoDB;

-- Servicios Adicionales
CREATE TABLE IF NOT EXISTS servicios_adicionales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10,2) DEFAULT 0,
  tipoCobro VARCHAR(50) DEFAULT 'evento',
  descripcion TEXT,
  sinPrecioFijo TINYINT(1) DEFAULT 0
) ENGINE=InnoDB;

-- Testimonios
CREATE TABLE IF NOT EXISTS testimonios (
  id VARCHAR(100) PRIMARY KEY,
  videoUrl VARCHAR(500)
) ENGINE=InnoDB;

-- Reglamento (single row)
CREATE TABLE IF NOT EXISTS reglamento (
  id INT PRIMARY KEY DEFAULT 1,
  precioApartado DECIMAL(10,2) DEFAULT 0,
  objetosProhibidos JSON,
  reglas JSON
) ENGINE=InnoDB;

-- Galería
CREATE TABLE IF NOT EXISTS galeria (
  id VARCHAR(100) PRIMARY KEY,
  url VARCHAR(500) NOT NULL,
  categoria VARCHAR(100) DEFAULT 'general'
) ENGINE=InnoDB;

-- Galería de Eventos (single row, shared gallery for all events)
CREATE TABLE IF NOT EXISTS eventos_galeria (
  id INT PRIMARY KEY DEFAULT 1,
  urls JSON
) ENGINE=InnoDB;

-- Usuarios (admin)
CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(100) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL
) ENGINE=InnoDB;
