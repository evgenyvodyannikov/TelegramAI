INSERT INTO languages (code) VALUES ('EN');
INSERT INTO languages (code) VALUES ('RU');
INSERT INTO languages (code) VALUES ('UA');

INSERT INTO users (telegram_id, first_name, last_name, is_admin, prefered_lang) VALUES
    ( '12345678', 'Eugene', 'Vodyannikov', TRUE, (SELECT id from languages WHERE code='EN'));