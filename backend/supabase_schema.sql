-- 1. USUARIOS (si no existe)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL DEFAULT '',
    rol VARCHAR(50) NOT NULL DEFAULT 'asesor',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. ALTER clientes (agregar columnas faltantes)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS apellido VARCHAR(255) DEFAULT '';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS ocupacion VARCHAR(255);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS ingreso_mensual DECIMAL(12,2) DEFAULT 0;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS gasto_mensual DECIMAL(12,2) DEFAULT 0;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS nombre_negocio VARCHAR(255);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS antiguedad_negocio VARCHAR(100);
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
-- Unique constraint para DNI
DO $$ BEGIN
  ALTER TABLE clientes ADD CONSTRAINT clientes_dni_unique UNIQUE (dni);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. ALTER solicitudes_credito
ALTER TABLE solicitudes_credito ADD COLUMN IF NOT EXISTS numero_expediente VARCHAR(50);
ALTER TABLE solicitudes_credito ADD COLUMN IF NOT EXISTS cliente_id UUID;
ALTER TABLE solicitudes_credito ADD COLUMN IF NOT EXISTS tea DECIMAL(5,2) DEFAULT 18.00;
ALTER TABLE solicitudes_credito ADD COLUMN IF NOT EXISTS tasa_mensual DECIMAL(6,4);
ALTER TABLE solicitudes_credito ADD COLUMN IF NOT EXISTS cuota_estimada DECIMAL(12,2);
ALTER TABLE solicitudes_credito ADD COLUMN IF NOT EXISTS garantia VARCHAR(255);
ALTER TABLE solicitudes_credito ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;
ALTER TABLE solicitudes_credito ADD COLUMN IF NOT EXISTS monto_aprobado DECIMAL(12,2);
ALTER TABLE solicitudes_credito ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE solicitudes_credito ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
-- Unique constraint para numero_expediente
DO $$ BEGIN
  ALTER TABLE solicitudes_credito ADD CONSTRAINT solicitudes_expediente_unique UNIQUE (numero_expediente);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Actualizar constraint de estados para incluir todos los estados válidos
ALTER TABLE solicitudes_credito DROP CONSTRAINT IF EXISTS solicitudes_credito_estado_check;
ALTER TABLE solicitudes_credito ADD CONSTRAINT solicitudes_credito_estado_check 
  CHECK (estado IN ('enviado', 'recibido_comite', 'en_evaluacion', 'aprobado', 'condicionado', 'rechazado', 'desembolsado'));

-- 4. CARTERA
CREATE TABLE IF NOT EXISTS cartera (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    oficial_id UUID NOT NULL,
    cliente_id UUID NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT NOW(),
    estado VARCHAR(50) DEFAULT 'asignado',
    visitado BOOLEAN DEFAULT FALSE,
    fecha_visita TIMESTAMP,
    latitud DECIMAL(10,7),
    longitud DECIMAL(10,7),
    observacion TEXT
);

-- 5. PRE-EVALUACIONES
CREATE TABLE IF NOT EXISTS pre_evaluaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    solicitud_id UUID,
    cliente_id UUID NOT NULL,
    ingreso DECIMAL(12,2) NOT NULL,
    gasto DECIMAL(12,2) NOT NULL,
    cuota_solicitada DECIMAL(12,2) NOT NULL,
    capacidad_pago DECIMAL(12,2),
    ratio_endeudamiento DECIMAL(5,2),
    puntaje INTEGER,
    apto BOOLEAN,
    observacion TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. BURÓ CONSULTAS
CREATE TABLE IF NOT EXISTS buro_consultas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL,
    dni VARCHAR(8) NOT NULL,
    score INTEGER,
    entidades_deuda INTEGER DEFAULT 0,
    deuda_total DECIMAL(12,2) DEFAULT 0,
    dias_mora INTEGER DEFAULT 0,
    resultado VARCHAR(50),
    inhabilitado BOOLEAN DEFAULT FALSE,
    consultado_por UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. DOCUMENTOS
CREATE TABLE IF NOT EXISTS documentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    solicitud_id UUID,
    cliente_id UUID NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    nombre_archivo VARCHAR(255),
    url TEXT,
    estado VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 8. FIRMAS DIGITALES
CREATE TABLE IF NOT EXISTS firmas_digitales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    solicitud_id UUID NOT NULL,
    cliente_id UUID NOT NULL,
    firma_data TEXT,
    fecha TIMESTAMP DEFAULT NOW()
);

-- 9. COMITÉ DECISIONES
CREATE TABLE IF NOT EXISTS comite_decisiones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    solicitud_id UUID NOT NULL,
    evaluador_id UUID,
    decision VARCHAR(50) NOT NULL,
    monto_aprobado DECIMAL(12,2),
    motivo TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 10. DESEMBOLSOS
CREATE TABLE IF NOT EXISTS desembolsos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    solicitud_id UUID NOT NULL,
    monto DECIMAL(12,2) NOT NULL,
    fecha_desembolso DATE NOT NULL,
    metodo VARCHAR(100) NOT NULL,
    estado VARCHAR(50) DEFAULT 'confirmado',
    confirmado_por UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11. CRONOGRAMA PAGOS
ALTER TABLE cronograma_pagos ADD COLUMN IF NOT EXISTS solicitud_id UUID;
ALTER TABLE cronograma_pagos ADD COLUMN IF NOT EXISTS numero_cuota INTEGER;
ALTER TABLE cronograma_pagos ADD COLUMN IF NOT EXISTS capital DECIMAL(12,2);
ALTER TABLE cronograma_pagos ADD COLUMN IF NOT EXISTS interes DECIMAL(12,2);
ALTER TABLE cronograma_pagos ADD COLUMN IF NOT EXISTS cuota_total DECIMAL(12,2);
ALTER TABLE cronograma_pagos ADD COLUMN IF NOT EXISTS saldo DECIMAL(12,2);
ALTER TABLE cronograma_pagos ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- ============= SEED DATA =============

-- SEED USUARIOS
INSERT INTO usuarios (email, password_hash, nombre, apellido, rol) VALUES
('admin@cajapiura.pe', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1GJ.t4iIgG7K0HKMv8F5pYHzFzQq', 'Carlos', 'Mendoza', 'admin'),
('supervisor@cajapiura.pe', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1GJ.t4iIgG7K0HKMv8F5pYHzFzQq', 'Maria', 'Torres', 'supervisor'),
('asesor@cajapiura.pe', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1GJ.t4iIgG7K0HKMv8F5pYHzFzQq', 'Juan', 'Perez', 'asesor'),
('cliente@cajapiura.pe', '$2b$12$LJ3m4ys3Lk0TSwHnbfOMiOXPm1GJ.t4iIgG7K0HKMv8F5pYHzFzQq', 'Pedro', 'Garcia', 'cliente')
ON CONFLICT (email) DO NOTHING;

-- SEED CLIENTES
INSERT INTO clientes (id, dni, nombre, apellido, telefono, email, direccion, ocupacion, ingreso_mensual, gasto_mensual, nombre_negocio, antiguedad_negocio) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567801', '12345678', 'Pedro', 'Garcia Lopez', '951123456', 'pedro@email.com', 'Av. Principal 123, Piura', 'Comerciante', 5000, 2500, 'Bodega Garcia', '5 anos'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567802', '87654321', 'Ana', 'Martinez Ruiz', '951654321', 'ana@email.com', 'Calle Lima 456, Piura', 'Emprendedora', 8000, 3000, 'Sastreria Elegante', '8 anos'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567803', '11223344', 'Luis', 'Fernandez Vargas', '951789012', 'luis@email.com', 'Jr. San Martin 789, Piura', 'Transportista', 6500, 3500, 'Transportes Fernandez', '3 anos'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567804', '44556677', 'Rosa', 'Diaz Morales', '951345678', 'rosa@email.com', 'Av. Piura 321, Piura', 'Vendedora', 3500, 1800, 'Minimarket Rosa', '2 anos'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567805', '99887766', 'Miguel', 'Sanchez Torres', '951987654', 'miguel@email.com', 'Calle Arequipa 654, Piura', 'Ganadero', 12000, 5000, 'Hacienda Sanchez', '15 anos')
ON CONFLICT (dni) DO NOTHING;

-- SEED SOLICITUDES
INSERT INTO solicitudes_credito (numero_expediente, cliente_id, cliente_dni, monto, plazo, tea, cuota_estimada, garantia, destino, estado) VALUES
('EXP-20260601-A1B2C3', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', '12345678', 15000, 24, 18.0, 756.30, 'Hipotecario', 'Capital de trabajo', 'aprobado'),
('EXP-20260602-D4E5F6', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', '87654321', 25000, 36, 16.5, 893.45, 'Prendario', 'Maquinaria', 'en_evaluacion'),
('EXP-20260603-G7H8I9', 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', '11223344', 8000, 12, 20.0, 739.88, 'Personal', 'Equipo de trabajo', 'enviado'),
('EXP-20260604-J1K2L3', 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', '44556677', 5000, 12, 22.0, 468.12, 'Personal', 'Capital de trabajo', 'rechazado'),
('EXP-20260605-M4N5O6', 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', '99887766', 50000, 48, 15.0, 1382.18, 'Hipotecario', 'Expansion del negocio', 'desembolsado')
ON CONFLICT (numero_expediente) DO NOTHING;

-- SEED CARTERA
INSERT INTO cartera (oficial_id, cliente_id, estado, visitado, observacion) VALUES
('b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'asignado', TRUE, 'Cliente activo, buen historial'),
('b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'asignado', FALSE, NULL),
('b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'asignado', TRUE, 'Interesado en ampliar negocio'),
('b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'asignado', FALSE, NULL),
('b1b2c3d4-e5f6-7890-abcd-ef1234567803', 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'asignado', TRUE, 'Cliente VIP, gran antiguedad');

-- ============= RLS =============

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartera ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE buro_consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE firmas_digitales ENABLE ROW LEVEL SECURITY;
ALTER TABLE comite_decisiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE desembolsos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "anon_read_usuarios" ON usuarios FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "anon_read_clientes" ON clientes FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "anon_read_cartera" ON cartera FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "anon_read_solicitudes" ON solicitudes_credito FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "anon_read_pre_evaluaciones" ON pre_evaluaciones FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "anon_read_buro" ON buro_consultas FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "anon_read_comite" ON comite_decisiones FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "anon_read_desembolsos" ON desembolsos FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "anon_read_cronograma" ON cronograma_pagos FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "auth_insert_usuarios" ON usuarios FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "auth_insert_clientes" ON clientes FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "auth_insert_solicitudes" ON solicitudes_credito FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "auth_insert_cartera" ON cartera FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "auth_update_cartera" ON cartera FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "auth_update_solicitudes" ON solicitudes_credito FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "auth_update_clientes" ON clientes FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

SELECT 'TODO OK' AS resultado;
