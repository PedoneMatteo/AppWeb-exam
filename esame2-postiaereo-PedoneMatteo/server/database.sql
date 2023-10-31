-- creates the users table
DROP TABLE IF EXISTS `user`;
CREATE TABLE  `user` (
	`id` INTEGER PRIMARY KEY,
	`email` varchar(45),
  `name` varchar(45),
	`hash` TEXT NOT NULL,
	`salt` TEXT NOT NULL
);

-- creates the airplanes table
DROP TABLE IF EXISTS `airplane`;
CREATE TABLE `airplane` (
  `id` INTEGER PRIMARY KEY,
  `departure` TEXT NOT NULL,
  `arrival` TEXT NOT NULL,
  'duration' TEXT NOT NULL,
  `type` varchar(45) NOT NULL,
  `rows` INTEGER NOT NULL,
  `cols` INTEGER NOT NULL
);

DROP TABLE IF EXISTS reservation;

DROP TABLE IF EXISTS booking;
CREATE TABLE `booking` (
  `id_airplane` INTEGER NOT NULL,
  `id_user` INTEGER NOT NULL,
  `seat` VARCHAR(3) NOT NULL,

  PRIMARY KEY (id_airplane, id_user, seat),
  FOREIGN KEY (id_airplane) REFERENCES airplane(id),
  FOREIGN KEY (id_user) REFERENCES user(id)
);

-- ***************************************************
--                   INSERT DATA - sqlite3 exam.db < database.sql
-- ***************************************************


-- airplanes types loaded
INSERT INTO airplane (departure, arrival, duration, type, rows, cols) VALUES
('Torino', 'Milano', '30m', 'locale', 15, 4),
('Torino', 'Roma', '1h','regionale', 20, 5),
('Roma', 'Barcellona', '1h 45m','internazionale', 25, 6);

INSERT INTO booking (id_airplane, id_user, seat) VALUES
(1,1, '10A'),
(1,1, '10B'),
(1,2, '3B'),
(1,2, '3C'),
(1,2, '3D'),
(1,2, '4A'),
(1,3, '7C'),
(1,3, '7D'),
(1,3, '8A'),
(1,3, '8B'),
(1,3, '8C'),
(2,2, '3C'),
(2,2, '3D'),
(2,2, '3E'),
(2,4, '13A'),
(2,4, '13B'),
(2,4, '13C'),
(2,4, '13D'),
(2,4, '14A'),
(2,4, '14B'),
(2,4, '14C'),
(2,4, '14D'),
(3,1, '7C'),
(3,1, '7D'),
(3,1, '8A'),
(3,1, '8B'),
(3,2, '3C'),
(3,2, '3D'),
(3,2, '3E'),
(3,2, '3F'),
(3,2, '4A'),
(3,3, '1C'),
(3,4, '12C'),
(3,4, '12D'),
(3,4, '12E');



INSERT INTO user (id, email, name, hash, salt) VALUES
(1, 'federico.baschirotto@gmail.com', 'Federico Baschirotto', '5e8fb8a004b03e61b74bb829c8710ed21d059a51d12d05fa8ae42681f7129f91', 'aw1'),
(2, 'gabriel.strefezza@gmail.com', 'Gabriel Strefezza', '0595e5b45ebb2fb39cfacf2b4c9f170391acf50e60f5bf6f1925f94d8735b431', 'aw2'), 
(3, 'samuel.umtiti@gmail.com', 'Samuel Umtiti', '9f83f698607974ae13f8e0ec40e4eea03c8869e9b22174a3e1e0ce8aab277dae', 'aw3'),
(4, 'saverio.sticchidamiani@gmail.com', 'Saverio Sticchi Damiani', '36c440e13f1017b9b89e75b161d138468c44abeb6a782b8eb5c26729172ef801', 'aw4'); 
