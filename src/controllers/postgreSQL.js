import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

let pgClient = null;

export const init = async () => {
  pgClient = new pg.Client();
  await pgClient.connect();
};

export const getUsers = async () => {
  if (pgClient) {
    const result = await pgClient.query({
      rowMode: "array",
      text:
        "SELECT users.id, users.telegram_id, users.first_name, users.last_name, users.is_admin, languages.code " +
        "FROM users " +
        "INNER JOIN languages ON users.prefered_lang = languages.id",
    });

    const rows = result.rows;
    const users = [];

    rows.forEach((item) => {
      users.push({
        id: item[0],
        telegram_id: item[1],
        name: item[2] + " " + item[3],
        isAdmin: item[4],
        lang: item[5],
      });
    });

    return users;
  }
};