create table languages (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    code VARCHAR(5) NOT NULL
);
create table users (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    telegram_id BIGSERIAL NOT NULL,
    first_name VARCHAR(25) NOT NULL,
    last_name VARCHAR(25) NOT NULL,
    is_admin BOOLEAN NOT NULL,
    prefered_lang INT NOT NULL,
    CONSTRAINT fk_lang FOREIGN KEY(prefered_lang) REFERENCES languages(id)
);