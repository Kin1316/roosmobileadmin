-- Script_FK.sql
-- Sample data insertion with FK-safe order.
-- Covers all tables and builds at least 5 complete operational flows.

BEGIN;

-- 1) Users (workers)
INSERT INTO users (first_name, paternal_last_name, maternal_last_name, phone, email, username, password, role)
SELECT 'Recolector01','Flow','Demo','5510000001','fk.recolector01@example.com','fk_recolector_01','$2a$10$9wqevFfQfr4jY8Y7W6eq0OHmS7jQ9v/8e5xTQn3Xj9Yw7f4f8bQMu','Recolector'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'fk_recolector_01');

INSERT INTO users (first_name, paternal_last_name, maternal_last_name, phone, email, username, password, role)
SELECT 'Recolector02','Flow','Demo','5510000002','fk.recolector02@example.com','fk_recolector_02','$2a$10$9wqevFfQfr4jY8Y7W6eq0OHmS7jQ9v/8e5xTQn3Xj9Yw7f4f8bQMu','Recolector'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'fk_recolector_02');

INSERT INTO users (first_name, paternal_last_name, maternal_last_name, phone, email, username, password, role)
SELECT 'Recolector03','Flow','Demo','5510000003','fk.recolector03@example.com','fk_recolector_03','$2a$10$9wqevFfQfr4jY8Y7W6eq0OHmS7jQ9v/8e5xTQn3Xj9Yw7f4f8bQMu','Recolector'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'fk_recolector_03');

INSERT INTO users (first_name, paternal_last_name, maternal_last_name, phone, email, username, password, role)
SELECT 'Recolector04','Flow','Demo','5510000004','fk.recolector04@example.com','fk_recolector_04','$2a$10$9wqevFfQfr4jY8Y7W6eq0OHmS7jQ9v/8e5xTQn3Xj9Yw7f4f8bQMu','Recolector'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'fk_recolector_04');

INSERT INTO users (first_name, paternal_last_name, maternal_last_name, phone, email, username, password, role)
SELECT 'Recolector05','Flow','Demo','5510000005','fk.recolector05@example.com','fk_recolector_05','$2a$10$9wqevFfQfr4jY8Y7W6eq0OHmS7jQ9v/8e5xTQn3Xj9Yw7f4f8bQMu','Recolector'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'fk_recolector_05');

-- 2) Vehicles
INSERT INTO vehicles (brand, model, license_plate, year, unit_number, status)
SELECT 'Ford','Transit','FK-0001',2020,'F001','Active'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'FK-0001');

INSERT INTO vehicles (brand, model, license_plate, year, unit_number, status)
SELECT 'Nissan','Urvan','FK-0002',2021,'F002','Active'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'FK-0002');

INSERT INTO vehicles (brand, model, license_plate, year, unit_number, status)
SELECT 'Chevrolet','Express','FK-0003',2019,'F003','Active'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'FK-0003');

INSERT INTO vehicles (brand, model, license_plate, year, unit_number, status)
SELECT 'Mercedes','Sprinter','FK-0004',2022,'F004','Active'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'FK-0004');

INSERT INTO vehicles (brand, model, license_plate, year, unit_number, status)
SELECT 'Renault','Master','FK-0005',2023,'F005','Active'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE license_plate = 'FK-0005');

-- 3) Sections and Questions (inspection checklist support)
INSERT INTO sections (section_name, status)
SELECT 'FK - Operational Checklist', TRUE
WHERE NOT EXISTS (SELECT 1 FROM sections WHERE section_name = 'FK - Operational Checklist');

INSERT INTO questions (statement, section_id, status)
SELECT 'Brakes operating correctly', s.section_id, TRUE
FROM sections s
WHERE s.section_name = 'FK - Operational Checklist'
  AND NOT EXISTS (
      SELECT 1 FROM questions q
      WHERE q.statement = 'Brakes operating correctly' AND q.section_id = s.section_id
  );

INSERT INTO questions (statement, section_id, status)
SELECT 'Lights and signals operational', s.section_id, TRUE
FROM sections s
WHERE s.section_name = 'FK - Operational Checklist'
  AND NOT EXISTS (
      SELECT 1 FROM questions q
      WHERE q.statement = 'Lights and signals operational' AND q.section_id = s.section_id
  );

INSERT INTO questions (statement, section_id, status)
SELECT 'Safety kit complete', s.section_id, TRUE
FROM sections s
WHERE s.section_name = 'FK - Operational Checklist'
  AND NOT EXISTS (
      SELECT 1 FROM questions q
      WHERE q.statement = 'Safety kit complete' AND q.section_id = s.section_id
  );

-- 4) Clients
INSERT INTO clients (client_name)
SELECT 'FK Client 01'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE client_name = 'FK Client 01');

INSERT INTO clients (client_name)
SELECT 'FK Client 02'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE client_name = 'FK Client 02');

INSERT INTO clients (client_name)
SELECT 'FK Client 03'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE client_name = 'FK Client 03');

INSERT INTO clients (client_name)
SELECT 'FK Client 04'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE client_name = 'FK Client 04');

INSERT INTO clients (client_name)
SELECT 'FK Client 05'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE client_name = 'FK Client 05');

-- 5) Routes (each assigned to one worker)
INSERT INTO routes (route_name, description, status, user_id)
SELECT 'FK Route 01', 'Flow route 01', 'Active', u.user_id
FROM users u
WHERE u.username = 'fk_recolector_01'
  AND NOT EXISTS (SELECT 1 FROM routes WHERE route_name = 'FK Route 01');

INSERT INTO routes (route_name, description, status, user_id)
SELECT 'FK Route 02', 'Flow route 02', 'Active', u.user_id
FROM users u
WHERE u.username = 'fk_recolector_02'
  AND NOT EXISTS (SELECT 1 FROM routes WHERE route_name = 'FK Route 02');

INSERT INTO routes (route_name, description, status, user_id)
SELECT 'FK Route 03', 'Flow route 03', 'Active', u.user_id
FROM users u
WHERE u.username = 'fk_recolector_03'
  AND NOT EXISTS (SELECT 1 FROM routes WHERE route_name = 'FK Route 03');

INSERT INTO routes (route_name, description, status, user_id)
SELECT 'FK Route 04', 'Flow route 04', 'Active', u.user_id
FROM users u
WHERE u.username = 'fk_recolector_04'
  AND NOT EXISTS (SELECT 1 FROM routes WHERE route_name = 'FK Route 04');

INSERT INTO routes (route_name, description, status, user_id)
SELECT 'FK Route 05', 'Flow route 05', 'Active', u.user_id
FROM users u
WHERE u.username = 'fk_recolector_05'
  AND NOT EXISTS (SELECT 1 FROM routes WHERE route_name = 'FK Route 05');

-- 6) Stores (destinations)
INSERT INTO stores (store_name, longitude, latitude, route_id, client_id, frequency_type, frequency_value, last_visited_date, priority)
SELECT 'FK Store 01', -99.1332, 19.4326, r.route_id, c.client_id, 'Daily', 'Everyday', CURRENT_DATE - 2, 1.1
FROM routes r, clients c
WHERE r.route_name = 'FK Route 01' AND c.client_name = 'FK Client 01'
  AND NOT EXISTS (SELECT 1 FROM stores WHERE store_name = 'FK Store 01');

INSERT INTO stores (store_name, longitude, latitude, route_id, client_id, frequency_type, frequency_value, last_visited_date, priority)
SELECT 'FK Store 02', -99.1400, 19.4200, r.route_id, c.client_id, 'Weekly', 'Monday, Wednesday', CURRENT_DATE - 1, 1.3
FROM routes r, clients c
WHERE r.route_name = 'FK Route 02' AND c.client_name = 'FK Client 02'
  AND NOT EXISTS (SELECT 1 FROM stores WHERE store_name = 'FK Store 02');

INSERT INTO stores (store_name, longitude, latitude, route_id, client_id, frequency_type, frequency_value, last_visited_date, priority)
SELECT 'FK Store 03', -99.1200, 19.4100, r.route_id, c.client_id, 'Monthly', '15', CURRENT_DATE - 4, 1.0
FROM routes r, clients c
WHERE r.route_name = 'FK Route 03' AND c.client_name = 'FK Client 03'
  AND NOT EXISTS (SELECT 1 FROM stores WHERE store_name = 'FK Store 03');

INSERT INTO stores (store_name, longitude, latitude, route_id, client_id, frequency_type, frequency_value, last_visited_date, priority)
SELECT 'FK Store 04', -99.1500, 19.4400, r.route_id, c.client_id, 'Custom', 'Tue-Thu-Sat', CURRENT_DATE - 3, 1.5
FROM routes r, clients c
WHERE r.route_name = 'FK Route 04' AND c.client_name = 'FK Client 04'
  AND NOT EXISTS (SELECT 1 FROM stores WHERE store_name = 'FK Store 04');

INSERT INTO stores (store_name, longitude, latitude, route_id, client_id, frequency_type, frequency_value, last_visited_date, priority)
SELECT 'FK Store 05', -99.1600, 19.4500, r.route_id, c.client_id, 'Daily', 'Everyday', CURRENT_DATE - 5, 1.2
FROM routes r, clients c
WHERE r.route_name = 'FK Route 05' AND c.client_name = 'FK Client 05'
  AND NOT EXISTS (SELECT 1 FROM stores WHERE store_name = 'FK Store 05');

-- 7) Services (5 full route execution flows)
INSERT INTO services (service_date, is_extra, executed_route_id, store_id, user_id, status, observation, signature_url)
SELECT CURRENT_DATE - 1, FALSE, r.route_id, s.store_id, u.user_id, 'C', 'Service completed for flow 01', '/signatures/fk01.png'
FROM routes r, stores s, users u
WHERE r.route_name = 'FK Route 01'
  AND s.store_name = 'FK Store 01'
  AND u.username = 'fk_recolector_01'
  AND NOT EXISTS (
      SELECT 1 FROM services x
      WHERE x.executed_route_id = r.route_id
        AND x.store_id = s.store_id
        AND x.user_id = u.user_id
        AND x.service_date = CURRENT_DATE - 1
  );

INSERT INTO services (service_date, is_extra, executed_route_id, store_id, user_id, status, observation, signature_url)
SELECT CURRENT_DATE - 1, FALSE, r.route_id, s.store_id, u.user_id, 'C', 'Service completed for flow 02', '/signatures/fk02.png'
FROM routes r, stores s, users u
WHERE r.route_name = 'FK Route 02'
  AND s.store_name = 'FK Store 02'
  AND u.username = 'fk_recolector_02'
  AND NOT EXISTS (
      SELECT 1 FROM services x
      WHERE x.executed_route_id = r.route_id
        AND x.store_id = s.store_id
        AND x.user_id = u.user_id
        AND x.service_date = CURRENT_DATE - 1
  );

INSERT INTO services (service_date, is_extra, executed_route_id, store_id, user_id, status, observation, signature_url)
SELECT CURRENT_DATE - 1, FALSE, r.route_id, s.store_id, u.user_id, 'C', 'Service completed for flow 03', '/signatures/fk03.png'
FROM routes r, stores s, users u
WHERE r.route_name = 'FK Route 03'
  AND s.store_name = 'FK Store 03'
  AND u.username = 'fk_recolector_03'
  AND NOT EXISTS (
      SELECT 1 FROM services x
      WHERE x.executed_route_id = r.route_id
        AND x.store_id = s.store_id
        AND x.user_id = u.user_id
        AND x.service_date = CURRENT_DATE - 1
  );

INSERT INTO services (service_date, is_extra, executed_route_id, store_id, user_id, status, observation, signature_url)
SELECT CURRENT_DATE - 1, FALSE, r.route_id, s.store_id, u.user_id, 'C', 'Service completed for flow 04', '/signatures/fk04.png'
FROM routes r, stores s, users u
WHERE r.route_name = 'FK Route 04'
  AND s.store_name = 'FK Store 04'
  AND u.username = 'fk_recolector_04'
  AND NOT EXISTS (
      SELECT 1 FROM services x
      WHERE x.executed_route_id = r.route_id
        AND x.store_id = s.store_id
        AND x.user_id = u.user_id
        AND x.service_date = CURRENT_DATE - 1
  );

INSERT INTO services (service_date, is_extra, executed_route_id, store_id, user_id, status, observation, signature_url)
SELECT CURRENT_DATE - 1, FALSE, r.route_id, s.store_id, u.user_id, 'C', 'Service completed for flow 05', '/signatures/fk05.png'
FROM routes r, stores s, users u
WHERE r.route_name = 'FK Route 05'
  AND s.store_name = 'FK Store 05'
  AND u.username = 'fk_recolector_05'
  AND NOT EXISTS (
      SELECT 1 FROM services x
      WHERE x.executed_route_id = r.route_id
        AND x.store_id = s.store_id
        AND x.user_id = u.user_id
        AND x.service_date = CURRENT_DATE - 1
  );

-- 8) Waste types
INSERT INTO waste_types (name, measurement_unit)
SELECT 'FK_PET', 'kg'
WHERE NOT EXISTS (SELECT 1 FROM waste_types WHERE name = 'FK_PET');

INSERT INTO waste_types (name, measurement_unit)
SELECT 'FK_CARDBOARD', 'kg'
WHERE NOT EXISTS (SELECT 1 FROM waste_types WHERE name = 'FK_CARDBOARD');

INSERT INTO waste_types (name, measurement_unit)
SELECT 'FK_ORGANIC', 'kg'
WHERE NOT EXISTS (SELECT 1 FROM waste_types WHERE name = 'FK_ORGANIC');

-- 9) Evidence (one evidence per service)
INSERT INTO evidence (service_id)
SELECT s.service_id
FROM services s
JOIN routes r ON r.route_id = s.executed_route_id
WHERE r.route_name IN ('FK Route 01','FK Route 02','FK Route 03','FK Route 04','FK Route 05')
  AND NOT EXISTS (SELECT 1 FROM evidence e WHERE e.service_id = s.service_id);

-- 10) Evidence_waste (at least one per evidence)
INSERT INTO evidence_waste (evidence_id, waste_type_id, weight)
SELECT e.evidence_id, wt.waste_type_id, 12.5
FROM evidence e
JOIN services s ON s.service_id = e.service_id
JOIN routes r ON r.route_id = s.executed_route_id
JOIN waste_types wt ON wt.name = 'FK_PET'
WHERE r.route_name IN ('FK Route 01','FK Route 02','FK Route 03','FK Route 04','FK Route 05')
  AND NOT EXISTS (
      SELECT 1 FROM evidence_waste ew
      WHERE ew.evidence_id = e.evidence_id
  );

-- 11) Images (generic evidence images)
INSERT INTO images (image_url, image_type, evidence_id)
SELECT '/images/fk_evidence_' || e.evidence_id || '.webp', 'General', e.evidence_id
FROM evidence e
JOIN services s ON s.service_id = e.service_id
JOIN routes r ON r.route_id = s.executed_route_id
WHERE r.route_name IN ('FK Route 01','FK Route 02','FK Route 03','FK Route 04','FK Route 05')
  AND NOT EXISTS (
      SELECT 1 FROM images i
      WHERE i.evidence_id = e.evidence_id
  );

-- 12) Emergencies and emergency images
INSERT INTO emergencies (description, route_id, user_id)
SELECT 'Flow emergency for ' || r.route_name, r.route_id, u.user_id
FROM routes r
JOIN users u ON u.user_id = r.user_id
WHERE r.route_name IN ('FK Route 01','FK Route 02','FK Route 03','FK Route 04','FK Route 05')
  AND NOT EXISTS (
      SELECT 1 FROM emergencies em
      WHERE em.route_id = r.route_id
        AND em.description = 'Flow emergency for ' || r.route_name
  );

INSERT INTO emergency_images (image_url, emergency_id)
SELECT '/images/fk_emergency_' || em.emergency_id || '.webp', em.emergency_id
FROM emergencies em
WHERE em.description LIKE 'Flow emergency for FK Route %'
  AND NOT EXISTS (
      SELECT 1 FROM emergency_images ei
      WHERE ei.emergency_id = em.emergency_id
  );

-- 13) Inspections (one per flow)
INSERT INTO inspections (inspection_date, kilometrage, is_approved, user_id, vehicle_id, observation)
SELECT NOW() - INTERVAL '1 day', 30000 + v.vehicle_id, TRUE, u.user_id, v.vehicle_id, 'FK inspection flow 01'
FROM users u, vehicles v
WHERE u.username = 'fk_recolector_01' AND v.license_plate = 'FK-0001'
  AND NOT EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.user_id = u.user_id
        AND i.vehicle_id = v.vehicle_id
        AND i.observation = 'FK inspection flow 01'
  );

INSERT INTO inspections (inspection_date, kilometrage, is_approved, user_id, vehicle_id, observation)
SELECT NOW() - INTERVAL '1 day', 30000 + v.vehicle_id, TRUE, u.user_id, v.vehicle_id, 'FK inspection flow 02'
FROM users u, vehicles v
WHERE u.username = 'fk_recolector_02' AND v.license_plate = 'FK-0002'
  AND NOT EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.user_id = u.user_id
        AND i.vehicle_id = v.vehicle_id
        AND i.observation = 'FK inspection flow 02'
  );

INSERT INTO inspections (inspection_date, kilometrage, is_approved, user_id, vehicle_id, observation)
SELECT NOW() - INTERVAL '1 day', 30000 + v.vehicle_id, TRUE, u.user_id, v.vehicle_id, 'FK inspection flow 03'
FROM users u, vehicles v
WHERE u.username = 'fk_recolector_03' AND v.license_plate = 'FK-0003'
  AND NOT EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.user_id = u.user_id
        AND i.vehicle_id = v.vehicle_id
        AND i.observation = 'FK inspection flow 03'
  );

INSERT INTO inspections (inspection_date, kilometrage, is_approved, user_id, vehicle_id, observation)
SELECT NOW() - INTERVAL '1 day', 30000 + v.vehicle_id, TRUE, u.user_id, v.vehicle_id, 'FK inspection flow 04'
FROM users u, vehicles v
WHERE u.username = 'fk_recolector_04' AND v.license_plate = 'FK-0004'
  AND NOT EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.user_id = u.user_id
        AND i.vehicle_id = v.vehicle_id
        AND i.observation = 'FK inspection flow 04'
  );

INSERT INTO inspections (inspection_date, kilometrage, is_approved, user_id, vehicle_id, observation)
SELECT NOW() - INTERVAL '1 day', 30000 + v.vehicle_id, TRUE, u.user_id, v.vehicle_id, 'FK inspection flow 05'
FROM users u, vehicles v
WHERE u.username = 'fk_recolector_05' AND v.license_plate = 'FK-0005'
  AND NOT EXISTS (
      SELECT 1 FROM inspections i
      WHERE i.user_id = u.user_id
        AND i.vehicle_id = v.vehicle_id
        AND i.observation = 'FK inspection flow 05'
  );

-- 14) Answers for each FK inspection using 3 checklist questions
INSERT INTO answers (status, observation, question_id, inspection_id)
SELECT 1, 'OK brakes', q.question_id, i.inspection_id
FROM inspections i
JOIN questions q ON q.statement = 'Brakes operating correctly'
WHERE i.observation LIKE 'FK inspection flow %'
  AND NOT EXISTS (
      SELECT 1 FROM answers a
      WHERE a.inspection_id = i.inspection_id AND a.question_id = q.question_id
  );

INSERT INTO answers (status, observation, question_id, inspection_id)
SELECT 1, 'OK lights', q.question_id, i.inspection_id
FROM inspections i
JOIN questions q ON q.statement = 'Lights and signals operational'
WHERE i.observation LIKE 'FK inspection flow %'
  AND NOT EXISTS (
      SELECT 1 FROM answers a
      WHERE a.inspection_id = i.inspection_id AND a.question_id = q.question_id
  );

INSERT INTO answers (status, observation, question_id, inspection_id)
SELECT 1, 'Safety kit complete', q.question_id, i.inspection_id
FROM inspections i
JOIN questions q ON q.statement = 'Safety kit complete'
WHERE i.observation LIKE 'FK inspection flow %'
  AND NOT EXISTS (
      SELECT 1 FROM answers a
      WHERE a.inspection_id = i.inspection_id AND a.question_id = q.question_id
  );

-- 15) Inspection images
INSERT INTO inspection_images (image_url, image_int, description, inspection_id)
SELECT '/images/fk_inspection_' || i.inspection_id || '.webp', 1, 'FK inspection image', i.inspection_id
FROM inspections i
WHERE i.observation LIKE 'FK inspection flow %'
  AND NOT EXISTS (
      SELECT 1 FROM inspection_images ii
      WHERE ii.inspection_id = i.inspection_id
  );

COMMIT;
