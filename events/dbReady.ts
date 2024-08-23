import Bot from "Bot";

export default (db: Bot["db"]) => {
  db.ready(() => {
    console.log("Database is ready!");
  });
};
